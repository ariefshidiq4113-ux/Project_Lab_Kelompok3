/**
 * presensifix.tsx
 * ---------------------------------------------------------------------------
 * Halaman "Sesi Presensi" (Admin) — HIMAFOR Attendance System (Local CRUD Version)
 *
 * Fitur:
 *  - Kontrol Sesi Aktif (Buka / Tutup Sesi)
 *  - [READ]   : Menampilkan daftar kehadiran anggota secara real-time.
 *  - [CREATE] : Tombol "Catat kehadiran" untuk menambah data kehadiran manual.
 *  - [UPDATE] : Tombol ganti status (Hadir / Terlambat / Izin) pada setiap anggota.
 *  - [DELETE] : Tombol hapus kehadiran anggota dari daftar sesi aktif.
 *  - Ekspor data (Excel / PDF placeholder).
 * ---------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AdminTabBar } from "@/components/admin-tab-bar";
import { HimaforHeader } from "@/components/himafor-header";

/* ============================== TYPES & DATA ============================== */

type AttendanceStatus = "hadir" | "terlambat" | "izin";
type EventStatus = "dibuka" | "belum" | "selesai";

interface AttendanceRecord {
  id: string;
  memberId: string;
  nama: string;
  email: string;
  waktu: string;
  status: AttendanceStatus;
}

interface EventItem {
  id: string;
  judul: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  status: EventStatus;
}

interface MemberOption {
  id: string;
  nama: string;
  email: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const STATUS_LABEL: Record<AttendanceStatus, string> = {
  hadir: "Hadir",
  terlambat: "Terlambat",
  izin: "Izin",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function requestApi(path: string, init?: RequestInit): Promise<unknown> {
  if (!API_BASE_URL) throw new Error("EXPO_PUBLIC_API_URL belum dikonfigurasi.");
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

function parseEvent(value: unknown): EventItem {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.nama !== "string" ||
    typeof value.tanggal !== "string" ||
    typeof value.jam !== "string" ||
    (value.status !== "dibuka" && value.status !== "belum" && value.status !== "selesai")
  ) {
    throw new Error("Format data kegiatan dari server tidak valid.");
  }
  const date = new Date(value.tanggal);
  if (Number.isNaN(date.getTime())) throw new Error("Tanggal kegiatan dari server tidak valid.");
  return {
    id: value.id,
    judul: value.nama,
    tanggal: `${String(date.getUTCDate()).padStart(2, "0")} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`,
    jam: value.jam,
    lokasi: typeof value.lokasi === "string" ? value.lokasi : "",
    status: value.status,
  };
}

function parseAttendance(value: unknown): AttendanceRecord {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.memberId !== "string" ||
    typeof value.nama !== "string" ||
    typeof value.email !== "string" ||
    typeof value.waktu !== "string" ||
    (value.status !== "hadir" && value.status !== "terlambat" && value.status !== "izin")
  ) {
    throw new Error("Format catatan kehadiran dari server tidak valid.");
  }
  const date = new Date(value.waktu);
  if (Number.isNaN(date.getTime())) throw new Error("Waktu kehadiran dari server tidak valid.");
  return {
    id: value.id,
    memberId: value.memberId,
    nama: value.nama,
    email: value.email,
    waktu: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }),
    status: value.status,
  };
}

function parseAttendanceResponse(payload: unknown): AttendanceRecord {
  if (!isRecord(payload) || payload.success !== true) {
    throw new Error("Server tidak mengembalikan catatan kehadiran yang valid.");
  }
  return parseAttendance(payload.data);
}

/* =============================== SUB-COMPONENTS ============================ */

const STATUS_STYLE: Record<AttendanceStatus, { bg: string; dot: string; text: string }> = {
  hadir: { bg: "bg-[#3CC4B9]", dot: "bg-white", text: "text-white" },
  terlambat: { bg: "bg-[#F5A623]", dot: "bg-white", text: "text-white" },
  izin: { bg: "bg-[#8A94A6]", dot: "bg-white", text: "text-white" },
};

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <View className={`flex-row items-center rounded-full px-3 py-1 ${s.bg}`}>
      <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${s.dot}`} />
      <Text className={`text-xs font-semibold ${s.text}`}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

interface SessionCardProps {
  session: EventItem;
  isOpen: boolean;
  onToggle: () => void;
}

function SessionCard({ session, isOpen, onToggle }: SessionCardProps) {
  return (
    <View className="rounded-3xl bg-[#0A0A6B] p-5 shadow-lg">
      <View className="flex-row items-center justify-between">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-white/90">
          Kegiatan
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

      <Text className="mt-3 text-2xl font-bold text-white">{session.judul}</Text>

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

      <Pressable
        onPress={onToggle}
        className="mt-5 flex-row items-center justify-center rounded-xl bg-white py-3 active:opacity-80"
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
    >
      <Feather name={icon} size={16} color="#2F63B0" />
      <Text className="ml-2 text-sm font-semibold text-[#2F63B0]">{label}</Text>
    </Pressable>
  );
}

interface AttendanceCardProps {
  item: AttendanceRecord;
  onChangeStatus: (item: AttendanceRecord) => void;
  onDelete: (item: AttendanceRecord) => void;
}

function AttendanceCard({ item, onChangeStatus, onDelete }: AttendanceCardProps) {
  return (
    <View className="mb-3 rounded-2xl border border-[#E3E8F3] bg-white p-4">
      {/* Baris Atas: Identitas & Tombol Hapus */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1 pr-2">
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

        <Pressable onPress={() => onDelete(item)} className="p-2 active:opacity-50">
          <Feather name="trash-2" size={16} color="#D8283A" />
        </Pressable>
      </View>

      <View className="my-3 h-px bg-[#EDF0F7]" />

      {/* Waktu & Tombol Status (bisa diklik untuk ubah status) */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="clock" size={14} color="#8A94A6" />
          <Text className="ml-2 text-xs text-[#6B7690]">Waktu: {item.waktu}</Text>
        </View>
        <Pressable onPress={() => onChangeStatus(item)} className="active:opacity-70">
          <StatusBadge status={item.status} />
        </Pressable>
      </View>
    </View>
  );
}

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

/* ========================== MODAL TAMBAH PRESENSI ========================== */

interface AddAttendanceModalProps {
  visible: boolean;
  members: MemberOption[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (memberId: string, status: AttendanceStatus) => Promise<boolean>;
}

function AddAttendanceModal({ visible, members, submitting, onClose, onSubmit }: AddAttendanceModalProps) {
  const [query, setQuery] = useState("");
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState<AttendanceStatus>("hadir");
  const [error, setError] = useState("");
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) =>
      member.nama.toLowerCase().includes(normalizedQuery) ||
      member.email.toLowerCase().includes(normalizedQuery),
    );
  }, [members, query]);
  const selectedMember = members.find((member) => member.id === memberId);

  const handleSave = async () => {
    if (!memberId) {
      setError("Pilih anggota terlebih dahulu.");
      return;
    }
    setError("");
    if (await onSubmit(memberId, status)) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 px-4" onPress={onClose}>
        <Pressable onPress={() => {}} className="w-full max-w-md rounded-3xl bg-white p-6">
          <View className="flex-row items-center justify-between pb-4 border-b border-[#E3E8F3]">
            <Text className="text-xl font-bold text-[#0F1B3D]">Catat Kehadiran Manual</Text>
            <Pressable onPress={onClose}><Feather name="x-circle" size={24} color="#D8283A" /></Pressable>
          </View>

          <View className="py-4">
            {error ? <Text className="mb-3 text-xs text-[#D64545]">{error}</Text> : null}

            <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">Cari anggota</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Nama atau email"
              placeholderTextColor="#8A94A6"
              autoCapitalize="none"
              className="mb-4 rounded-xl border border-[#E3E8F3] px-4 py-3.5 text-sm text-[#0A0A6B]"
            />
            {selectedMember ? (
              <Text className="mb-3 text-sm font-semibold text-[#2F63B0]">
                Dipilih: {selectedMember.nama}
              </Text>
            ) : null}
            <ScrollView className="mb-4 max-h-40 rounded-xl border border-[#E3E8F3]">
              {filteredMembers.length ? filteredMembers.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => setMemberId(member.id)}
                  className={`border-b border-[#EDF0F7] px-3 py-2.5 ${member.id === memberId ? "bg-[#E8EEFB]" : "bg-white"}`}
                >
                  <Text className="text-sm font-semibold text-[#0A0A6B]">{member.nama}</Text>
                  <Text className="mt-0.5 text-xs text-[#6B7690]">{member.email}</Text>
                </Pressable>
              )) : (
                <Text className="px-3 py-4 text-center text-xs text-[#6B7690]">
                  Anggota tidak ditemukan.
                </Text>
              )}
            </ScrollView>

            <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">Status Kehadiran</Text>
            <View className="flex-row gap-2">
              {(["hadir", "terlambat", "izin"] as AttendanceStatus[]).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  className={`flex-1 items-center rounded-xl border py-3 ${
                    status === s ? "border-[#2F63B0] bg-[#E8EEFB]" : "border-[#E3E8F3]"
                  }`}
                >
                  <Text className={`text-xs font-semibold ${status === s ? "text-[#2F63B0]" : "text-[#6B7690]"}`}>
                    {STATUS_LABEL[s]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={() => { void handleSave(); }}
            disabled={submitting}
            className="flex-row items-center justify-center rounded-xl bg-[#2F63B0] py-4 active:opacity-80 disabled:opacity-60"
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={18} color="#FFFFFF" />
                <Text className="ml-2 text-[15px] font-semibold text-white">Simpan Kehadiran</Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ================================== SCREEN ================================= */

export default function PresensiFix() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const selectedEvent = events.find((event) => event.id === selectedEventId) || null;
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isOpen = selectedEvent?.status === "dibuka";

  const totalLabel = useMemo(() => `${records.length} anggota`, [records.length]);

  const loadEvents = useCallback(async () => {
    try {
      const payload = await requestApi("/activities");
      if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error("Server tidak mengembalikan daftar kegiatan yang valid.");
      }
      const nextEvents = payload.data.map(parseEvent);
      setEvents(nextEvents);
      setSelectedEventId((current) =>
        current && nextEvents.some((event) => event.id === current)
          ? current
          : nextEvents.find((event) => event.status === "dibuka")?.id || nextEvents[0]?.id || null,
      );
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memuat kegiatan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const payload = await requestApi("/members");
      if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error("Server tidak mengembalikan daftar anggota yang valid.");
      }
      const nextMembers = payload.data.map((value): MemberOption => {
        if (
          !isRecord(value) ||
          typeof value.id !== "string" ||
          typeof value.nama !== "string" ||
          typeof value.email !== "string"
        ) {
          throw new Error("Format data anggota dari server tidak valid.");
        }
        return { id: value.id, nama: value.nama, email: value.email };
      });
      setMembers(nextMembers);
      setMembersError(null);
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : "Gagal memuat anggota.");
    }
  }, []);

  const loadRecords = useCallback(async (eventId: string | null) => {
    if (!eventId) {
      setRecords([]);
      return;
    }
    setRecordsLoading(true);
    try {
      const payload = await requestApi(`/attendance/session/${encodeURIComponent(eventId)}`);
      if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
        throw new Error("Server tidak mengembalikan daftar kehadiran yang valid.");
      }
      setRecords(payload.data.map(parseAttendance));
    } catch (error) {
      Alert.alert(
        "Gagal memuat kehadiran",
        error instanceof Error ? error.message : "Terjadi kesalahan saat memuat kehadiran.",
      );
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadEvents();
      void loadMembers();
    });
  }, [loadEvents, loadMembers]);

  useEffect(() => {
    void Promise.resolve().then(() => loadRecords(selectedEventId));
  }, [loadRecords, selectedEventId]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadEvents();
    void loadMembers();
    if (selectedEventId) void loadRecords(selectedEventId);
  }, [loadEvents, loadMembers, loadRecords, selectedEventId]);

  const handleToggleSession = () => {
    if (!selectedEvent) return;
    if (isOpen) {
      Alert.alert("Tutup sesi?", "Anggota tidak dapat presensi lagi setelah sesi ditutup.", [
        { text: "Batal", style: "cancel" },
        { text: "Tutup sesi", style: "destructive", onPress: () => { void updateSession("selesai"); } },
      ]);
    } else {
      void updateSession("dibuka");
    }
  };

  const updateSession = async (status: "dibuka" | "selesai") => {
    if (!selectedEvent) return;
    try {
      await requestApi(`/attendance/session/${encodeURIComponent(selectedEvent.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadEvents();
      await loadRecords(selectedEvent.id);
    } catch (error) {
      Alert.alert(
        "Gagal mengubah sesi",
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah sesi presensi.",
      );
    }
  };

  /* ---------- CRUD HANDLERS ---------- */

  const handleAddRecord = async (memberId: string, status: AttendanceStatus): Promise<boolean> => {
    if (!selectedEvent) return false;
    setSubmitting(true);
    try {
      const payload = await requestApi("/attendance/manual", {
        method: "POST",
        body: JSON.stringify({ eventId: selectedEvent.id, memberId, status }),
      });
      const record = parseAttendanceResponse(payload);
      setRecords((previous) => [record, ...previous]);
      return true;
    } catch (error) {
      Alert.alert(
        "Gagal mencatat kehadiran",
        error instanceof Error ? error.message : "Terjadi kesalahan saat mencatat kehadiran.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = (item: AttendanceRecord) => {
    if (!selectedEvent) return;
    const statuses: AttendanceStatus[] = ["hadir", "terlambat", "izin"];
    const currentIndex = statuses.indexOf(item.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    void requestApi(
      `/attendance/session/${encodeURIComponent(selectedEvent.id)}/records/${encodeURIComponent(item.id)}`,
      { method: "PATCH", body: JSON.stringify({ status: nextStatus }) },
    ).then((payload) => {
      const record = parseAttendanceResponse(payload);
      setRecords((previous) => previous.map((entry) => entry.id === record.id ? record : entry));
    }).catch((error: unknown) => {
      Alert.alert(
        "Gagal mengubah status",
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status kehadiran.",
      );
    });
  };

  const handleDeleteRecord = (item: AttendanceRecord) => {
    if (!selectedEvent) return;
    Alert.alert("Hapus Kehadiran?", `Hapus catatan kehadiran untuk ${item.nama}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void requestApi(
            `/attendance/session/${encodeURIComponent(selectedEvent.id)}/records/${encodeURIComponent(item.id)}`,
            { method: "DELETE" },
          ).then(() => setRecords((previous) => previous.filter((record) => record.id !== item.id)))
            .catch((error: unknown) => {
              Alert.alert(
                "Gagal menghapus kehadiran",
                error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus kehadiran.",
              );
            });
        },
      },
    ]);
  };

  const handleExport = (type: "Excel" | "PDF") => {
    Alert.alert(`Ekspor ${type}`, `Rekap kehadiran akan diekspor ke ${type}.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <HimaforHeader role="Admin" />

      <ScrollView
        className="flex-1 bg-[#F6F8FC]"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-6 pt-5">
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
        </View>
<<<<<<< HEAD
=======

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
>>>>>>> c20f6ed602488bf7f90d99d442b35901ba04b770
      </ScrollView>

      <SafeAreaView edges={["bottom"]} className="bg-white">
        <AdminTabBar />
      </SafeAreaView>

      <AddAttendanceModal
        key={`${modalVisible ? "open" : "closed"}-${selectedEventId ?? "none"}`}
        visible={modalVisible}
        members={members}
        submitting={submitting}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddRecord}
      />
    </SafeAreaView>
  );
}