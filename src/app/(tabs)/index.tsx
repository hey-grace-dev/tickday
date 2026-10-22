import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { HabitRow } from '@/components/habit-row';
import { IconButton } from '@/components/icon-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HabitColors, Layout } from '@/constants/theme';
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
      overline={hydrated ? formatLongDate(today) : ' '}
      action={<IconButton sf="plus" md="add" label="습관 추가" onPress={addHabit} filled />}>
      {!hydrated ? null : habits.length === 0 ? (
        <EmptyState onAdd={addHabit} />
      ) : (
        <>
          <Cheer done={doneCount} total={todays.length} />
          <View style={styles.section}>
            <View style={styles.list}>
              {todays.map((habit) => (
                <HabitRow
                  key={habit.id}
                  name={habit.name}
                  character={habit.character}
                  color={habit.color}
                  checked={isChecked(checks, habit.id, today)}
                  streak={currentStreak(habit, checks, today)}
                  onToggle={() => toggleCheck(habit.id, today)}
                  onLongPress={() => router.push(`/habit/${habit.id}`)}
                />
              ))}
            </View>
            <ThemedText type="caption" themeColor="textSecondary" style={styles.center}>
              {restCount > 0 && todays.length > 0 ? `오늘 쉬는 습관 ${restCount}개 · ` : ''}
              길게 누르면 편집할 수 있어요
            </ThemedText>
          </View>
        </>
      )}
    </Screen>
  );
}

function cheerMessage(done: number, total: number) {
  if (total === 0) return { mood: 'sleepy', text: '오늘은 쉬는 날이에요' } as const;
  if (done === total) return { mood: 'happy', text: '오늘 목표를 다 했어요!' } as const;
  if (done === 0) return { mood: 'idle', text: '오늘도 하나씩 해볼까요?' } as const;
  if (done / total >= 0.5) return { mood: 'happy', text: '거의 다 왔어요' } as const;
  return { mood: 'idle', text: '좋은 출발이에요' } as const;
}

function Cheer({ done, total }: { done: number; total: number }) {
  const theme = useTheme();
  const { mood, text } = cheerMessage(done, total);
  const allDone = total > 0 && done === total;
  return (
    <ThemedView type="backgroundElement" style={styles.cheer}>
      <Doodle character="mochi" color={HabitColors.coral} mood={mood} size={56} arms={allDone} />
      <View style={styles.cheerBody}>
        <View style={styles.cheerTop}>
          <ThemedText type="semibold" style={styles.flex}>
            {text}
          </ThemedText>
          {total > 0 && (
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {done} / {total}
            </ThemedText>
          )}
        </View>
        {total > 0 && (
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: theme.accent, width: `${(done / total) * 100}%` },
              ]}
            />
          </View>
        )}
      </View>
    </ThemedView>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.empty}>
      <Doodle character="mochi" color={HabitColors.coral} mood="happy" size={112} arms />
      <View style={styles.emptyTexts}>
        <ThemedText type="heading" style={styles.center}>
          첫 습관을 만들어 볼까요?
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          매일 한 번 톡 누르면 체크 끝
        </ThemedText>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onAdd}
        style={({ pressed }) => [
          styles.emptyButton,
          { backgroundColor: theme.accent },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="semibold" style={{ color: theme.onAccent }}>
          첫 습관 추가하기
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  list: {
    gap: Layout.itemGap,
  },
  center: {
    textAlign: 'center',
  },
  flex: {
    flex: 1,
  },
  cheer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Layout.cardPadding,
    borderRadius: Layout.cardRadius,
  },
  cheerBody: {
    flex: 1,
    gap: 10,
  },
  cheerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    gap: 20,
    paddingTop: 48,
  },
  emptyTexts: {
    gap: 6,
  },
  emptyButton: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 28,
    borderRadius: 26,
  },
  pressed: {
    opacity: 0.8,
  },
});
