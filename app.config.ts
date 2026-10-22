import type { ConfigContext, ExpoConfig } from 'expo/config';

// app.json holds the static config (EAS CLI writes to it); this file only adds
// values that come from the environment.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    // GitHub Pages serves the web preview under /<repo>/, so CI sets this
    baseUrl: process.env.EXPO_BASE_URL || undefined,
  },
});
