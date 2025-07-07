import { openai, } from "@ai-sdk/openai";
import { v } from "convex/values";
import {internal } from "./_generated/api";
import { action, internalMutation, mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { experimental_generateImage as generateImage } from 'ai';


export const generateImageAction = action({
  args:{
    prompt: v.string(),
    modelName: v.string(),
    userGeneratedImageId: v.id("userGeneratedImages"),
  },
  handler: async(ctx, args) =>{
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const { image } = await generateImage({
      model: openai.image(args.modelName),
      prompt: args.prompt,
      providerOptions:{
      }
    });

    const imageUrl = await ctx.storage.generateUploadUrl();

    const result = await fetch(imageUrl, {
      method: "POST",
      headers: {"Content-Type": image.mimeType},
      body: image.uint8Array
    })

    const { storageId } = await result.json();

    await ctx.runMutation(internal.image.updateUserGeneratedImageRecord, {id: args.userGeneratedImageId, storageId: storageId})

  }
})


export const createUserGeneratedImageRecord = mutation({
  args:{
    prompt: v.string(),
    isPublic: v.boolean()
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    const record = await ctx.db.insert("userGeneratedImages", {userId: userID, storageId: undefined, status: "pending", prompt: args.prompt, isPublic: args.isPublic})

    return record
  },
})

export const updateUserGeneratedImageRecord = internalMutation({
  args:{
    id: v.id("userGeneratedImages"),
    storageId: v.id("_storage")
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    ctx.db.patch(args.id, {storageId: args.storageId, imageUrl: imageUrl ?? undefined, status: "completed"})

  },
})


export const listUserGeneratedImageRecord = query({
  args:{},
  handler: async(ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    return await ctx.db.query("userGeneratedImages").withIndex("by_userId", q => q.eq("userId", userID)).collect();

  },
})

export const toggleImagePublicStatus = mutation({
  args: {
    imageId: v.id("userGeneratedImages"),
    isPublic: v.boolean()
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userID = identity.tokenIdentifier.split('|')[1];

    // Verify the image belongs to the current user
    const image = await ctx.db.get(args.imageId);
    if (!image || image.userId !== userID) {
      throw new Error("Image not found or not authorized");
    }

    // Update the isPublic status
    await ctx.db.patch(args.imageId, { isPublic: args.isPublic });

    return { success: true };
  }
})

export const listPublicImages = query({
  args: {},
  handler: async (ctx) => {
    // Get all images where isPublic is true and status is completed
    return await ctx.db
      .query("userGeneratedImages")
      .filter(q => 
        q.and(
          q.eq(q.field("isPublic"), true),
          q.eq(q.field("status"), "completed")
        )
      )
      .order("desc")
      .collect();
  }
})