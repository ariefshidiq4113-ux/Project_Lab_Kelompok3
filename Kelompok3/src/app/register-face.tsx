import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { HimaforHeader } from '@/components/himafor-header';
import {  useRouter } from 'expo-router';

const PRIMARY = '#101477';
const TEAL = '#39BFB7';
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
  const [currentSample, setCurrentSample] = useState(2); // 0-indexed, tampil "Sampel 3 dari 5"
  const router = useRouter()

  const handleTakeSample = () => {
    if (currentSample < TOTAL_SAMPLES - 1) {
      setCurrentSample((prev) => prev + 1);
    }
    if(currentSample===4){
        router.replace("/beranda")
    }
  };

  const sampelLabel = `Sampel ${currentSample + 1} dari ${TOTAL_SAMPLES}`;
  const poseInstruction = POSE_INSTRUCTIONS[currentSample] ?? '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <HimaforHeader role="Anggota" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Page title */}
        <Text style={styles.pageTitle}>Daftarkan wajah</Text>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Feather name="maximize" size={19} color={PRIMARY} />
          </View>
          <Text style={styles.infoText}>
            Hanya sekali, setelah login pertama.{'\n'}
            Dibutuhkan 5 sampel dari sudut berbeda.
          </Text>
        </View>

        {/* Camera oval preview */}
        <View style={styles.cameraContainer}>
          <View
            style={[
              styles.ovalOuter,
              { width: cameraWidth, height: Math.min(260, cameraWidth * 1.18) },
            ]}>
            <Text style={styles.cameraPlaceholderText}>Pratinjau kamera</Text>
          </View>
        </View>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: TOTAL_SAMPLES }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i <= currentSample ? styles.dotFilled : styles.dotEmpty,
              ]}
            />
          ))}
        </View>

        {/* Instruction text */}
        <Text style={styles.instructionText}>
          {sampelLabel} · {poseInstruction}
        </Text>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleTakeSample}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ambil sampel">
          <Text style={styles.ctaText}>Ambil sampel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scroll: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  // Content
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  pageTitle: {
    alignSelf: 'flex-start',
    color: PRIMARY,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    width: '100%',
    marginBottom: 32,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    color: '#374151',
    fontSize: 13,
    lineHeight: 20,
  },

  // Camera oval
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ovalOuter: {
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: '#60A5FA',
    borderStyle: 'dashed',
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 14,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotFilled: {
    backgroundColor: TEAL,
  },
  dotEmpty: {
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    backgroundColor: 'transparent',
  },

  // Instruction
  instructionText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 10,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  ctaButton: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
