import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type DateKey, todayKey } from '@/lib/date';
import { type Checks, FREE_HABIT_LIMIT, type Habit, type HabitInput } from '@/lib/habits';

type HabitState = {
  habits: Habit[];
  checks: Checks;
  /** Unlocked with the one-time purchase */
  isPro: boolean;
  addHabit: (input: HabitInput) => void;
  updateHabit: (id: string, input: HabitInput) => void;
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
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const state = persisted as Pick<HabitState, 'habits' | 'checks' | 'isPro'>;
        if (version < 2) {
          // v2 added emoji and color
          state.habits = state.habits.map((h) => ({ ...h, emoji: '🌱', color: 'mint' }));
        }
        return state;
      },
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
