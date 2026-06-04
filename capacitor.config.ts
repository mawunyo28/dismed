import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dismed.app',
  appName: 'Dismed',
  webDir: '.out/',
  server: {
    url: "https://dismed.vercel.app" ,
    cleartext: false

  }

};

export default config;
