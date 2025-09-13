import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listEvents = query({
  args: {
    rangeStartISO: v.optional(v.string()),
    rangeEndISO: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    let events;

    if (userId) {
      events = await ctx.db
        .query("events")
        .withIndex("by_created_by", (q) => q.eq("createdBy", userId))
        .collect();
    } else {
      events = await ctx.db.query("events").collect();
    }

    // Filter by date range if provided
    if (args.rangeStartISO || args.rangeEndISO) {
      return events.filter((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = event.end ? new Date(event.end) : eventStart;

        if (args.rangeStartISO && eventEnd < new Date(args.rangeStartISO)) {
          return false;
        }
        if (args.rangeEndISO && eventStart > new Date(args.rangeEndISO)) {
          return false;
        }
        return true;
      });
    }

    return events;
  },
});

export const queryEventsByText = query({
  args: {
    queryText: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!args.queryText.trim()) {
      return [];
    }

    const searchResults = await ctx.db
      .query("events")
      .withSearchIndex("search_events", (q) => {
        let query = q.search("title", args.queryText);
        if (userId) {
          query = query.eq("createdBy", userId);
        }
        return query;
      })
      .take(20);

    return searchResults;
  },
});

export const queryEventsByDateRange = query({
  args: {
    dateRange: v.string(), // "today", "tomorrow", "this_week", "next_week"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (args.dateRange) {
      case "today": {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      }
      case "tomorrow": {
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        break;
      }
      case "this_week": {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      }
      case "next_week": {
        const nextWeekStart = new Date(now);
        nextWeekStart.setDate(now.getDate() + (7 - now.getDay()));
        nextWeekStart.setHours(0, 0, 0, 0);
        startDate = nextWeekStart;
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      }
      default: {
        return [];
      }
    }

    let events;
    if (userId) {
      events = await ctx.db
        .query("events")
        .withIndex("by_created_by", (q) => q.eq("createdBy", userId))
        .collect();
    } else {
      events = await ctx.db.query("events").collect();
    }

    return events.filter((event) => {
      const eventStart = new Date(event.start);
      return eventStart >= startDate && eventStart < endDate;
    });
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    startISO: v.string(),
    endISO: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const eventId = await ctx.db.insert("events", {
      title: args.title,
      start: args.startISO,
      end: args.endISO,
      description: args.description,
      createdBy: userId || undefined,
      createdAt: new Date().toISOString(),
    });

    return eventId;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    startISO: v.optional(v.string()),
    endISO: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if (userId && event.createdBy !== userId) {
      throw new Error("Not authorized to update this event");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.startISO !== undefined) updates.start = args.startISO;
    if (args.endISO !== undefined) updates.end = args.endISO;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.eventId, updates);
    return args.eventId;
  },
});

export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if (userId && event.createdBy !== userId) {
      throw new Error("Not authorized to delete this event");
    }

    await ctx.db.delete(args.eventId);
    return args.eventId;
  },
});
