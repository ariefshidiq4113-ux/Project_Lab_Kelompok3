import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#1A237E';

// ─── Step definitions ─────────────────────────────────────────────────────────
type Step = 'sesi' | 'liveness' | 'cocokkan';

const STEPS: { key: Step; label: string }[] = [
  { key: 'sesi', label: 'Sesi valid' },
  { key: 'liveness', label: 'Liveness' },
  { key: 'cocokkan', label: 'Cocokkan wajah' },
];

// ─── Liveness instructions per active step ────────────────────────────────────
const LIVENESS_INSTRUCTION = 'Kedipkan mata dua kali';

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ active }: { active: Step }) {
  return (
    <View style={stepStyles.row}>
      {STEPS.map((step) => {
        const isActive = step.key === active;
        return (
          <View
            key={step.key}
            style={[
              stepStyles.chip,
              isActive ? stepStyles.chipActive : stepStyles.chipDefault,
            ]}
            accessibilityRole="text"
            accessibilityLabel={`${step.label}${isActive ? ', aktif' : ''}`}>
            <Text
              style={[
                stepStyles.chipText,
                isActive ? stepStyles.chipTextActive : stepStyles.chipTextDefault,
              ]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  chipDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: PRIMARY,
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextDefault: {
    color: PRIMARY,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PresensiScreen() {
  const router = useRouter();
  // Active step – update this as the flow progresses
  const [activeStep] = useState<Step>('liveness');

  const handleBatal = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── App Header ── */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>⚓</Text>
        </View>
        <Text style={styles.headerTitle}>HIMAFOR</Text>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Page title with back arrow */}
        <View style={styles.pageTitleRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Presensi</Text>
        </View>

        {/* Session name */}
        <Text style={styles.sessionName}>Rapat Pengurus HIMAFOR</Text>

        {/* Step indicator */}
        <StepIndicator active={activeStep} />

        {/* Camera oval */}
        <View style={styles.cameraWrapper}>
          <View style={styles.cameraOval}>
            <Text style={styles.cameraLabel}>Kamera depan</Text>
          </View>
        </View>

        {/* Liveness instruction button */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>{LIVENESS_INSTRUCTION}</Text>
        </View>

        {/* Helper note */}
        <Text style={styles.helperText}>
          Jangan gunakan foto atau layar. Wajah harus di dalam bingkai.
        </Text>
      </View>

      {/* ── Cancel button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.batalButton}
          onPress={handleBatal}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Batal presensi">
          <Text style={styles.batalText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    color: PRIMARY,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: 1,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Page title row
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 22,
    color: PRIMARY,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PRIMARY,
  },

  // Session name
  sessionName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },

  // Camera oval
  cameraWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cameraOval: {
    width: 230,
    height: 280,
    borderRadius: 115,
    borderWidth: 2,
    borderColor: PRIMARY,
    borderStyle: 'dashed',
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Instruction box
  instructionBox: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  instructionText: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY,
  },

  // Helper note
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 12,
  },
  batalButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  batalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
