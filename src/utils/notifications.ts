import { Task } from '../types';
import { playReminderAlarm } from './sound';

export interface InAppNotification {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'reminder' | 'success' | 'info';
}

type NotificationListener = (notification: InAppNotification) => void;
const listeners = new Set<NotificationListener>();

export function subscribeToNotifications(listener: NotificationListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dispatchInAppNotification(notification: InAppNotification) {
  listeners.forEach((fn) => fn(notification));
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export function sendLocalNotification(title: string, body: string, soundEnabled = true) {
  // 1. Play audio chime
  if (soundEnabled) {
    playReminderAlarm(true);
  }

  // 2. Dispatch in-app toast
  const inAppItem: InAppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    message: body,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'reminder',
  };
  dispatchInAppNotification(inAppItem);

  // 3. System browser notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        badge: '/favicon.ico',
        icon: '/favicon.ico',
      });
    } catch {
      // In some sandboxed contexts Notification constructor may throw
    }
  }
}

/**
 * Check tasks for any due reminders.
 * Returns array of task IDs that were triggered.
 */
export function checkTaskReminders(tasks: Task[], soundEnabled = true): string[] {
  const now = new Date();
  const triggeredTaskIds: string[] = [];

  for (const task of tasks) {
    if (!task.reminder || task.completed || task.reminderTriggered) {
      continue;
    }

    if (!task.date || !task.time) continue;

    try {
      const [year, month, day] = task.date.split('-').map(Number);
      const [hour, min] = task.time.split(':').map(Number);
      const taskScheduledDate = new Date(year, month - 1, day, hour, min, 0, 0);

      // Subtract reminder offset
      const reminderOffsetMs = (task.reminderOffsetMinutes || 0) * 60 * 1000;
      const reminderTargetTime = new Date(taskScheduledDate.getTime() - reminderOffsetMs);

      // Trigger if current time is at or past reminderTargetTime, but not more than 24h past
      const diffMs = now.getTime() - reminderTargetTime.getTime();
      if (diffMs >= 0 && diffMs < 24 * 60 * 60 * 1000) {
        triggeredTaskIds.push(task.id);
        const offsetText =
          task.reminderOffsetMinutes > 0
            ? `(in ${task.reminderOffsetMinutes} mins)`
            : `(Scheduled at ${task.time})`;
        sendLocalNotification(
          `Task Reminder: ${task.title}`,
          `${offsetText} • Priority: ${task.priority.toUpperCase()}`,
          soundEnabled
        );
      }
    } catch {
      // Ignore invalid date strings
    }
  }

  return triggeredTaskIds;
}
