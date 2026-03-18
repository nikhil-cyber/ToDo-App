import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Priority = 'low' | 'medium' | 'high'
export type BucketCategory = 'personal' | 'career' | 'travel' | 'health' | 'learning' | 'finance' | 'other'

export interface Task {
  id: string
  date: string        // YYYY-MM-DD
  name: string
  hours: number
  minutes: number
  link: string
  customer: string
  done: boolean
  createdAt: number
}

export interface Reminder {
  id: string
  text: string
  due: string         // YYYY-MM-DD or ''
  priority: Priority
  link: string
  customer: string
  done: boolean
  createdAt: number
}

export interface BucketItem {
  id: string
  title: string
  year: string
  category: BucketCategory
  notes: string
  done: boolean
  targetDate?: string  // YYYY-MM-DD, optional daily target
  createdAt: number
}

interface AppState {
  tasks: Task[]
  reminders: Reminder[]
  bucket: BucketItem[]

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'done'>) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  moveTaskToDate: (id: string, newDate: string) => void

  // Reminders
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt'>) => void
  toggleReminder: (id: string) => void
  deleteReminder: (id: string) => void
  updateReminderDue: (id: string, due: string) => void

  // Bucket
  addBucketItem: (b: Omit<BucketItem, 'id' | 'createdAt'>) => void
  toggleBucket: (id: string) => void
  deleteBucket: (id: string) => void
  updateBucketTargetDate: (id: string, targetDate: string) => void
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      reminders: [],
      bucket: [],

      addTask: (task) =>
        set((s) => ({
          tasks: [...s.tasks, { ...task, done: false, id: uid(), createdAt: Date.now() }],
        })),
      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      moveTaskToDate: (id, newDate) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, date: newDate, done: false } : t)),
        })),

      addReminder: (r) =>
        set((s) => ({
          reminders: [{ ...r, id: uid(), createdAt: Date.now() }, ...s.reminders],
        })),
      toggleReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, done: !r.done } : r,
          ),
        })),
      deleteReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      updateReminderDue: (id, due) =>
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, due, done: false } : r)),
        })),

      addBucketItem: (b) =>
        set((s) => ({
          bucket: [{ ...b, id: uid(), createdAt: Date.now() }, ...s.bucket],
        })),
      toggleBucket: (id) =>
        set((s) => ({
          bucket: s.bucket.map((b) =>
            b.id === id ? { ...b, done: !b.done } : b,
          ),
        })),
      deleteBucket: (id) =>
        set((s) => ({ bucket: s.bucket.filter((b) => b.id !== id) })),
      updateBucketTargetDate: (id, targetDate) =>
        set((s) => ({
          bucket: s.bucket.map((b) => (b.id === id ? { ...b, targetDate } : b)),
        })),
    }),
    { name: 'daily-planner-v1' },
  ),
)
