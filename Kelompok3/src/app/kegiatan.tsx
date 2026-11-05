import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Activity, ActivityCard, FilterChips, PageTitle } from '@/components/attendance-ui';
import { MainScreen } from '@/components/main-screen';
import { apiFetch } from '@/services/api';

const FILTERS = ['Semua', 'Hari ini', 'Selesai'] as const;
type ActivityFilter = (typeof FILTERS)[number];

interface ApiActivity {
  id: string;
  nama: string;
  tanggal: string;
  jam: string;
  lokasi?: string;
  agenda?: string;
  status: 'dibuka' | 'belum' | 'selesai';
}

interface ActivityListResponse {
  success: boolean;
  data: ApiActivity[];
}

type ActivityItem = Activity & { eventDate: Date; id: string };

function mapActivity(item: ApiActivity): ActivityItem {
  const eventDate = new Date(item.tanggal);
  return {
    id: item.id,
    title: item.nama,
    date: eventDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: item.jam,
    state:
      item.status === 'dibuka'
        ? 'open'
        : item.status === 'selesai'
          ? 'completed'
          : 'not-open',
    venue: item.lokasi ?? '-',
    agenda: item.agenda ?? '-',
    eventDate,
  };
}

export default function KegiatanScreen() {
  const [filter, setFilter] = useState<ActivityFilter>('Semua');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useRef(false);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Memanggil endpoint backend /events yang dikelola oleh eventController.js
      const response = await apiFetch<ActivityListResponse>('/events');
      if (isFocused.current && response && response.data) {
        setActivities(response.data.map(mapActivity));
      }
    } catch (requestError: unknown) {
      if (isFocused.current) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Kegiatan gagal dimuat.',
        );
      }
    } finally {
      if (isFocused.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void loadActivities();
      return () => {
        isFocused.current = false;
      };
    }, [loadActivities]),
  );

  const visibleActivities = activities.filter((activity) => {
    if (filter === 'Hari ini') {
      const today = new Date();
      return (
        activity.eventDate.getFullYear() === today.getFullYear() &&
        activity.eventDate.getMonth() === today.getMonth() &&
        activity.eventDate.getDate() === today.getDate()
      );
    }
    if (filter === 'Selesai') return activity.state === 'completed';
    return true;
  });

  return (
    <MainScreen activePath="/kegiatan">
      <ScrollView
        className="flex-1 bg-surface"
        showsVerticalScrollIndicator={false}>
        <View className="pt-[22px] px-5 pb-6">
          <PageTitle>Kegiatan</PageTitle>
          <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
          <View>
            {loading ? (
              <Text className="py-4 text-center text-muted">Memuat kegiatan...</Text>
            ) : error ? (
              <View className="items-center gap-3 py-4">
                <Text className="text-center text-muted">{error}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadActivities()}>
                  <Text className="font-bold text-navy">Coba lagi</Text>
                </Pressable>
              </View>
            ) : visibleActivities.length === 0 ? (
              <Text className="py-4 text-center text-muted">
                Tidak ada kegiatan untuk filter ini.
              </Text>
            ) : (
              visibleActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onPress={() =>
                    router.push({
                      pathname: '/detail-kegiatan',
                      params: {
                        id: activity.id,
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
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </MainScreen>
  );
}