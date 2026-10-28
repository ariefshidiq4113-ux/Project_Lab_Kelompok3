import { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { HimaforHeader } from '@/components/himafor-header';
import { useRouter } from 'expo-router';

/** Hex untuk prop warna ikon (mirror tailwind.config.js). */
const ICON = {
  navy: '#101477',
} as const;

const TOTAL_SAMPLES = 5;

const POSE_INSTRUCTIONS = [
  'Hadap lurus ke kamera',
  'Tengok sedikit ke kanan',
  'Tengok sedikit ke kiri',
  'Tengok sedikit ke kiri',
  'Miringkan kepala sedikit',
];

export default function RegisterFaceScreen() {
  const { width } = useWindowDimensions();
  const cameraWidth = Math.min(220, width - 64);
  const cameraHeight = Math.min(260, cameraWidth * 1.18);
  const [currentSample, setCurrentSample] = useState(2); // 0-indexed, tampil "Sampel 3 dari 5"
  const router = useRouter();

  const handleTakeSample = () => {
    if (currentSample < TOTAL_SAMPLES - 1) {
      setCurrentSample((prev) => prev + 1);
    }
    if (currentSample === 4) {
      router.replace('/beranda');
    }
  };

  const sampelLabel = `Sampel ${currentSample + 1} dari ${TOTAL_SAMPLES}`;
  const poseInstruction = POSE_INSTRUCTIONS[currentSample] ?? '';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <HimaforHeader role="Anggota" />
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="w-full max-w-[640px] flex-grow items-center self-center px-6 pt-6"
        showsVerticalScrollIndicator={false}>
        {/* Page title */}
        <Text className="mb-5 w-full self-start text-2xl font-extrabold text-navy">
          Daftarkan wajah
        </Text>

        {/* Info card */}
        <View className="mb-8 w-full flex-row items-center gap-3 rounded-[14px] bg-info-soft p-4">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-info-icon">
            <Feather name="maximize" size={19} color={ICON.navy} />
          </View>
          <Text className="flex-1 text-[13px] leading-5 text-body">
            Hanya sekali, setelah login pertama.{'\n'}
            Dibutuhkan 5 sampel dari sudut berbeda.
          </Text>
        </View>

        {/* Camera oval preview */}
        <View className="mb-7 items-center justify-center">
          <View
            className="items-center justify-center rounded-full border-[2.5px] border-dashed border-info-ring bg-info-preview"
            style={{ width: cameraWidth, height: cameraHeight }}>
            <Text className="text-sm text-placeholder">Pratinjau kamera</Text>
          </View>
        </View>

        {/* Progress dots */}
        <View className="mb-3 flex-row gap-2.5">
          {Array.from({ length: TOTAL_SAMPLES }).map((_, i) => (
            <View
              key={i}
              className={
                i <= currentSample
                  ? 'h-3 w-3 rounded-full bg-teal'
                  : 'h-3 w-3 rounded-full border-[1.5px] border-placeholder bg-transparent'
              }
            />
          ))}
        </View>

        {/* Instruction text */}
        <Text className="text-center text-[13px] text-subtle">
          {sampelLabel} · {poseInstruction}
        </Text>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="w-full max-w-[640px] self-center px-6 pb-3 pt-2.5">
        <TouchableOpacity
          className="items-center rounded-[14px] bg-teal py-[18px] active:opacity-80"
          onPress={handleTakeSample}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ambil sampel">
          <Text className="text-base font-extrabold text-white">Ambil sampel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
