import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmDestructive } from '@/lib/confirm';
import { WEEKDAY_LABELS } from '@/lib/date';
import { DAY_PRESETS } from '@/lib/habits';
import { useHabits } from '@/store/habits';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

/** Create (`/habit/new`) or edit (`/habit/<id>`) a habit */
export default function HabitEditScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabits((s) => s.habits.find((h) => h.id === id));
  const addHabit = useHabits((s) => s.addHabit);
  const updateHabit = useHabits((s) => s.updateHabit);
  const deleteHabit = useHabits((s) => s.deleteHabit);

  const isNew = id === 'new';
  const [name, setName] = useState(habit?.name ?? '');
  const [days, setDays] = useState<number[]>(habit?.days ?? ALL_DAYS);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && days.length > 0;

  const toggleDay = (day: number) =>
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    if (!canSave) return;
    if (isNew) addHabit({ name: trimmed, days });
    else if (habit) updateHabit(habit.id, { name: trimmed, days });
    close();
  };

  const remove = async () => {
    if (!habit) return;
    const ok = await confirmDestructive(
      '습관 삭제',
      `'${habit.name}'와 지금까지의 기록이 모두 삭제돼요.`,
      '삭제'
    );
    if (ok) {
      deleteHabit(habit.id);
      close();
    }
  };

  if (!isNew && !habit) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: '습관 편집' }} />
        <ThemedText style={styles.missing}>습관을 찾을 수 없어요.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isNew ? '새 습관' : '습관 편집',
          headerRight: () => (
            <Pressable onPress={save} disabled={!canSave} hitSlop={8}>
              <ThemedText
                type="smallBold"
                style={{ color: canSave ? theme.accent : theme.textSecondary }}>
                저장
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            이름
          </ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="예: 물 2L 마시기"
            placeholderTextColor={theme.textSecondary}
            autoFocus={isNew}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={save}
            style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            반복 요일
          </ThemedText>
          <View style={styles.days}>
            {WEEKDAY_LABELS.map((label, day) => (
              <Chip
                key={label}
                label={label}
                selected={days.includes(day)}
                onPress={() => toggleDay(day)}
                round
              />
            ))}
          </View>
          <View style={styles.presets}>
            {DAY_PRESETS.map((preset) => (
              <Chip
                key={preset.label}
                label={preset.label}
                selected={
                  preset.days.length === days.length && preset.days.every((d) => days.includes(d))
                }
                onPress={() => setDays([...preset.days])}
              />
            ))}
          </View>
          {days.length === 0 && (
            <ThemedText type="small" style={{ color: theme.danger }}>
              요일을 하나 이상 선택해 주세요
            </ThemedText>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={save}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: canSave ? theme.accent : theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <ThemedText
            type="smallBold"
            style={{ color: canSave ? theme.onAccent : theme.textSecondary }}>
            {isNew ? '추가하기' : '저장하기'}
          </ThemedText>
        </Pressable>

        {!isNew && (
          <Pressable accessibilityRole="button" onPress={remove} style={styles.deleteButton}>
            <ThemedText type="small" style={{ color: theme.danger }}>
              습관 삭제
            </ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

type ChipProps = { label: string; selected: boolean; onPress: () => void; round?: boolean };

function Chip({ label, selected, onPress, round }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        round ? styles.dayChip : styles.chip,
        { backgroundColor: selected ? theme.accent : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: selected ? theme.onAccent : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
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
    padding: Spacing.three,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  input: {
    fontSize: 18,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    outlineWidth: 0,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presets: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
  missing: {
    textAlign: 'center',
    padding: Spacing.five,
  },
});
