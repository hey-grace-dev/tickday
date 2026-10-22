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
import { FontFamily, type HabitColor, HabitColors, Layout, tint } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { EXP_PER_CHECK, type Growth } from '@/lib/growth';

type HabitRowProps = {
  name: string;
  character: Character;
  color: HabitColor;
  checked: boolean;
  streak: number;
  growth: Growth;
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
  growth,
  onToggle,
  onLongPress,
}: HabitRowProps) {
  const theme = useTheme();
  const point = HabitColors[color];
  const scale = useSharedValue(1);
  const bounce = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  // "+10 EXP" floats up from the check when it's ticked
  const gain = useSharedValue(0);
  const gainStyle = useAnimatedStyle(() => ({
    opacity: gain.get() === 0 ? 0 : 1 - gain.get(),
    transform: [{ translateY: -22 * gain.get() }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(
        checked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    if (!checked) {
      scale.set(withSequence(withTiming(0.8, { duration: 80 }), withSpring(1, { damping: 6 })));
      gain.set(withSequence(withTiming(0.001, { duration: 0 }), withTiming(1, { duration: 900 })));
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
      <Doodle
        character={character}
        color={point}
        mood={checked ? 'happy' : 'idle'}
        level={growth.level}
        size={52}
      />
      <View style={styles.texts}>
        <ThemedText type="semibold" numberOfLines={2}>
          {name}
          {streak > 0 && (
            <ThemedText type="caption" themeColor="textSecondary">
              {'  '}
              {streak}일 연속
            </ThemedText>
          )}
        </ThemedText>
        <View style={styles.meta}>
          <ThemedText type="caption" style={styles.level}>
            Lv.{growth.level}
          </ThemedText>
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[styles.fill, { backgroundColor: point, width: `${growth.progress * 100}%` }]}
            />
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            {growth.nextExp === null ? `${growth.exp} EXP` : `${growth.exp}/${growth.nextExp} EXP`}
          </ThemedText>
        </View>
      </View>
      <View>
        <Animated.View style={bounce}>
          <CheckBubble checked={checked} color={point} />
        </Animated.View>
        <Animated.Text
          pointerEvents="none"
          style={[styles.gain, { color: theme.accent }, gainStyle]}>
          +{EXP_PER_CHECK} EXP
        </Animated.Text>
      </View>
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
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  level: {
    fontFamily: FontFamily.semibold,
  },
  gain: {
    position: 'absolute',
    top: -14,
    right: -6,
    width: 60,
    textAlign: 'right',
    fontFamily: FontFamily.bold,
    fontSize: 12,
  },
  track: {
    flex: 1,
    maxWidth: 64,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
