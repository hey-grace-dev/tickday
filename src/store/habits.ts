import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type DateKey, todayKey } from '@/lib/date';
import { type Checks, FREE_HABIT_LIMIT, type Habit } from '@/lib/habits';

type HabitState = {
  habits: Habit[];
  checks: Checks;
  /** Unlocked with the one-time purchase */
  isPro: boolean;
  addHabit: (input: Pick<Habit, 'name' | 'days'>) => void;
  updateHabit: (id: string, input: Pick<Habit, 'name' | 'days'>) => void;
  deleteHabit: (id: string) => void;
  toggleCheck: (id: string, date: DateKey) => void;
  setPro: (isPro: boolean) => void;
  resetAll: () => void;
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const useHabits = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      checks: {},
      isPro: false,
      addHabit: ({ name, days }) =>
        set((s) => ({
          habits: [...s.habits, { id: newId(), name, days, startDate: todayKey() }],
        })),
      updateHabit: (id, { name, days }) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, name, days } : h)),
        })),
      deleteHabit: (id) =>
        set((s) => {
          const { [id]: _removed, ...checks } = s.checks;
          return { habits: s.habits.filter((h) => h.id !== id), checks };
        }),
      toggleCheck: (id, date) =>
        set((s) => {
          const dates = s.checks[id] ?? [];
          const next = dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date];
          return { checks: { ...s.checks, [id]: next } };
        }),
      setPro: (isPro) => set({ isPro }),
      resetAll: () => set({ habits: [], checks: {} }),
    }),
    {
      name: 'tickday',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ habits, checks, isPro }) => ({ habits, checks, isPro }),
    }
  )
);

export function useCanAddHabit() {
  return useHabits((s) => s.isPro || s.habits.length < FREE_HABIT_LIMIT);
}

/** False until saved data has been loaded from storage */
export function useHydrated() {
  return useSyncExternalStore(
    (onChange) => useHabits.persist.onFinishHydration(onChange),
    () => useHabits.persist.hasHydrated(),
    () => false
  );
}
