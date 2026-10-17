import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1A237E';
const TEAL = '#26C6B0';

export default function PresensiTercatatScreen() {
  const handleSelesai = () => {
    // TODO: navigate back to home or dashboard
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Success icon */}
        <View style={styles.iconOuterRing}>
          <View style={styles.iconInnerCircle}>
            <Text style={styles.checkmark}>✓</Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 28,
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
  checkmark: {
    color: PRIMARY,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
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
