import React, { useState, useEffect } from 'react';
import { X, Pin, Trash2 } from 'lucide-react';
import { Note } from '../types';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  onDelete?: (id: string) => void;
  initialNote?: Note | null;
}

const COLOR_OPTIONS: { id: Note['color']; label: string; bg: string; ring: string }[] = [
  { id: 'slate', label: 'Slate', bg: 'bg-slate-100', ring: 'ring-slate-400' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-100', ring: 'ring-amber-400' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-100', ring: 'ring-emerald-400' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-100', ring: 'ring-blue-400' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-100', ring: 'ring-rose-400' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-100', ring: 'ring-violet-400' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialNote,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<Note['color']>('slate');
  const [isPinned, setIsPinned] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setColor(initialNote.color || 'slate');
      setIsPinned(initialNote.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setColor('slate');
      setIsPinned(false);
    }
    setErrors({});
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Note title is required' });
      return;
    }

    onSave(
      {
        title: title.trim(),
        content: content.trim(),
        color,
        isPinned,
      },
      initialNote?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {initialNote ? 'Edit Note' : 'Quick Note'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Capture thoughts, ideas & checklists</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Note Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              placeholder="e.g., Ideas for Project Launch"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'
              }`}
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Content / Details
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here... supports multi-line checklists and ideas."
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none transition-all"
            />
          </div>

          {/* Color & Pin Options */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Note Color
              </label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} border border-slate-300 transition-transform ${
                      color === c.id ? `ring-2 ${c.ring} scale-110 shadow-sm` : 'hover:scale-105'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium self-start sm:self-auto transition-colors ${
                isPinned
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-600' : ''}`} />
              {isPinned ? 'Pinned to top' : 'Pin note'}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center gap-3">
            {initialNote && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this note?')) {
                    onDelete(initialNote.id);
                    onClose();
                  }
                }}
                className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                title="Delete note"
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
              {initialNote ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
