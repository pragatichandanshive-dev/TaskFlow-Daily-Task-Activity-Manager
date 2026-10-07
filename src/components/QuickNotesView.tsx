import React, { useState, useMemo } from 'react';
import { Plus, Search, Pin, Trash2, Copy, Check, StickyNote } from 'lucide-react';
import { Note } from '../types';

interface QuickNotesViewProps {
  notes: Note[];
  onOpenNoteModal: (note?: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

export const QuickNotesView: React.FC<QuickNotesViewProps> = ({
  notes,
  onOpenNoteModal,
  onDeleteNote,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Pinned notes first, then by updated date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      });
  }, [notes, searchQuery]);

  const handleCopyNote = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const colorStyles: Record<
    Note['color'],
    { bg: string; border: string; accent: string }
  > = {
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200',
      accent: 'text-slate-600',
    },
    amber: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      accent: 'text-amber-700',
    },
    emerald: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      accent: 'text-emerald-700',
    },
    blue: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-200',
      accent: 'text-blue-700',
    },
    rose: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-200',
      accent: 'text-rose-700',
    },
    violet: {
      bg: 'bg-violet-50/50',
      border: 'border-violet-200',
      accent: 'text-violet-700',
    },
  };

  return (
    <div className="space-y-5 pb-24">
      {/* 1. Header & Action */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quick Notes</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {notes.length} personal note{notes.length === 1 ? '' : 's'} · offline storage
          </p>
        </div>
        <button
          onClick={() => onOpenNoteModal()}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* 2. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search personal notes & ideas..."
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

      {/* 3. Notes Grid / List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <StickyNote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No notes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery
              ? 'Try adjusting your search keywords.'
              : 'Keep brain dumps, checklists, or key thoughts handy.'}
          </p>
          <button
            onClick={() => onOpenNoteModal()}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredNotes.map((note) => {
            const styles = colorStyles[note.color || 'slate'] || colorStyles.slate;

            return (
              <div
                key={note.id}
                onClick={() => onOpenNoteModal(note)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between hover:shadow-md ${styles.bg} ${styles.border}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(note.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.isPinned
                            ? 'text-amber-600 hover:text-amber-700 bg-amber-100/50'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={note.isPinned ? 'Unpin note' : 'Pin note'}
                      >
                        <Pin
                          className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-600' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 whitespace-pre-line line-clamp-4 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                {/* Note Footer */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">
                    {new Date(note.updatedAt || note.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopyNote(e, note)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Copy note text"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this note?')) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
