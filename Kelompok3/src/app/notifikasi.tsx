import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { HimaforHeader } from '@/components/himafor-header';
import { MainTabBar } from '@/components/main-tab-bar';

// ─── Constants ────────────────────────────────────────────────────────────────
const NAVY = '#101477';
const TEAL = '#39BFB7';
const MUTED = '#7183A2';
const BORDER = '#DCE5F0';

// ─── Types ────────────────────────────────────────────────────────────────────
export type NotifType = 'sesi' | 'kegiatan' | 'ditolak' | 'info';

export interface NotifItem {
  id: string;
  type: NotifType;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
  // detail content
  body: string;
  kegiatanNama?: string;
  kegiatanTanggal?: string;
  kegiatanWaktu?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
export const NOTIFIKASI_DATA: NotifItem[] = [
  {
    id: '1',
    type: 'sesi',
    title: 'Sesi presensi dibuka',
    subtitle: 'Rapat Pengurus HIMAFOR',
    time: '09:00 · Hari ini',
    read: false,
    body: 'Sesi presensi untuk kegiatan Rapat Pengurus HIMAFOR telah dibuka. Segera lakukan presensi sebelum sesi ditutup.',
    kegiatanNama: 'Rapat Pengurus HIMAFOR',
    kegiatanTanggal: '21 Okt 2026',
    kegiatanWaktu: '09:00 – 11:00',
  },
  {
    id: '2',
    type: 'kegiatan',
    title: 'Kegiatan baru ditambahkan',
    subtitle: 'Evaluasi Program Kerja',
    time: '10 Okt 2026',
    read: false,
    body: 'Kegiatan baru telah ditambahkan ke daftar kegiatan HIMAFOR. Pastikan kamu hadir dan melakukan presensi tepat waktu.',
    kegiatanNama: 'Evaluasi Program Kerja',
    kegiatanTanggal: '10 Okt 2026',
    kegiatanWaktu: '19:30 – 21:30',
  },
  {
    id: '3',
    type: 'ditolak',
    title: 'Presensi ditolak',
    subtitle: 'Liveness tidak terdeteksi',
    time: '08 Okt 2026',
    read: true,
    body: 'Presensi kamu ditolak karena sistem tidak dapat mendeteksi liveness. Pastikan wajah terlihat jelas, pencahayaan cukup, dan tidak menggunakan foto atau layar.',
    kegiatanNama: 'Rapat Pengurus HIMAFOR',
    kegiatanTanggal: '08 Okt 2026',
    kegiatanWaktu: '19:00 – 21:00',
  },
  {
    id: '4',
    type: 'info',
    title: 'Pengingat presensi',
    subtitle: 'Koordinasi Divisi dimulai 30 menit lagi',
    time: '06 Okt 2026',
    read: true,
    body: 'Kegiatan Koordinasi Divisi akan dimulai dalam 30 menit. Siapkan dirimu dan pastikan koneksi internet stabil untuk melakukan presensi.',
    kegiatanNama: 'Koordinasi Divisi',
    kegiatanTanggal: '06 Okt 2026',
    kegiatanWaktu: '19:00 – 21:00',
  },
];

// ─── Icon config per type ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<NotifType, {
  iosIcon: string; androidIcon: string;
  iconBg: string; iconColor: string;
  cardBg: string; borderColor: string;
}> = {
  sesi: {
    iosIcon: 'checkmark.circle.fill', androidIcon: 'check_circle',
    iconBg: '#E3F6F1', iconColor: TEAL,
    cardBg: '#F0FDFB', borderColor: TEAL,
  },
  kegiatan: {
    iosIcon: 'calendar.badge.plus', androidIcon: 'calendar_add_on',
    iconBg: '#EAF3FA', iconColor: '#3289D1',
    cardBg: '#F5FAFF', borderColor: '#3289D1',
  },
  ditolak: {
    iosIcon: 'xmark.circle.fill', androidIcon: 'cancel',
    iconBg: '#FDEAEA', iconColor: '#C0394F',
    cardBg: '#FFF5F5', borderColor: '#C0394F',
  },
  info: {
    iosIcon: 'bell.fill', androidIcon: 'notifications',
    iconBg: '#EEF0FB', iconColor: NAVY,
    cardBg: '#FFFFFF', borderColor: BORDER,
  },
};

// ─── Notification Card ────────────────────────────────────────────────────────
function NotifCard({ item, onPress }: { item: NotifItem; onPress: () => void }) {
  const cfg = TYPE_CONFIG[item.type];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: cfg.cardBg, borderColor: cfg.borderColor },
        pressed && styles.cardPressed,
      ]}>

      {/* Unread dot */}
      {!item.read && <View style={styles.unreadDot} />}

      <View style={styles.cardInner}>
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
          <SymbolView
            name={{ ios: cfg.iosIcon as any, android: cfg.androidIcon as any, web: cfg.androidIcon as any }}
            size={20}
            tintColor={cfg.iconColor}
          />
        </View>

        {/* Text */}
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>

        {/* Chevron */}
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={14}
          tintColor={MUTED}
        />
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NotifikasiScreen() {
  const router = useRouter();
  const unreadCount = NOTIFIKASI_DATA.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.app}>
        <HimaforHeader />

        {/* Page title */}
        <View style={styles.pageTitleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.pageTitle}>Notifikasi</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={NOTIFIKASI_DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            <NotifCard
              item={item}
              onPress={() => router.push({ pathname: '/notifikasi-detail', params: { id: item.id } } as any)}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <SymbolView
                name={{ ios: 'bell.slash', android: 'notifications_off', web: 'notifications_off' }}
                size={40}
                tintColor={MUTED}
              />
              <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
            </View>
          }
        />

        <MainTabBar activePath="/beranda" />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', backgroundColor: '#F4F7FC' },
  app: { flex: 1, width: '100%', maxWidth: 430, backgroundColor: '#F4F7FC' },

  pageTitleRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: '#F4F7FC',
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageTitle: { fontSize: 27, fontWeight: '800', color: NAVY },
  unreadBadge: {
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingBottom: 20 },

  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.78 },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TEAL,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: NAVY },
  cardTitleUnread: { fontWeight: '800' },
  cardSubtitle: { fontSize: 12, color: MUTED },
  cardTime: { fontSize: 11, color: MUTED, marginTop: 2 },

  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: MUTED },
});
