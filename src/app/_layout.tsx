import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Colors, FontFamily } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const [fontsLoaded] = useFonts({
    [FontFamily.regular]: require('@/assets/fonts/Pretendard-Regular.otf'),
    [FontFamily.semibold]: require('@/assets/fonts/Pretendard-SemiBold.otf'),
    [FontFamily.bold]: require('@/assets/fonts/Pretendard-Bold.otf'),
  });

  if (!fontsLoaded) return null;

  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <AnimatedSplashOverlay />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: FontFamily.bold, fontSize: 17 },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="habit/[id]" options={{ presentation: 'modal', title: '' }} />
        <Stack.Screen name="friend/[id]" options={{ title: '' }} />
        <Stack.Screen name="pro" options={{ presentation: 'modal', title: '' }} />
      </Stack>
    </ThemeProvider>
  );
}
