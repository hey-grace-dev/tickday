import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CHARACTERS } from '@/components/doodle';
import { type HabitColor } from '@/constants/theme';
import { type DateKey, todayKey } from '@/lib/date';
import {
  type Checks,
  FREE_HABIT_LIMIT,
  type Habit,
  type HabitInput,
  type TimeSlot,
} from '@/lib/habits';

export type Reminder = { enabled: boolean; hour: number; minute: number };
export type Reminders = Record<Exclude<TimeSlot, 'anytime'>, Reminder>;

export const DEFAULT_REMINDERS: Reminders = {
  morning: { enabled: false, hour: 8, minute: 0 },
  afternoon: { enabled: false, hour: 13, minute: 0 },
  evening: { enabled: false, hour: 21, minute: 0 },
};

/** Everything that is saved and backed up */
export type SavedData = {
  habits: Habit[];
  checks: Checks;
  isPro: boolean;
  reminders: Reminders;
};

type HabitState = SavedData & {
  /** Last deleted routine, kept in memory so it can be undone */
  lastDeleted: { habit: Habit; checks: DateKey[]; index: number } | null;
  addHabit: (input: HabitInput) => void;
  updateHabit: (id: string, input: HabitInput) => void;
  deleteHabit: (id: string) => void;
  undoDelete: () => void;
  clearLastDeleted: () => void;
  /** 졸업: hide from today but keep the character and its EXP */
  archiveHabit: (id: string) => void;
  restoreHabit: (id: string) => void;
  /** Swap with the neighbouring active routine in the same time slot */
  moveHabit: (id: string, direction: -1 | 1) => void;
  toggleCheck: (id: string, date: DateKey) => void;
  setPro: (isPro: boolean) => void;
  setReminder: (slot: keyof Reminders, reminder: Reminder) => void;
  replaceAll: (data: Omit<SavedData, 'isPro'>) => void;
  resetAll: () => void;
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const useHabits = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      checks: {},
      isPro: false,
      reminders: DEFAULT_REMINDERS,
      lastDeleted: null,
      addHabit: (input) =>
        set((s) => ({
          habits: [...s.habits, { id: newId(), ...input, startDate: todayKey() }],
        })),
      updateHabit: (id, input) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...input } : h)),
        })),
      deleteHabit: (id) =>
        set((s) => {
          const index = s.habits.findIndex((h) => h.id === id);
          if (index === -1) return {};
          const { [id]: removed, ...checks } = s.checks;
          return {
            habits: s.habits.filter((h) => h.id !== id),
            checks,
            lastDeleted: { habit: s.habits[index], checks: removed ?? [], index },
          };
        }),
      undoDelete: () =>
        set((s) => {
          if (!s.lastDeleted) return {};
          const { habit, checks, index } = s.lastDeleted;
          const habits = [...s.habits];
          habits.splice(Math.min(index, habits.length), 0, habit);
          return { habits, checks: { ...s.checks, [habit.id]: checks }, lastDeleted: null };
        }),
      clearLastDeleted: () => set({ lastDeleted: null }),
      archiveHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, archivedAt: todayKey() } : h)),
        })),
      restoreHabit: (id) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const { archivedAt: _archivedAt, ...rest } = h;
            return rest;
          }),
        })),
      moveHabit: (id, direction) =>
        set((s) => {
          const index = s.habits.findIndex((h) => h.id === id);
          const habit = s.habits[index];
          if (!habit) return {};
          // Neighbours are other active routines in the same slot, in list order
          let target = index + direction;
          while (
            target >= 0 &&
            target < s.habits.length &&
            (s.habits[target].time !== habit.time || s.habits[target].archivedAt)
          ) {
            target += direction;
          }
          if (target < 0 || target >= s.habits.length) return {};
          const habits = [...s.habits];
          [habits[index], habits[target]] = [habits[target], habits[index]];
          return { habits };
        }),
      toggleCheck: (id, date) =>
        set((s) => {
          const dates = s.checks[id] ?? [];
          const next = dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date];
          return { checks: { ...s.checks, [id]: next } };
        }),
      setPro: (isPro) => set({ isPro }),
      setReminder: (slot, reminder) =>
        set((s) => ({ reminders: { ...s.reminders, [slot]: reminder } })),
      replaceAll: ({ habits, checks, reminders }) =>
        set({ habits, checks, reminders, lastDeleted: null }),
      resetAll: () => set({ habits: [], checks: {}, lastDeleted: null }),
    }),
    {
      name: 'tickday',
      version: 5,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const state = persisted as SavedData;
        if (version < 3) {
          // v3 replaced emoji with a drawn character and renamed the color palette
          const colorMap: Record<string, HabitColor> = {
            peach: 'coral',
            lemon: 'yellow',
            mint: 'green',
            sky: 'blue',
            lavender: 'purple',
            pink: 'pink',
          };
          state.habits = state.habits.map((h, i) => {
            const { emoji: _emoji, ...rest } = h as Habit & { emoji?: string };
            return {
              ...rest,
              character: CHARACTERS[i % CHARACTERS.length],
              color: colorMap[h.color] ?? 'coral',
            };
          });
        }
        if (version < 4) {
          // v4 added the time-of-day slot
          state.habits = state.habits.map((h) => ({ ...h, time: h.time ?? 'anytime' }));
        }
        if (version < 5) {
          // v5 added reminders (archivedAt is optional and needs no migration)
          state.reminders = DEFAULT_REMINDERS;
        }
        return state;
      },
      partialize: ({ habits, checks, isPro, reminders }) => ({ habits, checks, isPro, reminders }),
    }
  )
);

export function useCanAddHabit() {
  return useHabits(
    (s) => s.isPro || s.habits.filter((h) => !h.archivedAt).length < FREE_HABIT_LIMIT
  );
}

/** False until saved data has been loaded from storage */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useHabits.persist.onFinishHydration(onChange),
    () => useHabits.persist.hasHydrated(),
    () => false
  );
}
