// Real-time reactive data engine for AgriConnect
// Implements full reactive queries, live mutations, multi-tab sync (BroadcastChannel), and Convex schema operations

const STORAGE_KEY = "agriconnect_live_db_v1";
const BROADCAST_CHANNEL_NAME = "agriconnect_realtime_events";

let channel = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

// Initial Seed Data
const getInitialSeed = () => {
  const now = Date.now();
  return {
    users: [
      {
        _id: "user_admin_1",
        email: "poornima@gmail.com",
        phone: "+91 9876543200",
        passwordHash: "hash_poornima",
        role: "admin",
        isActive: true,
        createdAt: now - 3600000 * 24 * 30,
        updatedAt: now,
      },
      {
        _id: "user_farmer_1",
        email: "raj.kumar@agriconnect.com",
        phone: "+91 9876543210",
        passwordHash: "hash_farmer123",
        role: "farmer",
        isActive: true,
        createdAt: now - 3600000 * 24 * 15,
        updatedAt: now,
      },
      {
        _id: "user_farmer_2",
        email: "priya.sharma@agriconnect.com",
        phone: "+91 9876543211",
        passwordHash: "hash_farmer123",
        role: "farmer",
        isActive: true,
        createdAt: now - 3600000 * 24 * 10,
        updatedAt: now,
      },
      {
        _id: "user_farmer_3",
        email: "arun.patel@agriconnect.com",
        phone: "+91 9876543212",
        passwordHash: "hash_farmer123",
        role: "farmer",
        isActive: true,
        createdAt: now - 3600000 * 24 * 8,
        updatedAt: now,
      },
      {
        _id: "user_farmer_4",
        email: "meena.devi@agriconnect.com",
        phone: "+91 9876543213",
        passwordHash: "hash_farmer123",
        role: "farmer",
        isActive: true,
        createdAt: now - 3600000 * 24 * 5,
        updatedAt: now,
      },
      {
        _id: "user_company_1",
        email: "procure@abcfoods.com",
        phone: "+91 9123456780",
        passwordHash: "hash_company123",
        role: "company",
        isActive: true,
        createdAt: now - 3600000 * 24 * 20,
        updatedAt: now,
      },
      {
        _id: "user_company_2",
        email: "contact@greenfresh.com",
        phone: "+91 9123456781",
        passwordHash: "hash_company123",
        role: "company",
        isActive: true,
        createdAt: now - 3600000 * 24 * 18,
        updatedAt: now,
      },
      {
        _id: "user_company_3",
        email: "trade@tamilagro.com",
        phone: "+91 9123456782",
        passwordHash: "hash_company123",
        role: "company",
        isActive: true,
        createdAt: now - 3600000 * 24 * 12,
        updatedAt: now,
      },
    ],
    farmers: [
      {
        _id: "farmer_profile_1",
        userId: "user_farmer_1",
        fullName: "Raj Kumar",
        phone: "+91 9876543210",
        email: "raj.kumar@agriconnect.com",
        profileImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300",
        village: "Seithur",
        district: "Virudhunagar",
        state: "Tamil Nadu",
        farmSize: 12,
        farmSizeUnit: "Acres",
        description: "Specialized in drip-irrigated high-grade tomatoes, Bellary onions and groundnuts. Practicing sustainable soil management.",
        createdAt: now - 3600000 * 24 * 15,
        updatedAt: now,
      },
      {
        _id: "farmer_profile_2",
        userId: "user_farmer_2",
        fullName: "Priya Sharma",
        phone: "+91 9876543211",
        email: "priya.sharma@agriconnect.com",
        profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
        village: "Kovilpatti",
        district: "Thoothukudi",
        state: "Tamil Nadu",
        farmSize: 8.5,
        farmSizeUnit: "Acres",
        description: "Producer of certified organic chilli and long-staple cotton. Pioneer in organic farming in South Tamil Nadu.",
        createdAt: now - 3600000 * 24 * 10,
        updatedAt: now,
      },
      {
        _id: "farmer_profile_3",
        userId: "user_farmer_3",
        fullName: "Arun Patel",
        phone: "+91 9876543212",
        email: "arun.patel@agriconnect.com",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
        village: "Alangulam",
        district: "Tenkasi",
        state: "Tamil Nadu",
        farmSize: 20,
        farmSizeUnit: "Acres",
        description: "Large scale river-delta paddy rice and Cavendish banana grower with modern mechanized harvesting support.",
        createdAt: now - 3600000 * 24 * 8,
        updatedAt: now,
      },
      {
        _id: "farmer_profile_4",
        userId: "user_farmer_4",
        fullName: "Meena Devi",
        phone: "+91 9876543213",
        email: "meena.devi@agriconnect.com",
        profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
        village: "Usilampatti",
        district: "Madurai",
        state: "Tamil Nadu",
        farmSize: 6,
        farmSizeUnit: "Acres",
        description: "Experienced grower of table potatoes, medium red onions and fresh farm vegetables.",
        createdAt: now - 3600000 * 24 * 5,
        updatedAt: now,
      },
    ],
    companies: [
      {
        _id: "company_profile_1",
        userId: "user_company_1",
        companyName: "ABC Foods Pvt Ltd",
        email: "procure@abcfoods.com",
        phone: "+91 9123456780",
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300",
        companyType: "Food Processor",
        address: "142 SIDCO Industrial Complex",
        district: "Virudhunagar",
        state: "Tamil Nadu",
        description: "Modern food processing unit producing sauces, purees, and ready-to-cook mixes. Guaranteed transparent weighbridge operations and immediate payment.",
        website: "https://abcfoods-agro.example.com",
        createdAt: now - 3600000 * 24 * 20,
        updatedAt: now,
      },
      {
        _id: "company_profile_2",
        userId: "user_company_2",
        companyName: "GreenFresh Agri Logistics",
        email: "contact@greenfresh.com",
        phone: "+91 9123456781",
        logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300",
        companyType: "Wholesaler & Exporter",
        address: "88 Ring Road Agro Park",
        district: "Madurai",
        state: "Tamil Nadu",
        description: "Cold-chain distribution network supplying fresh crops to major supermarket retail chains across South India.",
        website: "https://greenfresh-logistics.example.com",
        createdAt: now - 3600000 * 24 * 18,
        updatedAt: now,
      },
      {
        _id: "company_profile_3",
        userId: "user_company_3",
        companyName: "Tamil Agro Industries",
        email: "trade@tamilagro.com",
        phone: "+91 9123456782",
        logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=300",
        companyType: "Manufacturer",
        address: "55 Sipcot Industrial Complex",
        district: "Thoothukudi",
        state: "Tamil Nadu",
        description: "Industrial processor of agro commodities, rice milling, cotton processing and oil seed extraction.",
        website: "https://tamilagroind.example.com",
        createdAt: now - 3600000 * 24 * 12,
        updatedAt: now,
      },
    ],
    crops: [
      {
        _id: "crop_1",
        farmerId: "user_farmer_1",
        farmerProfileId: "farmer_profile_1",
        farmerName: "Raj Kumar",
        cropName: "Tomato",
        variety: "Shivam Hybrid & Organic Country",
        quantity: 1500,
        unit: "kg",
        expectedPrice: 28,
        priceUnit: "per kg",
        harvestDate: "2026-10-10",
        location: "Seithur Farm Gate",
        district: "Virudhunagar",
        state: "Tamil Nadu",
        quality: "Grade A",
        description: "Freshly harvested firm red tomatoes with high shelf-life, pesticide residue free.",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
        status: "available",
        createdAt: now - 3600000 * 24 * 2,
        updatedAt: now - 3600000 * 24 * 2,
      },
      {
        _id: "crop_2",
        farmerId: "user_farmer_1",
        farmerProfileId: "farmer_profile_1",
        farmerName: "Raj Kumar",
        cropName: "Onion",
        variety: "Bellary Red Medium",
        quantity: 1000,
        unit: "kg",
        expectedPrice: 35,
        priceUnit: "per kg",
        harvestDate: "2026-10-15",
        location: "Rajapalayam Mandi Road",
        district: "Virudhunagar",
        state: "Tamil Nadu",
        quality: "Grade A",
        description: "Properly cured, dry skinned and pungent onions sorted for commercial processing.",
        image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=600",
        status: "available",
        createdAt: now - 3600000 * 24 * 3,
        updatedAt: now - 3600000 * 24 * 3,
      },
      {
        _id: "crop_3",
        farmerId: "user_farmer_2",
        farmerProfileId: "farmer_profile_2",
        farmerName: "Priya Sharma",
        cropName: "Chilli",
        variety: "Guntur Sannam Hot",
        quantity: 800,
        unit: "kg",
        expectedPrice: 140,
        priceUnit: "per kg",
        harvestDate: "2026-10-05",
        location: "Kovilpatti Highway Farm",
        district: "Thoothukudi",
        state: "Tamil Nadu",
        quality: "Organic Certified",
        description: "Deep red sun-dried hot chillies with strong aroma and high capsaicin content.",
        image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=600",
        status: "available",
        createdAt: now - 3600000 * 24 * 1,
        updatedAt: now - 3600000 * 24 * 1,
      },
      {
        _id: "crop_4",
        farmerId: "user_farmer_2",
        farmerProfileId: "farmer_profile_2",
        farmerName: "Priya Sharma",
        cropName: "Cotton",
        variety: "BT Long Staple",
        quantity: 2500,
        unit: "kg",
        expectedPrice: 72,
        priceUnit: "per kg",
        harvestDate: "2026-10-20",
        location: "Kovilpatti Ginning Yard",
        district: "Thoothukudi",
        state: "Tamil Nadu",
        quality: "Grade A",
        description: "Clean bolls with low moisture, high tensile fiber ideal for spinning mills.",
        image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&q=80&w=600",
        status: "available",
        createdAt: now - 3600000 * 12,
        updatedAt: now - 3600000 * 12,
      },
      {
        _id: "crop_5",
        farmerId: "user_farmer_3",
        farmerProfileId: "farmer_profile_3",
        farmerName: "Arun Patel",
        cropName: "Rice",
        variety: "Sona Masoori Raw",
        quantity: 12000,
        unit: "kg",
        expectedPrice: 48,
        priceUnit: "per kg",
        harvestDate: "2026-09-30",
        location: "Tenkasi Paddy Storage",
        district: "Tenkasi",
        state: "Tamil Nadu",
        quality: "Grade A",
        description: "Aged premium grain rice harvested from fertile canal-fed river delta lands.",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
        status: "available",
        createdAt: now - 3600000 * 36,
        updatedAt: now - 3600000 * 36,
      },
      {
        _id: "crop_6",
        farmerId: "user_farmer_3",
        farmerProfileId: "farmer_profile_3",
        farmerName: "Arun Patel",
        cropName: "Banana",
        variety: "Grand Naine / G9",
        quantity: 4000,
        unit: "kg",
        expectedPrice: 22,
        priceUnit: "per kg",
        harvestDate: "2026-10-08",
        location: "Alangulam Plantation",
        district: "Tenkasi",
        state: "Tamil Nadu",
        quality: "Grade A",
        description: "Export quality uniform clusters, freshly cut to order with zero damage.",
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=600",
        status: "available",
        createdAt: now - 3600000 * 8,
        updatedAt: now - 3600000 * 8,
      },
      {
        _id: "crop_7",
        farmerId: "user_farmer_4",
        farmerProfileId: "farmer_profile_4",
        farmerName: "Meena Devi",
        cropName: "Potato",
        variety: "Kufri Jyoti",
        quantity: 3500,
        unit: "kg",
        expectedPrice: 24,
        priceUnit: "per kg",
        harvestDate: "2026-10-12",
        location: "Usilampatti Cold Depot",
        district: "Madurai",
        state: "Tamil Nadu",
        quality: "Standard",
        description: "Medium to large size table potatoes, zero greening and high starch content.",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600",
        status: "available",
        createdAt: now - 3600000 * 18,
        updatedAt: now - 3600000 * 18,
      },
    ],
    demands: [
      {
        _id: "demand_1",
        companyId: "user_company_1",
        companyProfileId: "company_profile_1",
        companyName: "ABC Foods Pvt Ltd",
        cropName: "Tomato",
        variety: "Hybrid Round / Sauce Grade",
        requiredQuantity: 5000,
        unit: "kg",
        offeredPriceMin: 25,
        offeredPriceMax: 30,
        priceUnit: "per kg",
        requiredDate: "2026-10-15",
        deliveryLocation: "ABC Processing Plant, Virudhunagar",
        district: "Virudhunagar",
        state: "Tamil Nadu",
        qualityRequirements: "Brix level > 4.5, red ripe, minimal blemishes, crates delivery",
        description: "Urgent bulk procurement for batch ketchup production. Prompt digital payment on gate weighing.",
        status: "active",
        createdAt: now - 3600000 * 20,
        updatedAt: now - 3600000 * 20,
      },
      {
        _id: "demand_2",
        companyId: "user_company_1",
        companyProfileId: "company_profile_1",
        companyName: "ABC Foods Pvt Ltd",
        cropName: "Onion",
        variety: "Bellary Medium 40-50mm",
        requiredQuantity: 3000,
        unit: "kg",
        offeredPriceMin: 32,
        offeredPriceMax: 37,
        priceUnit: "per kg",
        requiredDate: "2026-10-25",
        deliveryLocation: "ABC Processing Plant, Virudhunagar",
        district: "Virudhunagar",
        state: "Tamil Nadu",
        qualityRequirements: "Double skinned, sorted, moisture below 14%",
        description: "Looking for long-term supply contract with local farmer cooperatives.",
        status: "active",
        createdAt: now - 3600000 * 16,
        updatedAt: now - 3600000 * 16,
      },
      {
        _id: "demand_3",
        companyId: "user_company_2",
        companyProfileId: "company_profile_2",
        companyName: "GreenFresh Agri Logistics",
        cropName: "Chilli",
        variety: "Guntur Hot Dry",
        requiredQuantity: 1000,
        unit: "kg",
        offeredPriceMin: 135,
        offeredPriceMax: 155,
        priceUnit: "per kg",
        requiredDate: "2026-10-10",
        deliveryLocation: "GreenFresh Central Hub, Madurai",
        district: "Madurai",
        state: "Tamil Nadu",
        qualityRequirements: "Uniform red color, stem-less or clipped, moisture < 10%",
        description: "Sourcing for leading supermarket retail chain packaging.",
        status: "active",
        createdAt: now - 3600000 * 10,
        updatedAt: now - 3600000 * 10,
      },
      {
        _id: "demand_4",
        companyId: "user_company_3",
        companyProfileId: "company_profile_3",
        companyName: "Tamil Agro Industries",
        cropName: "Rice",
        variety: "Sona Masoori / Ponni",
        requiredQuantity: 10000,
        unit: "kg",
        offeredPriceMin: 45,
        offeredPriceMax: 50,
        priceUnit: "per kg",
        requiredDate: "2026-10-30",
        deliveryLocation: "Tamil Agro Grain Mills, Thoothukudi",
        district: "Thoothukudi",
        state: "Tamil Nadu",
        qualityRequirements: "Moisture < 12%, minimal broken percentage",
        description: "Continuous requirement for export consignment packaging.",
        status: "active",
        createdAt: now - 3600000 * 5,
        updatedAt: now - 3600000 * 5,
      },
    ],
    conversations: [
      {
        _id: "conv_1",
        participant1: "user_farmer_1",
        participant2: "user_company_1",
        participant1Name: "Raj Kumar",
        participant1Role: "farmer",
        participant2Name: "ABC Foods Pvt Ltd",
        participant2Role: "company",
        lastMessage: "Hello Raj Kumar, we saw your 1500 kg Tomato listing.",
        lastMessageSenderId: "user_company_1",
        lastMessageAt: now - 3600000 * 2,
        createdAt: now - 3600000 * 3,
        updatedAt: now - 3600000 * 2,
      },
    ],
    messages: [
      {
        _id: "msg_1",
        conversationId: "conv_1",
        senderId: "user_company_1",
        receiverId: "user_farmer_1",
        senderName: "ABC Foods Pvt Ltd",
        message: "Hello Raj Kumar, we saw your 1500 kg Tomato listing in Virudhunagar.",
        messageType: "text",
        isRead: false,
        createdAt: now - 3600000 * 3,
      },
      {
        _id: "msg_2",
        conversationId: "conv_1",
        senderId: "user_company_1",
        receiverId: "user_farmer_1",
        senderName: "ABC Foods Pvt Ltd",
        message: "We can procure the entire batch. Can you provide Grade A crate packaging?",
        messageType: "text",
        isRead: false,
        createdAt: now - 3600000 * 2,
      },
    ],
    offers: [],
    deals: [],
    notifications: [
      {
        _id: "notif_1",
        userId: "user_farmer_1",
        type: "new_demand",
        title: "New Demand: Tomato Needed! 🍅",
        message: "ABC Foods posted requirement for 5000 kg Tomato in Virudhunagar at ₹25–₹30/kg.",
        relatedId: "demand_1",
        link: "/farmer/demands",
        isRead: false,
        createdAt: now - 3600000 * 20,
      },
      {
        _id: "notif_2",
        userId: "user_farmer_1",
        type: "new_message",
        title: "Message from ABC Foods Pvt Ltd 💬",
        message: "We can procure the entire batch. Can you provide Grade A crate packaging?",
        relatedId: "conv_1",
        link: "/farmer/messages",
        isRead: false,
        createdAt: now - 3600000 * 2,
      },
      {
        _id: "notif_3",
        userId: "user_company_1",
        type: "new_crop",
        title: "New Crop Listed: Tomato 🍅",
        message: "Raj Kumar listed 1500 kg Tomato at ₹28/kg in Virudhunagar.",
        relatedId: "crop_1",
        link: "/company/farmers",
        isRead: true,
        createdAt: now - 3600000 * 24 * 2,
      },
    ],
    reports: [],
  };
};

class LiveDatabase {
  constructor() {
    this.listeners = new Set();
    this.data = this.loadData();

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data && event.data.type === "DB_UPDATED") {
          this.data = this.loadData();
          this.notifyListeners();
        }
      };
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY) {
          this.data = this.loadData();
          this.notifyListeners();
        }
      });
    }
  }

  loadData() {
    if (typeof window === "undefined") return getInitialSeed();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure admin user matches poornima@gmail.com
        const adminUser = parsed.users?.find((u) => u.role === "admin" || u._id === "user_admin_1");
        if (adminUser) {
          adminUser.email = "poornima@gmail.com";
          adminUser.passwordHash = "hash_poornima";
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load local DB:", e);
    }
    const seed = getInitialSeed();
    this.saveData(seed, false);
    return seed;
  }

  saveData(data, notify = true) {
    this.data = data;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        if (notify && channel) {
          channel.postMessage({ type: "DB_UPDATED", timestamp: Date.now() });
        }
      } catch (e) {
        console.error("Failed to save local DB:", e);
      }
    }
    if (notify) {
      this.notifyListeners();
    }
  }

  resetToSeed() {
    const seed = getInitialSeed();
    this.saveData(seed, true);
    return seed;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.data);
      } catch (err) {
        console.error("Listener error:", err);
      }
    }
  }

  generateId(prefix = "item") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

export const liveDb = new LiveDatabase();
