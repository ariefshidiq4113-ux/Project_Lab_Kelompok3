import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Activity, ActivityCard, FilterChips, PageTitle } from '@/components/attendance-ui';
import { MainScreen } from '@/components/main-screen';

const FILTERS = ['Semua', 'Hari ini', 'Selesai'] as const;
type ActivityFilter = (typeof FILTERS)[number];

const ACTIVITIES: Activity[] = [
  { title: 'Rapat Pengurus', date: '08 Okt 2026', time: '19:00 - 21:00', state: 'open' },
  {
    title: 'Evaluasi Program Kerja',
    date: '10 Okt 2026',
    time: '19:30 - 21:30',
    state: 'not-open',
  },
  {
    title: 'Koordinasi Divisi',
    date: '06 Okt 2026',
    time: '19:00 - 21:00',
    state: 'completed',
  },
  {
    title: 'Sosialisasi Program Kerja',
    date: '03 Okt 2026',
    time: '19:30 - 21:30',
    state: 'completed',
  },
];

export default function KegiatanScreen() {
  const [filter, setFilter] = useState<ActivityFilter>('Semua');
  const visibleActivities = useMemo(() => {
    if (filter === 'Hari ini') return ACTIVITIES.filter((activity) => activity.state === 'open');
    if (filter === 'Selesai') {
      return ACTIVITIES.filter((activity) => activity.state === 'completed');
    }
    return ACTIVITIES.filter((activity) => activity.state !== 'completed');
  }, [filter]);

  return (
    <MainScreen activePath="/kegiatan">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <PageTitle>Kegiatan</PageTitle>
        <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
        <View>
          {visibleActivities.map((activity) => (
            <ActivityCard
              key={activity.title}
              activity={activity}
              onPress={() => router.push('/presensi-ditolak')}
            />
          ))}
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
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
