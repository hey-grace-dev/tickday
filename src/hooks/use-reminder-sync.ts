import { useEffect } from 'react';

import { remindersSupported, syncReminders } from '@/lib/reminders';
import { useHabits, useHydrated } from '@/store/habits';

/** Keeps scheduled notifications in line with reminder settings and routines */
export function useReminderSync() {
  const hydrated = useHydrated();
  const reminders = useHabits((s) => s.reminders);
  const habits = useHabits((s) => s.habits);

  useEffect(() => {
    if (!hydrated || !remindersSupported) return;
    syncReminders(reminders, habits).catch((error) => {
      console.warn('Failed to schedule reminders', error);
    });
  }, [hydrated, reminders, habits]);
}
