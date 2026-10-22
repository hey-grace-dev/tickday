import { ScrollView, StyleSheet, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { FREE_HABIT_LIMIT } from '@/lib/habits';
import { useHabits } from '@/store/habits';

const BENEFITS = [
  '🌈 습관 개수 무제한',
  '💝 한 번 결제로 평생 사용',
  '🎁 앞으로 추가될 Pro 기능 포함',
];

// TODO: connect the one-time in-app purchase (RevenueCat) before release
export default function ProScreen() {
  const theme = useTheme();
  const isPro = useHabits((s) => s.isPro);
  const setPro = useHabits((s) => s.setPro);

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.crown}>👑</ThemedText>
        <ThemedText type="subtitle">{isPro ? 'Pro 사용 중' : '틱데이 Pro'}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {isPro
            ? '틱데이를 응원해 주셔서 감사합니다.'
            : `무료 버전은 습관을 ${FREE_HABIT_LIMIT}개까지 만들 수 있어요.`}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          {BENEFITS.map((benefit) => (
            <ThemedText key={benefit} type="display">
              {benefit}
            </ThemedText>
          ))}
        </ThemedView>

        {!isPro && (
          <View style={[styles.button, { backgroundColor: theme.backgroundSelected }]}>
            <ThemedText type="display" themeColor="textSecondary">
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
    padding: Spacing.four,
    gap: Spacing.three,
  },
  crown: {
    fontSize: 56,
    lineHeight: 68,
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  button: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
  devToggle: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
});
