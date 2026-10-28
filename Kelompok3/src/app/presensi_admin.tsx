/**
 * presensifix.tsx
 * ---------------------------------------------------------------------------
 * Halaman "Sesi Presensi" (Admin) — HIMAFOR Attendance System
 *
 * Stack     : React Native (Expo) + NativeWind (Tailwind CSS)
 * Dependensi: nativewind, react-native-safe-area-context, @expo/vector-icons
 *
 * Catatan setup NativeWind (jika belum):
 *   1. npm i nativewind tailwindcss react-native-safe-area-context
 *   2. tailwind.config.js -> content: ["./**\/*.{js,jsx,ts,tsx}"]
 *   3. babel.config.js    -> presets: ["babel-preset-expo", "nativewind/babel"]
 *   4. Import "./global.css" (berisi @tailwind base/components/utilities) di root app.
 *
 * Pemakaian: <PresensiFix /> sebagai screen, atau jadikan default export route.
 * ---------------------------------------------------------------------------
 */

import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AdminTabBar } from "@/components/admin-tab-bar";
import { HimaforHeader } from "@/components/himafor-header";

/* ============================== TYPES & DATA ============================== */

type AttendanceStatus = "Hadir" | "Terlambat" | "Izin";

interface AttendanceRecord {
  id: string;
  nama: string;
  email: string;
  waktu: string;
  status: AttendanceStatus;
}

interface ActiveSession {
  judul: string;
  tanggal: string;
  jam: string;
  lokasi: string;
}

/** Ganti dengan data dari API / state global saat integrasi backend. */
const ACTIVE_SESSION: ActiveSession = {
  judul: "Rapat Pengurus HIMAFOR",
  tanggal: "08 Okt 2026",
  jam: "19:00–21:00",
  lokasi: "Sekre HIMAFOR",
};

const INITIAL_RECORDS: AttendanceRecord[] = [
  { id: "1", nama: "[Nama Anggota]", email: "[email]", waktu: "[Jam]", status: "Hadir" },
  { id: "2", nama: "[Nama Anggota]", email: "[email]", waktu: "[Jam]", status: "Hadir" },
  { id: "3", nama: "[Nama Anggota]", email: "[email]", waktu: "[Jam]", status: "Hadir" },
  { id: "4", nama: "[Nama Anggota]", email: "[email]", waktu: "[Jam]", status: "Hadir" },
];

/* =============================== SUB-COMPONENTS ============================ */

const STATUS_STYLE: Record<AttendanceStatus, { bg: string; dot: string; text: string }> = {
  Hadir: { bg: "bg-[#3CC4B9]", dot: "bg-white", text: "text-white" },
  Terlambat: { bg: "bg-[#F5A623]", dot: "bg-white", text: "text-white" },
  Izin: { bg: "bg-[#8A94A6]", dot: "bg-white", text: "text-white" },
};

/** Badge kecil berbentuk pill dengan titik di depan label. */
function StatusBadge({ label, status }: { label: string; status: AttendanceStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <View className={`flex-row items-center rounded-full px-3 py-1 ${s.bg}`}>
      <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${s.dot}`} />
      <Text className={`text-xs font-semibold ${s.text}`}>{label}</Text>
    </View>
  );
}

interface SessionCardProps {
  session: ActiveSession;
  isOpen: boolean;
  onToggle: () => void;
}

function SessionCard({ session, isOpen, onToggle }: SessionCardProps) {
  return (
    <View className="rounded-3xl bg-[#0A0A6B] p-5 shadow-lg">
      {/* Baris atas: label + badge status sesi */}
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
          Kegiatan aktif
        </Text>
        <View
          className={`flex-row items-center rounded-full px-3 py-1 ${
            isOpen ? "bg-[#3CC4B9]" : "bg-[#8A94A6]"
          }`}
        >
          <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
          <Text className="text-xs font-semibold text-white">
            {isOpen ? "Sesi dibuka" : "Sesi ditutup"}
          </Text>
        </View>
      </View>

      {/* Judul */}
      <Text className="mt-3 text-2xl font-bold text-white">{session.judul}</Text>

      {/* Detail waktu & lokasi */}
      <View className="mt-3 flex-row items-center">
        <Feather name="calendar" size={14} color="#C7CCF0" />
        <Text className="ml-2 text-sm text-[#DDE0F7]">
          {session.tanggal} · {session.jam}
        </Text>
      </View>
      <View className="mt-2 flex-row items-center">
        <Feather name="map-pin" size={14} color="#C7CCF0" />
        <Text className="ml-2 text-sm text-[#DDE0F7]">{session.lokasi}</Text>
      </View>

      {/* Tombol tutup / buka sesi */}
      <Pressable
        onPress={onToggle}
        className="mt-5 flex-row items-center justify-center rounded-xl bg-white py-3 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={isOpen ? "Tutup sesi" : "Buka sesi"}
      >
        <Feather name={isOpen ? "pause-circle" : "play-circle"} size={16} color="#2F63B0" />
        <Text className="ml-2 text-sm font-semibold text-[#2F63B0]">
          {isOpen ? "Tutup sesi" : "Buka sesi"}
        </Text>
      </Pressable>
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

function AttendanceCard({ item }: { item: AttendanceRecord }) {
  return (
    <View className="mb-3 rounded-2xl border border-[#E3E8F3] bg-white p-4">
      {/* Avatar + identitas */}
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E8EEFB]">
          <Feather name="user" size={22} color="#7C93C4" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[15px] font-bold text-[#0A0A6B]" numberOfLines={1}>
            {item.nama}
          </Text>
          <Text className="mt-0.5 text-xs text-[#2F63B0]" numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </View>

      <View className="my-3 h-px bg-[#EDF0F7]" />

      {/* Waktu + status */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="clock" size={14} color="#8A94A6" />
          <Text className="ml-2 text-xs text-[#6B7690]">Waktu: {item.waktu}</Text>
        </View>
        <StatusBadge label={item.status} status={item.status} />
      </View>
    </View>
  );
}

/** Empty state saat belum ada anggota yang presensi. */
function EmptyAttendance({ isOpen }: { isOpen: boolean }) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-[#D6DCF0] bg-white px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E8EEFB]">
        <Feather name="users" size={24} color="#7C93C4" />
      </View>
      <Text className="mt-3 text-sm font-semibold text-[#0A0A6B]">Belum ada yang hadir</Text>
      <Text className="mt-1 text-center text-xs text-[#6B7690]">
        {isOpen
          ? "Kehadiran anggota akan muncul di sini secara real-time."
          : "Buka sesi agar anggota dapat melakukan presensi."}
      </Text>
    </View>
  );
}

/* ================================== SCREEN ================================= */

export default function PresensiFix() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [records] = useState<AttendanceRecord[]>(INITIAL_RECORDS);

  const totalLabel = useMemo(() => `${records.length} anggota`, [records.length]);

  const handleToggleSession = () => {
    if (isOpen) {
      Alert.alert("Tutup sesi?", "Anggota tidak dapat presensi lagi setelah sesi ditutup.", [
        { text: "Batal", style: "cancel" },
        { text: "Tutup sesi", style: "destructive", onPress: () => setIsOpen(false) },
      ]);
    } else {
      setIsOpen(true);
    }
  };

  const handleExport = (type: "Excel" | "PDF") => {
    // TODO: hubungkan dengan service ekspor (expo-file-system / expo-sharing / API backend)
    Alert.alert(`Ekspor ${type}`, `Rekap kehadiran akan diekspor ke ${type}.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <HimaforHeader role="Admin" />

      <ScrollView
        className="flex-1 bg-[#F6F8FC]"
        contentContainerClassName="px-5 pb-6 pt-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Kartu sesi aktif */}
        <SessionCard session={ACTIVE_SESSION} isOpen={isOpen} onToggle={handleToggleSession} />

        {/* Tombol ekspor */}
        <View className="mt-4 flex-row gap-3">
          <ExportButton label="Ekspor Excel" icon="file-text" onPress={() => handleExport("Excel")} />
          <ExportButton label="Ekspor PDF" icon="file" onPress={() => handleExport("PDF")} />
        </View>

        {/* Daftar kehadiran */}
        <View className="mb-3 mt-6 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-[#0A0A6B]">Kehadiran anggota</Text>
          <Text className="text-xs text-[#6B7690]">{totalLabel}</Text>
        </View>

        {records.length === 0 ? (
          <EmptyAttendance isOpen={isOpen} />
        ) : (
          records.map((item) => <AttendanceCard key={item.id} item={item} />)
        )}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="bg-white">
        <AdminTabBar />
      </SafeAreaView>
    </SafeAreaView>
  );
}