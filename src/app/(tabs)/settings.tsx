import Constants from 'expo-constants';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HabitColors, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmDestructive } from '@/lib/confirm';
import { describeDays, FREE_HABIT_LIMIT } from '@/lib/habits';
import { useHabits } from '@/store/habits';

export default function SettingsScreen() {
  const theme = useTheme();
  const habits = useHabits((s) => s.habits);
  const isPro = useHabits((s) => s.isPro);
  const resetAll = useHabits((s) => s.resetAll);

  const reset = async () => {
    const ok = await confirmDestructive(
      '모든 데이터 삭제',
      '습관과 체크 기록이 모두 삭제되고 되돌릴 수 없어요.',
      '삭제'
    );
    if (ok) resetAll();
  };

  return (
    <Screen title="설정">
      <Section title="틱데이 Pro">
        <Row
          label={isPro ? '👑 Pro 사용 중' : '👑 Pro 잠금 해제'}
          detail={isPro ? '감사합니다!' : `무료는 습관 ${FREE_HABIT_LIMIT}개까지`}
          onPress={() => router.push('/pro')}
        />
      </Section>

      <Section title={`습관 ${habits.length}개`}>
        {habits.length === 0 ? (
          <Row label="아직 습관이 없어요" />
        ) : (
          habits.map((h) => (
            <Row
              key={h.id}
              label={h.name}
              emoji={h.emoji}
              emojiBg={HabitColors[h.color]}
              detail={describeDays(h.days)}
              onPress={() => router.push(`/habit/${h.id}`)}
            />
          ))
        )}
      </Section>

      <Section title="데이터">
        <Row label="🔒 데이터는 이 기기에만 저장돼요" />
        <Row label="모든 데이터 삭제" color={theme.danger} onPress={reset} />
      </Section>

      <ThemedText type="small" themeColor="textSecondary" style={styles.version}>
        틱데이 {Constants.expoConfig?.version} · 오늘도 톡 ✓
      </ThemedText>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="display" themeColor="textSecondary" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        {children}
      </ThemedView>
    </View>
  );
}

type RowProps = {
  label: string;
  detail?: string;
  color?: string;
  emoji?: string;
  emojiBg?: string;
  onPress?: () => void;
};

function Row({ label, detail, color, emoji, emojiBg, onPress }: RowProps) {
  const content = (
    <>
      {emoji && (
        <View style={[styles.rowEmoji, { backgroundColor: emojiBg }]}>
          <ThemedText style={styles.rowEmojiText}>{emoji}</ThemedText>
        </View>
      )}
      <ThemedText style={[styles.rowLabel, color ? { color } : undefined]} numberOfLines={1}>
        {label}
      </ThemedText>
      {detail && (
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      )}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.two,
  },
  card: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    minHeight: 52,
  },
  rowLabel: {
    flex: 1,
  },
  rowEmoji: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowEmojiText: {
    fontSize: 16,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.6,
  },
  version: {
    textAlign: 'center',
  },
});
