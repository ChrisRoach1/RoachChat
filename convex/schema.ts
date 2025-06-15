import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),

  threadModelPreference: defineTable({
    threadId: v.string(),
    modelName: v.string()
  }).index("by_threadId", ["threadId"]),

  availableModels: defineTable({
    modelDescription: v.string(),
    modelName: v.string()
  }),

  userGeneratedImages: defineTable({
    userId: v.string(),
    storageId: v.optional(v.string()),
    status: v.string(),
    imageUrl: v.optional(v.string()),
    prompt: v.string()
  }).index("by_userId", ["userId"])
});

