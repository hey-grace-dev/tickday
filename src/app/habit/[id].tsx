import { router, Stack, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { type Character, CHARACTER_NAMES, CHARACTERS, Doodle } from '@/components/doodle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  FontFamily,
  type HabitColor,
  HabitColors,
  Layout,
  MaxContentWidth,
  tint,
} from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmDestructive } from '@/lib/confirm';
import { WEEKDAY_LABELS } from '@/lib/date';
import { checksToNextLevel, LEVEL_NAMES, levelFor, MAX_LEVEL, totalChecks } from '@/lib/growth';
import { DAY_PRESETS, TIME_SLOTS, type TimeSlot } from '@/lib/habits';
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
  const checkCount = useHabits((s) => totalChecks(s.checks, id));

  const isNew = id === 'new';
  const [name, setName] = useState(habit?.name ?? '');
  // New habits cycle through characters and colors so the list stays varied
  const [character, setCharacter] = useState<Character>(
    habit?.character ?? CHARACTERS[habitCount % CHARACTERS.length]
  );
  const [color, setColor] = useState<HabitColor>(
    habit?.color ?? COLOR_KEYS[habitCount % COLOR_KEYS.length]
  );
  const [time, setTime] = useState<TimeSlot>(habit?.time ?? 'anytime');
  const [days, setDays] = useState<number[]>(habit?.days ?? ALL_DAYS);
  const level = isNew ? 1 : levelFor(checkCount);
  const toNext = checksToNextLevel(checkCount);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && days.length > 0;
  const point = HabitColors[color];

  const toggleDay = (day: number) =>
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    if (!canSave) return;
    const input = { name: trimmed, character, color, time, days };
    if (isNew) addHabit(input);
    else if (habit) updateHabit(habit.id, input);
    close();
  };

  const remove = async () => {
    if (!habit) return;
    const ok = await confirmDestructive(
      '루틴 삭제',
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
        <Stack.Screen options={{ title: '루틴 편집' }} />
        <View style={styles.missing}>
          <Doodle character="ghost" color={HabitColors.purple} mood="sleepy" size={88} />
          <ThemedText themeColor="textSecondary">루틴을 찾을 수 없어요</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isNew ? '새 루틴' : '루틴 편집',
          headerRight: () => (
            <Pressable onPress={save} disabled={!canSave} hitSlop={10} style={styles.headerButton}>
              <ThemedText
                type="semibold"
                style={{ color: canSave ? theme.accent : theme.textSecondary }}>
                저장
              </ThemedText>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.preview, { backgroundColor: tint(point) }]}>
          <Doodle character={character} color={point} mood="happy" level={level} size={80} />
          {!isNew && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
              Lv.{level} {LEVEL_NAMES[level - 1]} 단계 ·{' '}
              {level === MAX_LEVEL || toNext === null
                ? '다 자랐어요'
                : `${toNext}번 더 체크하면 자라요`}
            </ThemedText>
          )}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="루틴 이름을 적어 주세요"
            placeholderTextColor={theme.textSecondary}
            autoFocus={isNew}
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={save}
            style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
          />
        </View>

        <Field label="캐릭터">
          <View style={styles.characters}>
            {CHARACTERS.map((c) => {
              const selected = character === c;
              return (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityLabel={CHARACTER_NAMES[c]}
                  accessibilityState={{ selected }}
                  onPress={() => setCharacter(c)}
                  style={[
                    styles.characterCell,
                    {
                      backgroundColor: selected ? tint(point) : theme.backgroundElement,
                      borderColor: selected ? point : 'transparent',
                    },
                  ]}>
                  <Doodle character={c} color={point} mood={selected ? 'happy' : 'idle'} size={52} />
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="색깔">
          <View style={styles.colors}>
            {COLOR_KEYS.map((key) => {
              const selected = color === key;
              return (
                <Pressable
                  key={key}
                  accessibilityRole="button"
                  accessibilityLabel={key}
                  accessibilityState={{ selected }}
                  onPress={() => setColor(key)}
                  hitSlop={4}
                  style={[styles.colorRing, { borderColor: selected ? theme.text : 'transparent' }]}>
                  <View style={[styles.colorDot, { backgroundColor: HabitColors[key] }]} />
                </Pressable>
              );
            })}
          </View>
        </Field>

        <Field label="언제 할까요?">
          <View style={styles.presets}>
            {TIME_SLOTS.map((slot) => (
              <Chip
                key={slot.key}
                label={slot.label}
                selected={time === slot.key}
                onPress={() => setTime(slot.key)}
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

        <View style={styles.actions}>
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
              type="semibold"
              style={{ color: canSave ? theme.onAccent : theme.textSecondary }}>
              {isNew ? '추가하기' : '저장하기'}
            </ThemedText>
          </Pressable>

          {!isNew && (
            <Pressable accessibilityRole="button" onPress={remove} style={styles.deleteButton}>
              <ThemedText type="smallBold" style={{ color: theme.danger }}>
                루틴 삭제
              </ThemedText>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" themeColor="textSecondary">
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
        { backgroundColor: selected ? theme.text : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={{ color: selected ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // The web header has no built-in side inset, native headers do
  headerButton: {
    paddingHorizontal: Platform.OS === 'web' ? 16 : 0,
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
  preview: {
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: Layout.cardRadius,
  },
  input: {
    alignSelf: 'stretch',
    fontFamily: FontFamily.semibold,
    fontSize: 17,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    textAlign: 'center',
    outlineWidth: 0,
  },
  field: {
    gap: Layout.titleGap,
  },
  characters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  characterCell: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorRing: {
    width: Layout.touch,
    height: Layout.touch,
    borderRadius: Layout.touch / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    gap: 8,
  },
  chip: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  actions: {
    gap: 8,
  },
  saveButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  deleteButton: {
    minHeight: Layout.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  center: {
    textAlign: 'center',
  },
  missing: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 64,
  },
});
