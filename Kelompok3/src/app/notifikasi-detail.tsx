import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { HimaforHeader } from '@/components/himafor-header';
import { NOTIFIKASI_DATA, NotifType } from './notifikasi';

// ─── Constants ────────────────────────────────────────────────────────────────
const NAVY = '#101477';
const TEAL = '#39BFB7';
const MUTED = '#7183A2';
const BORDER = '#DCE5F0';

// ─── Icon + label config per type ─────────────────────────────────────────────
const TYPE_CONFIG: Record<NotifType, {
  iosIcon: string; androidIcon: string;
  iconBg: string; iconColor: string;
  label: string; labelColor: string; labelBg: string;
}> = {
  sesi: {
    iosIcon: 'checkmark.circle.fill', androidIcon: 'check_circle',
    iconBg: '#E3F6F1', iconColor: TEAL,
    label: 'Sesi Presensi', labelColor: '#14705F', labelBg: '#E3F6F1',
  },
  kegiatan: {
    iosIcon: 'calendar.badge.plus', androidIcon: 'calendar_add_on',
    iconBg: '#EAF3FA', iconColor: '#3289D1',
    label: 'Kegiatan', labelColor: '#1A5E8A', labelBg: '#EAF3FA',
  },
  ditolak: {
    iosIcon: 'xmark.circle.fill', androidIcon: 'cancel',
    iconBg: '#FDEAEA', iconColor: '#C0394F',
    label: 'Presensi Ditolak', labelColor: '#C0394F', labelBg: '#FDEAEA',
  },
  info: {
    iosIcon: 'bell.fill', androidIcon: 'notifications',
    iconBg: '#EEF0FB', iconColor: NAVY,
    label: 'Informasi', labelColor: NAVY, labelBg: '#EEF0FB',
  },
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({
  iosIcon, androidIcon, label, value,
}: { iosIcon: string; androidIcon: string; label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.iconWrap}>
        <SymbolView
          name={{ ios: iosIcon as any, android: androidIcon as any, web: androidIcon as any }}
          size={15}
          tintColor={MUTED}
        />
      </View>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  iconWrap: { width: 28, alignItems: 'center' },
  label: { flex: 1, fontSize: 13, color: MUTED },
  value: { fontSize: 13, fontWeight: '600', color: NAVY },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NotifikasiDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const notif = NOTIFIKASI_DATA.find((n) => n.id === id);

  if (!notif) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.app}>
          <HimaforHeader />
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Notifikasi tidak ditemukan.</Text>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Kembali</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const cfg = TYPE_CONFIG[notif.type];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.app}>
        <HimaforHeader />

        {/* Back + title bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            style={({ pressed }) => pressed && { opacity: 0.6 }}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={22}
              tintColor={NAVY}
            />
          </Pressable>
          <Text style={styles.topBarTitle}>Detail Notifikasi</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Hero icon + type badge */}
          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: cfg.iconBg }]}>
              <SymbolView
                name={{ ios: cfg.iosIcon as any, android: cfg.androidIcon as any, web: cfg.androidIcon as any }}
                size={34}
                tintColor={cfg.iconColor}
              />
            </View>
            <View style={[styles.typeBadge, { backgroundColor: cfg.labelBg }]}>
              <Text style={[styles.typeBadgeText, { color: cfg.labelColor }]}>{cfg.label}</Text>
            </View>
          </View>

          {/* Title + time */}
          <Text style={styles.title}>{notif.title}</Text>
          <Text style={styles.time}>{notif.time}</Text>

          {/* Body */}
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{notif.body}</Text>
          </View>

          {/* Kegiatan info card */}
          {notif.kegiatanNama && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Detail Kegiatan</Text>
              <View style={styles.divider} />
              <InfoRow
                iosIcon="person.2.fill"
                androidIcon="groups"
                label="Kegiatan"
                value={notif.kegiatanNama}
              />
              <View style={styles.separator} />
              <InfoRow
                iosIcon="calendar"
                androidIcon="calendar_today"
                label="Tanggal"
                value={notif.kegiatanTanggal ?? '-'}
              />
              <View style={styles.separator} />
              <InfoRow
                iosIcon="clock"
                androidIcon="access_time"
                label="Waktu"
                value={notif.kegiatanWaktu ?? '-'}
              />
            </View>
          )}

          {/* CTA for sesi type */}
          {notif.type === 'sesi' && (
            <Pressable
              onPress={() => router.push('/presensi' as any)}
              accessibilityRole="button"
              accessibilityLabel="Presensi sekarang"
              style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.8 }]}>
              <SymbolView
                name={{ ios: 'faceid', android: 'face', web: 'face' }}
                size={18}
                tintColor="#FFFFFF"
              />
              <Text style={styles.ctaText}>Presensi sekarang</Text>
            </Pressable>
          )}

          {/* CTA for ditolak type */}
          {notif.type === 'ditolak' && (
            <Pressable
              onPress={() => router.push('/presensi' as any)}
              accessibilityRole="button"
              accessibilityLabel="Coba lagi presensi"
              style={({ pressed }) => [styles.ctaButton, styles.ctaRetry, pressed && { opacity: 0.8 }]}>
              <SymbolView
                name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                size={18}
                tintColor="#FFFFFF"
              />
              <Text style={styles.ctaText}>Coba lagi</Text>
            </Pressable>
          )}

          {/* CTA for kegiatan type */}
          {notif.type === 'kegiatan' && (
            <Pressable
              onPress={() => router.push('/kegiatan' as any)}
              accessibilityRole="button"
              accessibilityLabel="Lihat kegiatan"
              style={({ pressed }) => [styles.ctaButton, styles.ctaKegiatan, pressed && { opacity: 0.8 }]}>
              <SymbolView
                name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                size={18}
                tintColor="#FFFFFF"
              />
              <Text style={styles.ctaText}>Lihat kegiatan</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center', backgroundColor: '#F4F7FC' },
  app: { flex: 1, width: '100%', maxWidth: 430, backgroundColor: '#F4F7FC' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  topBarTitle: { fontSize: 15, fontWeight: '700', color: NAVY },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },

  // Hero
  hero: { alignItems: 'center', gap: 12, marginBottom: 4 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  typeBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  typeBadgeText: { fontSize: 12, fontWeight: '700' },

  // Title
  title: { fontSize: 20, fontWeight: '800', color: NAVY, textAlign: 'center' },
  time: { fontSize: 12, color: MUTED, textAlign: 'center', marginTop: -8 },

  // Body
  bodyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  bodyText: { fontSize: 14, color: '#20334F', lineHeight: 22 },

  // Info card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  infoCardTitle: { fontSize: 13, fontWeight: '700', color: NAVY, marginBottom: 8 },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 4 },
  separator: { height: 1, backgroundColor: BORDER, marginLeft: 38 },

  // CTA
  ctaButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: TEAL,
    borderRadius: 14, paddingVertical: 16, marginTop: 4,
  },
  ctaRetry: { backgroundColor: '#C0394F' },
  ctaKegiatan: { backgroundColor: NAVY },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Not found
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 15, color: MUTED },
  backBtn: { backgroundColor: NAVY, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText: { color: '#FFFFFF', fontWeight: '700' },
});
