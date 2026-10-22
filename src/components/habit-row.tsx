import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CheckBubble } from '@/components/check-bubble';
import { type Character, Doodle } from '@/components/doodle';
import { ThemedText } from '@/components/themed-text';
import { type HabitColor, HabitColors, Layout, tint } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HabitRowProps = {
  name: string;
  character: Character;
  color: HabitColor;
  checked: boolean;
  streak: number;
  onToggle: () => void;
  onLongPress: () => void;
};

/** The whole row is the tap target: one tap checks the habit off */
export function HabitRow({
  name,
  character,
  color,
  checked,
  streak,
  onToggle,
  onLongPress,
}: HabitRowProps) {
  const theme = useTheme();
  const point = HabitColors[color];
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
        { backgroundColor: checked ? tint(point) : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <Doodle character={character} color={point} mood={checked ? 'happy' : 'idle'} size={48} />
      <View style={styles.texts}>
        <ThemedText type="semibold" numberOfLines={2}>
          {name}
        </ThemedText>
        {streak > 0 && (
          <ThemedText type="caption" themeColor="textSecondary">
            {streak}일 연속
          </ThemedText>
        )}
      </View>
      <Animated.View style={bounce}>
        <CheckBubble checked={checked} color={point} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: Layout.cardPadding,
    borderRadius: Layout.cardRadius,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  texts: {
    flex: 1,
    gap: 2,
  },
});
