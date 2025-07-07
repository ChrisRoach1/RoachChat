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
    modelName: v.string(),
    orderNumber: v.optional(v.number()),
    provider: v.optional(v.string())
  }).index("by_orderNumber", ["orderNumber"]),

  userGeneratedImages: defineTable({
    userId: v.string(),
    storageId: v.optional(v.string()),
    status: v.string(),
    imageUrl: v.optional(v.string()),
    prompt: v.string(),
    isPublic: v.optional(v.boolean())
  }).index("by_userId", ["userId"]),

  userFolders: defineTable({
    userId: v.string(),
    name: v.string(),
    threadIds: v.optional(v.array(v.string()))
  }).index("by_userId", ["userId"]),

  userSentCounts: defineTable({
    userId: v.string(),
    date: v.string(),
    count: v.number()
  }).index("by_date_and_userId", ["date", "userId"])
});

