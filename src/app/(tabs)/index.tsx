import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { HabitRow } from '@/components/habit-row';
import { IconButton } from '@/components/icon-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate, todayKey } from '@/lib/date';
import { currentStreak, isChecked, isScheduled } from '@/lib/habits';
import { useCanAddHabit, useHabits, useHydrated } from '@/store/habits';

export default function TodayScreen() {
  const hydrated = useHydrated();
  const habits = useHabits((s) => s.habits);
  const checks = useHabits((s) => s.checks);
  const toggleCheck = useHabits((s) => s.toggleCheck);
  const canAdd = useCanAddHabit();

  const today = todayKey();
  const todays = habits.filter((h) => isScheduled(h, today));
  const doneCount = todays.filter((h) => isChecked(checks, h.id, today)).length;
  const restCount = habits.length - todays.length;

  const addHabit = () => router.push(canAdd ? '/habit/new' : '/pro');

  return (
    <Screen
      title="오늘"
      subtitle={hydrated ? formatLongDate(today) : ' '}
      action={<IconButton sf="plus" md="add" label="습관 추가" onPress={addHabit} filled />}>
      {!hydrated ? null : habits.length === 0 ? (
        <EmptyState onAdd={addHabit} />
      ) : (
        <>
          {todays.length > 0 && <Progress done={doneCount} total={todays.length} />}
          <View style={styles.list}>
            {todays.map((habit) => (
              <HabitRow
                key={habit.id}
                name={habit.name}
                checked={isChecked(checks, habit.id, today)}
                streak={currentStreak(habit, checks, today)}
                onToggle={() => toggleCheck(habit.id, today)}
                onLongPress={() => router.push(`/habit/${habit.id}`)}
              />
            ))}
          </View>
          {restCount > 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              {todays.length === 0 ? '오늘은 쉬는 날이에요. ' : ''}
              오늘 일정이 없는 습관 {restCount}개
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            길게 누르면 편집할 수 있어요
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

function Progress({ done, total }: { done: number; total: number }) {
  const theme = useTheme();
  const allDone = done === total;
  return (
    <View style={styles.progress}>
      <ThemedText type="smallBold" themeColor={allDone ? undefined : 'textSecondary'}>
        {allDone ? '오늘 목표를 모두 달성했어요!' : `${total}개 중 ${done}개 완료`}
      </ThemedText>
      <View style={[styles.track, { backgroundColor: theme.backgroundElement }]}>
        <View
          style={[styles.fill, { backgroundColor: theme.accent, width: `${(done / total) * 100}%` }]}
        />
      </View>
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <ThemedText style={styles.center}>매일 체크할 습관을 추가해 보세요</ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={onAdd}
        style={({ pressed }) => [
          styles.emptyButton,
          { backgroundColor: theme.accent },
          pressed && { opacity: 0.8 },
        ]}>
        <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
          첫 습관 추가하기
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
  progress: {
    gap: Spacing.two,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  emptyButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.four,
  },
});
