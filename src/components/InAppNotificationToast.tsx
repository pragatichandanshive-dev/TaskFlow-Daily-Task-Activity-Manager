import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Info, X } from 'lucide-react';
import { InAppNotification, subscribeToNotifications } from '../utils/notifications';

export const InAppNotificationToast: React.FC = () => {
  const [activeNotifications, setActiveNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((item) => {
      setActiveNotifications((prev) => [item, ...prev.slice(0, 2)]);

      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setActiveNotifications((prev) => prev.filter((n) => n.id !== item.id));
      }, 6000);
    });

    return () => unsubscribe();
  }, []);

  const dismiss = (id: string) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 flex flex-col gap-2 pointer-events-none">
      {activeNotifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl shadow-slate-900/20 border border-slate-800 flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-3"
        >
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
            {notif.type === 'reminder' ? (
              <Bell className="w-5 h-5 text-amber-400" />
            ) : notif.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Info className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-100 truncate">{notif.title}</h4>
              <span className="text-[11px] text-slate-400 font-mono shrink-0">{notif.timestamp}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
          </div>
          <button
            onClick={() => dismiss(notif.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 shrink-0"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
