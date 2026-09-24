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
    receiverId: v.id("users"),
    cropId: v.optional(v.id("crops")),
    demandId: v.optional(v.id("demands")),
    cropName: v.string(),
    conversationId: v.id("conversations"),
    quantity: v.number(),
    unit: v.string(),
    pricePerUnit: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const receiver = await ctx.db.get(args.receiverId);
    if (!receiver) throw new Error("Receiver not found.");

    let senderName = user.email;
    let receiverName = receiver.email;

    if (user.role === "farmer") {
      const f = await ctx.db.query("farmers").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
      if (f) senderName = f.fullName;
    } else if (user.role === "company") {
      const c = await ctx.db.query("companies").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
      if (c) senderName = c.companyName;
    }

    if (receiver.role === "farmer") {
      const f = await ctx.db.query("farmers").withIndex("by_userId", (q) => q.eq("userId", receiver._id)).first();
      if (f) receiverName = f.fullName;
    } else if (receiver.role === "company") {
      const c = await ctx.db.query("companies").withIndex("by_userId", (q) => q.eq("userId", receiver._id)).first();
      if (c) receiverName = c.companyName;
    }

    const totalAmount = args.quantity * args.pricePerUnit;
    const now = Date.now();

    const offerId = await ctx.db.insert("offers", {
      senderId: user._id,
      receiverId: args.receiverId,
      senderName,
      receiverName,
      senderRole: user.role,
      cropId: args.cropId,
      demandId: args.demandId,
      cropName: args.cropName,
      conversationId: args.conversationId,
      quantity: args.quantity,
      unit: args.unit,
      pricePerUnit: args.pricePerUnit,
      totalAmount,
      message: args.message || "",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Send offer message inside chat
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      receiverId: args.receiverId,
      senderName,
      message: `Offer: ${args.quantity} ${args.unit} of ${args.cropName} at ₹${args.pricePerUnit}/${args.unit} (Total: ₹${totalAmount.toLocaleString()})`,
      messageType: "offer",
      offerId,
      isRead: false,
      createdAt: now,
    });

    await ctx.db.patch(args.conversationId, {
      lastMessage: `🤝 New Offer: ₹${totalAmount.toLocaleString()} for ${args.cropName}`,
      lastMessageSenderId: user._id,
      lastMessageAt: now,
      updatedAt: now,
    });

    // Notification to receiver
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "new_offer",
      title: `New Trade Offer for ${args.cropName} 💰`,
      message: `${senderName} offered ₹${args.pricePerUnit}/${args.unit} for ${args.quantity} ${args.unit}. Total: ₹${totalAmount.toLocaleString()}`,
      relatedId: offerId.toString(),
      link: user.role === "farmer" ? "/company/deals" : "/farmer/deals",
      isRead: false,
      createdAt: now,
    });

    return offerId;
  },
});

export const respond = mutation({
  args: {
    token: v.string(),
    offerId: v.id("offers"),
    action: v.union(v.literal("accept"), v.literal("reject"), v.literal("counter")),
    counterPrice: v.optional(v.number()),
    counterQuantity: v.optional(v.number()),
    counterNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx, args.token);
    const offer = await ctx.db.get(args.offerId);

    if (!offer) throw new Error("Offer not found.");

    // Verification: user must be receiver (or sender if responding to counter)
    const isReceiver = offer.receiverId.toString() === user._id.toString();
    const isSender = offer.senderId.toString() === user._id.toString();

    if (!isReceiver && !isSender) {
      throw new Error("Forbidden: You are not authorized to respond to this offer.");
    }

    const partnerId = isReceiver ? offer.senderId : offer.receiverId;
    const now = Date.now();

    if (args.action === "accept") {
      await ctx.db.patch(args.offerId, {
        status: "accepted",
        updatedAt: now,
      });

      const agreedQuantity = offer.counterQuantity || offer.quantity;
      const agreedPrice = offer.counterPrice || offer.pricePerUnit;
      const totalAmount = agreedQuantity * agreedPrice;

      // Identify farmer vs company
      let farmerId = offer.senderRole === "farmer" ? offer.senderId : offer.receiverId;
      let farmerName = offer.senderRole === "farmer" ? offer.senderName : offer.receiverName;
      let companyId = offer.senderRole === "company" ? offer.senderId : offer.receiverId;
      let companyName = offer.senderRole === "company" ? offer.senderName : offer.receiverName;

      // Create Confirmed Deal
      const dealId = await ctx.db.insert("deals", {
        offerId: offer._id,
        farmerId,
        farmerName,
        companyId,
        companyName,
        cropId: offer.cropId,
        demandId: offer.demandId,
        cropName: offer.cropName,
        agreedQuantity,
        unit: offer.unit,
        agreedPrice,
        totalAmount,
        status: "confirmed",
        notes: "Offer accepted. Deal confirmed by parties.",
        createdAt: now,
        updatedAt: now,
      });

      // Notify both parties
      await ctx.db.insert("notifications", {
        userId: farmerId,
        type: "deal_created",
        title: "🎉 Deal Confirmed!",
        message: `Deal for ${agreedQuantity} ${offer.unit} of ${offer.cropName} with ${companyName} has been confirmed. Total: ₹${totalAmount.toLocaleString()}`,
        relatedId: dealId.toString(),
        link: "/farmer/deals",
        isRead: false,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: companyId,
        type: "deal_created",
        title: "🎉 Deal Confirmed!",
        message: `Deal for ${agreedQuantity} ${offer.unit} of ${offer.cropName} with ${farmerName} has been confirmed. Total: ₹${totalAmount.toLocaleString()}`,
        relatedId: dealId.toString(),
        link: "/company/deals",
        isRead: false,
        createdAt: now,
      });

      // System message in chat
      await ctx.db.insert("messages", {
        conversationId: offer.conversationId,
        senderId: user._id,
        receiverId: partnerId,
        senderName: "AgriConnect System",
        message: `🎉 Offer ACCEPTED! Deal #${dealId.toString().slice(-6).toUpperCase()} created for ${agreedQuantity} ${offer.unit} of ${offer.cropName} at ₹${agreedPrice}/${offer.unit} (₹${totalAmount.toLocaleString()}).`,
        messageType: "system",
        isRead: false,
        createdAt: now,
      });

      return { success: true, dealId };
    } else if (args.action === "reject") {
      await ctx.db.patch(args.offerId, {
        status: "rejected",
        updatedAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: partnerId,
        type: "offer_rejected",
        title: "Offer Declined ❌",
        message: `Your offer for ${offer.cropName} was declined.`,
        relatedId: offer._id.toString(),
        link: user.role === "farmer" ? "/farmer/deals" : "/company/deals",
        isRead: false,
        createdAt: now,
      });

      await ctx.db.insert("messages", {
        conversationId: offer.conversationId,
        senderId: user._id,
        receiverId: partnerId,
        senderName: "AgriConnect System",
        message: `❌ Offer for ${offer.cropName} was declined.`,
        messageType: "system",
        isRead: false,
        createdAt: now,
      });

      return { success: true };
    } else if (args.action === "counter") {
      if (!args.counterPrice || args.counterPrice <= 0) {
        throw new Error("Please specify a valid counter price.");
      }

      const counterQuantity = args.counterQuantity || offer.quantity;
      const counterTotal = counterQuantity * args.counterPrice;

      await ctx.db.patch(args.offerId, {
        status: "countered",
        counterPrice: args.counterPrice,
        counterQuantity,
        counterTotalAmount: counterTotal,
        counterNotes: args.counterNotes || "",
        updatedAt: now,
      });

      await ctx.db.insert("notifications", {
        userId: partnerId,
        type: "counter_offer",
        title: `Counter Offer: ₹${args.counterPrice}/${offer.unit} 🔄`,
        message: `A counter-offer for ${offer.cropName} was submitted (${counterQuantity} ${offer.unit} at ₹${args.counterPrice}/${offer.unit}).`,
        relatedId: offer._id.toString(),
        link: user.role === "farmer" ? "/farmer/deals" : "/company/deals",
        isRead: false,
        createdAt: now,
      });

      await ctx.db.insert("messages", {
        conversationId: offer.conversationId,
        senderId: user._id,
        receiverId: partnerId,
        senderName: user.email,
        message: `🔄 Counter Offer: ${counterQuantity} ${offer.unit} of ${offer.cropName} at ₹${args.counterPrice}/${offer.unit} (Total: ₹${counterTotal.toLocaleString()})${args.counterNotes ? ` - Note: "${args.counterNotes}"` : ""}`,
        messageType: "offer",
        offerId: offer._id,
        isRead: false,
        createdAt: now,
      });

      return { success: true };
    }
  },
});

export const getMyOffers = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return [];
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();
    if (!session) return [];

    const sent = await ctx.db
      .query("offers")
      .withIndex("by_senderId", (q) => q.eq("senderId", session.userId))
      .collect();

    const received = await ctx.db
      .query("offers")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", session.userId))
      .collect();

    const all = [...sent, ...received];
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
