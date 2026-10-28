import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { HimaforHeader } from '@/components/himafor-header';

export default function PresensiTercatatScreen() {
  const router = useRouter();

  const handleSelesai = () => {
    router.replace('/kegiatan');
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <HimaforHeader />
      <ScrollView
        contentContainerClassName="w-full max-w-[640px] flex-grow items-center justify-center gap-6 self-center px-5 py-8"
        showsVerticalScrollIndicator={false}>
        {/* Success icon */}
        <View className="h-[110px] w-[110px] items-center justify-center rounded-full bg-success-soft">
          <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-teal">
            <Feather name="check" size={34} color="#FFFFFF" />
          </View>
        </View>

        {/* Title */}
        <Text className="text-center text-[26px] font-extrabold text-navy">
          Presensi tercatat
        </Text>

        {/* Detail card */}
        <View className="w-full rounded-[14px] border border-card-line px-5 py-1">
          <View className="flex-row items-center justify-between border-b border-divider py-3.5">
            <Text className="text-sm text-subtle">Kegiatan</Text>
            <Text className="text-sm font-bold text-navy">Rapat Pengurus</Text>
          </View>
          <View className="flex-row items-center justify-between border-b border-divider py-3.5">
            <Text className="text-sm text-subtle">Waktu</Text>
            <Text className="text-sm font-bold text-navy">[Jam]</Text>
          </View>
          <View className="flex-row items-center justify-between py-3.5">
            <Text className="text-sm text-subtle">Metode</Text>
            <Text className="text-sm font-bold text-navy">Wajah + liveness</Text>
          </View>
        </View>

        {/* CTA button */}
        <TouchableOpacity
          className="w-full items-center rounded-xl bg-navy py-[17px] active:opacity-80"
          onPress={handleSelesai}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Selesai">
          <Text className="text-base font-bold text-white">Selesai</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
