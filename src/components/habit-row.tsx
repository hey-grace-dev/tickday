import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HabitRowProps = {
  name: string;
  checked: boolean;
  streak: number;
  onToggle: () => void;
  onLongPress: () => void;
};

/** The whole row is the tap target: one tap checks the habit off */
export function HabitRow({ name, checked, streak, onToggle, onLongPress }: HabitRowProps) {
  const theme = useTheme();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        checked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    onToggle();
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityHint="길게 누르면 편집"
      onPress={handlePress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.check,
          checked
            ? { backgroundColor: theme.accent, borderColor: theme.accent }
            : { borderColor: theme.textSecondary },
        ]}>
        {checked && (
          <SymbolView
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            tintColor={theme.onAccent}
            size={18}
            weight="bold"
          />
        )}
      </View>
      <ThemedText
        style={[styles.name, checked && styles.doneName]}
        themeColor={checked ? 'textSecondary' : 'text'}
        numberOfLines={2}>
        {name}
      </ThemedText>
      {streak > 0 && (
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {streak}일 연속
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    minHeight: 64,
  },
  pressed: {
    opacity: 0.8,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
  },
  doneName: {
    textDecorationLine: 'line-through',
  },
});
