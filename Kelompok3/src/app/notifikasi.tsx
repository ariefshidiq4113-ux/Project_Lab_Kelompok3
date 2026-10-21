import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { MainScreen } from '@/components/main-screen';

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIMARY = '#101477';

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
  const icon =
    item.type === 'sesi'
      ? 'bell'
      : item.type === 'kegiatan'
        ? 'calendar'
        : 'x-circle';

  return (
    <View style={styles.card} accessibilityLabel={`${item.title}. ${item.subtitle}`}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={19} color={PRIMARY} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color="#7183A2" />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NotifikasiScreen() {
  const router = useRouter();

  return (
    <MainScreen activePath="/beranda">
      <View style={styles.pageTitleRow}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={21} color={PRIMARY} />
        </Pressable>
        <Text style={styles.pageTitle}>Notifikasi</Text>
      </View>

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

    </MainScreen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    gap: 10,
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
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 40,
  },

  // Cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 15,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF3FA',
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
});
