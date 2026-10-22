import { type Character } from '@/components/doodle';
import { type HabitColor } from '@/constants/theme';
import { addDays, type DateKey, weekdayOf } from '@/lib/date';

export type Habit = {
  id: string;
  name: string;
  character: Character;
  color: HabitColor;
  /** Part of the day the routine belongs to */
  time: TimeSlot;
  /** Weekdays the habit is scheduled on, 0 = Sunday */
  days: number[];
  /** Day the habit was created; earlier days don't count against it */
  startDate: DateKey;
  /** Set when the routine graduated (archived): hidden from today, character kept */
  archivedAt?: DateKey;
};

export type HabitInput = Pick<Habit, 'name' | 'character' | 'color' | 'time' | 'days'>;

export const TIME_SLOTS = [
  { key: 'morning', label: '아침' },
  { key: 'afternoon', label: '오후' },
  { key: 'evening', label: '저녁' },
  { key: 'anytime', label: '언제든' },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number]['key'];

/** The part of the day it is now; 'anytime' is never current */
export function currentTimeSlot(date = new Date()): TimeSlot {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

/** habit id -> dates it was checked */
export type Checks = Record<string, DateKey[]>;

export const FREE_HABIT_LIMIT = 3;

export const DAY_PRESETS = [
  { label: '매일', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: '평일', days: [1, 2, 3, 4, 5] },
  { label: '주말', days: [0, 6] },
] as const;

export function isScheduled(habit: Habit, date: DateKey): boolean {
  return !habit.archivedAt && date >= habit.startDate && habit.days.includes(weekdayOf(date));
}

export function activeHabits(habits: Habit[]): Habit[] {
  return habits.filter((h) => !h.archivedAt);
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
