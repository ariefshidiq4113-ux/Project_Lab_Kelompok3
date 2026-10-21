import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
<<<<<<< Updated upstream
      <AppTabs />
=======
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register-face" options={{ headerShown: false }} />
        <Stack.Screen name="presensi-tercatat" options={{ headerShown: false }} />
        <Stack.Screen name="presensi-ditolak" options={{ headerShown: false }} />
        <Stack.Screen name="beranda" options={{ headerShown: false }} />
        <Stack.Screen name="kegiatan" options={{ headerShown: false }} />
        <Stack.Screen name="detail-kegiatan" options={{ headerShown: false }} />
        <Stack.Screen name="riwayat" options={{ headerShown: false }} />
        <Stack.Screen name="profil" options={{ headerShown: false }} />
        <Stack.Screen name="notifikasi" options={{ headerShown: false }} />
        <Stack.Screen name="presensi" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />

        <Stack.Screen name="explore" options={{ title: 'Explore' }} />
        <Stack.Screen name="profil" options={{ headerShown: false }} />
        <Stack.Screen name="notifikasi" options={{ headerShown: false }} />
        <Stack.Screen name="presensi" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
      </Stack>
>>>>>>> Stashed changes
    </ThemeProvider>
  );
}
