import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { IconButton } from '@/components/icon-button';
import { Screen } from '@/components/screen';
import { Chevron, Row, Section } from '@/components/settings-list';
import { ThemedText } from '@/components/themed-text';
import { HabitColors, Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmDestructive } from '@/lib/confirm';
import { habitGrowth } from '@/lib/growth';
import { activeHabits, describeDays, FREE_HABIT_LIMIT, TIME_SLOTS } from '@/lib/habits';
import { useHabits } from '@/store/habits';

export default function SettingsScreen() {
  const theme = useTheme();
  const allHabits = useHabits((s) => s.habits);
  const checks = useHabits((s) => s.checks);
  const isPro = useHabits((s) => s.isPro);
  const reminders = useHabits((s) => s.reminders);
  const moveHabit = useHabits((s) => s.moveHabit);
  const resetAll = useHabits((s) => s.resetAll);
  const [reordering, setReordering] = useState(false);

  const habits = activeHabits(allHabits);
  const graduatedCount = allHabits.length - habits.length;
  // Same order as the Today screen: by time slot, then by list order
  const ordered = TIME_SLOTS.flatMap((slot) => habits.filter((h) => h.time === slot.key));
  const remindersOn = Object.values(reminders).filter((r) => r.enabled).length;

  const reset = async () => {
    const ok = await confirmDestructive(
      '모든 데이터 삭제',
      '루틴과 체크 기록이 모두 삭제되고 되돌릴 수 없어요.',
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
            {isPro
              ? '응원해 주셔서 고마워요'
              : `무료는 루틴 ${FREE_HABIT_LIMIT}개까지 만들 수 있어요`}
          </ThemedText>
        </View>
        <Chevron />
      </Pressable>

      <Section
        title={`내 루틴 ${habits.length}개`}
        action={
          habits.length > 1 && (
            <Pressable onPress={() => setReordering((r) => !r)} hitSlop={10}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {reordering ? '완료' : '순서 바꾸기'}
              </ThemedText>
            </Pressable>
          )
        }
        footer={reordering ? '같은 시간대 안에서 순서를 바꿀 수 있어요' : undefined}>
        {ordered.length === 0 ? (
          <Row label="아직 루틴이 없어요" muted />
        ) : (
          ordered.map((h) => {
            const sameSlot = ordered.filter((o) => o.time === h.time);
            const pos = sameSlot.indexOf(h);
            return (
              <Row
                key={h.id}
                label={h.name}
                detail={
                  reordering
                    ? undefined
                    : `${TIME_SLOTS.find((t) => t.key === h.time)?.label} · ${describeDays(h.days)}`
                }
                leading={
                  <Doodle
                    character={h.character}
                    color={HabitColors[h.color]}
                    level={habitGrowth(checks, h.id).level}
                    size={40}
                  />
                }
                trailing={
                  reordering ? (
                    <View style={styles.moveButtons}>
                      <ThemedText type="caption" themeColor="textSecondary">
                        {TIME_SLOTS.find((t) => t.key === h.time)?.label}
                      </ThemedText>
                      <MoveButton
                        up
                        disabled={pos === 0}
                        onPress={() => moveHabit(h.id, -1)}
                        label={`${h.name} 위로`}
                      />
                      <MoveButton
                        disabled={pos === sameSlot.length - 1}
                        onPress={() => moveHabit(h.id, 1)}
                        label={`${h.name} 아래로`}
                      />
                    </View>
                  ) : undefined
                }
                onPress={reordering ? undefined : () => router.push(`/habit/${h.id}`)}
              />
            );
          })
        )}
        {graduatedCount > 0 && !reordering && (
          <Row
            label={`졸업한 친구 ${graduatedCount}명`}
            muted
            onPress={() => router.push('/friends')}
          />
        )}
      </Section>

      <Section title="알림">
        <Row
          label="시간대별 알림"
          detail={remindersOn > 0 ? `${remindersOn}개 켜짐` : '꺼짐'}
          onPress={() => router.push('/reminders')}
        />
      </Section>

      <Section title="데이터" footer="기록은 이 기기에만 저장돼요. 폰을 바꾸기 전에 백업해 두세요.">
        <Row label="백업하기 / 불러오기" onPress={() => router.push('/backup')} />
        <Row label="모든 데이터 삭제" color={theme.danger} onPress={reset} />
      </Section>

      <ThemedText type="caption" themeColor="textSecondary" style={styles.version}>
        틱데이 {Constants.expoConfig?.version}
      </ThemedText>
    </Screen>
  );
}

type MoveButtonProps = { up?: boolean; disabled: boolean; onPress: () => void; label: string };

function MoveButton({ up, disabled, onPress, label }: MoveButtonProps) {
  return (
    <View style={disabled && styles.disabled} pointerEvents={disabled ? 'none' : 'auto'}>
      <IconButton
        sf={up ? 'chevron.up' : 'chevron.down'}
        md={up ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
        label={label}
        onPress={onPress}
      />
    </View>
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
  moveButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
  version: {
    textAlign: 'center',
  },
});
