import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { LevelBar } from '@/components/level-bar';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { HabitColors, Layout, tint } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fromKey } from '@/lib/date';
import { habitGrowth } from '@/lib/growth';
import { type Habit } from '@/lib/habits';
import { useHabits } from '@/store/habits';

/** All routine characters in one place, so their growth is visible */
export default function FriendsScreen() {
  const habits = useHabits((s) => s.habits);
  const active = habits.filter((h) => !h.archivedAt);
  const graduated = habits.filter((h) => h.archivedAt);

  return (
    <Screen title="친구들" overline="체크할수록 쑥쑥 자라요">
      {active.length === 0 ? (
        <View style={styles.empty}>
          <Doodle character="chick" color={HabitColors.yellow} mood="sleepy" size={112} />
          <ThemedText themeColor="textSecondary" style={styles.center}>
            루틴을 만들면 친구가 생겨요
          </ThemedText>
        </View>
      ) : (
        <View style={styles.grid}>
          {active.map((habit) => (
            <FriendCard key={habit.id} habit={habit} />
          ))}
        </View>
      )}

      {graduated.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="heading">졸업한 친구들</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {graduated.length}
            </ThemedText>
          </View>
          <View style={styles.grid}>
            {graduated.map((habit) => (
              <FriendCard key={habit.id} habit={habit} />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

function FriendCard({ habit }: { habit: Habit }) {
  const theme = useTheme();
  const growth = habitGrowth(
    useHabits((s) => s.checks),
    habit.id
  );
  const point = HabitColors[habit.color];
  const archived = habit.archivedAt !== undefined;
  const graduatedOn = archived ? fromKey(habit.archivedAt!) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${habit.name} 캐릭터 보기`}
      onPress={() => router.push(`/friend/${habit.id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: archived ? theme.backgroundElement : tint(point, 0.14) },
        pressed && styles.pressed,
      ]}>
      <Doodle
        character={habit.character}
        color={point}
        mood={archived ? 'sleepy' : 'happy'}
        level={growth.level}
        size={104}
      />
      <View style={styles.cardTexts}>
        <ThemedText type="semibold" numberOfLines={1} style={styles.center}>
          {habit.name}
        </ThemedText>
        <ThemedText type="caption" themeColor="textSecondary" style={styles.center}>
          Lv.{growth.level} {growth.name} ·{' '}
          {graduatedOn
            ? `${graduatedOn.getMonth() + 1}월 ${graduatedOn.getDate()}일 졸업`
            : growth.nextExp === null
              ? `${growth.exp} EXP`
              : `${growth.exp}/${growth.nextExp} EXP`}
        </ThemedText>
      </View>
      {!archived && <LevelBar progress={growth.progress} color={point} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 48,
  },
  section: {
    gap: Layout.titleGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  card: {
    width: '48.3%',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 14,
    borderRadius: Layout.cardRadius,
  },
  cardTexts: {
    alignSelf: 'stretch',
    gap: 2,
  },
  pressed: {
    opacity: 0.8,
  },
});
