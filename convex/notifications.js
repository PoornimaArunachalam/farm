import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .order("desc")
      .take(40);
  },
});

export const markRead = mutation({
  args: {
    token: v.string(),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

export const markAllRead = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return { count: 0 };

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_userId_isRead", (q) => q.eq("userId", session.userId).eq("isRead", false))
      .collect();

    for (const notif of unread) {
      await ctx.db.patch(notif._id, { isRead: true });
    }

    return { count: unread.length };
  },
});
