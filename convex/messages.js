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

export const send = mutation({
  args: {
    token: v.string(),
    conversationId: v.id("conversations"),
    message: v.string(),
    messageType: v.optional(v.union(v.literal("text"), v.literal("offer"), v.literal("system"))),
    offerId: v.optional(v.id("offers")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const conv = await ctx.db.get(args.conversationId);

    if (!conv) throw new Error("Conversation not found.");

    const isP1 = conv.participant1.toString() === user._id.toString();
    const isP2 = conv.participant2.toString() === user._id.toString();

    if (!isP1 && !isP2) {
      throw new Error("Forbidden: You are not a participant in this conversation.");
    }

    const receiverId = isP1 ? conv.participant2 : conv.participant1;
    const senderName = isP1 ? conv.participant1Name : conv.participant2Name;
    const now = Date.now();

    const msgId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      receiverId,
      senderName,
      message: args.message.trim(),
      messageType: args.messageType || "text",
      offerId: args.offerId,
      isRead: false,
      createdAt: now,
    });

    // Update conversation summary
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.messageType === "offer" ? "📦 Sent a crop trade offer" : args.message.trim(),
      lastMessageSenderId: user._id,
      lastMessageAt: now,
      updatedAt: now,
    });

    // Notification to receiver
    if (args.messageType !== "offer") {
      await ctx.db.insert("notifications", {
        userId: receiverId,
        type: "new_message",
        title: `Message from ${senderName} 💬`,
        message: args.message.trim().substring(0, 100),
        relatedId: args.conversationId.toString(),
        link: user.role === "farmer" ? "/company/messages" : "/farmer/messages",
        isRead: false,
        createdAt: now,
      });
    }

    return msgId;
  },
});

export const list = query({
  args: {
    token: v.optional(v.string()),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    // Attach offer details if messageType === "offer"
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.offerId) {
          const offer = await ctx.db.get(msg.offerId);
          return { ...msg, offer };
        }
        return msg;
      })
    );

    return enrichedMessages;
  },
});

export const markAsRead = mutation({
  args: {
    token: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);

    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("receiverId"), user._id),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    for (const msg of unreadMessages) {
      await ctx.db.patch(msg._id, { isRead: true });
    }

    return { updated: unreadMessages.length };
  },
});
