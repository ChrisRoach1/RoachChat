import { openai } from "@ai-sdk/openai";
import { anthropic } from '@ai-sdk/anthropic';

import { v } from "convex/values";
import { api, components, internal } from "./_generated/api";
import { Agent, vStreamArgs } from "@convex-dev/agent";
import { action, internalAction, mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

const MODELS = {
  gpt4o: openai("gpt-4o"),
  claude4Sonnet: anthropic("claude-4-sonnet-20250514")
}

const createAgent = (modelType: string) => {
  const modelConfig = MODELS[modelType as keyof typeof MODELS];
  if (!modelConfig) {
    throw new Error(`Unsupported model type: ${modelType}`);
  }
  
  return new Agent(components.agent, {
    chat: modelConfig,
    textEmbedding: openai.embedding("text-embedding-3-small"),
    instructions: "You are a helpful assistant.",
  });
};

// Add a query to get user's preferred model
export const getThreadModelPreference = query({
  args: {
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    const modelPrefs = await ctx.db
      .query("threadModelPreference").withIndex("by_threadId", (q) => q.eq("threadId", args.threadId)).first();
      
    return modelPrefs?.modelName || "clause4Sonnet"; 
  }
});

export const viewAllThreads = query({
  args:{ },
  handler: async(ctx) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const threads = await ctx.runQuery(components.agent.threads.listThreadsByUserId,{
      userId: userID,
      order: "desc",
      paginationOpts: {cursor: null, numItems: 100}
    })

    return threads;
  }
})

export const deleteThread = mutation({
  args:{
    threadId: v.string()
  },
  handler: async(ctx, args) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const thread = await ctx.runQuery(components.agent.threads.getThread,{
      threadId: args.threadId
    });

    if(thread?.userId === userID){
      await ctx.runMutation(components.agent.threads.deleteAllForThreadIdAsync,{
        threadId: args.threadId
      })

      const modelPref = await ctx.db.query("threadModelPreference").withIndex("by_threadId", (q) => q.eq("threadId", args.threadId)).first();

      if(modelPref){
        ctx.db.delete(modelPref._id);
      }
    }
  }
})

export const setThreadModelPreference = mutation({
  args:{
    threadId: v.string(),
    modelName: v.string()
  },
  handler: async(ctx, args) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("threadModelPreference", {threadId: args.threadId, modelName: args.modelName});
  }
})

export const createThread = action({
  args:{
    title: v.string(),
    modelName: v.string()
  },
  handler: async (ctx, args): Promise<{threadId: string}> => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    
    const dynamicAgent = createAgent(args.modelName);

    const userID = identity.tokenIdentifier.split('|')[1];
    const { threadId } = await dynamicAgent.createThread(ctx, { userId: userID, title: args.title});
    
    await ctx.runMutation(api.chat.setThreadModelPreference, {threadId: threadId, modelName: args.modelName});
    
    return {threadId};

  }
});

export const streamMessageAsynchronously = mutation({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    const modelName = await ctx.runQuery(api.chat.getThreadModelPreference, {threadId});
    const dynamicAgent = createAgent(modelName);

    const { messageId } = await dynamicAgent.saveMessage(ctx, {
      threadId,
      prompt,
      skipEmbeddings: true,
    });
    await ctx.scheduler.runAfter(0, internal.chat.streamMessage, {
      threadId,
      promptMessageId: messageId,
      modelName
    });
  },
});

export const streamMessage = internalAction({
  args: { promptMessageId: v.string(), threadId: v.string(), modelName: v.string() },
  handler: async (ctx, { promptMessageId, threadId, modelName}) => {
    const dynamicAgent = createAgent(modelName);
    const { thread } = await dynamicAgent.continueThread(ctx, { threadId });
    const result = await thread.streamText(
      { promptMessageId },
      { saveStreamDeltas: true },
    );
    await result.consumeStream();
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, { threadId, paginationOpts, streamArgs }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const userID = identity.tokenIdentifier.split('|')[1];

    const thread = await ctx.runQuery(components.agent.threads.getThread, {
      threadId: threadId
    });

    // If thread doesn't exist or doesn't belong to user, throw an error
    if (thread?.userId !== userID) {
      throw new Error("Access denied");
    }
    const modelName = await ctx.runQuery(api.chat.getThreadModelPreference, {threadId});
    const dynamicAgent = createAgent(modelName);
    const paginated = (await dynamicAgent.listMessages(ctx, { threadId, paginationOpts }));
    const streams = await dynamicAgent.syncStreams(ctx, { threadId, streamArgs });

    return { ...paginated, streams };
  },
});


export const listAllAvailableModels = query({
  args:{},

  handler: async (ctx) =>{
    const models = await ctx.db
    .query("availableModels").collect();

    return models;
  }
})

export const updateThreadModelPreference = mutation({
  args:{
    threadId: v.string(),
    modelName: v.string()
  },
  handler: async (ctx, args) =>{

    const modelPref = await ctx.db.query("threadModelPreference").filter((q) => q.eq(q.field("threadId"), args.threadId)).first();

    if(modelPref){
      await ctx.db.patch(modelPref._id, {modelName: args.modelName});
    }

  }
})