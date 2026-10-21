/**
 * anggotafix.tsx
 * ---------------------------------------------------------------------------
 * Halaman "Kelola Anggota" (Admin) — HIMAFOR Attendance System
 *
 * Stack     : React Native (Expo) + NativeWind (Tailwind CSS)
 * Dependensi: nativewind, react-native-safe-area-context, @expo/vector-icons
 *             (sama dengan presensifix.tsx & kegiatanfix.tsx, tanpa dependensi baru)
 *
 * Fitur:
 *  - Pencarian anggota berdasarkan nama atau email (real-time, tombol hapus teks)
 *  - Jumlah anggota ikut berubah sesuai hasil pencarian
 *  - "Reset wajah" (dengan konfirmasi) mengubah status data wajah menjadi "Belum"
 *  - Empty state saat hasil pencarian kosong / belum ada anggota
 *  - Daftar dapat di-scroll + pull-to-refresh
 *  - Responsif: 1 kolom (HP) -> 2 kolom (tablet / layar lebar), konten dibatasi
 *    lebar maksimum dan diletakkan di tengah
 *
 * Pemakaian: <AnggotaFix /> sebagai screen, atau jadikan default export route.
 * ---------------------------------------------------------------------------
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AdminTabBar } from "@/components/admin-tab-bar";
import { HimaforHeader } from "@/components/himafor-header";

/* ============================== TYPES & DATA ============================== */

type MemberRole = "Pengurus" | "Anggota";
type FaceStatus = "terdaftar" | "belum";

interface Member {
  id: string;
  nama: string;
  email: string;
  role: MemberRole;
  wajah: FaceStatus;
}

/** Data contoh. Ganti dengan data anggota dari database / API. */
const INITIAL_MEMBERS: Member[] = [
  { id: "1", nama: "Ahmad Fauzi", email: "ahmad.fauzi@mail.com", role: "Pengurus", wajah: "terdaftar" },
  { id: "2", nama: "Siti Nurhaliza", email: "siti.nurhaliza@mail.com", role: "Anggota", wajah: "terdaftar" },
  { id: "3", nama: "Rizky Pratama", email: "rizky.pratama@mail.com", role: "Anggota", wajah: "belum" },
  { id: "4", nama: "Dewi Lestari", email: "dewi.lestari@mail.com", role: "Anggota", wajah: "belum" },
];

/* =============================== SUB-COMPONENTS ============================ */

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View>
      <Text className="mb-2 text-sm font-semibold text-[#0A0A6B]">Cari anggota</Text>
      <View className="flex-row items-center rounded-2xl border border-[#E3E8F3] bg-white px-4">
        <Feather name="search" size={18} color="#8A94A6" />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="[nama atau email]"
          placeholderTextColor="#8A94A6"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={Keyboard.dismiss}
          className="ml-3 flex-1 py-3.5 text-sm text-[#0A0A6B]"
          accessibilityLabel="Cari anggota"
        />
        {value.length > 0 && (
          <Pressable
            onPress={() => onChange("")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Hapus pencarian"
          >
            <Feather name="x-circle" size={18} color="#8A94A6" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function FaceBadge({ status }: { status: FaceStatus }) {
  const registered = status === "terdaftar";
  return (
    <View
      className={`flex-row items-center rounded-full px-3 py-1 ${
        registered ? "bg-[#E3F6F1]" : "bg-[#FFF1D6]"
      }`}
    >
      <View
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          registered ? "bg-[#2DB5A3]" : "bg-[#C77A00]"
        }`}
      />
      <Text
        className={`text-xs font-semibold ${registered ? "text-[#14705F]" : "text-[#8A5200]"}`}
      >
        {registered ? "Terdaftar" : "Belum"}
      </Text>
    </View>
  );
}

interface MemberCardProps {
  item: Member;
  onResetFace: (item: Member) => void;
  nameSize: number;
}

function MemberCard({ item, onResetFace, nameSize }: MemberCardProps) {
  return (
    <View className="rounded-3xl border border-[#E3E8F3] bg-white p-4">
      {/* Avatar + identitas + peran */}
      <View className="flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E8F0FB]">
          <Feather name="user" size={22} color="#4387C0" />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="font-bold text-[#0A0A6B]"
            style={{ fontSize: nameSize }}
            numberOfLines={1}
          >
            {item.nama}
          </Text>
          <Text className="mt-0.5 text-xs text-[#6B7690]" numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        <Text className="ml-2 text-xs font-semibold text-[#3B82C4]">{item.role}</Text>
      </View>

      <View className="my-3 h-px bg-[#EDF0F7]" />

      {/* Data wajah */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="maximize" size={16} color="#8A94A6" />
          <Text className="ml-2 text-sm text-[#6B7690]">Data wajah</Text>
        </View>
        <FaceBadge status={item.wajah} />
      </View>

      {/* Tombol reset hanya muncul jika data wajah sudah terdaftar */}
      {item.wajah === "terdaftar" && (
        <Pressable
          onPress={() => onResetFace(item)}
          className="mt-3 flex-row items-center justify-center rounded-xl bg-[#FDE7EA] py-3.5 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel={`Reset wajah ${item.nama}`}
        >
          <Feather name="rotate-ccw" size={16} color="#C0394F" />
          <Text className="ml-2 text-sm font-semibold text-[#C0394F]">Reset wajah</Text>
        </Pressable>
      )}
    </View>
  );
}

function EmptyState({ searching, query }: { searching: boolean; query: string }) {
  return (
    <View className="items-center rounded-3xl border border-dashed border-[#D6DCF0] bg-white px-6 py-12">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E8F0FB]">
        <Feather name={searching ? "search" : "users"} size={24} color="#4387C0" />
      </View>
      <Text className="mt-3 text-base font-semibold text-[#0A0A6B]">
        {searching ? "Anggota tidak ditemukan" : "Belum ada anggota"}
      </Text>
      <Text className="mt-1 text-center text-xs text-[#6B7690]">
        {searching
          ? `Tidak ada hasil untuk "${query}". Coba kata kunci lain.`
          : "Data anggota akan tampil di sini setelah tersedia."}
      </Text>
    </View>
  );
}

/* ================================== SCREEN ================================= */

export default function AnggotaFix() {
  const { width } = useWindowDimensions();

  // ---- Responsif ----
  // < 768  : HP      -> 1 kolom
  // >= 768 : tablet  -> 2 kolom, konten maksimum 960px dan di tengah
  const columns = width >= 768 ? 2 : 1;
  const nameSize = width >= 768 ? 18 : width < 360 ? 14 : 16;
  const sidePadding = width >= 768 ? 24 : 20;

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  /* ---------- Pencarian ---------- */

  const trimmedQuery = query.trim();

  const filtered = useMemo(() => {
    if (!trimmedQuery) return members;
    const q = trimmedQuery.toLowerCase();
    return members.filter(
      (m) => m.nama.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [members, trimmedQuery]);

  /* ---------- Aksi ---------- */

  const handleResetFace = useCallback((item: Member) => {
    Alert.alert(
      "Reset data wajah?",
      `Data wajah ${item.nama} akan dihapus. Anggota perlu mendaftarkan wajah kembali sebelum dapat presensi.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Reset wajah",
          style: "destructive",
          onPress: () => {
            // TODO: panggil API untuk menghapus face embedding anggota di server
            setMembers((prev) =>
              prev.map((m) => (m.id === item.id ? { ...m, wajah: "belum" } : m)),
            );
          },
        },
      ],
    );
  }, []);

  const handleRefresh = useCallback(() => {
    // TODO: ganti dengan fetch ulang data anggota dari API
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4387C0" />
        }
      >
        {/* Wrapper responsif: lebar penuh di HP, maksimum 960 di layar besar */}
        <View className="w-full self-center" style={{ maxWidth: 960 }}>
          <SearchBar value={query} onChange={setQuery} />

          {/* Judul daftar + jumlah */}
          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0A0A6B]">Daftar anggota</Text>
            <Text className="text-xs text-[#6B7690]">{filtered.length} anggota</Text>
          </View>

          {/* Daftar anggota (grid 1 / 2 kolom) */}
          {filtered.length === 0 ? (
            <EmptyState searching={trimmedQuery.length > 0} query={trimmedQuery} />
          ) : (
            <View className="-m-1.5 flex-row flex-wrap">
              {filtered.map((item) => (
                <View key={item.id} className="p-1.5" style={{ width: `${100 / columns}%` }}>
                  <MemberCard item={item} nameSize={nameSize} onResetFace={handleResetFace} />
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