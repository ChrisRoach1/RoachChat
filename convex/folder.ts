import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation } from "./_generated/server";
import { query } from "./_generated/server";

export const createFolder = mutation({
  args:{
    folderName: v.string()
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const record = await ctx.db.insert("userFolders", {userId: userID, name: args.folderName})

    return record
  },
})

export const addUpdateThreadToFolder = mutation({
  args:{
    folderId: v.string(),
    threadId: v.string()
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];


    const record = await ctx.db.query("userFolders").withIndex("by_userId", q => q.eq("userId", userID)).filter(x => x.eq(x.field("_id"), args.folderId)).first();
    
    
    if(record){

      //lets remove from previous folder if there
      await ctx.runMutation(api.folder.removeThreadToFolder,{threadId: args.threadId});

      if(record.threadIds){
        let existingThreadIds = record.threadIds;

        if(existingThreadIds && existingThreadIds.indexOf(args.threadId) <= -1){
          existingThreadIds = [...existingThreadIds, args.threadId];
        }
  
        ctx.db.patch(record._id, {threadIds: existingThreadIds});
      }else{
        ctx.db.patch(record._id, {threadIds: [args.threadId]});
      }
    }

    return record
  },
})

export const removeThreadToFolder = mutation({
  args:{
    threadId: v.string()
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];
    let folderId;
    let updatedThreadIds;
    const records = await ctx.db.query("userFolders").withIndex("by_userId", q => q.eq("userId", userID)).collect();
    
    if(records.length > 0){
      records.forEach(folder =>{
        if(folder.threadIds && folder.threadIds.indexOf(args.threadId) > -1){
          folderId = folder._id;
          updatedThreadIds = folder.threadIds.filter(x => x !== args.threadId);
        }
      })
    }

    if(folderId){
      await ctx.db.patch(folderId, {threadIds: updatedThreadIds});
    }

  },
})

export const deleteFolder = mutation({
  args:{
    folderId: v.string()
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const record = await ctx.db.query("userFolders").withIndex("by_userId", q => q.eq("userId", userID)).filter(q => q.eq(q.field("_id"), args.folderId)).first();
    
    if(record){
      await ctx.db.delete(record._id);
    }

  },
})


export const listFolders = query({
  args:{},
  handler: async(ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    //let folderArray: [{id: string, name: string, threadIds: string[]}];
    const userID = identity.tokenIdentifier.split('|')[1];
    const folders = await ctx.db.query("userFolders").withIndex("by_userId", q => q.eq("userId", userID)).collect();

    return folders
  },
})
