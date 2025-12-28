import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fplassistant.app',
  appName: 'FPL Assistant',
  webDir: 'out',
  
  // Server config for development
  server: {
    // Use this for live reload during development
    // url: 'http://YOUR_IP:3000',
    cleartext: true,
  },
  
  // iOS specific config
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0e0b1a',
  },
  
  // Android specific config  
  android: {
    backgroundColor: '#0e0b1a',
  },
  
  // Plugins config
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0e0b1a',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0e0b1a',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    App: {
      // App lifecycle configuration
    },
  },
};

export default config;
