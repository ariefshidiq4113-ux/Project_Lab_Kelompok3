/**
 * rekapfix.tsx
 * ---------------------------------------------------------------------------
 * Halaman "Rekap" (Admin) — HIMAFOR Attendance System
 *
 * Stack     : React Native (Expo) + NativeWind (Tailwind CSS)
 * Dependensi: nativewind, react-native-safe-area-context, @expo/vector-icons
 *             (sama dengan halaman sebelumnya, tanpa dependensi baru)
 *
 * Fitur:
 *  - Filter rekap: dropdown "Kegiatan" dan "Periode" (bottom-sheet picker)
 *  - Ringkasan kehadiran (Hadir / Tidak hadir / Persentase) dihitung otomatis
 *    dari filter yang dipilih
 *  - Rekap per anggota (Hadir / Tidak hadir / Persentase masing-masing anggota)
 *  - Tombol Ekspor Excel & PDF (placeholder, siap disambungkan ke service ekspor)
 *  - Scroll + pull-to-refresh, empty state saat tidak ada kegiatan di periode
 *  - Responsif: 1 kolom (HP) -> 2 kolom (tablet / layar lebar), konten dibatasi
 *    lebar maksimum dan diletakkan di tengah
 *
 * Pemakaian: <RekapFix /> sebagai screen, atau jadikan default export route.
 * ---------------------------------------------------------------------------
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AdminTabBar } from "@/components/admin-tab-bar";
import { HimaforHeader } from "@/components/himafor-header";

/* ============================== TYPES & DATA ============================== */

interface Member {
  id: string;
  nama: string;
}

interface EventItem {
  id: string;
  nama: string;
  periode: string; // contoh: "Oktober 2026"
  hadirIds: string[]; // id anggota yang hadir pada kegiatan ini
}

interface Option {
  value: string;
  label: string;
}

interface MemberRecap {
  member: Member;
  hadir: number;
  tidakHadir: number;
  persen: number;
}

const ALL_EVENTS = "all";

/** Data contoh. Ganti dengan data anggota & presensi dari API / database. */
const MEMBERS: Member[] = [
  { id: "m1", nama: "Ahmad Fauzi" },
  { id: "m2", nama: "Siti Nurhaliza" },
  { id: "m3", nama: "Rizky Pratama" },
  { id: "m4", nama: "Dewi Lestari" },
];

const EVENTS: EventItem[] = [
  { id: "e1", nama: "Rapat Pengurus HIMAFOR", periode: "Oktober 2026", hadirIds: ["m1", "m2", "m3"] },
  { id: "e2", nama: "Evaluasi Program Kerja", periode: "Oktober 2026", hadirIds: ["m1", "m2"] },
  { id: "e3", nama: "Workshop Forensik Digital", periode: "Oktober 2026", hadirIds: ["m1", "m2", "m3", "m4"] },
  { id: "e4", nama: "Rapat Kerja Awal Semester", periode: "September 2026", hadirIds: ["m1", "m4"] },
];

const DEFAULT_PERIOD = "Oktober 2026";

/* ================================ HELPERS ================================== */

const toPercent = (hadir: number, total: number) =>
  total === 0 ? 0 : Math.round((hadir / total) * 100);

/* =============================== SUB-COMPONENTS ============================ */

/* ---------- Dropdown (field + bottom-sheet picker) ---------- */

interface SelectFieldProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-[#0A0A6B]">{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-xl border border-[#E3E8F3] bg-white px-4 py-3.5 active:bg-[#F3F6FC]"
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? ""}`}
      >
        <Text className="flex-1 text-sm text-[#6B7690]" numberOfLines={1}>
          {selected?.label ?? "Pilih"}
        </Text>
        <Feather name="chevron-down" size={18} color="#8A94A6" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable
            onPress={() => {}}
            className="max-h-[70%] w-full self-center rounded-t-3xl bg-white px-5 pb-8 pt-3"
            style={{ maxWidth: 560 }}
          >
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-[#D6DCEA]" />
            <Text className="mb-2 text-base font-bold text-[#0A0A6B]">{label}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`mb-1 flex-row items-center justify-between rounded-xl px-3 py-3.5 active:bg-[#F3F6FC] ${
                      isSelected ? "bg-[#E8F0FB]" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`flex-1 text-sm ${
                        isSelected ? "font-bold text-[#0A0A6B]" : "text-[#3B4560]"
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && <Feather name="check" size={18} color="#4387C0" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ---------- Kartu ringkasan ---------- */

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  value: string;
  valueColor: string;
  label: string;
  valueSize: number;
}

function StatCard({ icon, iconColor, value, valueColor, label, valueSize }: StatCardProps) {
  return (
    <View className="flex-1 rounded-2xl border border-[#E3E8F3] bg-white p-3.5">
      <Feather name={icon} size={20} color={iconColor} />
      <Text
        className="mt-3 font-bold"
        style={{ fontSize: valueSize, color: valueColor }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text className="mt-1 text-[11px] text-[#6B7690]">{label}</Text>
    </View>
  );
}

function ExportButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#E3E8F3] bg-white py-4 active:bg-[#F3F6FC]"
      accessibilityRole="button"
    >
      <Feather name={icon} size={16} color="#2F63B0" />
      <Text className="ml-2 text-sm font-semibold text-[#2F63B0]">{label}</Text>
    </Pressable>
  );
}

/* ---------- Kartu rekap per anggota ---------- */

function RecapCard({ item, valueSize }: { item: MemberRecap; valueSize: number }) {
  return (
    <View className="rounded-3xl border border-[#E3E8F3] bg-white p-4">
      <View className="flex-row items-center">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E8F0FB]">
          <Feather name="user" size={18} color="#4387C0" />
        </View>
        <Text className="ml-3 flex-1 text-[15px] font-bold text-[#0A0A6B]" numberOfLines={1}>
          {item.member.nama}
        </Text>
      </View>

      <View className="my-3 h-px bg-[#EDF0F7]" />

      <View className="flex-row">
        <View className="flex-1">
          <Text className="text-[11px] text-[#6B7690]">Hadir</Text>
          <Text className="mt-1 font-bold text-[#0A0A6B]" style={{ fontSize: valueSize }}>
            {item.hadir}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[11px] text-[#6B7690]">Tidak hadir</Text>
          <Text className="mt-1 font-bold text-[#C0394F]" style={{ fontSize: valueSize }}>
            {item.tidakHadir}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-[11px] text-[#6B7690]">Persentase</Text>
          <Text className="mt-1 font-bold text-[#3B82C4]" style={{ fontSize: valueSize }}>
            {item.persen}%
          </Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="items-center rounded-3xl border border-dashed border-[#D6DCF0] bg-white px-6 py-12">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E8F0FB]">
        <Feather name="bar-chart-2" size={24} color="#4387C0" />
      </View>
      <Text className="mt-3 text-base font-semibold text-[#0A0A6B]">Belum ada data rekap</Text>
      <Text className="mt-1 text-center text-xs text-[#6B7690]">
        Tidak ada kegiatan pada periode ini. Pilih periode lain untuk melihat rekap.
      </Text>
    </View>
  );
}

/* ================================== SCREEN ================================= */

export default function RekapFix() {
  const { width } = useWindowDimensions();

  // ---- Responsif ----
  // < 768  : HP      -> 1 kolom
  // >= 768 : tablet  -> 2 kolom, konten maksimum 960px dan di tengah
  const columns = width >= 768 ? 2 : 1;
  const statSize = width >= 768 ? 28 : width < 360 ? 20 : 24;
  const memberValueSize = width >= 768 ? 22 : width < 360 ? 16 : 18;
  const sidePadding = width >= 768 ? 24 : 20;

  const [periode, setPeriode] = useState<string>(DEFAULT_PERIOD);
  const [kegiatanId, setKegiatanId] = useState<string>(ALL_EVENTS);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------- Opsi filter ---------- */

  const periodOptions: Option[] = useMemo(() => {
    const unique = Array.from(new Set(EVENTS.map((e) => e.periode)));
    return unique.map((p) => ({ value: p, label: p }));
  }, []);

  const eventsInPeriod = useMemo(
    () => EVENTS.filter((e) => e.periode === periode),
    [periode],
  );

  const eventOptions: Option[] = useMemo(
    () => [
      { value: ALL_EVENTS, label: "Semua kegiatan" },
      ...eventsInPeriod.map((e) => ({ value: e.id, label: e.nama })),
    ],
    [eventsInPeriod],
  );

  /* ---------- Perhitungan rekap ---------- */

  const selectedEvents = useMemo(
    () =>
      kegiatanId === ALL_EVENTS
        ? eventsInPeriod
        : eventsInPeriod.filter((e) => e.id === kegiatanId),
    [eventsInPeriod, kegiatanId],
  );

  const memberRecaps: MemberRecap[] = useMemo(() => {
    const total = selectedEvents.length;
    return MEMBERS.map((member) => {
      const hadir = selectedEvents.filter((e) => e.hadirIds.includes(member.id)).length;
      return {
        member,
        hadir,
        tidakHadir: total - hadir,
        persen: toPercent(hadir, total),
      };
    });
  }, [selectedEvents]);

  const summary = useMemo(() => {
    const hadir = memberRecaps.reduce((sum, r) => sum + r.hadir, 0);
    const tidakHadir = memberRecaps.reduce((sum, r) => sum + r.tidakHadir, 0);
    return { hadir, tidakHadir, persen: toPercent(hadir, hadir + tidakHadir) };
  }, [memberRecaps]);

  /* ---------- Aksi ---------- */

  const handlePeriodChange = useCallback((value: string) => {
    setPeriode(value);
    setKegiatanId(ALL_EVENTS); // kegiatan bergantung periode, jadi direset
  }, []);

  const handleExport = useCallback(
    (type: "Excel" | "PDF") => {
      // TODO: hubungkan dengan service ekspor (expo-file-system / expo-sharing / API backend)
      const kegiatan = eventOptions.find((o) => o.value === kegiatanId)?.label ?? "";
      Alert.alert(`Ekspor ${type}`, `Rekap "${kegiatan}" periode ${periode} akan diekspor ke ${type}.`);
    },
    [eventOptions, kegiatanId, periode],
  );

  const handleRefresh = useCallback(() => {
    // TODO: ganti dengan fetch ulang data rekap dari API
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const hasData = selectedEvents.length > 0;

  /* ---------- Render ---------- */

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <HimaforHeader role="Admin" />

      <ScrollView
        className="flex-1 bg-[#F6F8FC]"
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          paddingTop: 20,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4387C0" />
        }
      >
        {/* Wrapper responsif: lebar penuh di HP, maksimum 960 di layar besar */}
        <View className="w-full self-center" style={{ maxWidth: 960 }}>
          {/* Filter rekap */}
          <View className="rounded-3xl border border-[#E3E8F3] bg-white p-4">
            <View className="mb-4 flex-row items-center">
              <Feather name="sliders" size={16} color="#4387C0" />
              <Text className="ml-2 text-[15px] font-bold text-[#0A0A6B]">Filter rekap</Text>
            </View>

            <SelectField
              label="Kegiatan"
              value={kegiatanId}
              options={eventOptions}
              onChange={setKegiatanId}
            />
            <SelectField
              label="Periode"
              value={periode}
              options={periodOptions}
              onChange={handlePeriodChange}
            />
          </View>

          {/* Ringkasan kehadiran */}
          <Text className="mb-3 mt-6 text-lg font-bold text-[#0A0A6B]">Ringkasan kehadiran</Text>
          <View className="flex-row gap-3">
            <StatCard
              icon="user-check"
              iconColor="#2DB5A3"
              value={`${summary.hadir}`}
              valueColor="#0A0A6B"
              label="Hadir"
              valueSize={statSize}
            />
            <StatCard
              icon="user-x"
              iconColor="#C0394F"
              value={`${summary.tidakHadir}`}
              valueColor="#C0394F"
              label="Tidak hadir"
              valueSize={statSize}
            />
            <StatCard
              icon="bar-chart-2"
              iconColor="#3B82C4"
              value={`${summary.persen}%`}
              valueColor="#3B82C4"
              label="Persentase"
              valueSize={statSize}
            />
          </View>

          {/* Tombol ekspor */}
          <View className="mt-5 flex-row gap-3">
            <ExportButton label="Ekspor Excel" icon="file-text" onPress={() => handleExport("Excel")} />
            <ExportButton label="Ekspor PDF" icon="file" onPress={() => handleExport("PDF")} />
          </View>

          {/* Rekap per anggota */}
          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0A0A6B]">Rekap per anggota</Text>
            <Text className="text-xs text-[#6B7690]">{memberRecaps.length} anggota</Text>
          </View>

          {!hasData ? (
            <EmptyState />
          ) : (
            <View className="-m-1.5 flex-row flex-wrap">
              {memberRecaps.map((item) => (
                <View
                  key={item.member.id}
                  className="p-1.5"
                  style={{ width: `${100 / columns}%` }}
                >
                  <RecapCard item={item} valueSize={memberValueSize} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="bg-white">
        <AdminTabBar />
      </SafeAreaView>
    </SafeAreaView>
  );
}