import { type Checks } from '@/lib/habits';

/** EXP earned per check */
export const EXP_PER_CHECK = 10;

/**
 * Total EXP needed to reach each level after 1 (3, 10, 30 and 66 checks). The first step comes
 * quickly so growth is felt in the first days; 66 is the often-cited number of days to form a habit.
 */
const LEVEL_EXP = [30, 100, 300, 660] as const;
export const MAX_LEVEL = LEVEL_EXP.length + 1;

export const LEVEL_NAMES = ['아기', '꼬마', '반짝', '꽃핀', '왕관'] as const;

export function totalChecks(checks: Checks, habitId: string): number {
  return checks[habitId]?.length ?? 0;
}

/** Total EXP needed to reach `level` */
export function expForLevel(level: number): number {
  return level <= 1 ? 0 : LEVEL_EXP[level - 2];
}

export type Growth = {
  exp: number;
  level: number;
  name: string;
  /** Total EXP at which the next level starts, or null at max level */
  nextExp: number | null;
  /** 0-1 progress from the current level toward the next (1 at max level) */
  progress: number;
};

export function growthOf(checkCount: number): Growth {
  const exp = checkCount * EXP_PER_CHECK;
  const level = 1 + LEVEL_EXP.filter((t) => exp >= t).length;
  const nextExp = level === MAX_LEVEL ? null : expForLevel(level + 1);
  const from = expForLevel(level);
  return {
    exp,
    level,
    name: LEVEL_NAMES[level - 1],
    nextExp,
    progress: nextExp === null ? 1 : (exp - from) / (nextExp - from),
  };
}

export function habitGrowth(checks: Checks, habitId: string): Growth {
  return growthOf(totalChecks(checks, habitId));
}
