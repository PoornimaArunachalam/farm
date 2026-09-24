import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authId: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    passwordHash: v.string(),
    salt: v.string(),
    role: v.union(v.literal("farmer"), v.literal("company"), v.literal("admin")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    role: v.union(v.literal("farmer"), v.literal("company"), v.literal("admin")),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  farmers: defineTable({
    userId: v.id("users"),
    fullName: v.string(),
    phone: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    village: v.string(),
    district: v.string(),
    state: v.string(),
    farmSize: v.number(),
    farmSizeUnit: v.string(), // "Acres", "Hectares", "Bigha"
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_district", ["district"])
    .index("by_state", ["state"]),

  companies: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    email: v.string(),
    phone: v.string(),
    logo: v.optional(v.string()),
    companyType: v.string(), // "Food Processor", "Exporter", "Wholesaler", "Retail Chain", "Agri-Tech", "Manufacturer"
    address: v.string(),
    district: v.string(),
    state: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_district", ["district"])
    .index("by_state", ["state"]),

  crops: defineTable({
    farmerId: v.id("users"),
    farmerProfileId: v.optional(v.id("farmers")),
    farmerName: v.string(),
    cropName: v.string(),
    variety: v.string(),
    quantity: v.number(),
    unit: v.string(), // "kg", "quintal", "ton", "crates"
    expectedPrice: v.number(),
    priceUnit: v.string(), // "per kg", "per quintal", "per ton"
    harvestDate: v.string(),
    location: v.string(),
    district: v.string(),
    state: v.string(),
    quality: v.string(), // "Grade A", "Grade B", "Organic Certified", "Standard"
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    status: v.union(v.literal("available"), v.literal("partially_sold"), v.literal("sold"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_farmerId", ["farmerId"])
    .index("by_cropName", ["cropName"])
    .index("by_status", ["status"])
    .index("by_district", ["district"])
    .index("by_state", ["state"]),

  demands: defineTable({
    companyId: v.id("users"),
    companyProfileId: v.optional(v.id("companies")),
    companyName: v.string(),
    cropName: v.string(),
    variety: v.string(),
    requiredQuantity: v.number(),
    unit: v.string(), // "kg", "quintal", "ton"
    offeredPriceMin: v.number(),
    offeredPriceMax: v.number(),
    priceUnit: v.string(), // "per kg", "per quintal", "per ton"
    requiredDate: v.string(),
    deliveryLocation: v.string(),
    district: v.string(),
    state: v.string(),
    qualityRequirements: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("fulfilled"), v.literal("expired"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_companyId", ["companyId"])
    .index("by_cropName", ["cropName"])
    .index("by_status", ["status"])
    .index("by_district", ["district"])
    .index("by_state", ["state"]),

  conversations: defineTable({
    participant1: v.id("users"), // farmer or company user id
    participant2: v.id("users"), // company or farmer user id
    participant1Name: v.string(),
    participant1Role: v.string(),
    participant2Name: v.string(),
    participant2Role: v.string(),
    lastMessage: v.string(),
    lastMessageSenderId: v.optional(v.id("users")),
    lastMessageAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_participant1", ["participant1"])
    .index("by_participant2", ["participant2"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    senderName: v.string(),
    message: v.string(),
    messageType: v.union(v.literal("text"), v.literal("offer"), v.literal("system")),
    offerId: v.optional(v.id("offers")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_receiverId", ["receiverId", "isRead"]),

  offers: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    senderName: v.string(),
    receiverName: v.string(),
    senderRole: v.string(),
    cropId: v.optional(v.id("crops")),
    demandId: v.optional(v.id("demands")),
    cropName: v.string(),
    conversationId: v.id("conversations"),
    quantity: v.number(),
    unit: v.string(),
    pricePerUnit: v.number(),
    totalAmount: v.number(),
    message: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected"), v.literal("countered"), v.literal("cancelled")),
    counterQuantity: v.optional(v.number()),
    counterPrice: v.optional(v.number()),
    counterTotalAmount: v.optional(v.number()),
    counterNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_senderId", ["senderId"])
    .index("by_receiverId", ["receiverId"]),

  deals: defineTable({
    offerId: v.id("offers"),
    farmerId: v.id("users"),
    farmerName: v.string(),
    companyId: v.id("users"),
    companyName: v.string(),
    cropId: v.optional(v.id("crops")),
    demandId: v.optional(v.id("demands")),
    cropName: v.string(),
    agreedQuantity: v.number(),
    unit: v.string(),
    agreedPrice: v.number(),
    totalAmount: v.number(),
    status: v.union(v.literal("confirmed"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    deliveryDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_farmerId", ["farmerId"])
    .index("by_companyId", ["companyId"])
    .index("by_status", ["status"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_demand"),
      v.literal("new_crop"),
      v.literal("new_message"),
      v.literal("new_offer"),
      v.literal("offer_accepted"),
      v.literal("offer_rejected"),
      v.literal("counter_offer"),
      v.literal("deal_created"),
      v.literal("deal_status_updated"),
      v.literal("system")
    ),
    title: v.string(),
    message: v.string(),
    relatedId: v.optional(v.string()),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),

  reports: defineTable({
    reportedBy: v.id("users"),
    reporterName: v.string(),
    targetUser: v.optional(v.id("users")),
    targetUserName: v.optional(v.string()),
    targetType: v.union(v.literal("farmer"), v.literal("company"), v.literal("crop"), v.literal("demand")),
    targetId: v.string(),
    reason: v.string(),
    description: v.string(),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("resolved"), v.literal("dismissed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"]),
});
