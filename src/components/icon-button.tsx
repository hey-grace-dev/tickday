import { type AndroidSymbol, type SFSymbol, SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet } from 'react-native';

import { Layout } from '@/constants/theme';
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: filled ? theme.accent : theme.backgroundElement },
        pressed && styles.pressed,
      ]}>
      <SymbolView
        name={{ ios: sf, android: md, web: md }}
        tintColor={filled ? theme.onAccent : theme.text}
        size={22}
        weight="semibold"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: Layout.touch,
    height: Layout.touch,
    borderRadius: Layout.touch / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
