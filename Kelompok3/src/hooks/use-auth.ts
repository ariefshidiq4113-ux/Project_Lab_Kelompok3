import { Platform } from 'react-native';

const TOKEN_KEY = 'himafor_token';

/**
 * Simpan token setelah login.
 * Pakai localStorage di web, AsyncStorage di native (kalau sudah install).
 */
export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    // TODO: ganti dengan AsyncStorage saat sudah install
    // await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('[saveToken] token:', token);
  }
}

/**
 * Ambil token yang tersimpan.
 */
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    // TODO: ganti dengan AsyncStorage saat sudah install
    return null;
  }
}

/**
 * Hapus token saat logout.
 */
export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    // TODO: ganti dengan AsyncStorage saat sudah install
  }
}
