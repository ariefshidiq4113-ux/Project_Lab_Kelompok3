import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import {
  AttendanceRecord,
  FilterChips,
  HistoryCard,
  PageTitle,
} from '@/components/attendance-ui';
import { MainScreen } from '@/components/main-screen';
import { apiFetch } from '@/services/api';
import { getToken } from '@/services/auth.service';

// ─── Constants ────────────────────────────────────────────────────────────────
const FILTERS = ['Semua', 'Hadir', 'Tidak hadir'] as const;
type HistoryFilter = (typeof FILTERS)[number];

// ─── Types ────────────────────────────────────────────────────────────────────
interface PresensiItem {
  id: string;
  kegiatanNama: string;
  waktuPresensi: string;
  status: 'hadir' | 'ditolak';
}

interface PresensiResponse {
  total: number;
  data: PresensiItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTanggal(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function RiwayatScreen() {
  const [filter, setFilter]     = useState<HistoryFilter>('Semua');
  const [records, setRecords]   = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── Fetch dari API ──────────────────────────────────────────────────────────
  const fetchRiwayat = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const json = await apiFetch<PresensiResponse>('/presensi/me', { token });

      const mapped: AttendanceRecord[] = json.data.map((item) => ({
        title: item.kegiatanNama,
        date: formatTanggal(item.waktuPresensi),
        present: item.status === 'hadir',
      }));

      setRecords(mapped);
    } catch (err: any) {
      setError(err?.message ?? 'Gagal memuat riwayat presensi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  // ── Filter ──────────────────────────────────────────────────────────────────
  const visibleRecords = useMemo(() => {
    if (filter === 'Hadir')       return records.filter((r) => r.present);
    if (filter === 'Tidak hadir') return records.filter((r) => !r.present);
    return records;
  }, [records, filter]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <MainScreen activePath="/riwayat">
      <ScrollView
        className="flex-1 bg-surface"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRiwayat(true)}
            tintColor="#101477"
          />
        }>
        <View className="pt-[22px] px-5 pb-6">
          <PageTitle>Riwayat presensi</PageTitle>
          <FilterChips options={FILTERS} selected={filter} onSelect={setFilter} />

          {/* Loading */}
          {loading && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator color="#101477" size="large" />
            </View>
          )}

          {/* Error */}
          {!loading && error && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#C0394F', fontSize: 14, textAlign: 'center' }}>
                {error}
              </Text>
            </View>
          )}

          {/* Empty */}
          {!loading && !error && visibleRecords.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#7183A2', fontSize: 14 }}>
                Belum ada riwayat presensi.
              </Text>
            </View>
          )}

          {/* Data */}
          {!loading && !error && (
            <View>
              {visibleRecords.map((record, index) => (
                <HistoryCard key={`${record.present}-${index}`} record={record} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </MainScreen>
  );
}
