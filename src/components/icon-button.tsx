import { type AndroidSymbol, type SFSymbol, SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconButtonProps = {
  sf: SFSymbol;
  md: AndroidSymbol;
  label: string;
  onPress: () => void;
  filled?: boolean;
};

export function IconButton({ sf, md, label, onPress, filled }: IconButtonProps) {
  const theme = useTheme();
  const size = filled ? 52 : 40;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: filled ? theme.accent : theme.backgroundSelected,
        },
        filled && styles.shadow,
        pressed && styles.pressed,
      ]}>
      <SymbolView
        name={{ ios: sf, android: md, web: md }}
        tintColor={filled ? theme.onAccent : theme.text}
        size={filled ? 28 : 22}
        weight="bold"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    boxShadow: '0 4px 12px rgba(255, 138, 128, 0.45)',
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
});
