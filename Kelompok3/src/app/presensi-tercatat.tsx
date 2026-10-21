import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { HimaforHeader } from '@/components/himafor-header';

const PRIMARY = '#101477';
const TEAL = '#39BFB7';

export default function PresensiTercatatScreen() {
  const router = useRouter();

  const handleSelesai = () => {
    router.replace('/kegiatan');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <HimaforHeader />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* Success icon */}
        <View style={styles.iconOuterRing}>
          <View style={styles.iconInnerCircle}>
            <Feather name="check" size={34} color="#FFFFFF" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Presensi tercatat</Text>

        {/* Detail card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Kegiatan</Text>
            <Text style={styles.rowValue}>Rapat Pengurus</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Waktu</Text>
            <Text style={styles.rowValue}>[Jam]</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Metode</Text>
            <Text style={styles.rowValue}>Wajah + liveness</Text>
          </View>
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSelesai}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Selesai">
          <Text style={styles.buttonText}>Selesai</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 24,
  },

  // Success icon
  iconOuterRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInnerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Title
  title: {
    color: PRIMARY,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Detail card
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  rowValue: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },

  // Button
  button: {
    width: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
