import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Check,
  Clock,
  Calendar,
  Bell,
  Trash2,
  ArrowUpDown,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Task, Priority, Category } from '../types';
import { formatHumanDate, formatTime12h, getTodayDateString } from '../utils/storage';

interface TaskManagerViewProps {
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onOpenTaskModal: (task?: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompleted: () => void;
}

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  tasks,
  onToggleTaskComplete,
  onOpenTaskModal,
  onDeleteTask,
  onClearCompleted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'date' | 'title'>('time');

  const categories: Category[] = ['Work', 'Personal', 'Health', 'Study', 'Errand', 'Finance'];

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = (task.description || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Status
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;

        // Priority
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Category
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityWeights = { high: 3, medium: 2, low: 1 };
          return priorityWeights[b.priority] - priorityWeights[a.priority];
        }
        if (sortBy === 'date') {
          return `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        // Default sort by time
        return (a.time || '99:99').localeCompare(b.time || '99:99');
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = tasks.length - completedCount;

  return (
    <div className="space-y-5 pb-24">
      {/* 1. Header & Quick Add */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeCount} pending · {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => onOpenTaskModal()}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* 2. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by task title or description..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* 3. Status Tabs (All, Active, Completed) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-2xl">
          {(
            [
              { id: 'all', label: `All (${tasks.length})` },
              { id: 'active', label: `Pending (${activeCount})` },
              { id: 'completed', label: `Completed (${completedCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-7 text-xs font-medium text-slate-700 shadow-xs focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="time">Sort: Time</option>
            <option value="priority">Sort: Priority</option>
            <option value="date">Sort: Date</option>
            <option value="title">Sort: Alphabetical</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* 4. Priority Chips & Category Filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Priority:
          </span>
          {(['all', 'high', 'medium', 'low'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all capitalize border ${
                priorityFilter === p
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Category:
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all border ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Tasks List */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No matching tasks found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try clearing your filters or search keywords.'
                : 'Start organizing your day by creating a task.'}
            </p>
            <button
              onClick={() => onOpenTaskModal()}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-2xl p-4 border transition-all flex items-start gap-3.5 bg-white ${
                  task.completed
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Tactile Circular Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleTaskComplete(task.id)}
                  className={`min-w-[28px] min-h-[28px] w-7 h-7 rounded-xl flex items-center justify-center transition-all mt-0.5 ${
                    task.completed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border-2 border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  aria-label="Toggle completed"
                >
                  {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* Task Details */}
                <div
                  onClick={() => onOpenTaskModal(task)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-semibold truncate ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h4>

                    {/* Subtle status tag if completed */}
                    {task.completed && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        Completed
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p
                      className={`text-xs mt-1 line-clamp-2 ${
                        task.completed ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Clean unboxed metadata with · separator */}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-medium flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-slate-700">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatHumanDate(task.date)}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
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
                      {task.priority}
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
                          Reminder
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Delete action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this task?')) {
                      onDeleteTask(task.id);
                    }
                  }}
                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Footer bulk clear if completed tasks exist */}
      {completedCount > 0 && (
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              if (confirm(`Clear all ${completedCount} completed tasks?`)) {
                onClearCompleted();
              }
            }}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors underline decoration-slate-300"
          >
            Clear {completedCount} Completed Tasks
          </button>
        </div>
      )}
    </div>
  );
};
