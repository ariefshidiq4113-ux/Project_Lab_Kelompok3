import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiFetch } from '@/constants/api';

interface ActivityDetail {
  id: string;
  nama: string;
  tanggal: string;
  jam: string;
  status: 'dibuka' | 'belum' | 'selesai';
  lokasi: string;
  agenda: string;
}

const COLORS = {
  navy: '#101477',
  muted: '#657797',
  border: '#DCE5F0',
  background: '#F4F7FC',
  tealBackground: '#DDF4F2',
  iconBackground: '#E1ECF6',
};

const MONTHS: Record<string, string> = {
  Jan: 'Januari',
  Feb: 'Februari',
  Mar: 'Maret',
  Apr: 'April',
  Mei: 'Mei',
  Jun: 'Juni',
  Jul: 'Juli',
  Agu: 'Agustus',
  Sep: 'September',
  Okt: 'Oktober',
  Nov: 'November',
  Des: 'Desember',
};

function formatDate(date: string) {
  if (!date) return 'Tanggal belum ditentukan';

  const parsed = new Date(date);
  if (!Number.isNaN(parsed.getTime())) {
    const day = parsed.getUTCDate();
    const month = MONTHS[parsed.getUTCMonth()] ?? parsed.getUTCMonth();
    const year = parsed.getUTCFullYear();
    return `${day} ${month} ${year}`;
  }

  const [day, month, year] = date.split(' ');
  return `${day} ${MONTHS[month] ?? month} ${year}`;
}

function DetailRow({
  icon,
  label,
}: {
  icon: 'calendar_month' | 'access_time' | 'location_on';
  label: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <SymbolView
          name={{
            ios:
              icon === 'calendar_month'
                ? 'calendar'
                : icon === 'access_time'
                  ? 'clock'
                  : 'mappin.and.ellipse',
            android: icon,
            web: icon,
          }}
          size={20}
          tintColor={COLORS.navy}
        />
      </View>
      <Text style={styles.detailText}>{label}</Text>
    </View>
  );
}

export default function DetailKegiatanScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    date?: string;
    time?: string;
    state?: string;
    venue?: string;
    agenda?: string;
  }>();

  const [activity, setActivity] = useState<ActivityDetail | null>(null);

  useEffect(() => {
    const activityId = Array.isArray(params.id) ? params.id[0] : params.id;
    if (!activityId) return;

    const loadActivity = async () => {
      try {
        const response = await apiFetch(`/activities/${encodeURIComponent(activityId)}`);
        const payload = await response.json();

        if (!response.ok || !payload?.success || !payload.data) {
          throw new Error(payload?.message || 'Gagal memuat detail kegiatan');
        }

        setActivity(payload.data as ActivityDetail);
      } catch (error) {
        console.warn('Failed to load activity detail', error);
      }
    };

    void loadActivity();
  }, [params.id]);

  const title = activity?.nama || params.title || 'Rapat Pengurus HIMAFOR';
  const date = activity?.tanggal || params.date || '08 Okt 2026';
  const time = activity?.jam || params.time || '19:00 - 21:00';
  const state = activity?.status || (params.state === 'completed' ? 'selesai' : params.state === 'not-open' ? 'belum' : 'dibuka');
  const isOpen = state === 'dibuka';
  const statusLabel = state === 'selesai' ? 'Selesai' : isOpen ? 'Dibuka' : 'Belum Dibuka';
  const venue = activity?.lokasi || params.venue || 'Belum ditentukan';
  const agenda = activity?.agenda || params.agenda || 'Informasi agenda belum tersedia.';

  const stateBadgeStyle = useMemo(() => ({
    backgroundColor: state === 'selesai' ? '#E7ECF4' : state === 'belum' ? '#FFF1D6' : '#DDF4F2',
  }), [state]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.app}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
              size={22}
              tintColor={COLORS.navy}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Kegiatan</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.eventCard}>
            <View style={[styles.statusBadge, styles.eventStatusBadge, stateBadgeStyle]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
            <Text style={styles.eventTitle}>{title}</Text>
            <View style={styles.details}>
              <DetailRow icon="calendar_month" label={formatDate(date)} />
              <DetailRow icon="access_time" label={time.replace(/\s*-\s*/, '–')} />
              <DetailRow icon="location_on" label={venue} />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            <Text style={styles.agendaText}>{agenda}</Text>
          </View>

          <View style={styles.presenceCard}>
            <Text style={styles.sectionTitle}>Status presensi</Text>
            <View style={[styles.statusBadge, stateBadgeStyle]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isOpen }}
            disabled={!isOpen}
            onPress={() => router.push('/presensi')}
            style={({ pressed }) => [
              styles.attendanceButton,
              !isOpen && styles.attendanceButtonDisabled,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.attendanceButtonText}>
              {isOpen ? 'PRESENSI SEKARANG' : 'PRESENSI BELUM DIBUKA'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  app: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
  },
  headerTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  eventCard: {
    padding: 20,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    shadowColor: '#172653',
    shadowOpacity: 0.1,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  statusBadge: {
    minHeight: 31,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: COLORS.tealBackground,
  },
  eventStatusBadge: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    marginTop: 14,
    marginBottom: 21,
    color: COLORS.navy,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
  },
  details: {
    gap: 13,
  },
  detailRow: {
    minHeight: 37,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  detailIcon: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.iconBackground,
  },
  detailText: {
    color: COLORS.navy,
    fontSize: 14,
  },
  infoCard: {
    paddingHorizontal: 19,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    color: COLORS.navy,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  agendaText: {
    marginTop: 14,
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 23,
  },
  presenceCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  attendanceButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.navy,
  },
  attendanceButtonDisabled: {
    opacity: 0.55,
  },
  attendanceButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
