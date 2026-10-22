import { type Checks } from '@/lib/habits';

/** Total checks needed to reach each level after 1 (66 ~ the often-cited days to form a habit) */
const LEVEL_THRESHOLDS = [7, 21, 66] as const;
export const MAX_LEVEL = LEVEL_THRESHOLDS.length + 1;

export const LEVEL_NAMES = ['아기', '반짝', '꽃핀', '왕관'] as const;

export function totalChecks(checks: Checks, habitId: string): number {
  return checks[habitId]?.length ?? 0;
}

/** 1-based level from the total number of checks */
export function levelFor(count: number): number {
  return 1 + LEVEL_THRESHOLDS.filter((t) => count >= t).length;
}

/** Checks still needed for the next level, or null at max level */
export function checksToNextLevel(count: number): number | null {
  const next = LEVEL_THRESHOLDS.find((t) => count < t);
  return next === undefined ? null : next - count;
}
