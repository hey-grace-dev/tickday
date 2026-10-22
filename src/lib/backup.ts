import { CHARACTERS } from '@/components/doodle';
import { HabitColors } from '@/constants/theme';
import { type Habit, TIME_SLOTS } from '@/lib/habits';
import { DEFAULT_REMINDERS, type SavedData } from '@/store/habits';

const FORMAT = 'tickday-backup';
const FORMAT_VERSION = 1;

type BackupData = Omit<SavedData, 'isPro'>;

export function createBackup({ habits, checks, reminders }: BackupData): string {
  return JSON.stringify({
    format: FORMAT,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: { habits, checks, reminders },
  });
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isHabit(value: unknown): value is Habit {
  const h = value as Habit;
  return (
    typeof h === 'object' &&
    h !== null &&
    typeof h.id === 'string' &&
    typeof h.name === 'string' &&
    CHARACTERS.includes(h.character) &&
    h.color in HabitColors &&
    TIME_SLOTS.some((t) => t.key === h.time) &&
    Array.isArray(h.days) &&
    h.days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) &&
    typeof h.startDate === 'string' &&
    DATE.test(h.startDate) &&
    (h.archivedAt === undefined || DATE.test(h.archivedAt))
  );
}

/** Parse pasted backup text; returns an error message instead of throwing */
export function parseBackup(text: string): { data: BackupData } | { error: string } {
  let parsed: { format?: string; version?: number; data?: Partial<BackupData> };
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    return { error: '백업 내용을 읽을 수 없어요. 복사한 내용을 빠짐없이 붙여넣어 주세요.' };
  }
  if (parsed?.format !== FORMAT || !parsed.data) {
    return { error: '틱데이 백업이 아니에요.' };
  }
  if (typeof parsed.version !== 'number' || parsed.version > FORMAT_VERSION) {
    return { error: '더 새로운 버전의 틱데이에서 만든 백업이에요. 앱을 업데이트해 주세요.' };
  }
  const { habits, checks, reminders } = parsed.data;
  if (!Array.isArray(habits) || !habits.every(isHabit)) {
    return { error: '루틴 정보가 올바르지 않아요.' };
  }
  const validChecks =
    typeof checks === 'object' &&
    checks !== null &&
    Object.values(checks).every(
      (dates) => Array.isArray(dates) && dates.every((d) => DATE.test(d))
    );
  if (!validChecks) {
    return { error: '체크 기록이 올바르지 않아요.' };
  }
  return { data: { habits, checks, reminders: { ...DEFAULT_REMINDERS, ...reminders } } };
}
