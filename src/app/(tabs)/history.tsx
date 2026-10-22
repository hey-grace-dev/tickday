import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { IconButton } from '@/components/icon-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HabitColors, Layout, tint } from '@/constants/theme';
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
  const stats = shown.map((habit) => {
    const scheduled = pastDays.filter((d) => isScheduled(habit, d));
    const done = scheduled.filter((d) => isChecked(checks, habit.id, d)).length;
    return {
      habit,
      rate: scheduled.length ? Math.round((done / scheduled.length) * 100) : null,
      streak: currentStreak(habit, checks, today),
    };
  });

  if (habits.length === 0) {
    return (
      <Screen title="기록">
        <View style={styles.empty}>
          <Doodle character="bear" color={HabitColors.yellow} mood="sleepy" size={96} />
          <ThemedText themeColor="textSecondary" style={styles.center}>
            습관을 추가하면 여기에 기록이 쌓여요
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="기록">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}>
        <FilterChip label="전체" selected={!filterId} onPress={() => setFilterId(null)} />
        {habits.map((h) => (
          <FilterChip
            key={h.id}
            label={h.name}
            dot={HabitColors[h.color]}
            selected={filterId === h.id}
            onPress={() => setFilterId(h.id)}
          />
        ))}
      </ScrollView>

      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.monthHeader}>
          <IconButton sf="chevron.left" md="chevron_left" label="이전 달" onPress={() => shiftMonth(-1)} />
          <ThemedText type="semibold">
            {month.year}년 {month.month + 1}월
          </ThemedText>
          {isCurrentMonth ? (
            <View style={styles.iconPlaceholder} />
          ) : (
            <IconButton sf="chevron.right" md="chevron_right" label="다음 달" onPress={() => shiftMonth(1)} />
          )}
        </View>

        <View style={styles.grid}>
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} style={styles.weekday}>
              <ThemedText type="caption" themeColor="textSecondary">
                {label}
              </ThemedText>
            </View>
          ))}
          {cells.map((date, i) => {
            if (!date) return <View key={`pad-${i}`} style={styles.cell} />;
            const future = date > today;
            const ratio = future ? null : dayRatio(shown, checks, date);
            const full = ratio === 1;
            const partial = ratio !== null && ratio > 0 && ratio < 1;
            return (
              <View key={date} style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    full && { backgroundColor: theme.accent },
                    partial && { backgroundColor: tint(theme.accent, 0.22) },
                    date === today && !full && { borderWidth: 1.5, borderColor: theme.accent },
                  ]}>
                  <ThemedText
                    type={full ? 'smallBold' : 'small'}
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
        {stats.map(({ habit, rate, streak }) => (
          <ThemedView key={habit.id} type="backgroundElement" style={styles.statRow}>
            <Doodle character={habit.character} color={HabitColors[habit.color]} size={40} />
            <ThemedText type="semibold" style={styles.flex} numberOfLines={1}>
              {habit.name}
            </ThemedText>
            <View style={styles.statValues}>
              <ThemedText type="smallBold">{rate === null ? '-' : `${rate}%`}</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {streak > 0 ? `${streak}일 연속` : `${month.month + 1}월 달성률`}
              </ThemedText>
            </View>
          </ThemedView>
        ))}
      </View>
    </Screen>
  );
}

type FilterChipProps = { label: string; selected: boolean; onPress: () => void; dot?: string };

function FilterChip({ label, selected, onPress, dot }: FilterChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? theme.text : theme.backgroundElement }]}>
      {dot && <View style={[styles.chipDot, { backgroundColor: dot }]} />}
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
  },
  flex: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 48,
  },
  // Let chips scroll edge to edge while lining up with the screen padding
  filterScroll: {
    marginHorizontal: -Layout.screenPadding,
  },
  filters: {
    gap: 8,
    paddingHorizontal: Layout.screenPadding,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: 180,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  card: {
    borderRadius: Layout.cardRadius,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconPlaceholder: {
    width: Layout.touch,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingBottom: 8,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    gap: Layout.itemGap,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: Layout.cardPadding,
    borderRadius: Layout.cardRadius,
  },
  statValues: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
