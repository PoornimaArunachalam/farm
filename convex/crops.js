import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper to authenticate user session
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
    quantity: v.number(),
    unit: v.string(),
    expectedPrice: v.number(),
    priceUnit: v.string(),
    harvestDate: v.string(),
    location: v.string(),
    district: v.string(),
    state: v.string(),
    quality: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    if (user.role !== "farmer") {
      throw new Error("Forbidden: Only farmers can list crops.");
    }

    if (args.quantity <= 0) throw new Error("Quantity must be greater than 0");
    if (args.expectedPrice <= 0) throw new Error("Price must be greater than 0");

    const farmerProfile = await ctx.db
      .query("farmers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const farmerName = farmerProfile ? farmerProfile.fullName : "Farmer";
    const now = Date.now();

    const cropId = await ctx.db.insert("crops", {
      farmerId: user._id,
      farmerProfileId: farmerProfile?._id,
      farmerName,
      cropName: args.cropName.trim(),
      variety: args.variety.trim(),
      quantity: args.quantity,
      unit: args.unit,
      expectedPrice: args.expectedPrice,
      priceUnit: args.priceUnit,
      harvestDate: args.harvestDate,
      location: args.location.trim(),
      district: args.district.trim(),
      state: args.state.trim(),
      quality: args.quality,
      description: args.description || "",
      image: args.image || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now,
      updatedAt: now,
    });

    // Notify companies seeking this crop
    const matchingDemands = await ctx.db
      .query("demands")
      .withIndex("by_cropName", (q) => q.eq("cropName", args.cropName.trim()))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const notifiedCompanies = new Set();
    for (const demand of matchingDemands) {
      if (!notifiedCompanies.has(demand.companyId.toString())) {
        notifiedCompanies.add(demand.companyId.toString());
        await ctx.db.insert("notifications", {
          userId: demand.companyId,
          type: "new_crop",
          title: `New Crop Listed: ${args.cropName} 🌾`,
          message: `${farmerName} from ${args.district}, ${args.state} listed ${args.quantity} ${args.unit} of ${args.cropName} at ₹${args.expectedPrice} ${args.priceUnit}.`,
          relatedId: cropId.toString(),
          link: `/company/farmers`,
          isRead: false,
          createdAt: now,
        });
      }
    }

    return cropId;
  },
});

export const getMyCrops = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    return await ctx.db
      .query("crops")
      .withIndex("by_farmerId", (q) => q.eq("farmerId", session.userId))
      .order("desc")
      .collect();
  },
});

export const getAllAvailable = query({
  args: {
    cropName: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    minQuantity: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    quality: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let crops = await ctx.db
      .query("crops")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "available"),
          q.eq(q.field("status"), "partially_sold")
        )
      )
      .order("desc")
      .collect();

    if (args.cropName && args.cropName.trim() !== "") {
      const q = args.cropName.toLowerCase();
      crops = crops.filter(
        (c) =>
          c.cropName.toLowerCase().includes(q) ||
          c.variety.toLowerCase().includes(q)
      );
    }

    if (args.district && args.district !== "all") {
      crops = crops.filter((c) =>
        c.district.toLowerCase().includes(args.district.toLowerCase())
      );
    }

    if (args.state && args.state !== "all") {
      crops = crops.filter((c) =>
        c.state.toLowerCase().includes(args.state.toLowerCase())
      );
    }

    if (args.minQuantity && args.minQuantity > 0) {
      crops = crops.filter((c) => c.quantity >= args.minQuantity);
    }

    if (args.maxPrice && args.maxPrice > 0) {
      crops = crops.filter((c) => c.expectedPrice <= args.maxPrice);
    }

    if (args.quality && args.quality !== "all") {
      crops = crops.filter((c) => c.quality === args.quality);
    }

    return crops;
  },
});

export const getById = query({
  args: { cropId: v.id("crops") },
  handler: async (ctx, args) => {
    const crop = await ctx.db.get(args.cropId);
    if (!crop) return null;

    const farmerProfile = await ctx.db
      .query("farmers")
      .withIndex("by_userId", (q) => q.eq("userId", crop.farmerId))
      .first();

    return { ...crop, farmerProfile };
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    cropId: v.id("crops"),
    cropName: v.string(),
    variety: v.string(),
    quantity: v.number(),
    unit: v.string(),
    expectedPrice: v.number(),
    priceUnit: v.string(),
    harvestDate: v.string(),
    location: v.string(),
    district: v.string(),
    state: v.string(),
    quality: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    status: v.union(
      v.literal("available"),
      v.literal("partially_sold"),
      v.literal("sold"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const crop = await ctx.db.get(args.cropId);

    if (!crop) throw new Error("Crop listing not found.");
    if (crop.farmerId.toString() !== user._id.toString() && user.role !== "admin") {
      throw new Error("Forbidden: You cannot edit another farmer's crop.");
    }

    await ctx.db.patch(args.cropId, {
      cropName: args.cropName.trim(),
      variety: args.variety.trim(),
      quantity: args.quantity,
      unit: args.unit,
      expectedPrice: args.expectedPrice,
      priceUnit: args.priceUnit,
      harvestDate: args.harvestDate,
      location: args.location.trim(),
      district: args.district.trim(),
      state: args.state.trim(),
      quality: args.quality,
      description: args.description || "",
      image: args.image || crop.image,
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    token: v.string(),
    cropId: v.id("crops"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const crop = await ctx.db.get(args.cropId);

    if (!crop) throw new Error("Crop not found.");
    if (crop.farmerId.toString() !== user._id.toString() && user.role !== "admin") {
      throw new Error("Forbidden: You can only delete your own crops.");
    }

    await ctx.db.delete(args.cropId);
    return { success: true };
  },
});
