import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ozichat.android',
  appName: 'Ozichat',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // For development: uncomment next two lines to use live reload from dev server
    // url: 'http://192.168.0.9:3000',
    // cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0B0E14",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    }
  }
};

export default config;
