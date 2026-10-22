/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#4A3B35',
    background: '#FFF8F1',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F4E9DE',
    textSecondary: '#A08F86',
    accent: '#FF8A80',
    onAccent: '#ffffff',
    danger: '#E5484D',
  },
  dark: {
    text: '#FBEFE9',
    background: '#1F1A1D',
    backgroundElement: '#2C2529',
    backgroundSelected: '#3B3237',
    textSecondary: '#B8A7A1',
    accent: '#FF9E95',
    onAccent: '#3A1714',
    danger: '#FF8A8A',
  },
} as const;

/** Pastel colors a habit can be tagged with; text on them is always dark */
export const HabitColors = {
  peach: '#FFD3C4',
  lemon: '#FFEDA8',
  mint: '#C5EED7',
  sky: '#C9E4FF',
  lavender: '#E0D4FF',
  pink: '#FFD0E4',
} as const;

export type HabitColor = keyof typeof HabitColors;

export const OnHabitColor = '#4A3B35';

/** Rounded Korean display font, loaded in the root layout */
export const DisplayFont = 'Jua';

export const Radius = {
  card: 24,
  pill: 999,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
