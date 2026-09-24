import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function getAdminUser(ctx, token) {
  if (!token) throw new Error("Unauthorized: Session token required.");
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized: Session expired.");
  }
  const user = await ctx.db.get(session.userId);
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: Admin access required.");
  }
  return user;
}

export const getStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAdminUser(ctx, args.token);

    const farmers = await ctx.db.query("farmers").collect();
    const companies = await ctx.db.query("companies").collect();
    const crops = await ctx.db.query("crops").collect();
    const demands = await ctx.db.query("demands").collect();
    const deals = await ctx.db.query("deals").collect();
    const messages = await ctx.db.query("messages").collect();
    const reports = await ctx.db.query("reports").collect();

    const activeCrops = crops.filter((c) => c.status === "available").length;
    const activeDemands = demands.filter((d) => d.status === "active").length;
    const completedDeals = deals.filter((d) => d.status === "completed").length;
    const totalTradeValue = deals.reduce((acc, d) => acc + d.totalAmount, 0);
    const pendingReports = reports.filter((r) => r.status === "pending").length;

    return {
      totalFarmers: farmers.length,
      totalCompanies: companies.length,
      totalCrops: crops.length,
      activeCrops,
      totalDemands: demands.length,
      activeDemands,
      totalDeals: deals.length,
      completedDeals,
      totalTradeValue,
      totalMessages: messages.length,
      pendingReports,
    };
  },
});

export const getAllUsers = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAdminUser(ctx, args.token);

    const users = await ctx.db.query("users").order("desc").collect();
    const farmers = await ctx.db.query("farmers").collect();
    const companies = await ctx.db.query("companies").collect();

    return users.map((u) => {
      let profile = null;
      if (u.role === "farmer") {
        profile = farmers.find((f) => f.userId.toString() === u._id.toString());
      } else if (u.role === "company") {
        profile = companies.find((c) => c.userId.toString() === u._id.toString());
      }
      return {
        _id: u._id,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        profile,
      };
    });
  },
});

export const toggleUserStatus = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx, args.token);
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found.");

    await ctx.db.patch(args.userId, {
      isActive: !targetUser.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: !targetUser.isActive };
  },
});

export const getAllCrops = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAdminUser(ctx, args.token);
    return await ctx.db.query("crops").order("desc").collect();
  },
});

export const getAllDemands = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await getAdminUser(ctx, args.token);
    return await ctx.db.query("demands").order("desc").collect();
  },
});

export const deleteCrop = mutation({
  args: {
    token: v.string(),
    cropId: v.id("crops"),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx, args.token);
    await ctx.db.delete(args.cropId);
    return { success: true };
  },
});

export const deleteDemand = mutation({
  args: {
    token: v.string(),
    demandId: v.id("demands"),
  },
  handler: async (ctx, args) => {
    await getAdminUser(ctx, args.token);
    await ctx.db.delete(args.demandId);
    return { success: true };
  },
});
