import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Plus,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { Task } from '../types';
import {
  formatHumanDate,
  formatTime12h,
  getTodayDateString,
  getRelativeDateString,
} from '../utils/storage';

interface ScheduleViewProps {
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onOpenTaskModal: (task?: Task, defaultDate?: string, defaultTime?: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  tasks,
  onToggleTaskComplete,
  onOpenTaskModal,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Helper to change date by delta days
  const handleShiftDate = (days: number) => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const cur = new Date(y, m - 1, d);
      cur.setDate(cur.getDate() + days);
      const year = cur.getFullYear();
      const month = String(cur.getMonth() + 1).padStart(2, '0');
      const day = String(cur.getDate()).padStart(2, '0');
      setSelectedDate(`${year}-${month}-${day}`);
    } catch {
      setSelectedDate(todayStr);
    }
  };

  // Day's tasks ordered by time
  const dayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.date === selectedDate)
      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
  }, [tasks, selectedDate]);

  // Current time representation for "Now" line if viewing today
  const isViewingToday = selectedDate === todayStr;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeString = `${String(currentHour).padStart(2, '0')}:${String(
    currentMinute
  ).padStart(2, '0')}`;

  // Helper to evaluate timeline status of task
  const getTaskStatus = (task: Task) => {
    if (task.completed) return 'completed';
    if (!isViewingToday) return 'upcoming';
    if (task.time < currentTimeString) return 'overdue';
    // If within next 60 minutes
    const [th, tm] = task.time.split(':').map(Number);
    const diffMinutes = (th - currentHour) * 60 + (tm - currentMinute);
    if (diffMinutes >= 0 && diffMinutes <= 60) return 'due-soon';
    return 'upcoming';
  };

  return (
    <div className="space-y-5 pb-24">
      {/* 1. Header & Date Controller */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Daily Schedule</h1>
            <p className="text-xs text-slate-500 mt-0.5">Time-blocked chronological flow</p>
          </div>
          <button
            onClick={() => onOpenTaskModal(undefined, selectedDate, '09:00')}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Date Selector Navigation Bar */}
        <div className="mt-4 p-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <button
            onClick={() => handleShiftDate(-1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-900">
              {formatHumanDate(selectedDate)}
            </span>
            {isViewingToday && (
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isViewingToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Today
              </button>
            )}
            <button
              onClick={() => handleShiftDate(1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Timeline List */}
      <div>
        {dayTasks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">
              No tasks scheduled for {formatHumanDate(selectedDate)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Stay ahead by organizing your appointments and deliverables into a clean schedule.
            </p>
            <button
              onClick={() => onOpenTaskModal(undefined, selectedDate, '10:00')}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Schedule a Task
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {dayTasks.map((task) => {
              const status = getTaskStatus(task);

              return (
                <div key={task.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-4 w-4 h-4 -translate-x-[7px] sm:-translate-x-[7px] rounded-full border-2 bg-white transition-all flex items-center justify-center ${
                      status === 'completed'
                        ? 'border-emerald-600 bg-emerald-600'
                        : status === 'due-soon'
                        ? 'border-amber-500 ring-4 ring-amber-100'
                        : status === 'overdue'
                        ? 'border-rose-500'
                        : 'border-slate-400'
                    }`}
                  >
                    {status === 'completed' && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>

                  {/* Timeline Card */}
                  <div
                    className={`rounded-2xl p-4 border transition-all ${
                      status === 'completed'
                        ? 'bg-slate-50/70 border-slate-200 opacity-75'
                        : status === 'due-soon'
                        ? 'bg-white border-amber-300 shadow-sm ring-1 ring-amber-100'
                        : status === 'overdue'
                        ? 'bg-white border-rose-200 shadow-xs'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    {/* Time Header & Status */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {formatTime12h(task.time)}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-medium">{task.category}</span>
                      </div>

                      {/* Status indicator unboxed text */}
                      {status === 'completed' ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Completed
                        </span>
                      ) : status === 'due-soon' ? (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due Soon
                        </span>
                      ) : status === 'overdue' ? (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Past Due
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500">Upcoming</span>
                      )}
                    </div>

                    {/* Task Title & Description */}
                    <div
                      onClick={() => onOpenTaskModal(task)}
                      className="cursor-pointer"
                    >
                      <h4
                        className={`text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p
                          className={`text-xs mt-1 line-clamp-2 ${
                            task.completed ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Timeline Action bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span
                          className={`font-semibold capitalize ${
                            task.priority === 'high'
                              ? 'text-rose-600'
                              : task.priority === 'medium'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        {task.reminder && (
                          <>
                            <span aria-hidden="true" className="text-slate-300">·</span>
                            <span className="flex items-center gap-1 text-indigo-600">
                              <Bell className="w-3 h-3" />
                              Alert On
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleTaskComplete(task.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          task.completed
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{task.completed ? 'Completed' : 'Mark Done'}</span>
                      </button>
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
