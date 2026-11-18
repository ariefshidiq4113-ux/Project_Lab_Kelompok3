/**
 * anggota_admin.tsx
 * ---------------------------------------------------------------------------
 * Halaman "Kelola Anggota" (Admin) — HIMAFOR Attendance System
 *
 * Fitur CRUD:
 *  - [READ]   : Menampilkan daftar anggota & pencarian real-time.
 *  - [CREATE] : Tombol & modal "Tambah anggota" untuk membuat data baru.
 *  - [UPDATE] : Tombol Edit untuk mengubah nama, email, dan peran anggota,
 *               serta tombol Reset Wajah.
 *  - [DELETE] : Tombol Hapus anggota dengan konfirmasi.
 * ---------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { API_BASE_URL } from "@/constants/api";

/* ============================== TYPES & DATA ============================== */

type MemberRole = "Pengurus" | "Anggota";
type FaceStatus = "terdaftar" | "belum";

interface Member {
  id: string;
  nim: string;
  nama: string;
  email: string;
  role: MemberRole;
  wajah: FaceStatus;
}

interface MemberForm {
  nim: string;
  nama: string;
  email: string;
  role: MemberRole;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseMember(value: unknown): Member {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.nim !== "string" ||
    typeof value.nama !== "string" ||
    typeof value.email !== "string" ||
    (value.role !== "Pengurus" && value.role !== "Anggota") ||
    (value.wajah !== "terdaftar" && value.wajah !== "belum")
  ) {
    throw new Error("Format data anggota dari server tidak valid.");
  }
  return {
    id: value.id,
    nim: value.nim,
    nama: value.nama,
    email: value.email,
    role: value.role,
    wajah: value.wajah,
  };
}

async function requestApi(path: string, init?: RequestInit): Promise<unknown> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL belum dikonfigurasi.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.message === "string"
      ? payload.message
      : `Permintaan gagal (${response.status}).`;
    throw new Error(message);
  }
  return payload;
}

function parseMemberResponse(payload: unknown): Member {
  if (!isRecord(payload) || payload.success !== true) {
    throw new Error("Server tidak mengembalikan data anggota yang valid.");
  }
  return parseMember(payload.data);
}

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
  onEdit: (item: Member) => void;
  onDelete: (item: Member) => void;
  nameSize: number;
}

function MemberCard({ item, onResetFace, onEdit, onDelete, nameSize }: MemberCardProps) {
  return (
    <View className="rounded-3xl border border-[#E3E8F3] bg-white p-4">
      {/* Baris Atas: Avatar + Identitas + Tombol Edit/Hapus */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1 pr-2">
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
        </View>

        {/* Tombol Aksi (Edit & Delete) */}
        <View className="flex-row items-center">
          <Pressable onPress={() => onEdit(item)} className="p-2 active:opacity-50">
            <Feather name="edit-2" size={16} color="#6B7690" />
          </Pressable>
          <Pressable onPress={() => onDelete(item)} className="p-2 active:opacity-50">
            <Feather name="trash-2" size={16} color="#D8283A" />
          </Pressable>
        </View>
      </View>

      <View className="my-3 h-px bg-[#EDF0F7]" />

      {/* Peran & Status Wajah */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold text-[#3B82C4]">{item.role}</Text>
        <View className="flex-row items-center">
          <Text className="mr-2 text-xs text-[#6B7690]">Wajah:</Text>
          <FaceBadge status={item.wajah} />
        </View>
      </View>

      {/* Tombol reset wajah jika sudah terdaftar */}
      {item.wajah === "terdaftar" && (
        <Pressable
          onPress={() => onResetFace(item)}
          className="mt-3 flex-row items-center justify-center rounded-xl bg-[#FDE7EA] py-3 active:opacity-70"
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

function EmptyState({ searching, query, onAdd }: { searching: boolean; query: string; onAdd: () => void }) {
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
          : "Tambahkan anggota pertama untuk mulai mengelola sistem."}
      </Text>
      {!searching && (
        <Pressable onPress={onAdd} className="mt-4 rounded-xl bg-[#4387C0] px-5 py-2.5 active:opacity-80">
          <Text className="text-sm font-semibold text-white">Tambah anggota</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ========================= MODAL FORM TAMBAH/EDIT ========================= */

interface MemberModalProps {
  visible: boolean;
  initialData: Member | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (form: MemberForm, isEdit: boolean) => Promise<boolean>;
}

function MemberFormModal({ visible, initialData, submitting, onClose, onSubmit }: MemberModalProps) {
  const [nim, setNim] = useState(initialData?.nim ?? "");
  const [nama, setNama] = useState(initialData?.nama ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [role, setRole] = useState<MemberRole>(initialData?.role ?? "Anggota");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!nama.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    if (!initialData && !nim.trim()) {
      setError("NIM wajib diisi.");
      return;
    }
    const saved = await onSubmit(
      { nim: nim.trim(), nama: nama.trim(), email: email.trim(), role },
      !!initialData,
    );
    if (saved) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <Pressable className="flex-1 items-center justify-center bg-black/50 px-4" onPress={onClose}>
          <Pressable onPress={() => {}} className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6">
            
            {/* Header Modal */}
            <View className="flex-row items-center justify-between pb-4 border-b border-[#E3E8F3]">
              <Text className="text-xl font-bold text-[#0F1B3D]">
                {initialData ? "Edit Anggota" : "Tambah Anggota"}
              </Text>
              <Pressable onPress={onClose}>
                <Feather name="x-circle" size={24} color="#D8283A" />
              </Pressable>
            </View>

            {/* Form Input */}
            <View className="py-4">
              {error ? <Text className="mb-3 text-xs text-[#D64545]">{error}</Text> : null}

              {!initialData && (
                <>
                  <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">NIM</Text>
                  <TextInput
                    value={nim}
                    onChangeText={setNim}
                    placeholder="Masukkan NIM"
                    placeholderTextColor="#8A94A6"
                    keyboardType="number-pad"
                    className="mb-4 rounded-xl border border-[#E3E8F3] bg-white px-4 py-3.5 text-sm text-[#0A0A6B]"
                  />
                  <Text className="mb-4 -mt-2 text-xs text-[#6B7690]">
                    Password awal anggota adalah NIM dan wajib diganti saat login.
                  </Text>
                </>
              )}

              <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">Nama lengkap</Text>
              <TextInput
                value={nama}
                onChangeText={setNama}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#8A94A6"
                className="mb-4 rounded-xl border border-[#E3E8F3] bg-white px-4 py-3.5 text-sm text-[#0A0A6B]"
              />

              <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Masukkan email"
                placeholderTextColor="#8A94A6"
                autoCapitalize="none"
                keyboardType="email-address"
                className="mb-4 rounded-xl border border-[#E3E8F3] bg-white px-4 py-3.5 text-sm text-[#0A0A6B]"
              />

              <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">Peran (Role)</Text>
              <View className="flex-row gap-3">
                {(["Anggota", "Pengurus"] as MemberRole[]).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRole(r)}
                    className={`flex-1 items-center rounded-xl border py-3 ${
                      role === r ? "border-[#4387C0] bg-[#E8F0FB]" : "border-[#E3E8F3] bg-white"
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${role === r ? "text-[#4387C0]" : "text-[#6B7690]"}`}>
                      {r}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Tombol Simpan */}
            <Pressable
              onPress={() => { void handleSave(); }}
              disabled={submitting}
              className="mt-2 flex-row items-center justify-center rounded-xl bg-[#4387C0] py-4 active:opacity-80 disabled:opacity-60"
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#FFFFFF" />
                  <Text className="ml-2 text-[15px] font-semibold text-white">Simpan</Text>
                </>
              )}
            </Pressable>

          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ================================== SCREEN ================================= */

export default function AnggotaFix() {
  const { width } = useWindowDimensions();

  const columns = width >= 768 ? 2 : 1;
  const nameSize = width >= 768 ? 18 : width < 360 ? 14 : 16;
  const sidePadding = width >= 768 ? 24 : 20;

  // STATE CRUD
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // State Modal CRUD
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      const payload = await requestApi("/members");
      if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error("Server tidak mengembalikan daftar anggota yang valid.");
      }
      setMembers(payload.data.map(parseMember));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat data anggota.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadMembers);
  }, [loadMembers]);

  /* ---------- Pencarian ---------- */
  const trimmedQuery = query.trim();
  const filtered = useMemo(() => {
    if (!trimmedQuery) return members;
    const q = trimmedQuery.toLowerCase();
    return members.filter(
      (m) => m.nama.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
    );
  }, [members, trimmedQuery]);

  /* ---------- Aksi CRUD Handler ---------- */

  const handleOpenAdd = () => {
    setSelectedMember(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (item: Member) => {
    setSelectedMember(item);
    setModalVisible(true);
  };

  const handleFormSubmit = async (form: MemberForm, isEdit: boolean): Promise<boolean> => {
    setSubmitting(true);
    try {
      const member = isEdit && selectedMember
        ? parseMemberResponse(await requestApi(`/members/${encodeURIComponent(selectedMember.id)}`, {
            method: "PUT",
            body: JSON.stringify({ nama: form.nama, email: form.email, role: form.role }),
          }))
        : parseMemberResponse(await requestApi("/members", {
            method: "POST",
            body: JSON.stringify(form),
          }));

      setMembers((previous) =>
        isEdit
          ? previous.map((item) => (item.id === member.id ? member : item))
          : [member, ...previous],
      );
      setModalVisible(false);
      return true;
    } catch (error) {
      Alert.alert(
        "Gagal menyimpan anggota",
        error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan anggota.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMember = async (item: Member) => {
    try {
      await requestApi(`/members/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      setMembers((previous) => previous.filter((member) => member.id !== item.id));
    } catch (error) {
      Alert.alert(
        "Gagal menghapus anggota",
        error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus anggota.",
      );
    }
  };

  const handleDeleteMember = (item: Member) => {
    // [DELETE]
    Alert.alert(
      "Hapus Anggota?",
      `Data "${item.nama}" akan dinonaktifkan dan tidak ditampilkan lagi.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => { void deleteMember(item); },
        },
      ]
    );
  };

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
            void requestApi(`/members/${encodeURIComponent(item.id)}/reset-face`, {
              method: "PATCH",
            }).then((payload) => {
              const updatedMember = parseMemberResponse(payload);
              setMembers((previous) =>
                previous.map((member) => member.id === updatedMember.id ? updatedMember : member),
              );
            }).catch((error: unknown) => {
              Alert.alert(
                "Gagal mereset wajah",
                error instanceof Error ? error.message : "Terjadi kesalahan saat mereset wajah.",
              );
            });
          },
        },
      ],
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadMembers();
  }, [loadMembers]);

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
        <View className="w-full self-center" style={{ maxWidth: 960 }}>
          
          {/* Tombol Tambah Anggota */}
          <Pressable
            onPress={handleOpenAdd}
            className="mb-5 flex-row items-center justify-center rounded-2xl bg-[#4387C0] py-4 active:opacity-80"
          >
            <Feather name="user-plus" size={18} color="#FFFFFF" />
            <Text className="ml-2 text-[15px] font-semibold text-white">Tambah anggota</Text>
          </Pressable>

          <SearchBar value={query} onChange={setQuery} />

          {/* Judul daftar + jumlah */}
          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0A0A6B]">Daftar anggota</Text>
            <Text className="text-xs text-[#6B7690]">{filtered.length} anggota</Text>
          </View>

          {/* Daftar anggota (grid 1 / 2 kolom) */}
          {loading && members.length === 0 ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#4387C0" />
              <Text className="mt-3 text-sm text-[#6B7690]">Memuat anggota...</Text>
            </View>
          ) : loadError ? (
            <View className="items-center rounded-3xl border border-[#E3E8F3] bg-white px-6 py-10">
              <Text className="text-center text-sm text-[#D64545]">{loadError}</Text>
              <Pressable onPress={() => { setLoading(true); void loadMembers(); }} className="mt-4 rounded-xl bg-[#4387C0] px-5 py-2.5">
                <Text className="text-sm font-semibold text-white">Coba lagi</Text>
              </Pressable>
            </View>
          ) : filtered.length === 0 ? (
            <EmptyState searching={trimmedQuery.length > 0} query={trimmedQuery} onAdd={handleOpenAdd} />
          ) : (
            <View className="-m-1.5 flex-row flex-wrap">
              {filtered.map((item) => (
                <View key={item.id} className="p-1.5" style={{ width: `${100 / columns}%` }}>
                  <MemberCard
                    item={item}
                    nameSize={nameSize}
                    onResetFace={handleResetFace}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteMember}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="bg-white">
        <AdminTabBar />
      </SafeAreaView>

      {/* Modal Form Tambah / Edit */}
      <MemberFormModal
        key={`${modalVisible ? "open" : "closed"}-${selectedMember?.id ?? "new"}`}
        visible={modalVisible}
        initialData={selectedMember}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />
    </SafeAreaView>
  );
}