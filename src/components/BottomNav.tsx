import React from 'react';
import { LayoutDashboard, CheckSquare, Calendar, StickyNote, BarChart3, Plus } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onQuickAdd: () => void;
  activeTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onQuickAdd,
  activeTasksCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Today', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'schedule', label: 'Timeline', icon: Calendar },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 min-h-[44px] flex flex-col items-center justify-center relative py-1 transition-all ${
                isActive ? 'text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.id === 'tasks' && activeTasksCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-slate-900 text-white text-[9px] font-mono font-bold rounded-full min-w-3.5 text-center leading-tight">
                    {activeTasksCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate ${isActive ? 'font-semibold text-slate-900' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-slate-900 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Floating Quick Add button on thumb reachable zone */}
        <button
          onClick={onQuickAdd}
          className="absolute -top-5 right-4 sm:right-6 w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/25 flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all"
          title="New Task"
          aria-label="Add New Task"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </nav>
  );
};
