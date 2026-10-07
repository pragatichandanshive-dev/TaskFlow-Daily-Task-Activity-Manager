import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, Monitor, Download, Upload, RotateCcw, Check, User } from 'lucide-react';
import { UserProfile } from '../types';
import { exportAllDataJSON, importAllDataJSON, resetAllData } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onDataReset,
}) => {
  const [userName, setUserName] = useState(profile.name);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      onUpdateProfile({ ...profile, name: userName.trim() });
    }
  };

  const handleExport = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importAllDataJSON(content);
      if (result.success) {
        setImportStatus('Backup restored successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setImportStatus('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      confirm(
        'Reset all data? This will restore initial sample tasks and notes for today.'
      )
    ) {
      resetAllData();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        role="dialog"
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">App Settings</h3>
            <p className="text-xs text-slate-500">Preferences & Offline Storage</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Greeting Name
            </label>
            <form onSubmit={handleSaveName} className="flex gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Alex"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Save
              </button>
            </form>
          </div>

          {/* Sound & Audio Effects */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">Preferences</h4>
            
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-slate-700 shadow-xs border border-slate-200">
                  {profile.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Audio Chimes</div>
                  <div className="text-[11px] text-slate-500">Play chimes for completions and reminders</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.soundEnabled}
                  onChange={(e) =>
                    onUpdateProfile({ ...profile, soundEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>

            {/* Viewport Frame Mode (for desktop convenience) */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white text-slate-700 shadow-xs border border-slate-200">
                  {profile.deviceFrame ? (
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Monitor className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Mobile Frame Shell</div>
                  <div className="text-[11px] text-slate-500">Center inside a mobile phone mockup</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.deviceFrame}
                  onChange={(e) =>
                    onUpdateProfile({ ...profile, deviceFrame: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>
          </div>

          {/* Backup & Local Data */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">Local Data Storage</h4>
            
            <p className="text-xs text-slate-500">
              All tasks and notes are stored strictly on your device. You can download an offline JSON backup or restore an existing one.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-600" />
                Export JSON
              </button>

              <label className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-slate-600" />
                Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs text-emerald-600 font-medium text-center">
                {importStatus}
              </p>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full mt-2 p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Tasks & Sample Notes
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
