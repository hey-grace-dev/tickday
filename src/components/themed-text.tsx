import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'title' | 'heading' | 'default' | 'semibold' | 'small' | 'smallBold' | 'caption';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

// Custom fonts don't switch weight via fontWeight on native, so each weight is its own family
const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  default: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  semibold: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  small: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
