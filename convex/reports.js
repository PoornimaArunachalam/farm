import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getAuthUser(ctx, token) {
  if (!token) throw new Error("Unauthorized: Session token required.");
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Session expired or invalid.");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || !user.isActive) throw new Error("Unauthorized: Account inactive or not found.");
  return user;
}

export const create = mutation({
  args: {
    token: v.string(),
    targetUser: v.optional(v.id("users")),
    targetType: v.union(v.literal("farmer"), v.literal("company"), v.literal("crop"), v.literal("demand")),
    targetId: v.string(),
    reason: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);

    let reporterName = user.email;
    if (user.role === "farmer") {
      const f = await ctx.db.query("farmers").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
      if (f) reporterName = f.fullName;
    } else if (user.role === "company") {
      const c = await ctx.db.query("companies").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
      if (c) reporterName = c.companyName;
    }

    let targetUserName = "";
    if (args.targetUser) {
      const tu = await ctx.db.get(args.targetUser);
      if (tu) targetUserName = tu.email;
    }

    const now = Date.now();
    const reportId = await ctx.db.insert("reports", {
      reportedBy: user._id,
      reporterName,
      targetUser: args.targetUser,
      targetUserName,
      targetType: args.targetType,
      targetId: args.targetId,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return reportId;
  },
});

export const list = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    if (user.role !== "admin") throw new Error("Forbidden: Admin only.");
    return await ctx.db.query("reports").order("desc").collect();
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    reportId: v.id("reports"),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved"), v.literal("dismissed")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    if (user.role !== "admin") throw new Error("Forbidden: Admin only.");

    await ctx.db.patch(args.reportId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
