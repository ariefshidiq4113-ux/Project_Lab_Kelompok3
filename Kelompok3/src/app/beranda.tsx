import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { apiFetch } from '@/constants/api';
import { MainScreen } from '@/components/main-screen';
import { getMember } from '@/services/auth.service';

interface ActivityResponse {
  id: string;
  nama: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  status: 'dibuka' | 'belum' | 'selesai';
  agenda?: string;
}

const COLORS = {
  navy: '#101477',
  muted: '#657797',
  border: '#DCE5F0',
  teal: '#39BFB7',
  background: '#F4F7FC',
};

function formatActivityDate(dateValue: string) {
  if (!dateValue) return 'Tanggal belum ditentukan';

  const parsed = new Date(dateValue);
  if (!Number.isNaN(parsed.getTime())) {
    const day = parsed.getUTCDate();
    const month = MONTHS[parsed.getUTCMonth()];
    const year = parsed.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  return dateValue;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function BerandaScreen() {
  const [memberName, setMemberName] = useState('Anggota');
  const [memberRole, setMemberRole] = useState('Anggota');
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ hadir: 0, tidakHadir: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const member = await getMember();
        if (member) {
          setMemberName(member.nama || 'Anggota');
          setMemberRole(member.isAdmin ? 'Admin' : 'Anggota');
        }

        const activityResponse = await apiFetch('/activities');
        const activityPayload = await activityResponse.json();
        if (!activityResponse.ok || !activityPayload?.success) {
          throw new Error(activityPayload?.message || 'Gagal memuat kegiatan');
        }
        setActivities(Array.isArray(activityPayload.data) ? activityPayload.data : []);

        const recapResponse = await apiFetch('/attendance/recap');
        const recapPayload = await recapResponse.json();
        if (!recapResponse.ok || !recapPayload?.success) {
          throw new Error(recapPayload?.message || 'Gagal memuat rekap kehadiran');
        }

        const summary = recapPayload.summary ?? {};
        setAttendanceSummary({
          hadir: Number(summary.hadir ?? 0),
          tidakHadir: Number(summary.tidakHadir ?? 0),
        });
      } catch (error) {
        console.warn('Failed to load beranda data', error);
        setActivities([]);
        setAttendanceSummary({ hadir: 0, tidakHadir: 0 });
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const todayActivity = useMemo(() => {
    if (!activities.length) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return activities.find((activity) => {
      const date = new Date(activity.tanggal);
      return date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
    }) || activities.find((activity) => new Date(activity.tanggal) >= now) || activities[0];
  }, [activities]);

  const upcomingActivities = useMemo(() => {
    const list = activities.filter((activity) => activity.id !== todayActivity?.id);
    return list.slice(0, 2);
  }, [activities, todayActivity]);

  return (
    <MainScreen activePath="/beranda" showNotifications>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Halo, {memberName}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{memberRole}</Text>
            </View>
          </View>
        </View>

        <View style={styles.attendanceCard}>
          <Text style={styles.cardHeading}>Kehadiran</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statTile, styles.presentTile]}>
              <Text style={styles.statNumber}>{loading ? '—' : attendanceSummary.hadir}</Text>
              <Text style={styles.statLabel}>Hadir</Text>
            </View>
            <View style={[styles.statTile, styles.absentTile]}>
              <Text style={styles.statNumber}>{loading ? '—' : attendanceSummary.tidakHadir}</Text>
              <Text style={styles.statLabel}>Tidak hadir</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionHeading, styles.todayHeading]}>Kegiatan hari ini</Text>
        <View style={styles.todayCard}>
          <Text style={styles.todayTitle}>{todayActivity?.nama || 'Belum ada kegiatan yang tersedia'}</Text>
          <View style={styles.todayMeta}>
            <View style={styles.tealDot} />
            <Text style={styles.todayDate}>
              {todayActivity ? `${formatActivityDate(todayActivity.tanggal)} · ${todayActivity.jam}` : 'Data kegiatan belum tersedia'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!todayActivity}
            onPress={() => {
              if (!todayActivity) return;
              router.push({
                pathname: '/detail-kegiatan',
                params: {
                  id: todayActivity.id,
                  title: todayActivity.nama,
                  date: formatActivityDate(todayActivity.tanggal),
                  time: todayActivity.jam,
                  state: todayActivity.status,
                  venue: todayActivity.lokasi || '',
                  agenda: todayActivity.agenda || '',
                },
              });
            }}
            style={({ pressed }) => [styles.attendanceButton, (!todayActivity || loading) && styles.attendanceButtonDisabled, pressed && styles.pressed]}>
            <Text style={styles.attendanceButtonText}>PRESENSI</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionHeading, styles.upcomingHeading]}>Kegiatan mendatang</Text>
        {upcomingActivities.length > 0 ? upcomingActivities.map((activity) => (
          <Pressable
            key={activity.id}
            accessibilityRole="button"
            accessibilityLabel={`${activity.nama}, ${formatActivityDate(activity.tanggal)}`}
            onPress={() => router.push({
              pathname: '/detail-kegiatan',
              params: {
                id: activity.id,
                title: activity.nama,
                date: formatActivityDate(activity.tanggal),
                time: activity.jam,
                state: activity.status,
                venue: activity.lokasi || '',
                agenda: activity.agenda || '',
              },
            })}
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
                {activity.nama}
              </Text>
              <Text style={styles.upcomingDate}>{formatActivityDate(activity.tanggal)}</Text>
            </View>
          </Pressable>
        )) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada kegiatan mendatang.</Text>
          </View>
        )}
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
  attendanceButtonDisabled: {
    opacity: 0.5,
  },
  emptyCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
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
