// Dates are stored as local 'YYYY-MM-DD' keys so a check belongs to the day the user saw it.

export type DateKey = string;

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function toKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): DateKey {
  return toKey(new Date());
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

export function weekdayOf(key: DateKey): number {
  return fromKey(key).getDay();
}

export function formatLongDate(key: DateKey): string {
  const date = fromKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS[date.getDay()]}요일`;
}

/** Day cells for a month grid, padded with nulls so the first row starts on Sunday. */
export function monthGrid(year: number, month: number): (DateKey | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (DateKey | null)[] = Array(first.getDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toKey(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
