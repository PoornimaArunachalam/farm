import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { liveDb } from "../lib/convexBridge";

const ConvexContext = createContext(null);

export const ConvexProvider = ({ children }) => {
  const [dbState, setDbState] = useState(() => liveDb.data);

  useEffect(() => {
    const unsubscribe = liveDb.subscribe((newData) => {
      setDbState({ ...newData });
    });
    return unsubscribe;
  }, []);

  // Dispatcher for queries
  const queryExecutor = useCallback(
    (queryPath, args = {}) => {
      const data = dbState;
      const now = Date.now();

      switch (queryPath) {
        case "users:getCurrentUser": {
          if (!args.token) return null;
          const session = (data.sessions || []).find(
            (s) => s.token === args.token && s.expiresAt > now
          );
          if (!session) {
            // Also check if token matches user ID directly for dev convenience
            const directUser = data.users.find((u) => u._id === args.token || "session_" + u._id === args.token);
            if (directUser && directUser.isActive) {
              let profile = null;
              if (directUser.role === "farmer") {
                profile = data.farmers.find((f) => f.userId === directUser._id);
              } else if (directUser.role === "company") {
                profile = data.companies.find((c) => c.userId === directUser._id);
              }
              return { ...directUser, profile };
            }
            return null;
          }
          const user = data.users.find((u) => u._id === session.userId && u.isActive);
          if (!user) return null;
          let profile = null;
          if (user.role === "farmer") {
            profile = data.farmers.find((f) => f.userId === user._id);
          } else if (user.role === "company") {
            profile = data.companies.find((c) => c.userId === user._id);
          }
          return { ...user, profile };
        }

        case "farmers:getProfile": {
          if (!args.token) return null;
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return null;
          return data.farmers.find((f) => f.userId === user._id) || null;
        }

        case "farmers:getById": {
          const farmer = data.farmers.find((f) => f._id === args.farmerId);
          if (!farmer) return null;
          const crops = data.crops.filter((c) => c.farmerId === farmer.userId && c.status === "available");
          return { ...farmer, crops };
        }

        case "farmers:getByUserId": {
          const farmer = data.farmers.find((f) => f.userId === args.userId);
          if (!farmer) return null;
          const crops = data.crops.filter((c) => c.farmerId === args.userId && c.status === "available");
          return { ...farmer, crops };
        }

        case "farmers:search": {
          let list = [...data.farmers];
          if (args.query && args.query.trim()) {
            const q = args.query.toLowerCase();
            list = list.filter(
              (f) =>
                f.fullName.toLowerCase().includes(q) ||
                f.village.toLowerCase().includes(q) ||
                f.district.toLowerCase().includes(q)
            );
          }
          if (args.district && args.district !== "all") {
            list = list.filter((f) => f.district.toLowerCase().includes(args.district.toLowerCase()));
          }
          if (args.state && args.state !== "all") {
            list = list.filter((f) => f.state.toLowerCase().includes(args.state.toLowerCase()));
          }

          const results = list.map((f) => {
            const crops = data.crops.filter((c) => c.farmerId === f.userId && c.status === "available");
            return { ...f, crops };
          });

          if (args.crop && args.crop !== "all") {
            const cq = args.crop.toLowerCase();
            return results.filter((f) => f.crops.some((c) => c.cropName.toLowerCase().includes(cq)));
          }
          return results;
        }

        case "farmers:getStats": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return null;
          const myCrops = data.crops.filter((c) => c.farmerId === user._id);
          const totalCrops = myCrops.length;
          const availableCrops = myCrops.filter((c) => c.status === "available");
          const totalQuantity = availableCrops.reduce((acc, c) => acc + Number(c.quantity || 0), 0);
          const activeDemands = data.demands.filter((d) => d.status === "active").length;
          const pendingOffers = data.offers.filter(
            (o) => (o.senderId === user._id || o.receiverId === user._id) && (o.status === "pending" || o.status === "countered")
          ).length;
          const activeDeals = data.deals.filter(
            (d) => d.farmerId === user._id && (d.status === "confirmed" || d.status === "in_progress")
          ).length;
          const unreadMessagesCount = data.messages.filter(
            (m) => m.receiverId === user._id && !m.isRead
          ).length;

          return {
            totalCrops,
            totalQuantity,
            activeDemandsCount: activeDemands,
            pendingOffers,
            activeDeals,
            unreadMessagesCount,
          };
        }

        case "companies:getProfile": {
          if (!args.token) return null;
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return null;
          return data.companies.find((c) => c.userId === user._id) || null;
        }

        case "companies:getById": {
          const comp = data.companies.find((c) => c._id === args.companyId);
          if (!comp) return null;
          const demands = data.demands.filter((d) => d.companyId === comp.userId && d.status === "active");
          return { ...comp, demands };
        }

        case "companies:getByUserId": {
          const comp = data.companies.find((c) => c.userId === args.userId);
          if (!comp) return null;
          const demands = data.demands.filter((d) => d.companyId === args.userId && d.status === "active");
          return { ...comp, demands };
        }

        case "companies:search": {
          let list = [...data.companies];
          if (args.query && args.query.trim()) {
            const q = args.query.toLowerCase();
            list = list.filter(
              (c) =>
                c.companyName.toLowerCase().includes(q) ||
                c.companyType.toLowerCase().includes(q) ||
                c.district.toLowerCase().includes(q)
            );
          }
          if (args.district && args.district !== "all") {
            list = list.filter((c) => c.district.toLowerCase().includes(args.district.toLowerCase()));
          }
          if (args.state && args.state !== "all") {
            list = list.filter((c) => c.state.toLowerCase().includes(args.state.toLowerCase()));
          }

          const results = list.map((comp) => {
            const demands = data.demands.filter((d) => d.companyId === comp.userId && d.status === "active");
            return { ...comp, demands };
          });

          if (args.crop && args.crop !== "all") {
            const cq = args.crop.toLowerCase();
            return results.filter((c) => c.demands.some((d) => d.cropName.toLowerCase().includes(cq)));
          }
          return results;
        }

        case "companies:getStats": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return null;
          const myDemands = data.demands.filter((d) => d.companyId === user._id);
          const activeDemands = myDemands.filter((d) => d.status === "active").length;
          const availableCropsCount = data.crops.filter((c) => c.status === "available").length;
          const pendingOffers = data.offers.filter(
            (o) => (o.senderId === user._id || o.receiverId === user._id) && (o.status === "pending" || o.status === "countered")
          ).length;
          const activeDeals = data.deals.filter(
            (d) => d.companyId === user._id && (d.status === "confirmed" || d.status === "in_progress")
          ).length;
          const unreadMessagesCount = data.messages.filter(
            (m) => m.receiverId === user._id && !m.isRead
          ).length;

          return {
            activeDemands,
            availableCropsCount,
            pendingOffers,
            activeDeals,
            unreadMessagesCount,
          };
        }

        case "crops:getMyCrops": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          return data.crops
            .filter((c) => c.farmerId === user._id)
            .sort((a, b) => b.createdAt - a.createdAt);
        }

        case "crops:getAllAvailable": {
          let list = data.crops.filter(
            (c) => c.status === "available" || c.status === "partially_sold"
          );
          if (args.cropName && args.cropName.trim()) {
            const q = args.cropName.toLowerCase();
            list = list.filter(
              (c) =>
                c.cropName.toLowerCase().includes(q) ||
                (c.variety && c.variety.toLowerCase().includes(q))
            );
          }
          if (args.district && args.district !== "all") {
            list = list.filter((c) => c.district.toLowerCase().includes(args.district.toLowerCase()));
          }
          if (args.state && args.state !== "all") {
            list = list.filter((c) => c.state.toLowerCase().includes(args.state.toLowerCase()));
          }
          if (args.minQuantity && args.minQuantity > 0) {
            list = list.filter((c) => c.quantity >= args.minQuantity);
          }
          if (args.maxPrice && args.maxPrice > 0) {
            list = list.filter((c) => c.expectedPrice <= args.maxPrice);
          }
          if (args.quality && args.quality !== "all") {
            list = list.filter((c) => c.quality === args.quality);
          }
          return list.sort((a, b) => b.createdAt - a.createdAt);
        }

        case "crops:getById": {
          const crop = data.crops.find((c) => c._id === args.cropId);
          if (!crop) return null;
          const farmerProfile = data.farmers.find((f) => f.userId === crop.farmerId);
          return { ...crop, farmerProfile };
        }

        case "demands:getMyDemands": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          return data.demands
            .filter((d) => d.companyId === user._id)
            .sort((a, b) => b.createdAt - a.createdAt);
        }

        case "demands:getAllActive": {
          let list = data.demands.filter((d) => d.status === "active");
          if (args.cropName && args.cropName.trim()) {
            const q = args.cropName.toLowerCase();
            list = list.filter(
              (d) =>
                d.cropName.toLowerCase().includes(q) ||
                (d.variety && d.variety.toLowerCase().includes(q))
            );
          }
          if (args.district && args.district !== "all") {
            list = list.filter((d) => d.district.toLowerCase().includes(args.district.toLowerCase()));
          }
          if (args.state && args.state !== "all") {
            list = list.filter((d) => d.state.toLowerCase().includes(args.state.toLowerCase()));
          }
          if (args.minPrice && args.minPrice > 0) {
            list = list.filter((d) => d.offeredPriceMax >= args.minPrice);
          }
          return list.sort((a, b) => b.createdAt - a.createdAt);
        }

        case "demands:getById": {
          const demand = data.demands.find((d) => d._id === args.demandId);
          if (!demand) return null;
          const companyProfile = data.companies.find((c) => c.userId === demand.companyId);
          return { ...demand, companyProfile };
        }

        case "demands:getMatchingDemandsForFarmer": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          const myCrops = data.crops.filter((c) => c.farmerId === user._id);
          const activeDemands = data.demands.filter((d) => d.status === "active");
          if (myCrops.length === 0) {
            return activeDemands.slice(0, 6);
          }
          const cropNames = new Set(myCrops.map((c) => c.cropName.toLowerCase()));
          const matches = activeDemands.filter((d) => cropNames.has(d.cropName.toLowerCase()));
          return matches.length > 0 ? matches : activeDemands.slice(0, 6);
        }

        case "demands:getMatchingCropsForCompany": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          const myDemands = data.demands.filter((d) => d.companyId === user._id && d.status === "active");
          const availableCrops = data.crops.filter((c) => c.status === "available");
          if (myDemands.length === 0) {
            return availableCrops.slice(0, 6);
          }
          const demandCrops = new Set(myDemands.map((d) => d.cropName.toLowerCase()));
          const matches = availableCrops.filter((c) => demandCrops.has(c.cropName.toLowerCase()));
          return matches.length > 0 ? matches : availableCrops.slice(0, 6);
        }

        case "conversations:list": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          const convs = data.conversations.filter(
            (c) => c.participant1 === user._id || c.participant2 === user._id
          );

          const enriched = convs.map((c) => {
            const isUserP1 = c.participant1 === user._id;
            const partnerId = isUserP1 ? c.participant2 : c.participant1;
            const partnerName = isUserP1 ? c.participant2Name : c.participant1Name;
            const partnerRole = isUserP1 ? c.participant2Role : c.participant1Role;

            const unreadCount = data.messages.filter(
              (m) => m.conversationId === c._id && m.receiverId === user._id && !m.isRead
            ).length;

            let partnerAvatar = null;
            if (partnerRole === "farmer") {
              const f = data.farmers.find((farm) => farm.userId === partnerId);
              if (f) partnerAvatar = f.profileImage;
            } else if (partnerRole === "company") {
              const comp = data.companies.find((co) => co.userId === partnerId);
              if (comp) partnerAvatar = comp.logo;
            }

            return {
              ...c,
              partnerId,
              partnerName,
              partnerRole,
              partnerAvatar,
              unreadCount,
            };
          });

          return enriched.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
        }

        case "messages:list": {
          if (!args.conversationId) return [];
          const msgs = data.messages.filter((m) => m.conversationId === args.conversationId);
          const enriched = msgs.map((m) => {
            if (m.offerId) {
              const offer = data.offers.find((o) => o._id === m.offerId);
              return { ...m, offer };
            }
            return m;
          });
          return enriched.sort((a, b) => a.createdAt - b.createdAt);
        }

        case "offers:getMyOffers": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          return data.offers
            .filter((o) => o.senderId === user._id || o.receiverId === user._id)
            .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        }

        case "deals:getMyDeals": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          if (user.role === "admin") {
            return [...data.deals].sort((a, b) => b.createdAt - a.createdAt);
          }
          return data.deals
            .filter((d) => d.farmerId === user._id || d.companyId === user._id)
            .sort((a, b) => b.createdAt - a.createdAt);
        }

        case "notifications:list": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user) return [];
          return data.notifications
            .filter((n) => n.userId === user._id)
            .sort((a, b) => b.createdAt - a.createdAt);
        }

        case "admin:getStats": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user || user.role !== "admin") return null;

          const totalFarmers = data.farmers.length;
          const totalCompanies = data.companies.length;
          const totalCrops = data.crops.length;
          const activeCrops = data.crops.filter((c) => c.status === "available").length;
          const totalDemands = data.demands.length;
          const activeDemands = data.demands.filter((d) => d.status === "active").length;
          const totalDeals = data.deals.length;
          const completedDeals = data.deals.filter((d) => d.status === "completed").length;
          const totalTradeValue = data.deals.reduce((acc, d) => acc + Number(d.totalAmount || 0), 0);
          const totalMessages = data.messages.length;
          const pendingReports = data.reports.filter((r) => r.status === "pending").length;

          return {
            totalFarmers,
            totalCompanies,
            totalCrops,
            activeCrops,
            totalDemands,
            activeDemands,
            totalDeals,
            completedDeals,
            totalTradeValue,
            totalMessages,
            pendingReports,
          };
        }

        case "admin:getAllUsers": {
          const user = queryExecutor("users:getCurrentUser", { token: args.token });
          if (!user || user.role !== "admin") return [];

          return data.users.map((u) => {
            let profile = null;
            if (u.role === "farmer") {
              profile = data.farmers.find((f) => f.userId === u._id);
            } else if (u.role === "company") {
              profile = data.companies.find((c) => c.userId === u._id);
            }
            return { ...u, profile };
          });
        }

        case "admin:getAllCrops": {
          return [...data.crops].sort((a, b) => b.createdAt - a.createdAt);
        }

        case "admin:getAllDemands": {
          return [...data.demands].sort((a, b) => b.createdAt - a.createdAt);
        }

        case "reports:list": {
          return [...data.reports].sort((a, b) => b.createdAt - a.createdAt);
        }

        default:
          return null;
      }
    },
    [dbState]
  );

  // Dispatcher for mutations
  const mutationExecutor = useCallback(
    async (mutationPath, args = {}) => {
      const draft = JSON.parse(JSON.stringify(liveDb.data));
      const now = Date.now();

      const getCurrentUserHelper = (token) => {
        if (!token) return null;
        const session = (draft.sessions || []).find(
          (s) => s.token === token && s.expiresAt > now
        );
        if (!session) {
          return draft.users.find((u) => u._id === token || "session_" + u._id === token) || null;
        }
        return draft.users.find((u) => u._id === session.userId) || null;
      };

      switch (mutationPath) {
        case "users:register": {
          const existing = draft.users.find(
            (u) => u.email.toLowerCase() === args.email.toLowerCase().trim()
          );
          if (existing) {
            throw new Error("An account with this email already exists.");
          }

          const userId = liveDb.generateId("user");
          const newUser = {
            _id: userId,
            email: args.email.toLowerCase().trim(),
            phone: args.phone,
            passwordHash: "hash_" + args.password,
            role: args.role,
            isActive: true,
            createdAt: now,
            updatedAt: now,
          };
          draft.users.push(newUser);

          if (args.role === "farmer") {
            const farmerProfile = {
              _id: liveDb.generateId("farmer_profile"),
              userId,
              fullName: args.fullName || "Farmer",
              phone: args.phone,
              email: args.email.toLowerCase().trim(),
              profileImage: args.profileImage || "https://images.unsplash.com/photo-1592417817098-8f3d691a4574?auto=format&fit=crop&q=80&w=300",
              village: args.village || "",
              district: args.district,
              state: args.state,
              farmSize: Number(args.farmSize) || 5,
              farmSizeUnit: args.farmSizeUnit || "Acres",
              description: args.description || "Passionate farmer dedicated to producing high quality crops.",
              createdAt: now,
              updatedAt: now,
            };
            draft.farmers.push(farmerProfile);
          } else if (args.role === "company") {
            const companyProfile = {
              _id: liveDb.generateId("company_profile"),
              userId,
              companyName: args.companyName || "Agri Enterprise",
              email: args.email.toLowerCase().trim(),
              phone: args.phone,
              logo: args.companyLogo || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300",
              companyType: args.companyType || "Food Processor",
              address: args.address || "",
              district: args.district,
              state: args.state,
              description: args.companyDescription || "Leading agricultural procurement & trading firm.",
              website: args.website || "",
              createdAt: now,
              updatedAt: now,
            };
            draft.companies.push(companyProfile);
          }

          const token = "session_" + userId;
          draft.sessions = draft.sessions || [];
          draft.sessions.push({
            token,
            userId,
            role: args.role,
            expiresAt: now + 30 * 24 * 60 * 60 * 1000,
            createdAt: now,
          });

          draft.notifications.push({
            _id: liveDb.generateId("notif"),
            userId,
            type: "system",
            title: "Welcome to AgriConnect! 🌱",
            message: `Your account as a ${args.role.toUpperCase()} has been created. Start discovering live market trade opportunities.`,
            isRead: false,
            createdAt: now,
          });

          liveDb.saveData(draft);
          return { token, userId, role: args.role };
        }

        case "users:login": {
          const user = draft.users.find(
            (u) => u.email.toLowerCase() === args.email.toLowerCase().trim()
          );
          if (!user) {
            throw new Error("Invalid email or password.");
          }
          if (!user.isActive) {
            throw new Error("This account has been deactivated by administrator.");
          }

          const token = "session_" + user._id;
          draft.sessions = draft.sessions || [];
          draft.sessions.push({
            token,
            userId: user._id,
            role: user.role,
            expiresAt: now + 30 * 24 * 60 * 60 * 1000,
            createdAt: now,
          });

          liveDb.saveData(draft);
          return { token, userId: user._id, role: user.role };
        }

        case "users:logout": {
          if (draft.sessions) {
            draft.sessions = draft.sessions.filter((s) => s.token !== args.token);
          }
          liveDb.saveData(draft);
          return { success: true };
        }

        case "crops:create": {
          const user = getCurrentUserHelper(args.token);
          if (!user || user.role !== "farmer") {
            throw new Error("Unauthorized: Only farmers can list crops.");
          }

          const farmerProfile = draft.farmers.find((f) => f.userId === user._id);
          const farmerName = farmerProfile ? farmerProfile.fullName : "Farmer";
          const cropId = liveDb.generateId("crop");

          const newCrop = {
            _id: cropId,
            farmerId: user._id,
            farmerProfileId: farmerProfile?._id,
            farmerName,
            cropName: args.cropName.trim(),
            variety: args.variety.trim(),
            quantity: Number(args.quantity),
            unit: args.unit,
            expectedPrice: Number(args.expectedPrice),
            priceUnit: args.priceUnit,
            harvestDate: args.harvestDate,
            location: args.location.trim(),
            district: args.district.trim(),
            state: args.state.trim(),
            quality: args.quality,
            description: args.description || "",
            image: args.image || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600",
            status: "available",
            createdAt: now,
            updatedAt: now,
          };
          draft.crops.push(newCrop);

          // Real-time notification for companies demanding this crop
          const matchingDemands = draft.demands.filter(
            (d) => d.cropName.toLowerCase() === args.cropName.trim().toLowerCase() && d.status === "active"
          );
          const notified = new Set();
          for (const demand of matchingDemands) {
            if (!notified.has(demand.companyId)) {
              notified.add(demand.companyId);
              draft.notifications.push({
                _id: liveDb.generateId("notif"),
                userId: demand.companyId,
                type: "new_crop",
                title: `New Crop Listed: ${args.cropName} 🌾`,
                message: `${farmerName} from ${args.district}, ${args.state} listed ${args.quantity} ${args.unit} of ${args.cropName} at ₹${args.expectedPrice} ${args.priceUnit}.`,
                relatedId: cropId,
                link: `/company/farmers`,
                isRead: false,
                createdAt: now,
              });
            }
          }

          liveDb.saveData(draft);
          return cropId;
        }

        case "crops:update": {
          const user = getCurrentUserHelper(args.token);
          const crop = draft.crops.find((c) => c._id === args.cropId);
          if (!crop) throw new Error("Crop not found.");
          if (crop.farmerId !== user._id && user.role !== "admin") {
            throw new Error("Forbidden: You cannot modify this crop.");
          }

          Object.assign(crop, {
            cropName: args.cropName.trim(),
            variety: args.variety.trim(),
            quantity: Number(args.quantity),
            unit: args.unit,
            expectedPrice: Number(args.expectedPrice),
            priceUnit: args.priceUnit,
            harvestDate: args.harvestDate,
            location: args.location.trim(),
            district: args.district.trim(),
            state: args.state.trim(),
            quality: args.quality,
            description: args.description || "",
            image: args.image || crop.image,
            status: args.status,
            updatedAt: now,
          });

          liveDb.saveData(draft);
          return { success: true };
        }

        case "crops:remove": {
          const user = getCurrentUserHelper(args.token);
          const crop = draft.crops.find((c) => c._id === args.cropId);
          if (!crop) throw new Error("Crop not found.");
          if (crop.farmerId !== user._id && user.role !== "admin") {
            throw new Error("Forbidden: You cannot delete this crop.");
          }

          draft.crops = draft.crops.filter((c) => c._id !== args.cropId);
          liveDb.saveData(draft);
          return { success: true };
        }

        case "demands:create": {
          const user = getCurrentUserHelper(args.token);
          if (!user || user.role !== "company") {
            throw new Error("Unauthorized: Only companies can post crop demands.");
          }

          const companyProfile = draft.companies.find((c) => c.userId === user._id);
          const companyName = companyProfile ? companyProfile.companyName : "Company";
          const demandId = liveDb.generateId("demand");

          const newDemand = {
            _id: demandId,
            companyId: user._id,
            companyProfileId: companyProfile?._id,
            companyName,
            cropName: args.cropName.trim(),
            variety: args.variety.trim(),
            requiredQuantity: Number(args.requiredQuantity),
            unit: args.unit,
            offeredPriceMin: Number(args.offeredPriceMin),
            offeredPriceMax: Number(args.offeredPriceMax),
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
          };
          draft.demands.push(newDemand);

          // Real-time notification for farmers supplying this crop
          const matchingCrops = draft.crops.filter(
            (c) => c.cropName.toLowerCase() === args.cropName.trim().toLowerCase() && c.status === "available"
          );
          const notified = new Set();
          for (const crop of matchingCrops) {
            if (!notified.has(crop.farmerId)) {
              notified.add(crop.farmerId);
              draft.notifications.push({
                _id: liveDb.generateId("notif"),
                userId: crop.farmerId,
                type: "new_demand",
                title: `New Demand: ${args.cropName} Needed! 📢`,
                message: `${companyName} is purchasing ${args.requiredQuantity} ${args.unit} of ${args.cropName} (₹${args.offeredPriceMin}-₹${args.offeredPriceMax} ${args.priceUnit}).`,
                relatedId: demandId,
                link: `/farmer/demands`,
                isRead: false,
                createdAt: now,
              });
            }
          }

          liveDb.saveData(draft);
          return demandId;
        }

        case "demands:update": {
          const user = getCurrentUserHelper(args.token);
          const demand = draft.demands.find((d) => d._id === args.demandId);
          if (!demand) throw new Error("Demand not found.");
          if (demand.companyId !== user._id && user.role !== "admin") {
            throw new Error("Forbidden: You cannot modify this demand.");
          }

          Object.assign(demand, {
            cropName: args.cropName.trim(),
            variety: args.variety.trim(),
            requiredQuantity: Number(args.requiredQuantity),
            unit: args.unit,
            offeredPriceMin: Number(args.offeredPriceMin),
            offeredPriceMax: Number(args.offeredPriceMax),
            priceUnit: args.priceUnit,
            requiredDate: args.requiredDate,
            deliveryLocation: args.deliveryLocation.trim(),
            district: args.district.trim(),
            state: args.state.trim(),
            qualityRequirements: args.qualityRequirements,
            description: args.description || "",
            status: args.status,
            updatedAt: now,
          });

          liveDb.saveData(draft);
          return { success: true };
        }

        case "demands:remove": {
          const user = getCurrentUserHelper(args.token);
          const demand = draft.demands.find((d) => d._id === args.demandId);
          if (!demand) throw new Error("Demand not found.");
          if (demand.companyId !== user._id && user.role !== "admin") {
            throw new Error("Forbidden: You cannot delete this demand.");
          }

          draft.demands = draft.demands.filter((d) => d._id !== args.demandId);
          liveDb.saveData(draft);
          return { success: true };
        }

        case "conversations:getOrCreate": {
          const user = getCurrentUserHelper(args.token);
          if (!user) throw new Error("Unauthorized.");

          const partner = draft.users.find((u) => u._id === args.partnerId);
          if (!partner) throw new Error("Partner not found.");

          let existing = draft.conversations.find(
            (c) =>
              (c.participant1 === user._id && c.participant2 === args.partnerId) ||
              (c.participant1 === args.partnerId && c.participant2 === user._id)
          );

          if (existing) return existing._id;

          let p1Name = user.email;
          let p2Name = partner.email;

          if (user.role === "farmer") {
            const f = draft.farmers.find((farm) => farm.userId === user._id);
            if (f) p1Name = f.fullName;
          } else if (user.role === "company") {
            const c = draft.companies.find((co) => co.userId === user._id);
            if (c) p1Name = c.companyName;
          }

          if (partner.role === "farmer") {
            const f = draft.farmers.find((farm) => farm.userId === partner._id);
            if (f) p2Name = f.fullName;
          } else if (partner.role === "company") {
            const c = draft.companies.find((co) => co.userId === partner._id);
            if (c) p2Name = c.companyName;
          }

          const convId = liveDb.generateId("conv");
          draft.conversations.push({
            _id: convId,
            participant1: user._id,
            participant2: args.partnerId,
            participant1Name: p1Name,
            participant1Role: user.role,
            participant2Name: p2Name,
            participant2Role: partner.role,
            lastMessage: "Conversation initiated",
            lastMessageSenderId: user._id,
            lastMessageAt: now,
            createdAt: now,
            updatedAt: now,
          });

          liveDb.saveData(draft);
          return convId;
        }

        case "messages:send": {
          const user = getCurrentUserHelper(args.token);
          const conv = draft.conversations.find((c) => c._id === args.conversationId);
          if (!conv) throw new Error("Conversation not found.");

          const isP1 = conv.participant1 === user._id;
          const receiverId = isP1 ? conv.participant2 : conv.participant1;
          const senderName = isP1 ? conv.participant1Name : conv.participant2Name;

          const msgId = liveDb.generateId("msg");
          draft.messages.push({
            _id: msgId,
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

          conv.lastMessage = args.messageType === "offer" ? "📦 Sent a trade offer" : args.message.trim();
          conv.lastMessageSenderId = user._id;
          conv.lastMessageAt = now;
          conv.updatedAt = now;

          if (args.messageType !== "offer") {
            draft.notifications.push({
              _id: liveDb.generateId("notif"),
              userId: receiverId,
              type: "new_message",
              title: `Message from ${senderName} 💬`,
              message: args.message.trim().substring(0, 100),
              relatedId: args.conversationId,
              link: user.role === "farmer" ? "/company/messages" : "/farmer/messages",
              isRead: false,
              createdAt: now,
            });
          }

          liveDb.saveData(draft);
          return msgId;
        }

        case "messages:markAsRead": {
          const user = getCurrentUserHelper(args.token);
          let count = 0;
          for (const msg of draft.messages) {
            if (msg.conversationId === args.conversationId && msg.receiverId === user._id && !msg.isRead) {
              msg.isRead = true;
              count++;
            }
          }
          if (count > 0) liveDb.saveData(draft);
          return { updated: count };
        }

        case "offers:create": {
          const user = getCurrentUserHelper(args.token);
          const receiver = draft.users.find((u) => u._id === args.receiverId);
          if (!receiver) throw new Error("Receiver not found.");

          let senderName = user.email;
          let receiverName = receiver.email;

          if (user.role === "farmer") {
            const f = draft.farmers.find((farm) => farm.userId === user._id);
            if (f) senderName = f.fullName;
          } else if (user.role === "company") {
            const c = draft.companies.find((co) => co.userId === user._id);
            if (c) senderName = c.companyName;
          }

          if (receiver.role === "farmer") {
            const f = draft.farmers.find((farm) => farm.userId === receiver._id);
            if (f) receiverName = f.fullName;
          } else if (receiver.role === "company") {
            const c = draft.companies.find((co) => co.userId === receiver._id);
            if (c) receiverName = c.companyName;
          }

          const quantity = Number(args.quantity);
          const pricePerUnit = Number(args.pricePerUnit);
          const totalAmount = quantity * pricePerUnit;

          const offerId = liveDb.generateId("offer");
          const newOffer = {
            _id: offerId,
            senderId: user._id,
            receiverId: args.receiverId,
            senderName,
            receiverName,
            senderRole: user.role,
            cropId: args.cropId,
            demandId: args.demandId,
            cropName: args.cropName,
            conversationId: args.conversationId,
            quantity,
            unit: args.unit,
            pricePerUnit,
            totalAmount,
            message: args.message || "",
            status: "pending",
            createdAt: now,
            updatedAt: now,
          };
          draft.offers.push(newOffer);

          // Add to chat as offer message
          const msgId = liveDb.generateId("msg");
          draft.messages.push({
            _id: msgId,
            conversationId: args.conversationId,
            senderId: user._id,
            receiverId: args.receiverId,
            senderName,
            message: `Trade Offer: ${quantity} ${args.unit} of ${args.cropName} at ₹${pricePerUnit}/${args.unit} (Total: ₹${totalAmount.toLocaleString()})`,
            messageType: "offer",
            offerId,
            isRead: false,
            createdAt: now,
          });

          const conv = draft.conversations.find((c) => c._id === args.conversationId);
          if (conv) {
            conv.lastMessage = `🤝 Offer: ₹${totalAmount.toLocaleString()} for ${args.cropName}`;
            conv.lastMessageSenderId = user._id;
            conv.lastMessageAt = now;
            conv.updatedAt = now;
          }

          draft.notifications.push({
            _id: liveDb.generateId("notif"),
            userId: args.receiverId,
            type: "new_offer",
            title: `New Trade Offer for ${args.cropName} 💰`,
            message: `${senderName} offered ₹${pricePerUnit}/${args.unit} for ${quantity} ${args.unit}. Total: ₹${totalAmount.toLocaleString()}`,
            relatedId: offerId,
            link: user.role === "farmer" ? "/company/deals" : "/farmer/deals",
            isRead: false,
            createdAt: now,
          });

          liveDb.saveData(draft);
          return offerId;
        }

        case "offers:respond": {
          const user = getCurrentUserHelper(args.token);
          const offer = draft.offers.find((o) => o._id === args.offerId);
          if (!offer) throw new Error("Offer not found.");

          const isReceiver = offer.receiverId === user._id;
          const partnerId = isReceiver ? offer.senderId : offer.receiverId;

          if (args.action === "accept") {
            offer.status = "accepted";
            offer.updatedAt = now;

            const agreedQuantity = offer.counterQuantity || offer.quantity;
            const agreedPrice = offer.counterPrice || offer.pricePerUnit;
            const totalAmount = agreedQuantity * agreedPrice;

            const farmerId = offer.senderRole === "farmer" ? offer.senderId : offer.receiverId;
            const farmerName = offer.senderRole === "farmer" ? offer.senderName : offer.receiverName;
            const companyId = offer.senderRole === "company" ? offer.senderId : offer.receiverId;
            const companyName = offer.senderRole === "company" ? offer.senderName : offer.receiverName;

            const dealId = liveDb.generateId("deal");
            draft.deals.push({
              _id: dealId,
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
              notes: "Offer accepted. Deal confirmed by both parties.",
              createdAt: now,
              updatedAt: now,
            });

            // System message in chat
            draft.messages.push({
              _id: liveDb.generateId("msg"),
              conversationId: offer.conversationId,
              senderId: user._id,
              receiverId: partnerId,
              senderName: "AgriConnect System",
              message: `🎉 Offer ACCEPTED! Deal #${dealId.slice(-6).toUpperCase()} created for ${agreedQuantity} ${offer.unit} of ${offer.cropName} at ₹${agreedPrice}/${offer.unit} (₹${totalAmount.toLocaleString()}).`,
              messageType: "system",
              isRead: false,
              createdAt: now,
            });

            // Notifications to both
            draft.notifications.push({
              _id: liveDb.generateId("notif"),
              userId: farmerId,
              type: "deal_created",
              title: "🎉 Deal Confirmed!",
              message: `Deal for ${agreedQuantity} ${offer.unit} of ${offer.cropName} with ${companyName} is confirmed. Total: ₹${totalAmount.toLocaleString()}`,
              relatedId: dealId,
              link: "/farmer/deals",
              isRead: false,
              createdAt: now,
            });

            draft.notifications.push({
              _id: liveDb.generateId("notif"),
              userId: companyId,
              type: "deal_created",
              title: "🎉 Deal Confirmed!",
              message: `Deal for ${agreedQuantity} ${offer.unit} of ${offer.cropName} with ${farmerName} is confirmed. Total: ₹${totalAmount.toLocaleString()}`,
              relatedId: dealId,
              link: "/company/deals",
              isRead: false,
              createdAt: now,
            });

            liveDb.saveData(draft);
            return { success: true, dealId };
          } else if (args.action === "reject") {
            offer.status = "rejected";
            offer.updatedAt = now;

            draft.notifications.push({
              _id: liveDb.generateId("notif"),
              userId: partnerId,
              type: "offer_rejected",
              title: "Offer Declined ❌",
              message: `Your offer for ${offer.cropName} was declined.`,
              relatedId: offer._id,
              link: user.role === "farmer" ? "/farmer/deals" : "/company/deals",
              isRead: false,
              createdAt: now,
            });

            draft.messages.push({
              _id: liveDb.generateId("msg"),
              conversationId: offer.conversationId,
              senderId: user._id,
              receiverId: partnerId,
              senderName: "AgriConnect System",
              message: `❌ Offer for ${offer.cropName} was declined.`,
              messageType: "system",
              isRead: false,
              createdAt: now,
            });

            liveDb.saveData(draft);
            return { success: true };
          } else if (args.action === "counter") {
            const counterPrice = Number(args.counterPrice);
            const counterQuantity = Number(args.counterQuantity || offer.quantity);
            const counterTotal = counterQuantity * counterPrice;

            offer.status = "countered";
            offer.counterPrice = counterPrice;
            offer.counterQuantity = counterQuantity;
            offer.counterTotalAmount = counterTotal;
            offer.counterNotes = args.counterNotes || "";
            offer.updatedAt = now;

            draft.notifications.push({
              _id: liveDb.generateId("notif"),
              userId: partnerId,
              type: "counter_offer",
              title: `Counter Offer: ₹${counterPrice}/${offer.unit} 🔄`,
              message: `A counter-offer for ${offer.cropName} was submitted (${counterQuantity} ${offer.unit} at ₹${counterPrice}/${offer.unit}).`,
              relatedId: offer._id,
              link: user.role === "farmer" ? "/farmer/deals" : "/company/deals",
              isRead: false,
              createdAt: now,
            });

            draft.messages.push({
              _id: liveDb.generateId("msg"),
              conversationId: offer.conversationId,
              senderId: user._id,
              receiverId: partnerId,
              senderName: user.email,
              message: `🔄 Counter Offer: ${counterQuantity} ${offer.unit} of ${offer.cropName} at ₹${counterPrice}/${offer.unit} (Total: ₹${counterTotal.toLocaleString()})${args.counterNotes ? ` - "${args.counterNotes}"` : ""}`,
              messageType: "offer",
              offerId: offer._id,
              isRead: false,
              createdAt: now,
            });

            liveDb.saveData(draft);
            return { success: true };
          }
          break;
        }

        case "deals:updateStatus": {
          const user = getCurrentUserHelper(args.token);
          const deal = draft.deals.find((d) => d._id === args.dealId);
          if (!deal) throw new Error("Deal not found.");

          deal.status = args.status;
          if (args.notes) deal.notes = args.notes;
          if (args.deliveryDate) deal.deliveryDate = args.deliveryDate;
          deal.updatedAt = now;

          const isFarmer = deal.farmerId === user._id;
          const partnerId = isFarmer ? deal.companyId : deal.farmerId;

          draft.notifications.push({
            _id: liveDb.generateId("notif"),
            userId: partnerId,
            type: "deal_status_updated",
            title: `Deal Status: ${args.status.toUpperCase().replace('_', ' ')} 📋`,
            message: `Deal for ${deal.cropName} (#${args.dealId.slice(-6).toUpperCase()}) was updated to ${args.status}.`,
            relatedId: args.dealId,
            link: isFarmer ? "/company/deals" : "/farmer/deals",
            isRead: false,
            createdAt: now,
          });

          liveDb.saveData(draft);
          return { success: true };
        }

        case "farmers:updateProfile": {
          const user = getCurrentUserHelper(args.token);
          const profile = draft.farmers.find((f) => f.userId === user._id);
          if (profile) {
            Object.assign(profile, {
              fullName: args.fullName.trim(),
              phone: args.phone.trim(),
              village: args.village.trim(),
              district: args.district.trim(),
              state: args.state.trim(),
              farmSize: Number(args.farmSize),
              farmSizeUnit: args.farmSizeUnit,
              description: args.description || "",
              profileImage: args.profileImage || profile.profileImage,
              updatedAt: now,
            });
            liveDb.saveData(draft);
            return { success: true };
          }
          break;
        }

        case "companies:updateProfile": {
          const user = getCurrentUserHelper(args.token);
          const profile = draft.companies.find((c) => c.userId === user._id);
          if (profile) {
            Object.assign(profile, {
              companyName: args.companyName.trim(),
              phone: args.phone.trim(),
              companyType: args.companyType,
              address: args.address.trim(),
              district: args.district.trim(),
              state: args.state.trim(),
              description: args.description || "",
              website: args.website || "",
              logo: args.logo || profile.logo,
              updatedAt: now,
            });
            liveDb.saveData(draft);
            return { success: true };
          }
          break;
        }

        case "notifications:markRead": {
          const notif = draft.notifications.find((n) => n._id === args.notificationId);
          if (notif) {
            notif.isRead = true;
            liveDb.saveData(draft);
          }
          return { success: true };
        }

        case "notifications:markAllRead": {
          const user = getCurrentUserHelper(args.token);
          if (!user) return { count: 0 };
          let count = 0;
          for (const n of draft.notifications) {
            if (n.userId === user._id && !n.isRead) {
              n.isRead = true;
              count++;
            }
          }
          if (count > 0) liveDb.saveData(draft);
          return { count };
        }

        case "admin:toggleUserStatus": {
          const target = draft.users.find((u) => u._id === args.userId);
          if (target) {
            target.isActive = !target.isActive;
            target.updatedAt = now;
            liveDb.saveData(draft);
            return { success: true, isActive: target.isActive };
          }
          break;
        }

        case "admin:deleteCrop": {
          draft.crops = draft.crops.filter((c) => c._id !== args.cropId);
          liveDb.saveData(draft);
          return { success: true };
        }

        case "admin:deleteDemand": {
          draft.demands = draft.demands.filter((d) => d._id !== args.demandId);
          liveDb.saveData(draft);
          return { success: true };
        }

        case "reports:create": {
          const user = getCurrentUserHelper(args.token);
          let reporterName = user ? user.email : "User";
          if (user?.role === "farmer") {
            const f = draft.farmers.find((farm) => farm.userId === user._id);
            if (f) reporterName = f.fullName;
          } else if (user?.role === "company") {
            const c = draft.companies.find((co) => co.userId === user._id);
            if (c) reporterName = c.companyName;
          }

          let targetUserName = "";
          if (args.targetUser) {
            const tu = draft.users.find((u) => u._id === args.targetUser);
            if (tu) targetUserName = tu.email;
          }

          const reportId = liveDb.generateId("report");
          draft.reports.push({
            _id: reportId,
            reportedBy: user?._id || "anonymous",
            reporterName,
            targetUser: args.targetUser,
            targetUserName,
            targetType: args.targetType,
            targetId: args.targetId,
            reason: args.reason,
            description: args.description,
            status: "pending",
            createdAt: now,
            updatedAt: now,
          });

          liveDb.saveData(draft);
          return reportId;
        }

        case "reports:updateStatus": {
          const rep = draft.reports.find((r) => r._id === args.reportId);
          if (rep) {
            rep.status = args.status;
            rep.updatedAt = now;
            liveDb.saveData(draft);
            return { success: true };
          }
          break;
        }

        case "seed:reset": {
          const seed = liveDb.resetToSeed();
          return { success: true, seed };
        }

        default:
          console.warn("Unknown mutation path:", mutationPath);
          return null;
      }
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      queryExecutor,
      mutationExecutor,
      resetDatabase: () => liveDb.resetToSeed(),
    }),
    [queryExecutor, mutationExecutor]
  );

  return <ConvexContext.Provider value={contextValue}>{children}</ConvexContext.Provider>;
};

// React Convex Hooks
export const useConvex = () => {
  const context = useContext(ConvexContext);
  if (!context) {
    throw new Error("useConvex must be used within a ConvexProvider");
  }
  return context;
};

export const useQuery = (queryFnOrPath, args = {}) => {
  const { queryExecutor } = useConvex();
  const queryPath = typeof queryFnOrPath === "string" ? queryFnOrPath : queryFnOrPath?.path || queryFnOrPath?.name;
  return queryExecutor(queryPath, args);
};

export const useMutation = (mutationFnOrPath) => {
  const { mutationExecutor } = useConvex();
  const mutationPath = typeof mutationFnOrPath === "string" ? mutationFnOrPath : mutationFnOrPath?.path || mutationFnOrPath?.name;
  return useCallback(
    (args = {}) => mutationExecutor(mutationPath, args),
    [mutationExecutor, mutationPath]
  );
};
