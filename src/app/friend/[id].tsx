import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { LevelBar } from '@/components/level-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HabitColors, Layout, MaxContentWidth, tint } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fromKey, todayKey } from '@/lib/date';
import { EXP_PER_CHECK, expForLevel, habitGrowth, LEVEL_NAMES, MAX_LEVEL } from '@/lib/growth';
import { currentStreak } from '@/lib/habits';
import { useHabits } from '@/store/habits';

const STAGES = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1);

/** One routine's character: how big it is now and how it will grow */
export default function FriendScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabits((s) => s.habits.find((h) => h.id === id));
  const checks = useHabits((s) => s.checks);

  if (!habit) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.missing}>
          <Doodle character="ghost" color={HabitColors.purple} mood="sleepy" size={88} />
          <ThemedText themeColor="textSecondary">캐릭터를 찾을 수 없어요</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const growth = habitGrowth(checks, habit.id);
  const { level } = growth;
  const point = HabitColors[habit.color];
  const today = todayKey();
  const days =
    Math.round((fromKey(today).getTime() - fromKey(habit.startDate).getTime()) / 86_400_000) + 1;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: habit.name,
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/habit/${habit.id}`)}
              hitSlop={10}
              style={styles.headerButton}>
              <ThemedText type="semibold" style={{ color: theme.accent }}>
                편집
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: tint(point, 0.16) }]}>
          <Doodle character={habit.character} color={point} mood="happy" level={level} size={200} />
          <View style={styles.heroTexts}>
            <ThemedText type="title" style={styles.center}>
              Lv.{level} {growth.name}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.center}>
              {growth.nextExp === null
                ? '다 자랐어요. 정말 대단해요!'
                : `체크할 때마다 +${EXP_PER_CHECK} EXP`}
            </ThemedText>
          </View>
          <View style={styles.expBlock}>
            <LevelBar progress={growth.progress} color={point} height={10} />
            <View style={styles.expRow}>
              <ThemedText type="smallBold">
                {growth.nextExp === null
                  ? `${growth.exp} EXP`
                  : `${growth.exp} / ${growth.nextExp} EXP`}
              </ThemedText>
              {growth.nextExp !== null && (
                <ThemedText type="small" themeColor="textSecondary">
                  다음 단계 {LEVEL_NAMES[level]}
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            성장 단계
          </ThemedText>
          <ThemedView type="backgroundElement" style={styles.stages}>
            {STAGES.map((stage) => {
              const reached = stage <= level;
              return (
                <View key={stage} style={styles.stage}>
                  <Doodle
                    character={habit.character}
                    color={point}
                    level={stage}
                    mood={stage === level ? 'happy' : 'idle'}
                    locked={!reached}
                    size={56}
                  />
                  <ThemedText
                    type="caption"
                    themeColor={reached ? 'text' : 'textSecondary'}
                    style={styles.center}>
                    {reached ? LEVEL_NAMES[stage - 1] : `${expForLevel(stage)} EXP`}
                  </ThemedText>
                </View>
              );
            })}
          </ThemedView>
        </View>

        <View style={styles.stats}>
          <Stat label="누적 EXP" value={`${growth.exp}`} />
          <Stat label="연속" value={`${currentStreak(habit, checks, today)}일`} />
          <Stat label="함께한 날" value={`${days}일`} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.stat}>
      <ThemedText type="heading">{value}</ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 40,
    gap: Layout.sectionGap,
  },
  center: {
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderRadius: Layout.cardRadius,
  },
  heroTexts: {
    gap: 4,
  },
  expBlock: {
    alignSelf: 'stretch',
    gap: 8,
  },
  expRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    gap: Layout.titleGap,
  },
  stages: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: Layout.cardRadius,
  },
  stage: {
    alignItems: 'center',
    gap: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: Layout.itemGap,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
    borderRadius: Layout.cardRadius,
  },
  missing: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 64,
  },
});
