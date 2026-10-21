import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <PageTitle>Riwayat presensi</PageTitle>
        <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />
        <View>
          {visibleRecords.map((record, index) => (
            <HistoryCard key={`${record.present}-${index}`} record={record} />
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
