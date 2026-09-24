import React from "react";
import { useLocation } from "react-router-dom";
import ChatWindow from "../../components/ChatWindow";

export default function FarmerMessages() {
  const location = useLocation();
  const activeConvId = location.state?.activeConvId;
  const cropContext = location.state?.cropContext;
  const demandContext = location.state?.demandContext;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Direct Messages & Negotiation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Live encrypted communication with corporate procurement managers and wholesale buyers.
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
