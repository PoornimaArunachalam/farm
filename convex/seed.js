import { mutation } from "./_generated/server";

export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const usersCount = (await ctx.db.query("users").collect()).length;
    if (usersCount > 0) {
      return { message: "Database already populated.", seeded: false };
    }

    const now = Date.now();
    const hash = (pwd) => "seed_hash_" + pwd;

    // 1. Admin User
    const adminId = await ctx.db.insert("users", {
      email: "poornima@gmail.com",
      phone: "+91 9876543200",
      passwordHash: hash("poornima"),
      salt: "salt_admin",
      role: "admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Farmers
    const f1Id = await ctx.db.insert("users", {
      email: "raj.kumar@agriconnect.com",
      phone: "+91 9876543210",
      passwordHash: hash("farmer123"),
      salt: "salt_f1",
      role: "farmer",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const f1ProfileId = await ctx.db.insert("farmers", {
      userId: f1Id,
      fullName: "Raj Kumar",
      phone: "+91 9876543210",
      email: "raj.kumar@agriconnect.com",
      profileImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300",
      village: "Seithur",
      district: "Virudhunagar",
      state: "Tamil Nadu",
      farmSize: 12,
      farmSizeUnit: "Acres",
      description: "Progressive farmer with 15+ years experience cultivating high-yield organic tomatoes, onions and groundnuts.",
      createdAt: now,
      updatedAt: now,
    });

    const f2Id = await ctx.db.insert("users", {
      email: "priya.sharma@agriconnect.com",
      phone: "+91 9876543211",
      passwordHash: hash("farmer123"),
      salt: "salt_f2",
      role: "farmer",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const f2ProfileId = await ctx.db.insert("farmers", {
      userId: f2Id,
      fullName: "Priya Sharma",
      phone: "+91 9876543211",
      email: "priya.sharma@agriconnect.com",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
      village: "Kovilpatti",
      district: "Thoothukudi",
      state: "Tamil Nadu",
      farmSize: 8.5,
      farmSizeUnit: "Acres",
      description: "Specialized in drip-irrigated chilli, cotton, and organic millets with zero synthetic pesticides.",
      createdAt: now,
      updatedAt: now,
    });

    const f3Id = await ctx.db.insert("users", {
      email: "arun.patel@agriconnect.com",
      phone: "+91 9876543212",
      passwordHash: hash("farmer123"),
      salt: "salt_f3",
      role: "farmer",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const f3ProfileId = await ctx.db.insert("farmers", {
      userId: f3Id,
      fullName: "Arun Patel",
      phone: "+91 9876543212",
      email: "arun.patel@agriconnect.com",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      village: "Alangulam",
      district: "Tenkasi",
      state: "Tamil Nadu",
      farmSize: 20,
      farmSizeUnit: "Acres",
      description: "Large scale paddy rice and premium Cavendish banana grower supplying export grade consignments.",
      createdAt: now,
      updatedAt: now,
    });

    const f4Id = await ctx.db.insert("users", {
      email: "meena.devi@agriconnect.com",
      phone: "+91 9876543213",
      passwordHash: hash("farmer123"),
      salt: "salt_f4",
      role: "farmer",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const f4ProfileId = await ctx.db.insert("farmers", {
      userId: f4Id,
      fullName: "Meena Devi",
      phone: "+91 9876543213",
      email: "meena.devi@agriconnect.com",
      profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
      village: "Usilampatti",
      district: "Madurai",
      state: "Tamil Nadu",
      farmSize: 6,
      farmSizeUnit: "Acres",
      description: "Quality producer of organic potatoes, certified grade onions, and fresh seasonal vegetables.",
      createdAt: now,
      updatedAt: now,
    });

    // 3. Companies
    const c1Id = await ctx.db.insert("users", {
      email: "procure@abcfoods.com",
      phone: "+91 9123456780",
      passwordHash: hash("company123"),
      salt: "salt_c1",
      role: "company",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const c1ProfileId = await ctx.db.insert("companies", {
      userId: c1Id,
      companyName: "ABC Foods Pvt Ltd",
      email: "procure@abcfoods.com",
      phone: "+91 9123456780",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300",
      companyType: "Food Processor",
      address: "142 SIDCO Industrial Estate",
      district: "Virudhunagar",
      state: "Tamil Nadu",
      description: "Leading agro-processing and sauce manufacturing unit sourcing fresh farm produce directly from farmers with on-spot digital payment.",
      website: "https://abcfoods-agro.example.com",
      createdAt: now,
      updatedAt: now,
    });

    const c2Id = await ctx.db.insert("users", {
      email: "contact@greenfresh.com",
      phone: "+91 9123456781",
      passwordHash: hash("company123"),
      salt: "salt_c2",
      role: "company",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const c2ProfileId = await ctx.db.insert("companies", {
      userId: c2Id,
      companyName: "GreenFresh Agri Logistics",
      email: "contact@greenfresh.com",
      phone: "+91 9123456781",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300",
      companyType: "Wholesaler & Exporter",
      address: "88 Ring Road Agro Park",
      district: "Madurai",
      state: "Tamil Nadu",
      description: "Direct farm-to-supermarket cold chain distributor supplying over 200 retail grocery stores.",
      website: "https://greenfresh-logistics.example.com",
      createdAt: now,
      updatedAt: now,
    });

    const c3Id = await ctx.db.insert("users", {
      email: "trade@tamilagro.com",
      phone: "+91 9123456782",
      passwordHash: hash("company123"),
      salt: "salt_c3",
      role: "company",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const c3ProfileId = await ctx.db.insert("companies", {
      userId: c3Id,
      companyName: "Tamil Agro Industries",
      email: "trade@tamilagro.com",
      phone: "+91 9123456782",
      logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=300",
      companyType: "Manufacturer",
      address: "55 Sipcot Industrial Complex",
      district: "Thoothukudi",
      state: "Tamil Nadu",
      description: "Industrial processor of cotton yarns, seed oil extraction, and bulk flour milling.",
      website: "https://tamilagroind.example.com",
      createdAt: now,
      updatedAt: now,
    });

    // 4. Crops
    const crop1 = await ctx.db.insert("crops", {
      farmerId: f1Id,
      farmerProfileId: f1ProfileId,
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
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now - 3600000 * 24 * 2,
      updatedAt: now - 3600000 * 24 * 2,
    });

    const crop2 = await ctx.db.insert("crops", {
      farmerId: f1Id,
      farmerProfileId: f1ProfileId,
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
      image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now - 3600000 * 24 * 3,
      updatedAt: now - 3600000 * 24 * 3,
    });

    const crop3 = await ctx.db.insert("crops", {
      farmerId: f2Id,
      farmerProfileId: f2ProfileId,
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
      image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now - 3600000 * 24 * 1,
      updatedAt: now - 3600000 * 24 * 1,
    });

    const crop4 = await ctx.db.insert("crops", {
      farmerId: f2Id,
      farmerProfileId: f2ProfileId,
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
      image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now - 3600000 * 12,
      updatedAt: now - 3600000 * 12,
    });

    const crop5 = await ctx.db.insert("crops", {
      farmerId: f3Id,
      farmerProfileId: f3ProfileId,
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
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now - 3600000 * 36,
      updatedAt: now - 3600000 * 36,
    });

    const crop6 = await ctx.db.insert("crops", {
      farmerId: f3Id,
      farmerProfileId: f3ProfileId,
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
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now - 3600000 * 8,
      updatedAt: now - 3600000 * 8,
    });

    const crop7 = await ctx.db.insert("crops", {
      farmerId: f4Id,
      farmerProfileId: f4ProfileId,
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
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400",
      status: "available",
      createdAt: now - 3600000 * 18,
      updatedAt: now - 3600000 * 18,
    });

    // 5. Demands
    const d1 = await ctx.db.insert("demands", {
      companyId: c1Id,
      companyProfileId: c1ProfileId,
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
    });

    const d2 = await ctx.db.insert("demands", {
      companyId: c1Id,
      companyProfileId: c1ProfileId,
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
    });

    const d3 = await ctx.db.insert("demands", {
      companyId: c2Id,
      companyProfileId: c2ProfileId,
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
    });

    const d4 = await ctx.db.insert("demands", {
      companyId: c3Id,
      companyProfileId: c3ProfileId,
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
    });

    return { success: true, message: "Demo database seeded successfully with farmers, companies, crops, and demands." };
  },
});
