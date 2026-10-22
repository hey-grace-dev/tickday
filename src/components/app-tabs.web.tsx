import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { type AndroidSymbol, SymbolView } from 'expo-symbols';
import { Pressable, View, StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// Web gets a bottom tab bar too, since the web build is mostly opened on phones as a preview.
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="check_circle">오늘</TabButton>
          </TabTrigger>
          <TabTrigger name="history" href="/history" asChild>
            <TabButton icon="calendar_month">기록</TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton icon="settings">설정</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  ref: _ref,
  ...props
}: TabTriggerSlotProps & { icon: AndroidSymbol }) {
  const theme = useTheme();
  const color = isFocused ? theme.text : theme.textSecondary;
  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <SymbolView name={{ web: icon }} tintColor={color} size={24} />
      <ThemedText type="small" style={{ color }}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.tabListContainer}>
      <View {...props} style={styles.innerContainer} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    alignItems: 'center',
    paddingBottom: Spacing.two,
  },
  innerContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
