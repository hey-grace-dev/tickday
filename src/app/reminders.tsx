import { Alert, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { IconButton } from '@/components/icon-button';
import { Section } from '@/components/settings-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HabitColors, Layout, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { activeHabits, TIME_SLOTS } from '@/lib/habits';
import { remindersSupported, requestReminderPermission } from '@/lib/reminders';
import { type Reminder, type Reminders, useHabits } from '@/store/habits';

const STEP_MINUTES = 30;

function formatTime({ hour, minute }: Reminder) {
  const period = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${h12}:${String(minute).padStart(2, '0')}`;
}

function shiftTime(reminder: Reminder, minutes: number): Reminder {
  const total = (reminder.hour * 60 + reminder.minute + minutes + 24 * 60) % (24 * 60);
  return { ...reminder, hour: Math.floor(total / 60), minute: total % 60 };
}

/** Daily reminder per time slot */
export default function RemindersScreen() {
  const theme = useTheme();
  const reminders = useHabits((s) => s.reminders);
  const habits = activeHabits(useHabits((s) => s.habits));
  const setReminder = useHabits((s) => s.setReminder);

  const toggle = async (slot: keyof Reminders, enabled: boolean) => {
    if (enabled && remindersSupported && !(await requestReminderPermission())) {
      Alert.alert('알림이 꺼져 있어요', '휴대폰 설정에서 틱데이 알림을 허용해 주세요.');
      return;
    }
    setReminder(slot, { ...reminders[slot], enabled });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Doodle character="bunny" color={HabitColors.blue} mood="happy" size={72} />
          <ThemedText themeColor="textSecondary" style={styles.center}>
            정한 시간에 그 시간대 루틴을 알려 드려요
          </ThemedText>
        </View>

        {!remindersSupported && (
          <ThemedView type="backgroundElement" style={styles.notice}>
            <ThemedText type="small" themeColor="textSecondary">
              알림은 휴대폰 앱에서만 울려요. 웹 미리보기에서는 설정만 저장돼요.
            </ThemedText>
          </ThemedView>
        )}

        <Section
          title="시간대별 알림"
          footer="언제든 시간대 루틴은 알림이 없어요. 루틴이 없는 시간대도 알림이 가지 않아요.">
          {TIME_SLOTS.filter(
            (slot): slot is (typeof TIME_SLOTS)[number] & { key: keyof Reminders } =>
              slot.key !== 'anytime'
          ).map((slot) => {
            const reminder = reminders[slot.key];
            const count = habits.filter((h) => h.time === slot.key).length;
            return (
              <View key={slot.key} style={styles.row}>
                <View style={styles.rowTop}>
                  <View style={styles.flex}>
                    <ThemedText type="semibold">{slot.label}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      루틴 {count}개
                    </ThemedText>
                  </View>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={(on) => toggle(slot.key, on)}
                    trackColor={{ true: theme.accent, false: theme.backgroundSelected }}
                    thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
                    // react-native-web colors the "on" thumb separately
                    {...(Platform.OS === 'web' ? { activeThumbColor: '#FFFFFF' } : {})}
                    accessibilityLabel={`${slot.label} 알림`}
                  />
                </View>
                {reminder.enabled && (
                  <View style={styles.time}>
                    <IconButton
                      sf="minus"
                      md="remove"
                      label={`${slot.label} 알림 ${STEP_MINUTES}분 앞당기기`}
                      onPress={() => setReminder(slot.key, shiftTime(reminder, -STEP_MINUTES))}
                    />
                    <ThemedText type="heading" style={styles.timeText}>
                      {formatTime(reminder)}
                    </ThemedText>
                    <IconButton
                      sf="plus"
                      md="add"
                      label={`${slot.label} 알림 ${STEP_MINUTES}분 미루기`}
                      onPress={() => setReminder(slot.key, shiftTime(reminder, STEP_MINUTES))}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </Section>
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
  intro: {
    alignItems: 'center',
    gap: 12,
  },
  center: {
    textAlign: 'center',
  },
  notice: {
    padding: Layout.cardPadding,
    borderRadius: Layout.cardRadius,
  },
  flex: {
    flex: 1,
  },
  row: {
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Layout.cardPadding,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  timeText: {
    minWidth: 110,
    textAlign: 'center',
  },
});
