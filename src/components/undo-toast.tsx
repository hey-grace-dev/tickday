import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Layout, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useHabits } from '@/store/habits';

const UNDO_MS = 6000;

/** Shown for a few seconds after a routine is deleted, with a way to bring it back */
export function UndoToast() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const lastDeleted = useHabits((s) => s.lastDeleted);
  const undoDelete = useHabits((s) => s.undoDelete);
  const clearLastDeleted = useHabits((s) => s.clearLastDeleted);

  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(clearLastDeleted, UNDO_MS);
    return () => clearTimeout(timer);
  }, [lastDeleted, clearLastDeleted]);

  if (!lastDeleted) return null;

  // Sit just above the tab bar
  const bottom = (Platform.OS === 'web' ? 72 : BottomTabInset + insets.bottom) + 12;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View style={[styles.toast, { backgroundColor: theme.text }]}>
        <ThemedText
          type="small"
          numberOfLines={1}
          style={[styles.message, { color: theme.background }]}>
          &apos;{lastDeleted.habit.name}&apos; 루틴을 삭제했어요
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={undoDelete} hitSlop={10}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            되돌리기
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: MaxContentWidth,
    minHeight: 52,
    paddingHorizontal: Layout.cardPadding,
    borderRadius: 16,
  },
  message: {
    flex: 1,
  },
});
