import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  AttendanceRecord,
  FilterChips,
  HistoryCard,
  PageTitle,
} from '@/components/attendance-ui';
import { MainScreen } from '@/components/main-screen';

const FILTERS = ['Semua', 'Hadir', 'Tidak hadir'] as const;
type HistoryFilter = (typeof FILTERS)[number];

const RECORDS: AttendanceRecord[] = [
  { title: '[Nama Kegiatan]', date: '[Tanggal]', present: true },
  { title: '[Nama Kegiatan]', date: '[Tanggal]', present: true },
  { title: '[Nama Kegiatan]', date: '[Tanggal]', present: false },
  { title: '[Nama Kegiatan]', date: '[Tanggal]', present: true },
];

export default function RiwayatScreen() {
  const [filter, setFilter] = useState<HistoryFilter>('Semua');
  const visibleRecords = useMemo(() => {
    if (filter === 'Hadir') return RECORDS.filter((record) => record.present);
    if (filter === 'Tidak hadir') return RECORDS.filter((record) => !record.present);
    return RECORDS;
  }, [filter]);

  return (
    <MainScreen activePath="/riwayat">
      <ScrollView
        className="flex-1 bg-surface"
        showsVerticalScrollIndicator={false}>
        <View className="pt-[22px] px-5 pb-6">
          <PageTitle>Riwayat presensi</PageTitle>
          <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
          <View>
            {visibleRecords.map((record, index) => (
              <HistoryCard key={`${record.present}-${index}`} record={record} />
            ))}
          </View>
        </View>
      </ScrollView>
    </MainScreen>
  );
}
