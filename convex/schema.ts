import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  events: defineTable({
    title: v.string(),
    start: v.string(), // ISO string
    end: v.optional(v.string()), // ISO string, optional
    description: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.string(), // ISO string
  })
    .index("by_start", ["start"])
    .index("by_created_by", ["createdBy"])
    .searchIndex("search_events", {
      searchField: "title",
      filterFields: ["createdBy"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
