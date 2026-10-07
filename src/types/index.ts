export type Priority = 'high' | 'medium' | 'low';

export type Category = 'Work' | 'Personal' | 'Health' | 'Study' | 'Errand' | 'Finance';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  priority: Priority;
  category: Category;
  completed: boolean;
  completedAt?: string;
  reminder: boolean;
  reminderOffsetMinutes: number; // 0 for at time, 5, 15, 30, 60
  reminderTriggered?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: 'slate' | 'amber' | 'emerald' | 'blue' | 'rose' | 'violet';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  deviceFrame: boolean;
}

export type TabType = 'dashboard' | 'tasks' | 'schedule' | 'notes' | 'progress';

export interface FilterState {
  searchQuery: string;
  status: 'all' | 'active' | 'completed';
  priority: 'all' | Priority;
  category: 'all' | Category;
  sortBy: 'time' | 'priority' | 'title' | 'created';
}

export interface ReminderAlert {
  id: string;
  taskId: string;
  title: string;
  time: string;
  date: string;
  timestamp: number;
}
