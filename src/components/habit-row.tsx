import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { type HabitColor, HabitColors, OnHabitColor, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HabitRowProps = {
  name: string;
  emoji: string;
  color: HabitColor;
  checked: boolean;
  streak: number;
  onToggle: () => void;
  onLongPress: () => void;
};

/** The whole row is the tap target: one tap checks the habit off */
export function HabitRow({
  name,
  emoji,
  color,
  checked,
  streak,
  onToggle,
  onLongPress,
}: HabitRowProps) {
  const theme = useTheme();
  const pastel = HabitColors[color];
  const scale = useSharedValue(1);
  const bounce = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        checked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    if (!checked) {
      scale.set(withSequence(withTiming(0.8, { duration: 80 }), withSpring(1, { damping: 6 })));
    }
    onToggle();
  };

  const textColor = checked ? OnHabitColor : theme.text;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={name}
      accessibilityHint="길게 누르면 편집"
      onPress={handlePress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: checked ? pastel : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.emoji, { backgroundColor: checked ? '#ffffff99' : pastel }]}>
        <ThemedText style={styles.emojiText}>{emoji}</ThemedText>
      </View>
      <View style={styles.texts}>
        <ThemedText type="display" style={{ color: textColor }} numberOfLines={2}>
          {name}
        </ThemedText>
        {streak > 0 && (
          <ThemedText type="small" style={{ color: checked ? OnHabitColor : theme.textSecondary }}>
            🔥 {streak}일 연속
          </ThemedText>
        )}
      </View>
      <Animated.View
        style={[
          styles.check,
          checked
            ? { backgroundColor: theme.accent, borderColor: theme.accent }
            : { borderColor: pastel, backgroundColor: theme.backgroundElement },
          bounce,
        ]}>
        {checked && <ThemedText style={[styles.checkMark, { color: theme.onAccent }]}>✓</ThemedText>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
    minHeight: 76,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  emoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
    lineHeight: 30,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  check: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: 900,
  },
});
