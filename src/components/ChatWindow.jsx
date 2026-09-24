import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  TrendingUp,
  Building2,
  User,
  CheckCheck,
  Check,
  Phone,
  Info,
  Package,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation } from "../context/ConvexClientContext";
import MakeOfferModal from "./MakeOfferModal";
import OfferCard from "./OfferCard";

export default function ChatWindow({ initialConversationId, cropContext, demandContext }) {
  const { user, token, role } = useAuth();
  const [activeConvId, setActiveConvId] = useState(initialConversationId || null);
  const [messageText, setMessageText] = useState("");
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const conversations = useQuery("conversations:list", { token }) || [];
  const messages = useQuery("messages:list", {
    token,
    conversationId: activeConvId || undefined,
  }) || [];

  const sendMessage = useMutation("messages:send");
  const markAsRead = useMutation("messages:markAsRead");

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0]._id);
    }
  }, [conversations, activeConvId]);

  // Mark as read on active conversation
  useEffect(() => {
    if (activeConvId && token) {
      markAsRead({ token, conversationId: activeConvId });
    }
  }, [activeConvId, messages.length, token, markAsRead]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConv = conversations.find((c) => c._id === activeConvId);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConvId) return;

    setSending(true);
    const txt = messageText;
    setMessageText("");

    try {
      await sendMessage({
        token,
        conversationId: activeConvId,
        message: txt,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageText(txt);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex h-[75vh] min-h-[520px]">
      {/* Sidebar / Conversation List */}
      <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h3 className="font-bold text-slate-800 text-base">Conversations</h3>
          <p className="text-xs text-slate-400 mt-0.5">Live farmer & company direct chat</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No conversations yet. Start chatting from crop or demand listings.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv._id === activeConvId;
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConvId(conv._id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
                    isActive ? "bg-agri-50/80 border-r-4 border-agri-600" : "hover:bg-slate-100/70"
                  }`}
                >
                  <img
                    src={
                      conv.partnerAvatar ||
                      (conv.partnerRole === "farmer"
                        ? "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=100"
                        : "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100")
                    }
                    alt={conv.partnerName}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {conv.partnerName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {conv.lastMessageAt ? formatMessageTime(conv.lastMessageAt) : ""}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-agri-700 uppercase">
                      {conv.partnerRole}
                    </span>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {conv.lastMessage || "Started conversation"}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="h-5 min-w-5 flex items-center justify-center rounded-full bg-agri-600 text-white text-[10px] font-bold px-1 shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Active Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <img
                src={
                  activeConv.partnerAvatar ||
                  (activeConv.partnerRole === "farmer"
                    ? "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=100"
                    : "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100")
                }
                alt={activeConv.partnerName}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{activeConv.partnerName}</h4>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online"></span>
                </div>
                <span className="text-[11px] text-slate-400 capitalize">
                  {activeConv.partnerRole} • Verified Account
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMakeOfferOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-xs font-bold shadow-sm shadow-agri-600/20 transition flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Make Trade Offer</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?._id;

              if (msg.messageType === "system") {
                return (
                  <div key={msg._id} className="flex justify-center my-3">
                    <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold max-w-md text-center shadow-sm">
                      {msg.message}
                    </div>
                  </div>
                );
              }

              if (msg.messageType === "offer" && msg.offer) {
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"} my-2`}
                  >
                    <div className="max-w-md w-full">
                      <OfferCard offer={msg.offer} />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-sm sm:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-agri-600 text-white rounded-br-sm"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    <span className="text-[10px] text-slate-400">
                      {formatMessageTime(msg.createdAt)}
                    </span>
                    {isMe && (
                      <span className="text-slate-400">
                        {msg.isRead ? (
                          <CheckCheck className="w-3 h-3 text-agri-600" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message or negotiate terms..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agri-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="p-2.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white shadow-sm shadow-agri-600/30 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Make Offer Modal */}
          {isMakeOfferOpen && (
            <MakeOfferModal
              isOpen={isMakeOfferOpen}
              onClose={() => setIsMakeOfferOpen(false)}
              targetUser={{ userId: activeConv.partnerId }}
              cropContext={cropContext}
              demandContext={demandContext}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <Sparkles className="w-10 h-10 text-slate-300 mb-2" />
          <h4 className="font-bold text-slate-700">Select a Conversation</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Choose a contact from the list on the left to start negotiating prices and chatting live.
          </p>
        </div>
      )}
    </div>
  );
}
