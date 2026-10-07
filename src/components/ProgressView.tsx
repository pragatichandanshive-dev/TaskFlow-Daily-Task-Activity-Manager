import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { Task } from '../types';
import { getTodayDateString, getRelativeDateString } from '../utils/storage';

interface ProgressViewProps {
  tasks: Task[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ tasks }) => {
  const todayStr = getTodayDateString();

  // 1. Overall stats
  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalPending = totalTasks - totalCompleted;
  const overallPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // 2. Today's stats
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const todayTotal = todayTasks.length;
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // 3. Last 7 Days completion data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i;
    const dateStr = getRelativeDateString(-offset);
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - offset);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
    const shortDate = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const dayDone = dayTasks.filter((t) => t.completed).length;
    const dayTotal = dayTasks.length;
    const dayRate = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;

    return {
      dateStr,
      dayLabel,
      shortDate,
      total: dayTotal,
      completed: dayDone,
      rate: dayRate,
      isToday: dateStr === todayStr,
    };
  });

  // Calculate highest task count in last 7 days for bar scaling
  const maxBarValue = Math.max(...last7Days.map((d) => d.total), 4);

  // 4. Priority breakdown
  const priorities = (['high', 'medium', 'low'] as const).map((p) => {
    const pTasks = tasks.filter((t) => t.priority === p);
    const pCompleted = pTasks.filter((t) => t.completed).length;
    const pTotal = pTasks.length;
    const pRate = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;
    return {
      priority: p,
      total: pTotal,
      completed: pCompleted,
      rate: pRate,
    };
  });

  // 5. Category breakdown
  const categoryMap = tasks.reduce((acc, t) => {
    const cat = t.category || 'General';
    if (!acc[cat]) acc[cat] = { total: 0, completed: 0 };
    acc[cat].total += 1;
    if (t.completed) acc[cat].completed += 1;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  // 6. Streak calculation (consecutive days with at least 1 completed task up to today)
  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const dStr = getRelativeDateString(-i);
    const completedOnDay = tasks.some((t) => t.date === dStr && t.completed);
    if (completedOnDay) {
      currentStreak += 1;
    } else if (i === 0) {
      // If today hasn't completed any yet, don't break streak if yesterday was completed
      continue;
    } else {
      break;
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity & Progress</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time productivity analytics</p>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today's Completion */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today
            </span>
            <span className="text-xs font-mono font-bold text-slate-900">
              {todayCompleted}/{todayTotal}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {todayPercentage}%
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-500"
                style={{ width: `${todayPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Completed */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
              {totalCompleted}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Lifetime tasks</p>
          </div>
        </div>

        {/* Total Pending */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-800 font-mono tabular-nums">
              {totalPending}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">To be executed</p>
          </div>
        </div>

        {/* Active Streak */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Streak
            </span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-800 font-mono tabular-nums">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Daily consistency</p>
          </div>
        </div>
      </div>

      {/* 3. 7-Day Completion Trend Bar Chart */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              7-Day Activity Velocity
            </h2>
            <p className="text-xs text-slate-500">Completed vs total daily tasks</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-900" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-200" /> Total
            </span>
          </div>
        </div>

        {/* Visual Bar Columns */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-1 border-b border-slate-100">
          {last7Days.map((day) => {
            const totalHeightPercent = Math.min(100, Math.max(12, (day.total / maxBarValue) * 100));
            const completedHeightPercent =
              day.total > 0 ? (day.completed / day.total) * 100 : 0;

            return (
              <div
                key={day.dateStr}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                {/* Tooltip on hover */}
                <span className="text-[10px] font-mono font-bold text-slate-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.completed}/{day.total}
                </span>

                {/* Bar Container */}
                <div
                  className={`w-full max-w-[28px] rounded-lg overflow-hidden flex flex-col justify-end transition-all ${
                    day.isToday ? 'ring-2 ring-indigo-400/50' : ''
                  }`}
                  style={{
                    height: `${totalHeightPercent}%`,
                    backgroundColor: day.total > 0 ? '#e2e8f0' : '#f1f5f9',
                  }}
                >
                  <div
                    className="w-full bg-slate-900 rounded-b-lg transition-all duration-500"
                    style={{ height: `${completedHeightPercent}%` }}
                  />
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[11px] font-bold ${
                      day.isToday ? 'text-indigo-600' : 'text-slate-700'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-mono">
                    {day.shortDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Weekly Completion Rate</span>
          <span className="font-bold text-slate-900 font-mono tabular-nums">
            {overallPercentage}%
          </span>
        </div>
      </div>

      {/* 4. Priority Breakdown */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
          Priority Distribution & Resolution
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Balance of critical vs routine activities
        </p>

        <div className="space-y-3.5">
          {priorities.map((item) => {
            const barColors = {
              high: 'bg-rose-500',
              medium: 'bg-amber-500',
              low: 'bg-emerald-500',
            };
            const labelColors = {
              high: 'text-rose-700',
              medium: 'text-amber-700',
              low: 'text-emerald-700',
            };

            return (
              <div key={item.priority} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold capitalize ${labelColors[item.priority]}`}>
                    {item.priority} Priority
                  </span>
                  <span className="font-mono text-slate-600">
                    <strong className="text-slate-900">{item.completed}</strong> / {item.total} completed ({item.rate}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColors[item.priority]} rounded-full transition-all duration-500`}
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Category Breakdown & Summary */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
          Categories Breakdown
        </h2>
        <p className="text-xs text-slate-500 mb-4">Task allocation across life domains</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {Object.entries(categoryMap).map(([cat, stat]) => (
            <div key={cat} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xs font-semibold text-slate-800">{cat}</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                  {stat.completed}/{stat.total}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
