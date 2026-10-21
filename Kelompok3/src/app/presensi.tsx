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
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { HimaforHeader } from '@/components/himafor-header';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#101477';

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
  const { width } = useWindowDimensions();
  const cameraWidth = Math.min(230, width - 64);
  // Active step – update this as the flow progresses
  const [activeStep] = useState<Step>('liveness');

  const handleBatal = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.app}>
        <HimaforHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
        {/* Page title with back arrow */}
        <View style={styles.pageTitleRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={21} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Presensi</Text>
        </View>

        {/* Session name */}
        <Text style={styles.sessionName}>Rapat Pengurus HIMAFOR</Text>

        {/* Step indicator */}
        <StepIndicator active={activeStep} />

        {/* Camera oval */}
        <View style={styles.cameraWrapper}>
          <View
            style={[
              styles.cameraOval,
              { width: cameraWidth, height: Math.min(280, cameraWidth * 1.22) },
            ]}>
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
        </ScrollView>

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
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },

  // Content
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },

  // Page title row
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
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
    borderRadius: 999,
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
    paddingBottom: 12,
    paddingTop: 10,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
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
