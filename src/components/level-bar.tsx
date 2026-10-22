import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Thin progress bar toward the next growth level */
export function LevelBar({
  progress,
  color,
  height = 6,
}: {
  progress: number;
  color: string;
  height?: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: theme.backgroundSelected,
        },
      ]}>
      <View
        style={[
          styles.fill,
          {
            borderRadius: height / 2,
            backgroundColor: color,
            width: `${progress * 100}%`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
