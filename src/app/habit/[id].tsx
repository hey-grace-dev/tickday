import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  type HabitColor,
  HabitColors,
  MaxContentWidth,
  OnHabitColor,
  Radius,
  Spacing,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmDestructive } from '@/lib/confirm';
import { WEEKDAY_LABELS } from '@/lib/date';
import { DAY_PRESETS, HABIT_EMOJIS } from '@/lib/habits';
import { useHabits } from '@/store/habits';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const COLOR_KEYS = Object.keys(HabitColors) as HabitColor[];

/** Create (`/habit/new`) or edit (`/habit/<id>`) a habit */
export default function HabitEditScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabits((s) => s.habits.find((h) => h.id === id));
  const habitCount = useHabits((s) => s.habits.length);
  const addHabit = useHabits((s) => s.addHabit);
  const updateHabit = useHabits((s) => s.updateHabit);
  const deleteHabit = useHabits((s) => s.deleteHabit);

  const isNew = id === 'new';
  const [name, setName] = useState(habit?.name ?? '');
  const [emoji, setEmoji] = useState<string>(habit?.emoji ?? HABIT_EMOJIS[0]);
  // New habits cycle through the palette so the list stays colorful
  const [color, setColor] = useState<HabitColor>(
    habit?.color ?? COLOR_KEYS[habitCount % COLOR_KEYS.length]
  );
  const [days, setDays] = useState<number[]>(habit?.days ?? ALL_DAYS);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && days.length > 0;

  const toggleDay = (day: number) =>
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    if (!canSave) return;
    const input = { name: trimmed, emoji, color, days };
    if (isNew) addHabit(input);
    else if (habit) updateHabit(habit.id, input);
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
        <ThemedText style={styles.missing}>습관을 찾을 수 없어요 🥲</ThemedText>
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
                type="display"
                style={{ color: canSave ? theme.accent : theme.textSecondary }}>
                저장
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.preview, { backgroundColor: HabitColors[color] }]}>
          <View style={styles.previewEmoji}>
            <ThemedText style={styles.previewEmojiText}>{emoji}</ThemedText>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="습관 이름 (예: 물 2L 마시기)"
            placeholderTextColor={`${OnHabitColor}88`}
            autoFocus={isNew}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={save}
            style={styles.input}
          />
        </View>

        <Field label="이모지">
          <View style={styles.wrap}>
            {HABIT_EMOJIS.map((e) => (
              <Pressable
                key={e}
                accessibilityRole="button"
                accessibilityState={{ selected: emoji === e }}
                onPress={() => setEmoji(e)}
                style={[
                  styles.emojiCell,
                  {
                    backgroundColor: emoji === e ? HabitColors[color] : theme.backgroundElement,
                    borderColor: emoji === e ? theme.accent : 'transparent',
                  },
                ]}>
                <ThemedText style={styles.emojiCellText}>{e}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="색깔">
          <View style={styles.colors}>
            {COLOR_KEYS.map((key) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={key}
                accessibilityState={{ selected: color === key }}
                onPress={() => setColor(key)}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: HabitColors[key],
                    borderColor: color === key ? theme.accent : 'transparent',
                  },
                ]}
              />
            ))}
          </View>
        </Field>

        <Field label="반복 요일">
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
              요일을 하나 이상 골라 주세요
            </ThemedText>
          )}
        </Field>

        <Pressable
          accessibilityRole="button"
          onPress={save}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.saveButton,
            canSave
              ? { backgroundColor: theme.accent, boxShadow: '0 4px 12px rgba(255, 138, 128, 0.45)' }
              : { backgroundColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <ThemedText
            type="display"
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="display" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </View>
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
      <ThemedText type="display" style={{ color: selected ? theme.onAccent : theme.text }}>
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
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
  },
  previewEmoji: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff99',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmojiText: {
    fontSize: 30,
    lineHeight: 38,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: OnHabitColor,
    paddingVertical: Spacing.two,
    outlineWidth: 0,
  },
  field: {
    gap: Spacing.two,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellText: {
    fontSize: 24,
    lineHeight: 30,
  },
  colors: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
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
    borderRadius: Radius.pill,
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  missing: {
    textAlign: 'center',
    padding: Spacing.five,
  },
});
