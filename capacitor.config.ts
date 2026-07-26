import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.voltaic.app',
  appName: 'Voltaic',
  webDir: 'out',
  server: {
    url: 'http://localhost:3002',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: true,
    scrollEnabled: true,
  }
};

export default config;
