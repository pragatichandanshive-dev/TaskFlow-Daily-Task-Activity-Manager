import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Volume2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Task } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendLocalNotification,
} from '../utils/notifications';
import { formatTime12h, formatHumanDate } from '../utils/storage';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  soundEnabled: boolean;
  onSelectTask: (task: Task) => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  tasks,
  soundEnabled,
  onSelectTask,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (isOpen) {
      setPermission(getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      sendLocalNotification(
        'TaskFlow Notifications Active',
        'You will now receive timely task reminders directly on your device.',
        soundEnabled
      );
    }
  };

  const handleTestChime = () => {
    sendLocalNotification(
      'Test Reminder Alert',
      'This is how your task reminders will sound and notify you.',
      soundEnabled
    );
  };

  // Filter tasks with active reminders that aren't completed
  const activeReminders = tasks
    .filter((t) => t.reminder && !t.completed)
    .sort((a, b) => {
      const aKey = `${a.date} ${a.time}`;
      const bKey = `${b.date} ${b.time}`;
      return aKey.localeCompare(bKey);
    });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reminders & Alerts</h3>
              <p className="text-xs text-slate-500">Local notifications engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Permission card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {permission === 'granted' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : permission === 'denied' ? (
                  <BellOff className="w-4 h-4 text-rose-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-xs font-semibold text-slate-800">
                  System Notification Status:{' '}
                  <span
                    className={
                      permission === 'granted'
                        ? 'text-emerald-600 capitalize'
                        : permission === 'denied'
                        ? 'text-rose-600 capitalize'
                        : 'text-amber-600 capitalize'
                    }
                  >
                    {permission}
                  </span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              TaskFlow triggers alerts in your browser and plays acoustic chimes even when running locally offline.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {permission !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
                >
                  Enable System Alerts
                </button>
              )}
              <button
                type="button"
                onClick={handleTestChime}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                Test Sound & Alert
              </button>
            </div>
          </div>

          {/* Active reminders list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Scheduled Reminders ({activeReminders.length})
              </h4>
            </div>

            {activeReminders.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No active reminders</p>
                <p className="text-xs text-slate-400 mt-1">
                  When you add or edit tasks, switch on the reminder toggle to be alerted.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeReminders.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      onSelectTask(task);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatHumanDate(task.date)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-slate-800">{formatTime12h(task.time)}</span>
                        {task.reminderOffsetMinutes > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[11px] text-amber-600">
                              {task.reminderOffsetMinutes}m before
                            </span>
                          </>
                        )}
                      </div>
                      <h5 className="text-sm font-semibold text-slate-900 mt-1 truncate">
                        {task.title}
                      </h5>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                      <Bell className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
