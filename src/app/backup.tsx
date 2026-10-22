import { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';

import { Doodle } from '@/components/doodle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FontFamily, HabitColors, Layout, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createBackup, parseBackup } from '@/lib/backup';
import { confirmDestructive } from '@/lib/confirm';
import { useHabits } from '@/store/habits';

/** Back up as text the user can save anywhere, and restore by pasting it back */
export default function BackupScreen() {
  const theme = useTheme();
  const habits = useHabits((s) => s.habits);
  const checks = useHabits((s) => s.checks);
  const reminders = useHabits((s) => s.reminders);
  const replaceAll = useHabits((s) => s.replaceAll);

  const [backup, setBackup] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [pasted, setPasted] = useState('');
  const [importNote, setImportNote] = useState<{ ok: boolean; text: string } | null>(null);

  const exportBackup = async () => {
    const text = createBackup({ habits, checks, reminders });
    setBackup(text);
    setExportNote(null);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: '틱데이 백업', text });
        } else {
          await navigator.clipboard.writeText(text);
          setExportNote('백업 내용을 복사했어요. 메모 앱 같은 곳에 붙여넣어 보관하세요.');
        }
      } else {
        await Share.share({ message: text, title: '틱데이 백업' });
      }
    } catch {
      setExportNote('아래 백업 내용을 길게 눌러 전체 복사해서 보관하세요.');
    }
  };

  const importBackup = async () => {
    const result = parseBackup(pasted);
    if ('error' in result) {
      setImportNote({ ok: false, text: result.error });
      return;
    }
    const ok = await confirmDestructive(
      '백업 불러오기',
      `루틴 ${result.data.habits.length}개를 불러와요. 지금 기기에 있는 루틴과 기록은 백업 내용으로 바뀌어요.`,
      '불러오기'
    );
    if (!ok) return;
    replaceAll(result.data);
    setPasted('');
    setImportNote({ ok: true, text: `루틴 ${result.data.habits.length}개를 불러왔어요.` });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Doodle character="bear" color={HabitColors.yellow} mood="happy" size={72} />
          <ThemedText themeColor="textSecondary" style={styles.center}>
            기록은 이 기기에만 저장돼요.{'\n'}폰을 바꾸기 전에 백업해 두세요.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="heading">백업하기</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            백업 내용을 메모 앱이나 나에게 보내기로 보관해 두세요.
          </ThemedText>
          <PrimaryButton label="백업 내용 만들기" onPress={exportBackup} />
          {exportNote && (
            <ThemedText type="small" themeColor="textSecondary">
              {exportNote}
            </ThemedText>
          )}
          {backup && (
            <TextInput
              value={backup}
              editable={false}
              multiline
              selectTextOnFocus
              style={[styles.code, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            />
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="heading">불러오기</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            보관해 둔 백업 내용을 그대로 붙여넣어 주세요.
          </ThemedText>
          <TextInput
            value={pasted}
            onChangeText={(text) => {
              setPasted(text);
              setImportNote(null);
            }}
            multiline
            placeholder="여기에 붙여넣기"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.code, { color: theme.text, backgroundColor: theme.backgroundElement }]}
          />
          <PrimaryButton label="불러오기" onPress={importBackup} disabled={!pasted.trim()} />
          {importNote && (
            <ThemedText
              type="small"
              style={{ color: importNote.ok ? theme.text : theme.danger }}
              accessibilityLiveRegion="polite">
              {importNote.text}
            </ThemedText>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

type PrimaryButtonProps = { label: string; onPress: () => void; disabled?: boolean };

function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? theme.backgroundSelected : theme.accent },
        pressed && styles.pressed,
      ]}>
      <ThemedText
        type="semibold"
        style={{ color: disabled ? theme.textSecondary : theme.onAccent }}>
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
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 8,
    paddingBottom: 40,
    gap: Layout.sectionGap + 8,
  },
  intro: {
    alignItems: 'center',
    gap: 12,
  },
  center: {
    textAlign: 'center',
  },
  section: {
    gap: Layout.titleGap,
  },
  code: {
    minHeight: 96,
    maxHeight: 160,
    padding: 12,
    borderRadius: 12,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlignVertical: 'top',
    outlineWidth: 0,
  },
  button: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
