import { addDays, type DateKey, weekdayOf } from '@/lib/date';

export type Habit = {
  id: string;
  name: string;
  /** Weekdays the habit is scheduled on, 0 = Sunday */
  days: number[];
  /** Day the habit was created; earlier days don't count against it */
  startDate: DateKey;
};

/** habit id -> dates it was checked */
export type Checks = Record<string, DateKey[]>;

export const FREE_HABIT_LIMIT = 3;

export const DAY_PRESETS = [
  { label: '매일', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: '평일', days: [1, 2, 3, 4, 5] },
  { label: '주말', days: [0, 6] },
] as const;

export function isScheduled(habit: Habit, date: DateKey): boolean {
  return date >= habit.startDate && habit.days.includes(weekdayOf(date));
}

export function isChecked(checks: Checks, habitId: string, date: DateKey): boolean {
  return checks[habitId]?.includes(date) ?? false;
}

/**
 * Consecutive scheduled days completed, counting back from `today`.
 * An unchecked today doesn't break the streak yet; the day isn't over.
 */
export function currentStreak(habit: Habit, checks: Checks, today: DateKey): number {
  let streak = 0;
  let date = today;
  if (isScheduled(habit, date) && !isChecked(checks, habit.id, date)) {
    date = addDays(date, -1);
  }
  while (date >= habit.startDate) {
    if (isScheduled(habit, date)) {
      if (!isChecked(checks, habit.id, date)) break;
      streak++;
    }
    date = addDays(date, -1);
  }
  return streak;
}

export function describeDays(days: number[]): string {
  const sorted = [...days].sort();
  const preset = DAY_PRESETS.find(
    (p) => p.days.length === sorted.length && p.days.every((d) => sorted.includes(d))
  );
  if (preset) return preset.label;
  return sorted.map((d) => '일월화수목금토'[d]).join(' ');
}
