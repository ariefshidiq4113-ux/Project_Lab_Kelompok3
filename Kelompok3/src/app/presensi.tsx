/**
 * presensi.tsx
 * Flow 3 langkah: Sesi Valid → Liveness → Cocokkan Wajah
 * Masing-masing step memiliki UI & logika berbeda.
 * Saat ini tanpa kamera nyata — placeholder oval + tombol simulasi.
 * Integrasi expo-camera bisa ditambahkan nanti tanpa mengubah struktur step.
 */

import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { HimaforHeader } from '@/components/himafor-header';

// ─── Constants ────────────────────────────────────────────────────────────────
const NAVY   = '#101477';
const TEAL   = '#39BFB7';
const MUTED  = '#7183A2';
const BORDER = '#DCE5F0';
const RED    = '#C0394F';

// ─── Step definitions ─────────────────────────────────────────────────────────
type StepKey = 'sesi' | 'liveness' | 'cocokkan';

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'sesi',     label: 'Sesi valid'    },
  { key: 'liveness', label: 'Liveness'      },
  { key: 'cocokkan', label: 'Cocokkan wajah'},
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
type StepState = 'pending' | 'active' | 'done';

function StepIndicator({ current }: { current: StepKey }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <View style={stepStyles.row}>
      {STEPS.map((step, i) => {
        const state: StepState =
          i < idx ? 'done' : i === idx ? 'active' : 'pending';
        return (
          <View key={step.key} style={stepStyles.chipWrap}>
            <View style={[
              stepStyles.chip,
              state === 'active'  && stepStyles.chipActive,
              state === 'done'    && stepStyles.chipDone,
              state === 'pending' && stepStyles.chipPending,
            ]}>
              {state === 'done' ? (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  size={11}
                  tintColor="#FFFFFF"
                />
              ) : null}
              <Text style={[
                stepStyles.chipText,
                state === 'active'  && stepStyles.chipTextActive,
                state === 'done'    && stepStyles.chipTextDone,
                state === 'pending' && stepStyles.chipTextPending,
              ]}>
                {step.label}
              </Text>
            </View>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <View style={[stepStyles.connector, i < idx && stepStyles.connectorDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  chipWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5,
  },
  chipActive:  { backgroundColor: NAVY,  borderColor: NAVY  },
  chipDone:    { backgroundColor: TEAL,  borderColor: TEAL  },
  chipPending: { backgroundColor: '#FFF',borderColor: BORDER },
  chipText: { fontSize: 12, fontWeight: '600' },
  chipTextActive:  { color: '#FFF'  },
  chipTextDone:    { color: '#FFF'  },
  chipTextPending: { color: MUTED   },
  connector: { flex: 1, height: 2, backgroundColor: BORDER, marginHorizontal: 4 },
  connectorDone: { backgroundColor: TEAL },
});

// ─── Camera Oval ─────────────────────────────────────────────────────────────
function CameraOval({ scanning }: { scanning: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (scanning) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.04, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
    pulse.setValue(1);
  }, [scanning, pulse]);

  return (
    <View style={ovalStyles.wrapper}>
      <Animated.View style={[ovalStyles.oval, { transform: [{ scale: pulse }] }]}>
        <Text style={ovalStyles.label}>Kamera depan</Text>
        {scanning && <ActivityIndicator color={TEAL} style={{ marginTop: 8 }} />}
      </Animated.View>
    </View>
  );
}

const ovalStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 24 },
  oval: {
    width: 230, height: 280, borderRadius: 115,
    borderWidth: 2.5, borderColor: NAVY, borderStyle: 'dashed',
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  label: { fontSize: 14, color: MUTED },
});

// ─── STEP VIEWS ───────────────────────────────────────────────────────────────

/** Step 1: validasi sesi otomatis */
function StepSesi({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    // Simulasi pengecekan sesi — ganti dengan API call nyata
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={innerStyles.center}>
      <CameraOval scanning />
      <View style={innerStyles.statusBox}>
        <ActivityIndicator color={NAVY} />
        <Text style={innerStyles.statusText}>Memvalidasi sesi presensi…</Text>
      </View>
    </View>
  );
}

/** Step 2: deteksi liveness (kedip mata) */
function StepLiveness({ onSuccess, onFail }: { onSuccess: () => void; onFail: () => void }) {
  const [blinkCount, setBlinkCount] = useState(0);
  const TARGET = 2;

  const handleBlink = () => {
    const next = blinkCount + 1;
    setBlinkCount(next);
    if (next >= TARGET) {
      setTimeout(onSuccess, 400);
    }
  };

  return (
    <View style={innerStyles.flex}>
      <CameraOval scanning={blinkCount > 0 && blinkCount < TARGET} />

      {/* Blink progress dots */}
      <View style={innerStyles.dotsRow}>
        {Array.from({ length: TARGET }).map((_, i) => (
          <View key={i} style={[innerStyles.dot, i < blinkCount && innerStyles.dotFilled]} />
        ))}
      </View>

      {/* Instruction card */}
      <View style={innerStyles.instrCard}>
        <SymbolView
          name={{ ios: 'eye', android: 'visibility', web: 'visibility' }}
          size={20} tintColor={NAVY}
        />
        <Text style={innerStyles.instrText}>Kedipkan mata {TARGET} kali</Text>
      </View>
      <Text style={innerStyles.helper}>
        Jangan gunakan foto atau layar. Wajah harus di dalam bingkai.
      </Text>

      {/* Simulate blink button — hapus & ganti kamera nyata jika sudah integrasi */}
      <Pressable
        onPress={handleBlink}
        accessibilityRole="button"
        style={({ pressed }) => [innerStyles.simBtn, pressed && { opacity: 0.75 }]}>
        <Text style={innerStyles.simBtnText}>
          Kedip ({blinkCount}/{TARGET})
        </Text>
      </Pressable>
    </View>
  );
}

/** Step 3: pencocokan wajah */
function StepCocokkan({ onSuccess, onFail }: { onSuccess: () => void; onFail: () => void }) {
  const [matching, setMatching] = useState(false);

  const handleCocokkan = () => {
    setMatching(true);
    // Simulasi pencocokan 2 detik — ganti dengan API face-matching nyata
    setTimeout(() => {
      setMatching(false);
      onSuccess(); // ganti onFail() untuk simulasi kegagalan
    }, 2000);
  };

  return (
    <View style={innerStyles.flex}>
      <CameraOval scanning={matching} />

      <View style={innerStyles.instrCard}>
        <SymbolView
          name={{ ios: 'person.fill.viewfinder', android: 'face_retouching_natural', web: 'face_retouching_natural' }}
          size={20} tintColor={NAVY}
        />
        <Text style={innerStyles.instrText}>Posisikan wajah di dalam bingkai</Text>
      </View>
      <Text style={innerStyles.helper}>
        Pastikan pencahayaan cukup dan wajah terlihat jelas.
      </Text>

      <Pressable
        onPress={handleCocokkan}
        disabled={matching}
        accessibilityRole="button"
        style={({ pressed }) => [
          innerStyles.simBtn,
          innerStyles.simBtnPrimary,
          (pressed || matching) && { opacity: 0.75 },
        ]}>
        {matching
          ? <ActivityIndicator color="#FFF" />
          : <Text style={[innerStyles.simBtnText, { color: '#FFF' }]}>Cocokkan wajah</Text>}
      </Pressable>
    </View>
  );
}

const innerStyles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
  statusBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 },
  statusText: { fontSize: 14, color: MUTED },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: MUTED },
  dotFilled: { backgroundColor: TEAL, borderColor: TEAL },
  instrCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: NAVY, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12,
  },
  instrText: { fontSize: 14, fontWeight: '600', color: NAVY, flex: 1 },
  helper: { fontSize: 12, color: MUTED, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  simBtn: {
    borderWidth: 1.5, borderColor: NAVY, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 10,
  },
  simBtnPrimary: { backgroundColor: NAVY, borderColor: NAVY },
  simBtnText: { fontSize: 14, fontWeight: '700', color: NAVY },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PresensiScreen() {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>('sesi');

  const goNext = (from: StepKey) => {
    if (from === 'sesi')     setStep('liveness');
    if (from === 'liveness') setStep('cocokkan');
  };

  const handleSuccess = () => router.replace('/presensi-tercatat' as any);
  const handleFail    = () => router.replace('/presensi-ditolak'  as any);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.app}>
        <HimaforHeader />

        <View style={styles.content}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              style={({ pressed }) => pressed && { opacity: 0.6 }}>
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={22} tintColor={NAVY}
              />
            </Pressable>
            <Text style={styles.pageTitle}>Presensi</Text>
          </View>

          {/* Session name */}
          <Text style={styles.sessionName}>Rapat Pengurus HIMAFOR</Text>

          {/* Step indicator */}
          <StepIndicator current={step} />

          {/* Step content */}
          {step === 'sesi' && (
            <StepSesi onDone={() => goNext('sesi')} />
          )}
          {step === 'liveness' && (
            <StepLiveness
              onSuccess={() => goNext('liveness')}
              onFail={handleFail}
            />
          )}
          {step === 'cocokkan' && (
            <StepCocokkan
              onSuccess={handleSuccess}
              onFail={handleFail}
            />
          )}
        </View>

        {/* Footer batal */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Batal presensi"
            style={({ pressed }) => [styles.batalBtn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.batalText}>Batal</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', backgroundColor: '#FFFFFF' },
  app: { flex: 1, width: '100%', maxWidth: 430, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  pageTitle: { fontSize: 27, fontWeight: '800', color: NAVY },
  sessionName: { fontSize: 13, color: MUTED, marginBottom: 20 },
  footer: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 8 },
  batalBtn: { backgroundColor: NAVY, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  batalText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
