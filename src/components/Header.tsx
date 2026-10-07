import React from 'react';
import { Bell, Settings, Smartphone, Monitor } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  onOpenReminders: () => void;
  onOpenSettings: () => void;
  pendingRemindersCount: number;
  profile: UserProfile;
  onToggleDeviceFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenReminders,
  onOpenSettings,
  pendingRemindersCount,
  profile,
  onToggleDeviceFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
          TaskFlow
        </span>
      </div>

      {/* Zone 2: Navigation actions / secondary controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Toggle device frame (convenient for desktop users) */}
        <button
          onClick={onToggleDeviceFrame}
          className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={profile.deviceFrame ? 'Switch to Fluid Full Width' : 'Switch to Mobile Frame'}
        >
          {profile.deviceFrame ? (
            <Monitor className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
        </button>

        {/* Reminders Bell with active count */}
        <button
          onClick={onOpenReminders}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Reminders & Notifications"
          aria-label="Reminders"
        >
          <Bell className="w-4 h-4" />
          {pendingRemindersCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          )}
        </button>

        {/* Settings gear */}
        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Settings & Data"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
