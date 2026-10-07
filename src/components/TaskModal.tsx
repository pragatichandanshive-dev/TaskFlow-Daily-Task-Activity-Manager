import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Bell, Trash2, Check } from 'lucide-react';
import { Task, Priority, Category } from '../types';
import { getTodayDateString } from '../utils/storage';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  onDelete?: (id: string) => void;
  initialTask?: Task | null;
  defaultDate?: string;
  defaultTime?: string;
}

const CATEGORIES: Category[] = ['Work', 'Personal', 'Health', 'Study', 'Errand', 'Finance'];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  defaultDate,
  defaultTime,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Work');
  const [reminder, setReminder] = useState(true);
  const [reminderOffsetMinutes, setReminderOffsetMinutes] = useState(15);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDate(initialTask.date);
      setTime(initialTask.time || '09:00');
      setPriority(initialTask.priority);
      setCategory(initialTask.category || 'Work');
      setReminder(initialTask.reminder ?? true);
      setReminderOffsetMinutes(initialTask.reminderOffsetMinutes ?? 15);
      setCompleted(initialTask.completed);
    } else {
      setTitle('');
      setDescription('');
      setDate(defaultDate || getTodayDateString());
      setTime(defaultTime || '09:00');
      setPriority('medium');
      setCategory('Work');
      setReminder(true);
      setReminderOffsetMinutes(15);
      setCompleted(false);
    }
    setErrors({});
  }, [initialTask, isOpen, defaultDate, defaultTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Task title is required' });
      return;
    }

    onSave(
      {
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        priority,
        category,
        completed,
        reminder,
        reminderOffsetMinutes,
        reminderTriggered: false,
      },
      initialTask?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialTask ? 'Edit Task' : 'New Task'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {initialTask ? 'Update task details and reminder' : 'Organize your daily activity'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              placeholder="e.g., Prepare quarterly presentation"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, checklist points, or subtasks..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition-all"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                const colors = {
                  low: isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                  medium: isSelected
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                  high: isSelected
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
                };

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${colors[p]}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p === 'high'
                          ? 'bg-rose-400'
                          : p === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder Section */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Task Reminder</h4>
                  <p className="text-[11px] text-slate-500">Receive local notification chime</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
              </label>
            </div>

            {reminder && (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Alert Time:</span>
                <select
                  value={reminderOffsetMinutes}
                  onChange={(e) => setReminderOffsetMinutes(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium text-xs focus:ring-1 focus:ring-slate-900"
                >
                  <option value={0}>At scheduled time</option>
                  <option value={5}>5 minutes before</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                </select>
              </div>
            )}
          </div>

          {/* Completed toggle if editing */}
          {initialTask && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-700">Mark as completed</span>
              <button
                type="button"
                onClick={() => setCompleted(!completed)}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                  completed ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                }`}
              >
                {completed && <Check className="w-4 h-4 stroke-[3]" />}
              </button>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-2 flex items-center gap-3">
            {initialTask && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this task?')) {
                    onDelete(initialTask.id);
                    onClose();
                  }
                }}
                className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                title="Delete task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white font-medium text-xs sm:text-sm hover:bg-slate-800 shadow-sm transition-colors"
            >
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
