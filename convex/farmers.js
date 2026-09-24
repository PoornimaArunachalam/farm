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
      .query("farmers")
      .withIndex("by_userId", (q) => q.eq("userId", session.userId))
      .first();
  },
});

export const getById = query({
  args: { farmerId: v.id("farmers") },
  handler: async (ctx, args) => {
    const farmer = await ctx.db.get(args.farmerId);
    if (!farmer) return null;

    const crops = await ctx.db
      .query("crops")
      .withIndex("by_farmerId", (q) => q.eq("farmerId", farmer.userId))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();

    return { ...farmer, crops };
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const farmer = await ctx.db
      .query("farmers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!farmer) return null;

    const crops = await ctx.db
      .query("crops")
      .withIndex("by_farmerId", (q) => q.eq("farmerId", args.userId))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();

    return { ...farmer, crops };
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
    let farmers = await ctx.db.query("farmers").collect();

    if (args.query && args.query.trim() !== "") {
      const q = args.query.toLowerCase();
      farmers = farmers.filter(
        (f) =>
          f.fullName.toLowerCase().includes(q) ||
          f.village.toLowerCase().includes(q) ||
          f.district.toLowerCase().includes(q)
      );
    }

    if (args.district && args.district !== "all") {
      farmers = farmers.filter((f) =>
        f.district.toLowerCase().includes(args.district.toLowerCase())
      );
    }

    if (args.state && args.state !== "all") {
      farmers = farmers.filter((f) =>
        f.state.toLowerCase().includes(args.state.toLowerCase())
      );
    }

    // Attach current available crops
    const results = await Promise.all(
      farmers.map(async (farmer) => {
        const crops = await ctx.db
          .query("crops")
          .withIndex("by_farmerId", (q) => q.eq("farmerId", farmer.userId))
          .filter((q) => q.eq(q.field("status"), "available"))
          .collect();
        return { ...farmer, crops };
      })
    );

    if (args.crop && args.crop.trim() !== "" && args.crop !== "all") {
      const cropQ = args.crop.toLowerCase();
      return results.filter((f) =>
        f.crops.some((c) => c.cropName.toLowerCase().includes(cropQ))
      );
    }

    return results;
  },
});

export const updateProfile = mutation({
  args: {
    token: v.string(),
    fullName: v.string(),
    phone: v.string(),
    village: v.string(),
    district: v.string(),
    state: v.string(),
    farmSize: v.number(),
    farmSizeUnit: v.string(),
    description: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    if (user.role !== "farmer") throw new Error("Forbidden: Not a farmer.");

    const profile = await ctx.db
      .query("farmers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();
    if (profile) {
      await ctx.db.patch(profile._id, {
        fullName: args.fullName.trim(),
        phone: args.phone.trim(),
        village: args.village.trim(),
        district: args.district.trim(),
        state: args.state.trim(),
        farmSize: args.farmSize,
        farmSizeUnit: args.farmSizeUnit,
        description: args.description || "",
        profileImage: args.profileImage || profile.profileImage,
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

    const myCrops = await ctx.db
      .query("crops")
      .withIndex("by_farmerId", (q) => q.eq("farmerId", session.userId))
      .collect();

    const totalCrops = myCrops.length;
    const availableCrops = myCrops.filter((c) => c.status === "available");
    const totalQuantity = availableCrops.reduce((acc, c) => acc + c.quantity, 0);

    const activeDemands = await ctx.db
      .query("demands")
      .withIndex("by_status", (q) => q.eq("status", "active"))
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
      .withIndex("by_farmerId", (q) => q.eq("farmerId", session.userId))
      .collect();
    const activeDeals = myDeals.filter((d) => d.status === "confirmed" || d.status === "in_progress").length;

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", session.userId).eq("isRead", false))
      .collect();

    return {
      totalCrops,
      totalQuantity,
      activeDemandsCount: activeDemands.length,
      pendingOffers,
      activeDeals,
      unreadMessagesCount: unreadMessages.length,
    };
  },
});
