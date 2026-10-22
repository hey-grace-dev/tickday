import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { LevelBar } from '@/components/level-bar';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { HabitColors, Layout, tint } from '@/constants/theme';
import { habitGrowth } from '@/lib/growth';
import { useHabits } from '@/store/habits';

/** All routine characters in one place, so their growth is visible */
export default function FriendsScreen() {
  const habits = useHabits((s) => s.habits);
  const checks = useHabits((s) => s.checks);

  return (
    <Screen title="친구들" overline="체크할수록 쑥쑥 자라요">
      {habits.length === 0 ? (
        <View style={styles.empty}>
          <Doodle character="chick" color={HabitColors.yellow} mood="sleepy" level={1} size={112} />
          <ThemedText themeColor="textSecondary" style={styles.center}>
            루틴을 만들면 친구가 생겨요
          </ThemedText>
        </View>
      ) : (
        <View style={styles.grid}>
          {habits.map((habit) => {
            const growth = habitGrowth(checks, habit.id);
            const point = HabitColors[habit.color];
            return (
              <Pressable
                key={habit.id}
                accessibilityRole="button"
                accessibilityLabel={`${habit.name} 캐릭터 보기`}
                onPress={() => router.push(`/friend/${habit.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: tint(point, 0.14) },
                  pressed && styles.pressed,
                ]}>
                <Doodle
                  character={habit.character}
                  color={point}
                  mood="happy"
                  level={growth.level}
                  size={104}
                />
                <View style={styles.cardTexts}>
                  <ThemedText type="semibold" numberOfLines={1} style={styles.center}>
                    {habit.name}
                  </ThemedText>
                  <ThemedText type="caption" themeColor="textSecondary" style={styles.center}>
                    Lv.{growth.level} {growth.name} ·{' '}
                    {growth.nextExp === null
                      ? `${growth.exp} EXP`
                      : `${growth.exp}/${growth.nextExp} EXP`}
                  </ThemedText>
                </View>
                <LevelBar progress={growth.progress} color={point} />
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
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
