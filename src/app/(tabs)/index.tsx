import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { HabitRow } from '@/components/habit-row';
import { IconButton } from '@/components/icon-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
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
          <Cheer done={doneCount} total={todays.length} />
          <View style={styles.list}>
            {todays.map((habit) => (
              <HabitRow
                key={habit.id}
                name={habit.name}
                emoji={habit.emoji}
                color={habit.color}
                checked={isChecked(checks, habit.id, today)}
                streak={currentStreak(habit, checks, today)}
                onToggle={() => toggleCheck(habit.id, today)}
                onLongPress={() => router.push(`/habit/${habit.id}`)}
              />
            ))}
          </View>
          {restCount > 0 && todays.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              오늘 쉬는 습관 {restCount}개
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            꾹 누르면 편집할 수 있어요
          </ThemedText>
        </>
      )}
    </Screen>
  );
}

function cheerMessage(done: number, total: number) {
  if (total === 0) return { emoji: '🛋️', text: '오늘은 쉬는 날이에요' };
  if (done === total) return { emoji: '🎉', text: '오늘 목표 완료! 최고예요' };
  if (done === 0) return { emoji: '🌱', text: '오늘도 하나씩 해볼까요?' };
  if (done / total >= 0.5) return { emoji: '💪', text: '거의 다 왔어요!' };
  return { emoji: '😊', text: '좋은 출발이에요!' };
}

function Cheer({ done, total }: { done: number; total: number }) {
  const theme = useTheme();
  const { emoji, text } = cheerMessage(done, total);
  return (
    <ThemedView type="backgroundElement" style={styles.cheer}>
      <View style={styles.cheerTop}>
        <ThemedText style={styles.cheerEmoji}>{emoji}</ThemedText>
        <ThemedText type="display" style={styles.cheerText}>
          {text}
        </ThemedText>
        {total > 0 && (
          <ThemedText type="display" style={{ color: theme.accent }}>
            {done}/{total}
          </ThemedText>
        )}
      </View>
      {total > 0 && (
        <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
          <View
            style={[styles.fill, { backgroundColor: theme.accent, width: `${(done / total) * 100}%` }]}
          />
        </View>
      )}
    </ThemedView>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <ThemedText style={styles.emptyEmoji}>🐣</ThemedText>
      <ThemedText type="display" style={styles.center}>
        첫 습관을 만들어 볼까요?
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
        매일 톡 한 번이면 체크 끝!
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={onAdd}
        style={({ pressed }) => [
          styles.emptyButton,
          { backgroundColor: theme.accent },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="display" style={{ color: theme.onAccent }}>
          첫 습관 추가하기
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two + Spacing.one,
  },
  center: {
    textAlign: 'center',
  },
  cheer: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cheerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cheerEmoji: {
    fontSize: 26,
    lineHeight: 32,
  },
  cheerText: {
    flex: 1,
  },
  track: {
    height: 14,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.six,
  },
  emptyEmoji: {
    fontSize: 72,
    lineHeight: 88,
  },
  emptyButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Radius.pill,
    boxShadow: '0 4px 12px rgba(255, 138, 128, 0.45)',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
