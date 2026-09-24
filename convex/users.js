import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper for simple deterministic hashing with salt
function hashPassword(password, salt) {
  let hash = 0;
  const str = password + ":" + salt + ":agriconnect_secure_salt_2026";
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16) + "_" + str.length;
}

export const register = mutation({
  args: {
    role: v.union(v.literal("farmer"), v.literal("company")),
    email: v.string(),
    phone: v.string(),
    password: v.string(),
    fullName: v.optional(v.string()),
    village: v.optional(v.string()),
    district: v.string(),
    state: v.string(),
    farmSize: v.optional(v.number()),
    farmSizeUnit: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companyType: v.optional(v.string()),
    address: v.optional(v.string()),
    companyDescription: v.optional(v.string()),
    website: v.optional(v.string()),
    companyLogo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (existing) {
      throw new Error("User with this email already exists.");
    }

    const salt = Math.random().toString(36).substring(2, 10);
    const passwordHash = hashPassword(args.password, salt);
    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase().trim(),
      phone: args.phone,
      passwordHash,
      salt,
      role: args.role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    if (args.role === "farmer") {
      await ctx.db.insert("farmers", {
        userId,
        fullName: args.fullName || "Farmer",
        phone: args.phone,
        email: args.email.toLowerCase().trim(),
        profileImage: args.profileImage || "https://images.unsplash.com/photo-1592417817098-8f3d691a4574?auto=format&fit=crop&q=80&w=300",
        village: args.village || "",
        district: args.district,
        state: args.state,
        farmSize: args.farmSize || 5,
        farmSizeUnit: args.farmSizeUnit || "Acres",
        description: "Passionate farmer dedicated to producing high quality organic and fresh produce.",
        createdAt: now,
        updatedAt: now,
      });
    } else if (args.role === "company") {
      await ctx.db.insert("companies", {
        userId,
        companyName: args.companyName || "Agri Enterprise",
        email: args.email.toLowerCase().trim(),
        phone: args.phone,
        logo: args.companyLogo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300",
        companyType: args.companyType || "Food Processor",
        address: args.address || "",
        district: args.district,
        state: args.state,
        description: args.companyDescription || "Leading agricultural procurement & processing company.",
        website: args.website || "",
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create session token
    const token = "session_" + Math.random().toString(36).substring(2) + "_" + now;
    await ctx.db.insert("sessions", {
      token,
      userId,
      role: args.role,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000,
      createdAt: now,
    });

    // Create welcome notification
    await ctx.db.insert("notifications", {
      userId,
      type: "system",
      title: "Welcome to AgriConnect! 🌱",
      message: `Your account as a ${args.role.toUpperCase()} has been created. Start exploring live market deals.`,
      isRead: false,
      createdAt: now,
    });

    return { token, userId, role: args.role };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (!user.isActive) {
      throw new Error("This account has been deactivated by administrator.");
    }

    const expectedHash = hashPassword(args.password, user.salt);
    if (expectedHash !== user.passwordHash) {
      throw new Error("Invalid email or password.");
    }

    const now = Date.now();
    const token = "session_" + Math.random().toString(36).substring(2) + "_" + now;
    await ctx.db.insert("sessions", {
      token,
      userId: user._id,
      role: user.role,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000,
      createdAt: now,
    });

    return { token, userId: user._id, role: user.role };
  },
});

export const getCurrentUser = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) return null;

    const user = await ctx.db.get(session.userId);
    if (!user || !user.isActive) return null;

    let profile = null;
    if (user.role === "farmer") {
      profile = await ctx.db
        .query("farmers")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();
    } else if (user.role === "company") {
      profile = await ctx.db
        .query("companies")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();
    }

    return {
      _id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      profile,
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
    return { success: true };
  },
});
