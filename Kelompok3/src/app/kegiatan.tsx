import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Activity, ActivityCard, FilterChips, PageTitle } from '@/components/attendance-ui';
import { MainScreen } from '@/components/main-screen';

const FILTERS = ['Semua', 'Hari ini', 'Selesai'] as const;
type ActivityFilter = (typeof FILTERS)[number];

const ACTIVITIES: Activity[] = [
  {
    title: 'Rapat Pengurus HIMAFOR',
    date: '08 Okt 2026',
    time: '19:00 - 21:00',
    state: 'open',
    venue: 'Sekre HIMAFOR',
    agenda:
      'Evaluasi kegiatan bulan ini berjalan dan persiapan program kerja berikutnya.',
  },
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
        className="flex-1 bg-surface"
        showsVerticalScrollIndicator={false}>
        <View className="pt-[22px] px-5 pb-6">
          <PageTitle>Kegiatan</PageTitle>
          <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
          <View>
            {visibleActivities.map((activity) => (
              <ActivityCard
                key={activity.title}
                activity={activity}
                onPress={() =>
                  router.push({
                    pathname: '/detail-kegiatan',
                    params: {
                      title: activity.title,
                      date: activity.date,
                      time: activity.time,
                      state: activity.state,
                      venue: activity.venue ?? '',
                      agenda: activity.agenda ?? '',
                    },
                  })
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </MainScreen>
  );
}
