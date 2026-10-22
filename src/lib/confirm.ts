import { Alert, Platform } from 'react-native';

/** Destructive confirmation dialog; react-native-web has no Alert, so web uses window.confirm */
export function confirmDestructive(title: string, message: string, actionLabel: string) {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise<boolean>((resolve) => {
    Alert.alert(title, message, [
      { text: '취소', style: 'cancel', onPress: () => resolve(false) },
      { text: actionLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
