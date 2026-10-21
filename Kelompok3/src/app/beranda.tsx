import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { MainScreen } from '@/components/main-screen';

// ─── Mock data ────────────────────────────────────────────────────────────────
const UPCOMING = [
  { title: 'Rapat Pengurus HIMAFOR', date: '08 Okt 2026', time: '19:00', open: true },
  { title: 'Evaluasi Program Kerja', date: '10 Okt 2026', time: '19:30', open: false },
];

const COLORS = {
  navy: '#101477',
  muted: '#7183A2',
  border: '#DCE5F0',
  teal: '#39BFB7',
  blue: '#3289D1',
};

export default function BerandaScreen() {
  return (
    <MainScreen activePath="/beranda">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <Text style={styles.greeting}>Halo, Anggota 👋</Text>
        <Text style={styles.subGreeting}>Selamat datang di HIMAFOR Attendance</Text>

        {/* Upcoming sessions */}
        <Text style={styles.sectionTitle}>Kegiatan mendatang</Text>
        {UPCOMING.map((item) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => (router as any).push('/kegiatan')}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.date} · {item.time}</Text>
            </View>
            {item.open && (
              <View style={styles.openBadge}>
                <Text style={styles.openBadgeText}>Dibuka</Text>
              </View>
            )}
          </Pressable>
        ))}

        {/* Quick links */}
        <Text style={styles.sectionTitle}>Menu cepat</Text>
        <View style={styles.quickRow}>
          <Pressable
            style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
            onPress={() => (router as any).push('/riwayat')}
            accessibilityRole="button"
            accessibilityLabel="Riwayat presensi">
            <Text style={styles.quickIcon}>📋</Text>
            <Text style={styles.quickLabel}>Riwayat</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
            onPress={() => (router as any).push('/notifikasi')}
            accessibilityRole="button"
            accessibilityLabel="Notifikasi">
            <Text style={styles.quickIcon}>🔔</Text>
            <Text style={styles.quickLabel}>Notifikasi</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]}
            onPress={() => (router as any).push('/profil')}
            accessibilityRole="button"
            accessibilityLabel="Profil">
            <Text style={styles.quickIcon}>👤</Text>
            <Text style={styles.quickLabel}>Profil</Text>
          </Pressable>
        </View>
      </ScrollView>
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20334F',
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.muted,
  },
  openBadge: {
    backgroundColor: '#E3F6F4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  openBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#008B88',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  quickIcon: {
    fontSize: 24,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },
  pressed: {
    opacity: 0.78,
  },
});
