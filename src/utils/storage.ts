import { Task, Note, UserProfile } from '../types';

const TASKS_STORAGE_KEY = 'taskflow_tasks_v1';
const NOTES_STORAGE_KEY = 'taskflow_notes_v1';
const PROFILE_STORAGE_KEY = 'taskflow_profile_v1';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatHumanDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatFullDateHeader(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime12h(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m || 0).padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17) {
    timeGreeting = 'Good evening';
  }
  return `${timeGreeting}, ${name || 'Friend'}`;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Alex',
  soundEnabled: true,
  notificationsEnabled: true,
  deviceFrame: false,
};

export function getInitialTasks(): Task[] {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  const yesterday = getRelativeDateString(-1);

  return [
    {
      id: 'task-1',
      title: 'Review quarterly project deliverables',
      description: 'Go over sprint KPI benchmarks, client feedback, and prepare sync slide deck.',
      date: today,
      time: '09:30',
      priority: 'high',
      category: 'Work',
      completed: false,
      reminder: true,
      reminderOffsetMinutes: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: '30-minute brisk walk & stretch',
      description: 'Midday screen break, hydrate, and get outdoor sunlight.',
      date: today,
      time: '12:15',
      priority: 'medium',
      category: 'Health',
      completed: true,
      completedAt: new Date().toISOString(),
      reminder: false,
      reminderOffsetMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Client design demo & feedback review',
      description: 'Showcase mobile prototype interactions and validate task flow navigation.',
      date: today,
      time: '14:00',
      priority: 'high',
      category: 'Work',
      completed: false,
      reminder: true,
      reminderOffsetMinutes: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Grocery restock & pantry essentials',
      description: 'Pick up fresh produce, oats, olive oil, and coffee beans.',
      date: today,
      time: '17:45',
      priority: 'low',
      category: 'Errand',
      completed: false,
      reminder: true,
      reminderOffsetMinutes: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Read 2 chapters of Architecture book',
      description: 'Chapter 4 & 5 on distributed transactions and event streams.',
      date: today,
      time: '20:30',
      priority: 'low',
      category: 'Study',
      completed: false,
      reminder: false,
      reminderOffsetMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Team sprint backlog refinement',
      description: 'Prioritize upcoming user stories and estimation points.',
      date: tomorrow,
      time: '10:00',
      priority: 'medium',
      category: 'Work',
      completed: false,
      reminder: true,
      reminderOffsetMinutes: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-7',
      title: 'Strength training: Core & mobility',
      description: 'Warmup stretches, kettlebell swings, and mobility cooldown.',
      date: tomorrow,
      time: '16:30',
      priority: 'medium',
      category: 'Health',
      completed: false,
      reminder: true,
      reminderOffsetMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'task-8',
      title: 'Organize workspace & archive weekly logs',
      description: 'Clear desk surface, backup local notes, clean inbox.',
      date: yesterday,
      time: '18:00',
      priority: 'low',
      category: 'Personal',
      completed: true,
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      reminder: false,
      reminderOffsetMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getInitialNotes(): Note[] {
  return [
    {
      id: 'note-1',
      title: 'Key Habits for High Productivity',
      content: '1. Plan the top 3 high-impact tasks the night before.\n2. 90-minute uninterrupted morning focus block.\n3. Keep phone notifications on silent during deep work.',
      color: 'amber',
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note-2',
      title: 'Sprint Retrospective Takeaways',
      content: 'Team agreed to shorten standups to 10 minutes and use async updates for non-blocking tickets. Great momentum on mobile responsive polish!',
      color: 'blue',
      isPinned: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note-3',
      title: 'Weekend Farmer’s Market List',
      content: '• Organic apples & berries\n• Sourdough loaf\n• Local wildflower honey\n• Fresh rosemary and basil herbs',
      color: 'emerald',
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getInitialTasks();
      saveTasks(initial);
      return initial;
    }
    return parsed;
  } catch {
    return getInitialTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialNotes();
      saveNotes(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getInitialNotes();
      saveNotes(initial);
      return initial;
    }
    return parsed;
  } catch {
    return getInitialNotes();
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      saveUserProfile(INITIAL_USER_PROFILE);
      return INITIAL_USER_PROFILE;
    }
    return { ...INITIAL_USER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return INITIAL_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function exportAllDataJSON(): string {
  const tasks = loadTasks();
  const notes = loadNotes();
  const profile = loadUserProfile();
  return JSON.stringify(
    {
      app: 'TaskFlow',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      notes,
      profile,
    },
    null,
    2
  );
}

export function importAllDataJSON(jsonStr: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (data.tasks && Array.isArray(data.tasks)) {
      saveTasks(data.tasks);
    }
    if (data.notes && Array.isArray(data.notes)) {
      saveNotes(data.notes);
    }
    if (data.profile && typeof data.profile === 'object') {
      saveUserProfile(data.profile);
    }
    return { success: true, message: 'Data imported successfully' };
  } catch {
    return { success: false, message: 'Invalid JSON backup format' };
  }
}

export function resetAllData(): { tasks: Task[]; notes: Note[]; profile: UserProfile } {
  const tasks = getInitialTasks();
  const notes = getInitialNotes();
  const profile = { ...INITIAL_USER_PROFILE };
  saveTasks(tasks);
  saveNotes(notes);
  saveUserProfile(profile);
  return { tasks, notes, profile };
}
