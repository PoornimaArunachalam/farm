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
    cropName: v.string(),
    variety: v.string(),
    requiredQuantity: v.number(),
    unit: v.string(),
    offeredPriceMin: v.number(),
    offeredPriceMax: v.number(),
    priceUnit: v.string(),
    requiredDate: v.string(),
    deliveryLocation: v.string(),
    district: v.string(),
    state: v.string(),
    qualityRequirements: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    if (user.role !== "company") {
      throw new Error("Forbidden: Only companies can post crop demands.");
    }

    if (args.requiredQuantity <= 0) throw new Error("Required quantity must be > 0");
    if (args.offeredPriceMin <= 0 || args.offeredPriceMax <= 0) {
      throw new Error("Price range must be greater than 0");
    }
    if (args.offeredPriceMin > args.offeredPriceMax) {
      throw new Error("Minimum price cannot exceed maximum price");
    }

    const companyProfile = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const companyName = companyProfile ? companyProfile.companyName : "Company";
    const now = Date.now();

    const demandId = await ctx.db.insert("demands", {
      companyId: user._id,
      companyProfileId: companyProfile?._id,
      companyName,
      cropName: args.cropName.trim(),
      variety: args.variety.trim(),
      requiredQuantity: args.requiredQuantity,
      unit: args.unit,
      offeredPriceMin: args.offeredPriceMin,
      offeredPriceMax: args.offeredPriceMax,
      priceUnit: args.priceUnit,
      requiredDate: args.requiredDate,
      deliveryLocation: args.deliveryLocation.trim(),
      district: args.district.trim(),
      state: args.state.trim(),
      qualityRequirements: args.qualityRequirements,
      description: args.description || "",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Notify farmers who grow or list this crop
    const matchingCrops = await ctx.db
      .query("crops")
      .withIndex("by_cropName", (q) => q.eq("cropName", args.cropName.trim()))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();

    const notifiedFarmers = new Set();
    for (const crop of matchingCrops) {
      if (!notifiedFarmers.has(crop.farmerId.toString())) {
        notifiedFarmers.add(crop.farmerId.toString());
        await ctx.db.insert("notifications", {
          userId: crop.farmerId,
          type: "new_demand",
          title: `New Demand: ${args.cropName} Needed! 📢`,
          message: `${companyName} is purchasing ${args.requiredQuantity} ${args.unit} of ${args.cropName} (₹${args.offeredPriceMin}-₹${args.offeredPriceMax} ${args.priceUnit}).`,
          relatedId: demandId.toString(),
          link: `/farmer/demands`,
          isRead: false,
          createdAt: now,
        });
      }
    }

    return demandId;
  },
});

export const getMyDemands = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    return await ctx.db
      .query("demands")
      .withIndex("by_companyId", (q) => q.eq("companyId", session.userId))
      .order("desc")
      .collect();
  },
});

export const getAllActive = query({
  args: {
    cropName: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    minPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let demands = await ctx.db
      .query("demands")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    if (args.cropName && args.cropName.trim() !== "") {
      const q = args.cropName.toLowerCase();
      demands = demands.filter(
        (d) =>
          d.cropName.toLowerCase().includes(q) ||
          d.variety.toLowerCase().includes(q)
      );
    }

    if (args.district && args.district !== "all") {
      demands = demands.filter((d) =>
        d.district.toLowerCase().includes(args.district.toLowerCase())
      );
    }

    if (args.state && args.state !== "all") {
      demands = demands.filter((d) =>
        d.state.toLowerCase().includes(args.state.toLowerCase())
      );
    }

    if (args.minPrice && args.minPrice > 0) {
      demands = demands.filter((d) => d.offeredPriceMax >= args.minPrice);
    }

    return demands;
  },
});

export const getById = query({
  args: { demandId: v.id("demands") },
  handler: async (ctx, args) => {
    const demand = await ctx.db.get(args.demandId);
    if (!demand) return null;

    const companyProfile = await ctx.db
      .query("companies")
      .withIndex("by_userId", (q) => q.eq("userId", demand.companyId))
      .first();

    return { ...demand, companyProfile };
  },
});

export const getMatchingDemandsForFarmer = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    const myCrops = await ctx.db
      .query("crops")
      .withIndex("by_farmerId", (q) => q.eq("farmerId", session.userId))
      .collect();

    if (myCrops.length === 0) {
      // return latest 5 active demands
      return await ctx.db
        .query("demands")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(5);
    }

    const cropNames = [...new Set(myCrops.map((c) => c.cropName.toLowerCase()))];
    const allActive = await ctx.db
      .query("demands")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    return allActive.filter((d) => cropNames.includes(d.cropName.toLowerCase()));
  },
});

export const getMatchingCropsForCompany = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    const myDemands = await ctx.db
      .query("demands")
      .withIndex("by_companyId", (q) => q.eq("companyId", session.userId))
      .collect();

    if (myDemands.length === 0) {
      return await ctx.db
        .query("crops")
        .withIndex("by_status", (q) => q.eq("status", "available"))
        .order("desc")
        .take(6);
    }

    const demandedCropNames = [...new Set(myDemands.map((d) => d.cropName.toLowerCase()))];
    const availableCrops = await ctx.db
      .query("crops")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .order("desc")
      .collect();

    return availableCrops.filter((c) => demandedCropNames.includes(c.cropName.toLowerCase()));
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    demandId: v.id("demands"),
    cropName: v.string(),
    variety: v.string(),
    requiredQuantity: v.number(),
    unit: v.string(),
    offeredPriceMin: v.number(),
    offeredPriceMax: v.number(),
    priceUnit: v.string(),
    requiredDate: v.string(),
    deliveryLocation: v.string(),
    district: v.string(),
    state: v.string(),
    qualityRequirements: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("fulfilled"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const demand = await ctx.db.get(args.demandId);

    if (!demand) throw new Error("Demand not found.");
    if (demand.companyId.toString() !== user._id.toString() && user.role !== "admin") {
      throw new Error("Forbidden: You cannot modify another company's demand.");
    }

    await ctx.db.patch(args.demandId, {
      cropName: args.cropName.trim(),
      variety: args.variety.trim(),
      requiredQuantity: args.requiredQuantity,
      unit: args.unit,
      offeredPriceMin: args.offeredPriceMin,
      offeredPriceMax: args.offeredPriceMax,
      priceUnit: args.priceUnit,
      requiredDate: args.requiredDate,
      deliveryLocation: args.deliveryLocation.trim(),
      district: args.district.trim(),
      state: args.state.trim(),
      qualityRequirements: args.qualityRequirements,
      description: args.description || "",
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    demandId: v.id("demands"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const demand = await ctx.db.get(args.demandId);

    if (!demand) throw new Error("Demand not found.");
    if (demand.companyId.toString() !== user._id.toString() && user.role !== "admin") {
      throw new Error("Forbidden: You can only delete your own demands.");
    }

    await ctx.db.delete(args.demandId);
    return { success: true };
  },
});
