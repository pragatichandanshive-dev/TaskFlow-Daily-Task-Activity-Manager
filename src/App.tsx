/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Task, Note, UserProfile, TabType } from './types';
import {
  loadTasks,
  saveTasks,
  loadNotes,
  saveNotes,
  loadUserProfile,
  saveUserProfile,
  getTodayDateString,
} from './utils/storage';
import { playSuccessChime, playTapSound } from './utils/sound';
import { checkTaskReminders } from './utils/notifications';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { TaskManagerView } from './components/TaskManagerView';
import { ScheduleView } from './components/ScheduleView';
import { QuickNotesView } from './components/QuickNotesView';
import { ProgressView } from './components/ProgressView';

import { TaskModal } from './components/TaskModal';
import { NoteModal } from './components/NoteModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { SettingsModal } from './components/SettingsModal';
import { InAppNotificationToast } from './components/InAppNotificationToast';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskDate, setDefaultTaskDate] = useState<string | undefined>(undefined);
  const [defaultTaskTime, setDefaultTaskTime] = useState<string | undefined>(undefined);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial data hydration
  useEffect(() => {
    const loadedTasks = loadTasks();
    const loadedNotes = loadNotes();
    const loadedProfile = loadUserProfile();
    setTasks(loadedTasks);
    setNotes(loadedNotes);
    setProfile(loadedProfile);
  }, []);

  // Periodic reminder checking every 15 seconds
  useEffect(() => {
    if (tasks.length === 0) return;

    const interval = setInterval(() => {
      const triggeredIds = checkTaskReminders(tasks, profile.soundEnabled);
      if (triggeredIds.length > 0) {
        setTasks((prev) => {
          const updated = prev.map((t) =>
            triggeredIds.includes(t.id) ? { ...t, reminderTriggered: true } : t
          );
          saveTasks(updated);
          return updated;
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [tasks, profile.soundEnabled]);

  // Tab change handler
  const handleTabChange = useCallback(
    (tab: TabType) => {
      playTapSound(profile.soundEnabled);
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [profile.soundEnabled]
  );

  // Task actions
  const handleToggleTaskComplete = useCallback(
    (taskId: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) => {
          if (t.id === taskId) {
            const willBeCompleted = !t.completed;
            if (willBeCompleted) {
              playSuccessChime(profile.soundEnabled);
            } else {
              playTapSound(profile.soundEnabled);
            }
            return {
              ...t,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        });
        saveTasks(updated);
        return updated;
      });
    },
    [profile.soundEnabled]
  );

  const handleSaveTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => {
      setTasks((prev) => {
        let updated: Task[];
        const now = new Date().toISOString();
        if (editId) {
          updated = prev.map((t) =>
            t.id === editId ? { ...t, ...taskData, updatedAt: now } : t
          );
        } else {
          const newTask: Task = {
            ...taskData,
            id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            createdAt: now,
            updatedAt: now,
          };
          updated = [newTask, ...prev];
        }
        saveTasks(updated);
        return updated;
      });
      playTapSound(profile.soundEnabled);
    },
    [profile.soundEnabled]
  );

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId);
      saveTasks(updated);
      return updated;
    });
  }, []);

  const handleClearCompleted = useCallback(() => {
    setTasks((prev) => {
      const updated = prev.filter((t) => !t.completed);
      saveTasks(updated);
      return updated;
    });
  }, []);

  // Note actions
  const handleSaveNote = useCallback(
    (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => {
      setNotes((prev) => {
        let updated: Note[];
        const now = new Date().toISOString();
        if (editId) {
          updated = prev.map((n) =>
            n.id === editId ? { ...n, ...noteData, updatedAt: now } : n
          );
        } else {
          const newNote: Note = {
            ...noteData,
            id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            createdAt: now,
            updatedAt: now,
          };
          updated = [newNote, ...prev];
        }
        saveNotes(updated);
        return updated;
      });
      playTapSound(profile.soundEnabled);
    },
    [profile.soundEnabled]
  );

  const handleDeleteNote = useCallback((noteId: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== noteId);
      saveNotes(updated);
      return updated;
    });
  }, []);

  const handleToggleNotePin = useCallback((noteId: string) => {
    setNotes((prev) => {
      const updated = prev.map((n) =>
        n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
      );
      saveNotes(updated);
      return updated;
    });
  }, []);

  // Profile update
  const handleUpdateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);
  }, []);

  const handleDataReset = useCallback(() => {
    setTasks(loadTasks());
    setNotes(loadNotes());
    setProfile(loadUserProfile());
  }, []);

  // Quick Add modal trigger
  const handleOpenTaskModal = (task?: Task, date?: string, time?: string) => {
    setTaskToEdit(task || null);
    setDefaultTaskDate(date || getTodayDateString());
    setDefaultTaskTime(time || '09:00');
    setIsTaskModalOpen(true);
  };

  const handleOpenNoteModal = (note?: Note) => {
    setNoteToEdit(note || null);
    setIsNoteModalOpen(true);
  };

  // Pending reminders count
  const pendingRemindersCount = tasks.filter((t) => t.reminder && !t.completed).length;
  const activeTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start items-center">
      {/* Toast Notification Container */}
      <InAppNotificationToast />

      {/* Main Container: Supports either standard responsive layout or sleek phone mockup */}
      <div
        className={`w-full transition-all duration-300 ${
          profile.deviceFrame
            ? 'max-w-md my-4 sm:my-8 rounded-[40px] shadow-2xl border-[10px] border-slate-900 bg-white overflow-hidden relative min-h-[850px] ring-1 ring-slate-800'
            : 'max-w-xl bg-slate-50 min-h-screen shadow-sm'
        }`}
      >
        {/* Mock iPhone Dynamic Island / Speaker Notch (only shown if deviceFrame is toggled on) */}
        {profile.deviceFrame && (
          <div className="bg-slate-900 h-6 flex items-center justify-center relative z-40">
            <div className="w-24 h-4 bg-black rounded-full" />
          </div>
        )}

        {/* Top Header */}
        <Header
          onOpenReminders={() => setIsRemindersOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          pendingRemindersCount={pendingRemindersCount}
          profile={profile}
          onToggleDeviceFrame={() =>
            handleUpdateProfile({ ...profile, deviceFrame: !profile.deviceFrame })
          }
        />

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 pt-3 pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              profile={profile}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenTaskModal={handleOpenTaskModal}
              onNavigateToSchedule={() => handleTabChange('schedule')}
              onNavigateToTasks={() => handleTabChange('tasks')}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManagerView
              tasks={tasks}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenTaskModal={handleOpenTaskModal}
              onDeleteTask={handleDeleteTask}
              onClearCompleted={handleClearCompleted}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              tasks={tasks}
              onToggleTaskComplete={handleToggleTaskComplete}
              onOpenTaskModal={handleOpenTaskModal}
            />
          )}

          {activeTab === 'notes' && (
            <QuickNotesView
              notes={notes}
              onOpenNoteModal={handleOpenNoteModal}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleToggleNotePin}
            />
          )}

          {activeTab === 'progress' && <ProgressView tasks={tasks} />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          onQuickAdd={() => {
            if (activeTab === 'notes') {
              handleOpenNoteModal();
            } else {
              handleOpenTaskModal();
            }
          }}
          activeTasksCount={activeTasksCount}
        />
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={taskToEdit}
        defaultDate={defaultTaskDate}
        defaultTime={defaultTaskTime}
      />

      {/* Quick Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setNoteToEdit(null);
        }}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        initialNote={noteToEdit}
      />

      {/* Reminders Drawer */}
      <RemindersDrawer
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        tasks={tasks}
        soundEnabled={profile.soundEnabled}
        onSelectTask={(t) => handleOpenTaskModal(t)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onDataReset={handleDataReset}
      />
    </div>
  );
}
