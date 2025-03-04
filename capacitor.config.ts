import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.admobtest',
  appName: 'admobtest',
  webDir: 'build',
  plugins: {
    AdMob: {
      appId: {
        ios: 'ca-app-pub-3940256099942544~1458002511',
        android: 'ca-app-pub-3940256099942544~3347511713'
      }
    }
  }
};

export default config;
