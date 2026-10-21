import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1A237E';
const TEAL = '#26C6B0';
const TOTAL_SAMPLES = 5;

const POSE_INSTRUCTIONS = [
  'Hadap lurus ke kamera',
  'Tengok sedikit ke kanan',
  'Tengok sedikit ke kiri',
  'Tengok sedikit ke kiri',
  'Miringkan kepala sedikit',
];

export default function RegisterFaceScreen() {
  const [currentSample, setCurrentSample] = useState(2); // 0-indexed, tampil "Sampel 3 dari 5"

  const handleTakeSample = () => {
    if (currentSample < TOTAL_SAMPLES - 1) {
      setCurrentSample((prev) => prev + 1);
    }
  };

  const sampelLabel = `Sampel ${currentSample + 1} dari ${TOTAL_SAMPLES}`;
  const poseInstruction = POSE_INSTRUCTIONS[currentSample] ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoLetter}>H</Text>
          </View>
          <Text style={styles.headerTitle}>HIMAFOR</Text>
        </View>
        <View style={styles.anggotaBadge}>
          <Text style={styles.anggotaText}>Anggota</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        {/* Page title */}
        <Text style={styles.pageTitle}>Daftarkan wajah</Text>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            {/* Face scan icon using unicode approximation */}
            <Text style={styles.infoIcon}>⬚</Text>
          </View>
          <Text style={styles.infoText}>
            Hanya sekali, setelah login pertama.{'\n'}
            Dibutuhkan 5 sampel dari sudut berbeda.
          </Text>
        </View>

        {/* Camera oval preview */}
        <View style={styles.cameraContainer}>
          <View style={styles.ovalOuter}>
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
      </View>

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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    color: PRIMARY,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  anggotaBadge: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  anggotaText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  // Content
  content: {
    flex: 1,
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
  infoIcon: {
    fontSize: 18,
    color: PRIMARY,
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
    width: 220,
    height: 260,
    borderRadius: 110,
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
    paddingBottom: 24,
    paddingTop: 12,
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
