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

export const getOrCreate = mutation({
  args: {
    token: v.string(),
    partnerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const partner = await ctx.db.get(args.partnerId);

    if (!partner) throw new Error("Target user not found.");
    if (user._id.toString() === args.partnerId.toString()) {
      throw new Error("Cannot create conversation with yourself.");
    }

    // Check existing conversation
    let conv = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("participant1"), user._id),
            q.eq(q.field("participant2"), args.partnerId)
          ),
          q.and(
            q.eq(q.field("participant1"), args.partnerId),
            q.eq(q.field("participant2"), user._id)
          )
        )
      )
      .first();

    if (conv) return conv._id;

    // Fetch names
    let userName = user.email;
    let partnerName = partner.email;

    if (user.role === "farmer") {
      const f = await ctx.db.query("farmers").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
      if (f) userName = f.fullName;
    } else if (user.role === "company") {
      const c = await ctx.db.query("companies").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
      if (c) userName = c.companyName;
    }

    if (partner.role === "farmer") {
      const f = await ctx.db.query("farmers").withIndex("by_userId", (q) => q.eq("userId", partner._id)).first();
      if (f) partnerName = f.fullName;
    } else if (partner.role === "company") {
      const c = await ctx.db.query("companies").withIndex("by_userId", (q) => q.eq("userId", partner._id)).first();
      if (c) partnerName = c.companyName;
    }

    const now = Date.now();
    const convId = await ctx.db.insert("conversations", {
      participant1: user._id,
      participant2: args.partnerId,
      participant1Name: userName,
      participant1Role: user.role,
      participant2Name: partnerName,
      participant2Role: partner.role,
      lastMessage: "Conversation initiated",
      lastMessageSenderId: user._id,
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return convId;
  },
});

export const list = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    const conversations = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.or(
          q.eq(q.field("participant1"), session.userId),
          q.eq(q.field("participant2"), session.userId)
        )
      )
      .order("desc")
      .collect();

    // Attach unread count & partner details for each conversation
    const result = await Promise.all(
      conversations.map(async (c) => {
        const isUserP1 = c.participant1.toString() === session.userId.toString();
        const partnerId = isUserP1 ? c.participant2 : c.participant1;
        const partnerName = isUserP1 ? c.participant2Name : c.participant1Name;
        const partnerRole = isUserP1 ? c.participant2Role : c.participant1Role;

        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) => q.eq("conversationId", c._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("receiverId"), session.userId),
              q.eq(q.field("isRead"), false)
            )
          )
          .collect();

        let partnerAvatar = null;
        if (partnerRole === "farmer") {
          const f = await ctx.db.query("farmers").withIndex("by_userId", (q) => q.eq("userId", partnerId)).first();
          if (f) partnerAvatar = f.profileImage;
        } else if (partnerRole === "company") {
          const comp = await ctx.db.query("companies").withIndex("by_userId", (q) => q.eq("userId", partnerId)).first();
          if (comp) partnerAvatar = comp.logo;
        }

        return {
          ...c,
          partnerId,
          partnerName,
          partnerRole,
          partnerAvatar,
          unreadCount: unreadMessages.length,
        };
      })
    );

    return result.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});
