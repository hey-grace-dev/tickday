import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/icon-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { type DateKey, fromKey, monthGrid, todayKey, WEEKDAY_LABELS } from '@/lib/date';
import { type Checks, currentStreak, type Habit, isChecked, isScheduled } from '@/lib/habits';
import { useHabits } from '@/store/habits';

/** Share of scheduled habits done on a day, or null when nothing was scheduled */
function dayRatio(habits: Habit[], checks: Checks, date: DateKey): number | null {
  const scheduled = habits.filter((h) => isScheduled(h, date));
  if (scheduled.length === 0) return null;
  return scheduled.filter((h) => isChecked(checks, h.id, date)).length / scheduled.length;
}

function dayColor(ratio: number, theme: ReturnType<typeof useTheme>) {
  if (ratio === 0) return theme.backgroundSelected;
  if (ratio === 1) return theme.accent;
  // Partially done days get a lighter accent; hex alpha suffix keeps the label fully opaque
  const alpha = Math.round((0.25 + ratio * 0.45) * 255);
  return `${theme.accent}${alpha.toString(16).padStart(2, '0')}`;
}

export default function HistoryScreen() {
  const theme = useTheme();
  const habits = useHabits((s) => s.habits);
  const checks = useHabits((s) => s.checks);
  const today = todayKey();
  const now = fromKey(today);

  const [month, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [filterId, setFilterId] = useState<string | null>(null);

  const shown = filterId ? habits.filter((h) => h.id === filterId) : habits;
  const cells = monthGrid(month.year, month.month);
  const isCurrentMonth = month.year === now.getFullYear() && month.month === now.getMonth();

  const shiftMonth = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  // Monthly rate per habit, over scheduled days up to today
  const pastDays = cells.filter((d): d is DateKey => d !== null && d <= today);
  const stats = habits.map((habit) => {
    const scheduled = pastDays.filter((d) => isScheduled(habit, d));
    const done = scheduled.filter((d) => isChecked(checks, habit.id, d)).length;
    return {
      habit,
      rate: scheduled.length ? Math.round((done / scheduled.length) * 100) : null,
      streak: currentStreak(habit, checks, today),
    };
  });

  return (
    <Screen title="기록">
      {habits.length === 0 ? (
        <ThemedText themeColor="textSecondary" style={styles.center}>
          습관을 추가하면 여기에 기록이 쌓여요
        </ThemedText>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              <FilterChip label="전체" selected={!filterId} onPress={() => setFilterId(null)} />
              {habits.map((h) => (
                <FilterChip
                  key={h.id}
                  label={h.name}
                  selected={filterId === h.id}
                  onPress={() => setFilterId(h.id)}
                />
              ))}
            </View>
          </ScrollView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.monthHeader}>
              <IconButton
                sf="chevron.left"
                md="chevron_left"
                label="이전 달"
                onPress={() => shiftMonth(-1)}
              />
              <ThemedText type="smallBold">
                {month.year}년 {month.month + 1}월
              </ThemedText>
              {isCurrentMonth ? (
                <View style={styles.iconPlaceholder} />
              ) : (
                <IconButton
                  sf="chevron.right"
                  md="chevron_right"
                  label="다음 달"
                  onPress={() => shiftMonth(1)}
                />
              )}
            </View>

            <View style={styles.grid}>
              {WEEKDAY_LABELS.map((label) => (
                <View key={label} style={styles.cell}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {label}
                  </ThemedText>
                </View>
              ))}
              {cells.map((date, i) => {
                if (!date) return <View key={`pad-${i}`} style={styles.cell} />;
                const future = date > today;
                const ratio = future ? null : dayRatio(shown, checks, date);
                const full = ratio === 1;
                return (
                  <View key={date} style={styles.cell}>
                    <View
                      style={[
                        styles.day,
                        ratio !== null && { backgroundColor: dayColor(ratio, theme) },
                        date === today && { borderColor: theme.text, borderWidth: 2 },
                      ]}>
                      <ThemedText
                        type="small"
                        style={{
                          color: full ? theme.onAccent : future ? theme.textSecondary : theme.text,
                        }}>
                        {fromKey(date).getDate()}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          </ThemedView>

          <View style={styles.stats}>
            {stats
              .filter((s) => !filterId || s.habit.id === filterId)
              .map(({ habit, rate, streak }) => (
                <ThemedView key={habit.id} type="backgroundElement" style={styles.statRow}>
                  <ThemedText style={styles.statName} numberOfLines={1}>
                    {habit.name}
                  </ThemedText>
                  <View style={styles.statValues}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {month.month + 1}월 {rate === null ? '-' : `${rate}%`}
                    </ThemedText>
                    <ThemedText
                      type="smallBold"
                      style={{ color: streak > 0 ? theme.accent : theme.textSecondary }}>
                      {streak}일 연속
                    </ThemedText>
                  </View>
                </ThemedView>
              ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? theme.text : theme.backgroundElement }]}>
      <ThemedText
        type="smallBold"
        numberOfLines={1}
        style={{ color: selected ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
    paddingVertical: Spacing.six,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    maxWidth: 160,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconPlaceholder: {
    width: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: '84%',
    height: '84%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    gap: Spacing.two,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  statName: {
    flex: 1,
  },
  statValues: {
    alignItems: 'flex-end',
  },
});
