import { type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Layout, MaxContentWidth } from '@/constants/theme';

type ScreenProps = {
  title: string;
  /** Small line above the title */
  overline?: string;
  /** Rendered to the right of the title */
  action?: ReactNode;
  children: ReactNode;
};

/** Scrollable tab screen with a title header; top-level children are spaced by `sectionGap` */
export function Screen({ title, overline, action, children }: ScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.titles}>
              {overline !== undefined && (
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {overline}
                </ThemedText>
              )}
              <ThemedText type="title">{title}</ThemedText>
            </View>
            {action}
          </View>
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'web' ? 32 : BottomTabInset + 32,
    gap: Layout.sectionGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 56,
  },
  titles: {
    flexShrink: 1,
    gap: 2,
  },
});
