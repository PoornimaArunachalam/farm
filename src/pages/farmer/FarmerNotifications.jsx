import React from "react";
import { Bell, CheckCheck, Sparkles, ArrowRight } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/EmptyState";

export default function FarmerNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notifications Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time updates on company demands, trade offers, messages, and deals.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-agri-700 hover:bg-agri-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All As Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When new demands match your crops or companies send trade offers, you'll see alerts here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition ${
                !notif.isRead ? "bg-emerald-50/30" : ""
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    !notif.isRead
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className={`text-sm ${
                        !notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
              </div>

              {notif.link && (
                <div className="shrink-0 self-center">
                  <span className="p-2 rounded-xl text-slate-400 hover:text-agri-700 hover:bg-agri-50 transition flex items-center">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
