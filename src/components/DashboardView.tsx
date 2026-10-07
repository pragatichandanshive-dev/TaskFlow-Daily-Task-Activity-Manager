import React, { useState } from 'react';
import { Check, Clock, Bell, Plus, Calendar, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Task, UserProfile } from '../types';
import {
  getGreeting,
  formatFullDateHeader,
  formatTime12h,
  getTodayDateString,
  getRelativeDateString,
} from '../utils/storage';

interface DashboardViewProps {
  tasks: Task[];
  profile: UserProfile;
  onToggleTaskComplete: (taskId: string) => void;
  onOpenTaskModal: (task?: Task) => void;
  onNavigateToSchedule: () => void;
  onNavigateToTasks: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  profile,
  onToggleTaskComplete,
  onOpenTaskModal,
  onNavigateToSchedule,
  onNavigateToTasks,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'completed'>('all');

  // Generate 5 days for the horizontal date selector
  const dateOptions = [
    { label: 'Yesterday', date: getRelativeDateString(-1) },
    { label: 'Today', date: todayStr },
    { label: 'Tomorrow', date: getRelativeDateString(1) },
    { label: '+2 Days', date: getRelativeDateString(2) },
    { label: '+3 Days', date: getRelativeDateString(3) },
  ];

  // Tasks for the active selected date
  const selectedDateTasks = tasks
    .filter((t) => t.date === selectedDate)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  // Today specific calculations for primary greeting and stats
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const todayTotal = todayTasks.length;
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayPending = todayTotal - todayCompleted;
  const todayProgressPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  // Filtered tasks for the current selected date view
  const displayTasks = selectedDateTasks.filter((t) => {
    if (filterState === 'pending') return !t.completed;
    if (filterState === 'completed') return t.completed;
    return true;
  });

  // Next upcoming pending task for today
  const nextPendingTask = todayTasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))[0];

  // SVG circular progress calculation
  const circleRadius = 38;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (todayProgressPercent / 100) * circleCircumference;

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header Greeting & Current Date */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatFullDateHeader(new Date())}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {getGreeting(profile.name)}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {todayPending > 0
            ? `You have ${todayPending} pending task${todayPending === 1 ? '' : 's'} scheduled for today.`
            : todayTotal > 0
            ? "Fantastic! All of today's tasks are completed."
            : 'No tasks scheduled yet. Tap + to plan your day.'}
        </p>
      </div>

      {/* 2. Visual Progress & Stats Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular Progress Gauge */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 96 96">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100"
                fill="transparent"
              />
              {/* Progress arc */}
              <circle
                cx="48"
                cy="48"
                r={circleRadius}
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-900 transition-all duration-700 ease-out"
                fill="transparent"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                {todayProgressPercent}%
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Done
              </span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="flex-1 w-full grid grid-cols-3 gap-2.5 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1 font-mono tabular-nums">
                {todayTotal}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tasks</div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/60">
              <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
                Completed
              </div>
              <div className="text-xl font-bold text-emerald-800 mt-1 font-mono tabular-nums">
                {todayCompleted}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Finished</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100/60">
              <div className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">
                Pending
              </div>
              <div className="text-xl font-bold text-amber-800 mt-1 font-mono tabular-nums">
                {todayPending}
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">To do</div>
            </div>
          </div>
        </div>

        {/* Up Next Banner if there's a pending task */}
        {nextPendingTask && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Next Up · {formatTime12h(nextPendingTask.time)}
                </span>
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {nextPendingTask.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenTaskModal(nextPendingTask)}
              className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 shrink-0"
            >
              View <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3. Horizontal Date Scrubber */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Daily Schedule Date</h2>
          <button
            onClick={onNavigateToSchedule}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            Full Timeline <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {dateOptions.map((opt) => {
            const isSelected = selectedDate === opt.date;
            const isToday = opt.date === todayStr;
            const count = tasks.filter((t) => t.date === opt.date).length;

            return (
              <button
                key={opt.date}
                type="button"
                onClick={() => setSelectedDate(opt.date)}
                className={`py-2 px-3.5 rounded-2xl text-xs font-medium transition-all shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{opt.label}</span>
                {isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Task List for Selected Date */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {selectedDate === todayStr ? "Today's Tasks" : "Day's Tasks"}
            </h2>
            <span className="text-xs font-mono text-slate-400">({displayTasks.length})</span>
          </div>

          {/* Filter tabs: All, Pending, Completed */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl">
            {(['all', 'pending', 'completed'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setFilterState(filter)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                  filterState === filter
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards List */}
        {displayTasks.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">
              {filterState === 'completed'
                ? 'No completed tasks yet'
                : filterState === 'pending'
                ? 'No pending tasks left!'
                : 'No tasks scheduled for this day'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Plan your activities, meetings, workouts, or errands with exact times and reminders.
            </p>
            <button
              onClick={() => onOpenTaskModal()}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add First Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayTasks.map((task) => {
              const priorityColors = {
                high: 'text-rose-600 bg-rose-50 border-rose-200',
                medium: 'text-amber-600 bg-amber-50 border-amber-200',
                low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              };

              return (
                <div
                  key={task.id}
                  className={`group rounded-2xl p-4 border transition-all duration-200 flex items-start gap-3.5 bg-white ${
                    task.completed
                      ? 'border-slate-200 bg-slate-50/70 opacity-75'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Tactile Circular Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTaskComplete(task.id);
                    }}
                    className={`min-w-[28px] min-h-[28px] w-7 h-7 rounded-xl flex items-center justify-center transition-all mt-0.5 ${
                      task.completed
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border-2 border-slate-300 bg-white hover:border-slate-400'
                    }`}
                    title={task.completed ? 'Mark pending' : 'Mark completed'}
                    aria-label="Toggle completed"
                  >
                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Task Content (Click to edit) */}
                  <div
                    onClick={() => onOpenTaskModal(task)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>

                    {task.description && (
                      <p
                        className={`text-xs mt-1 line-clamp-1 ${
                          task.completed ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Unboxed Metadata with · separator */}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1 font-mono text-slate-700">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatTime12h(task.time)}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span
                        className={`capitalize font-semibold ${
                          task.priority === 'high'
                            ? 'text-rose-600'
                            : task.priority === 'medium'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      {task.category && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-600">{task.category}</span>
                        </>
                      )}
                      {task.reminder && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="flex items-center gap-0.5 text-indigo-600">
                            <Bell className="w-3 h-3" />
                            Alert
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
