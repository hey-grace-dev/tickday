import { SymbolView } from 'expo-symbols';
import { Fragment, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Layout } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Chevron() {
  const theme = useTheme();
  return (
    <SymbolView
      name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
      tintColor={theme.textSecondary}
      size={18}
    />
  );
}

type SectionProps = {
  title: string;
  /** Rendered at the right of the title, e.g. an edit toggle */
  action?: ReactNode;
  /** Small text under the card */
  footer?: string;
  children: ReactNode;
};

/** Titled card of rows separated by hairlines */
export function Section({ title, action, footer, children }: SectionProps) {
  const theme = useTheme();
  const rows = (Array.isArray(children) ? children : [children]).flat().filter(Boolean);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.flex}>
          {title}
        </ThemedText>
        {action}
      </View>
      <ThemedView type="backgroundElement" style={styles.card}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            {row}
          </Fragment>
        ))}
      </ThemedView>
      {footer && (
        <ThemedText type="caption" themeColor="textSecondary" style={styles.footer}>
          {footer}
        </ThemedText>
      )}
    </View>
  );
}

type RowProps = {
  label: string;
  detail?: string;
  color?: string;
  muted?: boolean;
  leading?: ReactNode;
  /** Replaces the chevron */
  trailing?: ReactNode;
  onPress?: () => void;
};

export function Row({ label, detail, color, muted, leading, trailing, onPress }: RowProps) {
  const content = (
    <>
      {leading}
      <ThemedText
        type={muted ? 'small' : 'default'}
        themeColor={muted ? 'textSecondary' : undefined}
        style={[styles.flex, color ? { color } : undefined]}
        numberOfLines={1}>
        {label}
      </ThemedText>
      {detail && (
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      )}
      {trailing ?? (onPress && !color && <Chevron />)}
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  section: {
    gap: Layout.titleGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Layout.cardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: Layout.cardPadding,
  },
  footer: {
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.6,
  },
});
