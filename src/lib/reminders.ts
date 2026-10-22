import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { type Habit, TIME_SLOTS } from '@/lib/habits';
import { type Reminders } from '@/store/habits';

/** Local notifications only exist in the native app */
export const remindersSupported = Platform.OS !== 'web';

const CHANNEL_ID = 'routine-reminders';

if (remindersSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/** Ask for permission; resolves false if the user declined */
export async function requestReminderPermission(): Promise<boolean> {
  if (!remindersSupported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Replace all scheduled reminders with one daily notification per enabled time slot.
 * Called whenever reminder settings or routine names change, so the text stays current.
 */
export async function syncReminders(reminders: Reminders, habits: Habit[]): Promise<void> {
  if (!remindersSupported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: '루틴 알림',
      importance: AndroidImportance.DEFAULT,
    });
  }

  for (const slot of TIME_SLOTS) {
    if (slot.key === 'anytime') continue;
    const reminder = reminders[slot.key];
    const routines = habits.filter((h) => !h.archivedAt && h.time === slot.key);
    if (!reminder.enabled || routines.length === 0) continue;

    const [first, ...rest] = routines;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${slot.label} 루틴 시간이에요`,
        body:
          rest.length > 0
            ? `'${first.name}' 외 ${rest.length}개, 톡 눌러서 체크해요`
            : `'${first.name}', 톡 눌러서 체크해요`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
        channelId: CHANNEL_ID,
      },
    });
  }
}
