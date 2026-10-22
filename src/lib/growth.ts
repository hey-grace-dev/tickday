import { type Checks } from '@/lib/habits';

/**
 * Total checks needed to reach each level after 1. The first step comes quickly so growth is
 * felt in the first days; 66 is the often-cited number of days to form a habit.
 */
const LEVEL_THRESHOLDS = [3, 10, 30, 66] as const;
export const MAX_LEVEL = LEVEL_THRESHOLDS.length + 1;

export const LEVEL_NAMES = ['아기', '꼬마', '반짝', '꽃핀', '왕관'] as const;

export function totalChecks(checks: Checks, habitId: string): number {
  return checks[habitId]?.length ?? 0;
}

/** 1-based level from the total number of checks */
export function levelFor(count: number): number {
  return 1 + LEVEL_THRESHOLDS.filter((t) => count >= t).length;
}

/** Checks needed to reach `level` */
export function thresholdFor(level: number): number {
  return level <= 1 ? 0 : LEVEL_THRESHOLDS[level - 2];
}

/** Checks still needed for the next level, or null at max level */
export function checksToNextLevel(count: number): number | null {
  const next = LEVEL_THRESHOLDS.find((t) => count < t);
  return next === undefined ? null : next - count;
}

/** 0-1 progress from the current level toward the next (1 at max level) */
export function levelProgress(count: number): number {
  const level = levelFor(count);
  if (level === MAX_LEVEL) return 1;
  const from = thresholdFor(level);
  const to = thresholdFor(level + 1);
  return (count - from) / (to - from);
}
