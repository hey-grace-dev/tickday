import Constants from 'expo-constants';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HabitColors, Layout } from '@/constants/theme';
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
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/pro')}
        style={({ pressed }) => [
          styles.proCard,
          { backgroundColor: theme.backgroundElement },
          pressed && styles.pressed,
        ]}>
        <Doodle character="chick" color={HabitColors.yellow} mood="happy" size={52} />
        <View style={styles.flex}>
          <ThemedText type="semibold">{isPro ? '틱데이 Pro 사용 중' : '틱데이 Pro'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isPro ? '응원해 주셔서 고마워요' : `무료는 습관 ${FREE_HABIT_LIMIT}개까지 만들 수 있어요`}
          </ThemedText>
        </View>
        <Chevron />
      </Pressable>

      <Section title={`내 습관 ${habits.length}개`}>
        {habits.length === 0 ? (
          <Row label="아직 습관이 없어요" muted />
        ) : (
          habits.map((h) => (
            <Row
              key={h.id}
              label={h.name}
              detail={describeDays(h.days)}
              leading={<Doodle character={h.character} color={HabitColors[h.color]} size={36} />}
              onPress={() => router.push(`/habit/${h.id}`)}
            />
          ))
        )}
      </Section>

      <Section title="데이터">
        <Row label="기록은 이 기기에만 저장돼요" muted />
        <Row label="모든 데이터 삭제" color={theme.danger} onPress={reset} />
      </Section>

      <ThemedText type="caption" themeColor="textSecondary" style={styles.version}>
        틱데이 {Constants.expoConfig?.version}
      </ThemedText>
    </Screen>
  );
}

function Chevron() {
  const theme = useTheme();
  return (
    <SymbolView
      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
      tintColor={theme.textSecondary}
      size={18}
    />
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  const rows = Array.isArray(children) ? children : [children];
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.card}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            {row}
          </Fragment>
        ))}
      </ThemedView>
    </View>
  );
}

type RowProps = {
  label: string;
  detail?: string;
  color?: string;
  muted?: boolean;
  leading?: ReactNode;
  onPress?: () => void;
};

function Row({ label, detail, color, muted, leading, onPress }: RowProps) {
  const content = (
    <>
      {leading}
      <ThemedText
        type={muted ? 'small' : 'default'}
        themeColor={muted ? 'textSecondary' : undefined}
        style={[styles.flex, color ? { color } : undefined]}
        numberOfLines={1}>
        {label}
      </ThemedText>
      {detail && (
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      )}
      {onPress && !color && <Chevron />}
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
  flex: {
    flex: 1,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: Layout.cardPadding,
    borderRadius: Layout.cardRadius,
  },
  section: {
    gap: Layout.titleGap,
  },
  sectionTitle: {
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Layout.cardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: Layout.cardPadding,
  },
  pressed: {
    opacity: 0.6,
  },
  version: {
    textAlign: 'center',
  },
});
