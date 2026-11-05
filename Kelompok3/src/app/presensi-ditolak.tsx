/**
 * presensi-ditolak.tsx
 * ---------------------------------------------------------------------------
 * Halaman Presensi Ditolak — HIMAFOR Attendance System
 * Diintegrasikan dengan sistem navigasi Expo Router & route aplikasi.
 * ---------------------------------------------------------------------------
 */

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HimaforHeader } from '@/components/himafor-header';

export default function PresensiDitolakScreen() {
  return (
    <SafeAreaView className="flex-1 items-center bg-white">
      <View className="w-full max-w-[430px] flex-1 bg-white">
        <HimaforHeader />
        
        <View className="flex-1 justify-center px-5">
          {/* Bagian Icon & Keterangan Error */}
          <View className="mb-8 items-center">
            <View className="mb-6 h-[106px] w-[106px] items-center justify-center rounded-full bg-[#EAF2FB]">
              <View className="h-[72px] w-[72px] items-center justify-center rounded-full border-[1.5px] border-blue bg-teal">
                <Feather name="x" size={29} color="#101477" />
              </View>
            </View>
            <Text className="mb-3 text-[26px] font-extrabold text-navy">
              Presensi ditolak
            </Text>
            <Text className="text-center text-[14px] leading-[23px] text-muted">
              Liveness tidak terdeteksi. Pastikan wajah terlihat jelas,
              {'\n'}tanpa foto atau layar.
            </Text>
          </View>

          {/* Tombol Aksi */}
          <View className="gap-[11px]">
            {/* Tombol Coba Lagi: Mengembalikan pengguna ke halaman daftar kegiatan untuk scan ulang */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/kegiatan')}
              className="h-[51px] flex-row items-center justify-center gap-[9px] rounded-xl bg-navy active:opacity-[0.78]">
              <Feather name="rotate-ccw" size={18} color="#FFFFFF" />
              <Text className="text-[14px] font-bold text-white">Coba lagi</Text>
            </Pressable>

            {/* Tombol Hubungi Admin: Mengarahkan ke halaman profil/bantuan */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/profil')}
              className="h-[51px] flex-row items-center justify-center gap-[9px] rounded-xl border border-line bg-white active:opacity-[0.78]">
              <Feather name="message-circle" size={18} color="#101477" />
              <Text className="text-[14px] font-bold text-navy">Hubungi admin</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}