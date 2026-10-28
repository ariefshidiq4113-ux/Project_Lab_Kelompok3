import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import '@/global.css';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="beranda" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register-face" options={{ headerShown: false }} />
        <Stack.Screen name="presensi-tercatat" options={{ headerShown: false }} />
        <Stack.Screen name="presensi-ditolak" options={{ headerShown: false }} />
        <Stack.Screen name="kegiatan" options={{ headerShown: false }} />
        <Stack.Screen name="detail-kegiatan" options={{ headerShown: false }} />
        <Stack.Screen name="riwayat" options={{ headerShown: false }} />
        <Stack.Screen name="profil" options={{ headerShown: false }} />
        <Stack.Screen name="notifikasi" options={{ headerShown: false }} />
        <Stack.Screen name="notifikasi-detail" options={{ headerShown: false }} />
        <Stack.Screen name="presensi" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
        <Stack.Screen name="anggota_admin" options={{ headerShown: false }} />
        <Stack.Screen name="kegiatan_admin" options={{ headerShown: false }} />
        <Stack.Screen name="presensi_admin" options={{ headerShown: false }} />
        <Stack.Screen name="rekap_admin" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}