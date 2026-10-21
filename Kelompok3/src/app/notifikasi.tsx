import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
type TabName = 'beranda' | 'kegiatan' | 'riwayat' | 'profil';

function BottomTabBar({ active }: { active: TabName }) {
  const router = useRouter();

  const tabs: { name: TabName; label: string; icon: string; route: string }[] = [
    { name: 'beranda', label: 'Beranda', icon: '⌂', route: '/' },
    { name: 'kegiatan', label: 'Kegiatan', icon: '▦', route: '/kegiatan' },
    { name: 'riwayat', label: 'Riwayat', icon: '↺', route: '/riwayat' },
    { name: 'profil', label: 'Profil', icon: '○', route: '/profil' },
  ];

  return (
    <View style={tabStyles.bar}>
      {tabs.map((tab) => {
        const isActive = tab.name === active;
        return (
          <TouchableOpacity
            key={tab.name}
            style={tabStyles.tab}
            onPress={() => router.push(tab.route as any)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}>
            <Text style={[tabStyles.icon, isActive && tabStyles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={tabStyles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  iconActive: {
    color: PRIMARY,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  labelActive: {
    color: PRIMARY,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    height: 2,
    width: '60%',
    backgroundColor: PRIMARY,
    borderRadius: 2,
  },
});

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>⚓</Text>
        </View>
        <Text style={styles.headerTitle}>HIMAFOR</Text>
      </View>

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
      <BottomTabBar active="beranda" />
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
