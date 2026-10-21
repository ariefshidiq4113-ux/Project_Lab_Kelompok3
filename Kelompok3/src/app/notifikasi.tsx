import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HimaforHeader } from '@/components/himafor-header';
import { MainTabBar } from '@/components/main-tab-bar';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#1A237E';
const TEAL_BG = '#E0F7F5';
const TEAL_BORDER = '#26A69A';

// ─── Types ────────────────────────────────────────────────────────────────────
type NotifType = 'sesi' | 'kegiatan' | 'ditolak';

interface Notifikasi {
  id: string;
  type: NotifType;
  title: string;
  subtitle: string;
}

// ─── Mock data – replace with real API/context ────────────────────────────────
const NOTIFIKASI_DATA: Notifikasi[] = [
  {
    id: '1',
    type: 'sesi',
    title: 'Sesi presensi dibuka',
    subtitle: 'Rapat Pengurus HIMAFOR · 09:00',
  },
  {
    id: '2',
    type: 'kegiatan',
    title: 'Kegiatan baru ditambahkan',
    subtitle: 'Evaluasi Program Kerja · 10 Okt 2026',
  },
  {
    id: '3',
    type: 'ditolak',
    title: 'Presensi ditolak',
    subtitle: 'Liveness tidak terdeteksi · 10 Okt 2026',
  },
];

// ─── Notification Card ────────────────────────────────────────────────────────
function NotifCard({ item }: { item: Notifikasi }) {
  // The first item (type === 'sesi') uses the teal highlight style
  const isHighlighted = item.type === 'sesi';

  return (
    <View
      style={[
        styles.card,
        isHighlighted ? styles.cardHighlighted : styles.cardDefault,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${item.title}. ${item.subtitle}`}>
      <Text
        style={[
          styles.cardTitle,
          isHighlighted && styles.cardTitleHighlighted,
        ]}>
        {item.title}
      </Text>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NotifikasiScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.app}>
        <HimaforHeader />

        {/* ── Page title with back button ── */}
      <View style={styles.pageTitleRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Notifikasi</Text>
      </View>

      {/* ── Notification list ── */}
      <FlatList
        data={NOTIFIKASI_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotifCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Tidak ada notifikasi.</Text>
        }
      />

        {/* ── Bottom Tab Bar ── */}
        <MainTabBar activePath="/beranda" />
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

  // Page title row
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
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

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 40,
  },

  // Cards
  card: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  cardHighlighted: {
    backgroundColor: TEAL_BG,
    borderWidth: 1.5,
    borderColor: TEAL_BORDER,
  },
  cardDefault: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  cardTitleHighlighted: {
    color: TEAL_BORDER,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
});
