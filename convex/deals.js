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

export const getMyDeals = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!session) return [];

    let deals = [];
    if (session.role === "farmer") {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_farmerId", (q) => q.eq("farmerId", session.userId))
        .order("desc")
        .collect();
    } else if (session.role === "company") {
      deals = await ctx.db
        .query("deals")
        .withIndex("by_companyId", (q) => q.eq("companyId", session.userId))
        .order("desc")
        .collect();
    } else if (session.role === "admin") {
      deals = await ctx.db.query("deals").order("desc").collect();
    }

    return deals;
  },
});

export const updateStatus = mutation({
  args: {
    token: v.string(),
    dealId: v.id("deals"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
    deliveryDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const deal = await ctx.db.get(args.dealId);

    if (!deal) throw new Error("Deal not found.");

    const isFarmer = deal.farmerId.toString() === user._id.toString();
    const isCompany = deal.companyId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isFarmer && !isCompany && !isAdmin) {
      throw new Error("Forbidden: You are not authorized to update this deal.");
    }

    const now = Date.now();
    await ctx.db.patch(args.dealId, {
      status: args.status,
      notes: args.notes || deal.notes,
      deliveryDate: args.deliveryDate || deal.deliveryDate,
      updatedAt: now,
    });

    const partnerId = isFarmer ? deal.companyId : deal.farmerId;
    await ctx.db.insert("notifications", {
      userId: partnerId,
      type: "deal_status_updated",
      title: `Deal Status: ${args.status.toUpperCase().replace('_', ' ')} 📋`,
      message: `Deal for ${deal.cropName} (#${args.dealId.toString().slice(-6).toUpperCase()}) was updated to ${args.status}.`,
      relatedId: args.dealId.toString(),
      link: isFarmer ? "/company/deals" : "/farmer/deals",
      isRead: false,
      createdAt: now,
    });

    return { success: true };
  },
});
