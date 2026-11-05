import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  AttendanceRecord,
  FilterChips,
  HistoryCard,
  PageTitle,
} from '@/components/attendance-ui';
import { MainScreen } from '@/components/main-screen';
import { apiFetch } from '@/services/api';

const FILTERS = ['Semua', 'Hadir', 'Tidak hadir'] as const;
type HistoryFilter = (typeof FILTERS)[number];

interface ApiAttendanceRecord {
  id: string;
  eventId: {
    nama: string;
    tanggal: string;
  };
  waktu: string;
  status: 'Hadir' | 'Terlambat' | 'Izin';
}

interface AttendanceListResponse {
  success: boolean;
  data: ApiAttendanceRecord[];
}

export default function RiwayatScreen() {
  const [filter, setFilter] = useState<HistoryFilter>('Semua');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFocused = useRef(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mengambil riwayat presensi dari backend
      // Sesuaikan endpoint dengan ID anggota yang sedang login atau route riwayat user
      const response = await apiFetch<AttendanceListResponse>('/attendance/my-history');
      if (isFocused.current && response && response.data) {
        const mappedRecords: AttendanceRecord[] = response.data.map((item) => ({
          title: item.eventId?.nama || 'Kegiatan HIMAFOR',
          date: item.eventId?.tanggal || item.waktu,
          present: item.status === 'Hadir' || item.status === 'Terlambat',
        }));
        setRecords(mappedRecords);
      }
    } catch (requestError: unknown) {
      if (isFocused.current) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Gagal memuat riwayat presensi.',
        );
      }
    } finally {
      if (isFocused.current) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void loadHistory();
      return () => {
        isFocused.current = false;
      };
    }, [loadHistory]),
  );

  const visibleRecords = useMemo(() => {
    if (filter === 'Hadir') return records.filter((record) => record.present);
    if (filter === 'Tidak hadir') return records.filter((record) => !record.present);
    return records;
  }, [filter, records]);

  return (
    <MainScreen activePath="/riwayat">
      <ScrollView
        className="flex-1 bg-surface"
        showsVerticalScrollIndicator={false}>
        <View className="pt-[22px] px-5 pb-6">
          <PageTitle>Riwayat presensi</PageTitle>
          <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
          <View>
            {loading ? (
              <Text className="py-4 text-center text-muted">Memuat riwayat...</Text>
            ) : error ? (
              <View className="items-center gap-3 py-4">
                <Text className="text-center text-muted">{error}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadHistory()}>
                  <Text className="font-bold text-navy">Coba lagi</Text>
                </Pressable>
              </View>
            ) : visibleRecords.length === 0 ? (
              <Text className="py-4 text-center text-muted">
                Tidak ada riwayat presensi untuk filter ini.
              </Text>
            ) : (
              visibleRecords.map((record, index) => (
                <HistoryCard key={`${record.present}-${index}`} record={record} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </MainScreen>
  );
}