import { type ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = {
  title: string;
  subtitle?: string;
  /** Rendered to the right of the title */
  action?: ReactNode;
  children: ReactNode;
};

/** Scrollable tab screen with a large title header */
export function Screen({ title, subtitle, action, children }: ScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.titles}>
              {subtitle && (
                <ThemedText type="small" themeColor="textSecondary">
                  {subtitle}
                </ThemedText>
              )}
              <ThemedText type="subtitle">{title}</ThemedText>
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
    padding: Spacing.three,
    paddingBottom: Platform.OS === 'web' ? Spacing.four : BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
  },
  titles: {
    flexShrink: 1,
  },
});
