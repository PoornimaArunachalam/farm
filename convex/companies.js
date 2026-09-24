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

export const getProfile = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return null;

    return await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();
  },
});

export const getById = query({
  args: { companyId: v.id("companies") },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) return null;

    const demands = await ctx.db
      .query("demands")
      .withIndex("by_companyId", (q) => q.eq("companyId", company.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return { ...company, demands };
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!company) return null;

    const demands = await ctx.db
      .query("demands")
      .withIndex("by_companyId", (q) => q.eq("companyId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return { ...company, demands };
  },
});

export const search = query({
  args: {
    query: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    crop: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let companies = await ctx.db.query("companies").collect();

    if (args.query && args.query.trim() !== "") {
      const q = args.query.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.companyType.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q)
      );
    }

    if (args.district && args.district !== "all") {
      companies = companies.filter((c) =>
        c.district.toLowerCase().includes(args.district.toLowerCase())
      );
    }

    if (args.state && args.state !== "all") {
      companies = companies.filter((c) =>
        c.state.toLowerCase().includes(args.state.toLowerCase())
      );
    }

    // Attach active demands
    const results = await Promise.all(
      companies.map(async (company) => {
        const demands = await ctx.db
          .query("demands")
          .withIndex("by_companyId", (q) => q.eq("companyId", company.userId))
          .filter((q) => q.eq(q.field("status"), "active"))
          .collect();
        return { ...company, demands };
      })
    );

    if (args.crop && args.crop.trim() !== "" && args.crop !== "all") {
      const cropQ = args.crop.toLowerCase();
      return results.filter((c) =>
        c.demands.some((d) => d.cropName.toLowerCase().includes(cropQ))
      );
    }

    return results;
  },
});

export const updateProfile = mutation({
  args: {
    token: v.string(),
    companyName: v.string(),
    phone: v.string(),
    companyType: v.string(),
    address: v.string(),
    district: v.string(),
    state: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    if (user.role !== "company") throw new Error("Forbidden: Not a company.");

    const profile = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();
    if (profile) {
      await ctx.db.patch(profile._id, {
        companyName: args.companyName.trim(),
        phone: args.phone.trim(),
        companyType: args.companyType,
        address: args.address.trim(),
        district: args.district.trim(),
        state: args.state.trim(),
        description: args.description || "",
        website: args.website || "",
        logo: args.logo || profile.logo,
        updatedAt: now,
      });
      return { success: true };
    }
  },
});

export const getStats = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return null;

    const myDemands = await ctx.db
      .query("demands")
      .withIndex("by_companyId", (q) => q.eq("companyId", session.userId))
      .collect();
    const activeDemands = myDemands.filter((d) => d.status === "active").length;

    const availableCrops = await ctx.db
      .query("crops")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    const myOffers = await ctx.db
      .query("offers")
      .filter((q) =>
        q.or(
          q.eq(q.field("senderId"), session.userId),
          q.eq(q.field("receiverId"), session.userId)
        )
      )
      .collect();
    const pendingOffers = myOffers.filter((o) => o.status === "pending" || o.status === "countered").length;

    const myDeals = await ctx.db
      .query("deals")
      .withIndex("by_companyId", (q) => q.eq("companyId", session.userId))
      .collect();
    const activeDeals = myDeals.filter((d) => d.status === "confirmed" || d.status === "in_progress").length;

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", session.userId).eq("isRead", false))
      .collect();

    return {
      activeDemands,
      availableCropsCount: availableCrops.length,
      pendingOffers,
      activeDeals,
      unreadMessagesCount: unreadMessages.length,
    };
  },
});
