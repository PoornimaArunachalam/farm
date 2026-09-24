import React from "react";
import { useLocation } from "react-router-dom";
import ChatWindow from "../../components/ChatWindow";

export default function CompanyMessages() {
  const location = useLocation();
  const activeConvId = location.state?.activeConvId;
  const cropContext = location.state?.cropContext;
  const demandContext = location.state?.demandContext;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Procurement Chat & Live Negotiation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time encrypted chat channel with farmers for pricing negotiation, offers, and delivery logistics.
        </p>
      </div>

      <ChatWindow
        initialConversationId={activeConvId}
        cropContext={cropContext}
        demandContext={demandContext}
      />
    </div>
  );
}
