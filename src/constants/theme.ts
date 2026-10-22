import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F1E24',
    background: '#FFFFFF',
    backgroundElement: '#F5F5F7',
    backgroundSelected: '#EAEAEE',
    textSecondary: '#8B8B95',
    border: '#EDEDF0',
    accent: '#FF7A5C',
    onAccent: '#FFFFFF',
    danger: '#E5484D',
  },
  dark: {
    text: '#F4F4F6',
    background: '#111113',
    backgroundElement: '#1C1C1F',
    backgroundSelected: '#2A2A2F',
    textSecondary: '#9C9CA6',
    border: '#26262B',
    accent: '#FF8A6E',
    onAccent: '#FFFFFF',
    danger: '#FF7B7B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Point colors a habit can be tagged with; used for its character and check */
export const HabitColors = {
  coral: '#FF9478',
  yellow: '#FFD25E',
  green: '#6FD39B',
  blue: '#6CB4FF',
  purple: '#B49BFF',
  pink: '#FF9CC6',
} as const;

export type HabitColor = keyof typeof HabitColors;

/** Light tint of a habit color for backgrounds (hex alpha suffix) */
export function tint(hex: string, alpha = 0.16) {
  return `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

/** Pretendard weights, registered in the root layout */
export const FontFamily = {
  regular: 'Pretendard',
  semibold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Spacing rules shared by every screen, so gaps stay consistent */
export const Layout = {
  /** Left/right padding of screen content */
  screenPadding: 20,
  /** Between sections on a screen */
  sectionGap: 28,
  /** Between a section title and its content */
  titleGap: 12,
  /** Between stacked cards or list rows */
  itemGap: 10,
  /** Inside cards */
  cardPadding: 16,
  cardRadius: 20,
  /** Smallest comfortable touch target */
  touch: 44,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 600;
