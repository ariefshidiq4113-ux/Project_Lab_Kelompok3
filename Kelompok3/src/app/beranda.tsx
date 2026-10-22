import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MainScreen } from '@/components/main-screen';

const COLORS = {
  navy: '#101477',
  muted: '#657797',
  border: '#DCE5F0',
  teal: '#39BFB7',
  background: '#F4F7FC',
};

const UPCOMING_ACTIVITIES = [
  { title: 'Evaluasi Program Kerja', date: '10 Okt 2026' },
  { title: 'Workshop UI/UX Design', date: '20 Okt 2026' },
];

export default function BerandaScreen() {
  return (
    <MainScreen activePath="/beranda">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Halo, [Nama]</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>[Role]</Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceCard}>
          <Text style={styles.cardHeading}>Kehadiran</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statTile, styles.presentTile]}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Hadir</Text>
            </View>
            <View style={[styles.statTile, styles.absentTile]}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Tidak hadir</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionHeading, styles.todayHeading]}>Kegiatan hari ini</Text>
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>Rapat Pengurus HIMAFOR</Text>
          <View style={styles.todayMeta}>
            <View style={styles.tealDot} />
            <Text style={styles.todayDate}>08 Okt 2026 · 19:00–21:00</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/presensi')}
            style={({ pressed }) => [styles.attendanceButton, pressed && styles.pressed]}>
            <Text style={styles.attendanceButtonText}>PRESENSI</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionHeading, styles.upcomingHeading]}>Kegiatan mendatang</Text>
        {UPCOMING_ACTIVITIES.map((activity) => (
          <Pressable
            key={activity.title}
            accessibilityRole="button"
            accessibilityLabel={`${activity.title}, ${activity.date}`}
            onPress={() => router.push('/kegiatan')}
            style={({ pressed }) => [styles.upcomingCard, pressed && styles.pressed]}>
            <View style={styles.calendarTile}>
              <SymbolView
                name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                size={23}
                tintColor={COLORS.navy}
              />
            </View>
            <View style={styles.upcomingCopy}>
              <Text style={styles.upcomingTitle} numberOfLines={1}>
                {activity.title}
              </Text>
              <Text style={styles.upcomingDate}>{activity.date}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </MainScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 20,
  },
  greetingSection: {
    height: 112,
    paddingHorizontal: 20,
    paddingTop: 25,
    backgroundColor: '#FFFFFF',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    color: COLORS.navy,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
  },
  roleBadge: {
    borderRadius: 18,
    backgroundColor: '#DDEAF5',
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  roleText: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  attendanceCard: {
    padding: 18,
    marginHorizontal: 20,
    marginTop: -40,
    marginBottom: 25,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#172653',
    shadowOpacity: 0.1,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeading: {
    marginBottom: 13,
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statTile: {
    height: 62,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 13,
  },
  presentTile: {
    backgroundColor: '#DDF4F2',
  },
  absentTile: {
    backgroundColor: '#E5EEF5',
  },
  statNumber: {
    color: COLORS.navy,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeading: {
    paddingHorizontal: 20,
    color: COLORS.navy,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  todayHeading: {
    marginBottom: 12,
  },
  todayCard: {
    padding: 17,
    marginHorizontal: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  todayTitle: {
    color: COLORS.navy,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  todayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 18,
  },
  tealDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.teal,
  },
  todayDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  attendanceButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.navy,
  },
  attendanceButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  upcomingHeading: {
    marginBottom: 12,
  },
  upcomingCard: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  calendarTile: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#E1ECF6',
  },
  upcomingCopy: {
    flex: 1,
    gap: 6,
  },
  upcomingTitle: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '700',
  },
  upcomingDate: {
    color: COLORS.muted,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});
