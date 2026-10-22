import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CheckBubble } from '@/components/check-bubble';
import { Doodle } from '@/components/doodle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HabitColors, Layout, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FREE_HABIT_LIMIT } from '@/lib/habits';
import { useHabits } from '@/store/habits';

const BENEFITS = ['습관 개수 무제한', '한 번 결제로 계속 사용', '앞으로 추가될 Pro 기능 포함'];

// TODO: connect the one-time in-app purchase (RevenueCat) before release
export default function ProScreen() {
  const theme = useTheme();
  const isPro = useHabits((s) => s.isPro);
  const setPro = useHabits((s) => s.setPro);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.doodles}>
            <Doodle character="cat" color={HabitColors.pink} mood="happy" size={64} />
            <Doodle character="mochi" color={HabitColors.coral} mood="happy" size={88} arms />
            <Doodle character="bunny" color={HabitColors.blue} mood="happy" size={64} />
          </View>
          <View style={styles.heroTexts}>
            <ThemedText type="title" style={styles.center}>
              {isPro ? 'Pro 사용 중' : '틱데이 Pro'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.center}>
              {isPro
                ? '응원해 주셔서 고마워요'
                : `무료 버전은 습관을 ${FREE_HABIT_LIMIT}개까지 만들 수 있어요`}
            </ThemedText>
          </View>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          {BENEFITS.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <CheckBubble checked color={HabitColors.green} size={24} />
              <ThemedText type="semibold">{benefit}</ThemedText>
            </View>
          ))}
        </ThemedView>

        {!isPro && (
          <View style={[styles.button, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="semibold" themeColor="textSecondary">
              결제는 출시 때 열려요
            </ThemedText>
          </View>
        )}

        {__DEV__ && (
          <Pressable onPress={() => setPro(!isPro)} style={styles.devToggle}>
            <ThemedText type="small" themeColor="textSecondary">
              [개발용] Pro {isPro ? '끄기' : '켜기'}
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  hero: {
    alignItems: 'center',
    gap: 20,
  },
  doodles: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  heroTexts: {
    gap: 6,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Layout.cardRadius,
    padding: 20,
    gap: 14,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  devToggle: {
    minHeight: Layout.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
