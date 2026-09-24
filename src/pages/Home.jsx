import React from "react";
import { Link } from "react-router-dom";
import {
  Sprout,
  Building2,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Handshake,
  Layers,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useQuery } from "../context/ConvexClientContext";

export default function Home() {
  const availableCrops = useQuery("crops:getAllAvailable", {}) || [];
  const activeDemands = useQuery("demands:getAllActive", {}) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-agri-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(#16a34a_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold mb-6 animate-pulse-subtle">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Reactive Agriculture Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Connect Farmers With Companies.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-700 via-agri-600 to-emerald-500">
                Sell Better. Buy Directly. Grow Together.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
              A real-time, live synchronized marketplace directly bridging farmers with food processors, exporters, and wholesalers. Eliminate middlemen, negotiate transparent prices, and confirm trades with instant contracts.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register?role=farmer"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-agri-600 hover:bg-agri-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-agri-600/30 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Sprout className="w-5 h-5" />
                <span>Join as a Farmer</span>
              </Link>

              <Link
                to="/register?role=company"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-slate-900/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Building2 className="w-5 h-5" />
                <span>Join as a Company</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Counter Section */}
      <section className="py-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="block text-2xl sm:text-3xl font-extrabold text-agri-800">
                {availableCrops.length}+
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Active Crop Listings
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {activeDemands.length}+
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Live Company Demands
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">
                100%
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Real-Time Reactive Sync
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-600">
                ₹0 Middleman
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 block">
                Direct Transparent Trade
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              How AgriConnect Works
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Streamlined direct agriculture trading built from the ground up for transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* For Farmers */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-premium transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Farmers</h3>
                  <p className="text-xs text-slate-500">Sell at fair rates directly to corporate buyers</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { step: "1", title: "Create Your Profile", desc: "Register with village, district, state, and farm size details." },
                  { step: "2", title: "List Your Harvest", desc: "Publish crops with variety, quantity, quality grade, and expected price." },
                  { step: "3", title: "Discover Live Demands", desc: "Instant matching algorithm alerts you when companies demand your crops." },
                  { step: "4", title: "Direct Chat & Negotiation", desc: "Chat in real-time, review offers, propose counter-offers, and accept." },
                  { step: "5", title: "Confirmed Deals", desc: "Lock agreements with transparent quantity, rate, and delivery dates." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-xl bg-agri-50 text-agri-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-agri-200">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Companies */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-premium transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Companies</h3>
                  <p className="text-xs text-slate-500">Source verified bulk agricultural produce straight from farms</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { step: "1", title: "Register Business Account", desc: "Set up company profile, procurement specifications, and location." },
                  { step: "2", title: "Publish Crop Demands", desc: "Post bulk required quantity, price brackets, quality criteria, and deadline." },
                  { step: "3", title: "Browse Verified Farmers", desc: "Filter active farmer crops by variety, grade, district, and quantity." },
                  { step: "4", title: "Propose Trade Offers", desc: "Send formal price proposals directly into instant chat channels." },
                  { step: "5", title: "Track Logistics & Delivery", desc: "Monitor deal progress from confirmation to final delivery receipt." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Modern Marketplace Features
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Powered by Convex reactive database and instant multi-role synchronization.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Live Reactive Synchronization",
                desc: "No manual browser refreshes. Newly listed crops and demands appear instantly on all screens.",
              },
              {
                icon: MessageSquare,
                title: "Instant Direct Messaging",
                desc: "Farmer and procurement teams communicate directly with real-time read status and active indicators.",
              },
              {
                icon: TrendingUp,
                title: "Offer & Counter-Offer Negotiation",
                desc: "Send formal pricing offers, counter with revised quantities or rates, and close deals effortlessly.",
              },
              {
                icon: Handshake,
                title: "Deals & Contract Management",
                desc: "Track active trades from confirmation, dispatch, to delivery completion with digital agreement logs.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Profiles & RBAC",
                desc: "Strict role-based access control protecting farmer and company management workspaces.",
              },
              {
                icon: Layers,
                title: "Admin Moderation & Insights",
                desc: "Comprehensive platform dashboard for managing users, listings, demands, and resolution reports.",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-agri-300 hover:shadow-premium transition duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-agri-100 text-agri-800 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
