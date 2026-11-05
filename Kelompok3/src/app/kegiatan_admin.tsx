/**
 * kegiatan_admin.tsx
 * ---------------------------------------------------------------------------
 * Halaman "Kegiatan" (Admin) — HIMAFOR Attendance System
 *
 * Fitur CRUD:
 *  - [READ]   : Menampilkan daftar kegiatan[cite: 2].
 *  - [CREATE] : Tombol "Tambah kegiatan" untuk membuat data baru[cite: 2].
 *  - [UPDATE] : Ikon pensil (Edit) untuk mengubah nama, tanggal, jam, dan lokasi kegiatan.
 *  - [DELETE] : Ikon tempat sampah (Hapus) untuk menghapus kegiatan (dengan konfirmasi).
 * ---------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AdminTabBar } from "@/components/admin-tab-bar";
import { HimaforHeader } from "@/components/himafor-header";

/* ============================== TYPES & DATA ============================== */

type EventStatus = "dibuka" | "belum" | "selesai";

interface EventItem {
  id: string;
  nama: string;
  tanggal: string;
  jam: string;
  lokasi?: string;
  status: EventStatus;
}

interface EventForm {
  nama: string;
  tanggal: string;
  jam: string;
  lokasi: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function parseEventResponse(payload: unknown): EventItem {
  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) {
    throw new Error("Server tidak mengembalikan data kegiatan yang valid.");
  }
  const event = payload.data;
  if (
    typeof event.id !== "string" ||
    typeof event.nama !== "string" ||
    typeof event.tanggal !== "string" ||
    typeof event.jam !== "string" ||
    (event.status !== "dibuka" && event.status !== "belum" && event.status !== "selesai")
  ) {
    throw new Error("Format data kegiatan dari server tidak valid.");
  }
  const date = new Date(event.tanggal);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Tanggal kegiatan dari server tidak valid.");
  }
  return {
    id: event.id,
    nama: event.nama,
    tanggal: formatDate({
      y: date.getUTCFullYear(),
      m: date.getUTCMonth(),
      d: date.getUTCDate(),
    }),
    jam: event.jam,
    lokasi: typeof event.lokasi === "string" ? event.lokasi : "",
    status: event.status,
  };
}

function toApiDate(value: string): string {
  const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(value);
  const month = match ? BULAN_SINGKAT.indexOf(match[2]) : -1;
  if (!match || month < 0) {
    throw new Error("Format tanggal kegiatan tidak valid.");
  }
  const [, day, , year] = match;
  return `${year}-${pad(month + 1)}-${pad(Number(day))}T00:00:00.000Z`;
}

function parseDisplayDate(value: string): DateParts | null {
  const match = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(value);
  if (!match) return null;
  const month = BULAN_SINGKAT.indexOf(match[2]);
  const day = Number(match[1]);
  const year = Number(match[3]);
  if (month < 0 || day < 1 || day > new Date(year, month + 1, 0).getDate()) return null;
  return { y: year, m: month, d: day };
}

const STATUS_META: Record<
  EventStatus,
  { label: string; bg: string; dot: string; text: string }
> = {
  dibuka: { label: "Dibuka", bg: "bg-[#E3F6F1]", dot: "bg-[#2DB5A3]", text: "text-[#14705F]" },
  belum: { label: "Belum", bg: "bg-[#FFF1D6]", dot: "bg-[#C77A00]", text: "text-[#8A5200]" },
  selesai: { label: "Selesai", bg: "bg-[#EDF0F5]", dot: "bg-[#8A94A6]", text: "text-[#5B667D]" },
};

/* =============================== SUB-COMPONENTS ============================ */

function StatusBadge({ status }: { status: EventStatus }) {
  const m = STATUS_META[status];
  return (
    <View className={`flex-row items-center rounded-full px-2.5 py-1 ${m.bg}`}>
      <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${m.dot}`} />
      <Text className={`text-[10px] font-bold uppercase tracking-wider ${m.text}`}>{m.label}</Text>
    </View>
  );
}

interface EventCardProps {
  item: EventItem;
  onPrimaryAction: (item: EventItem) => void;
  onEdit: (item: EventItem) => void;
  onDelete: (item: EventItem) => void;
  titleSize: number;
}

function EventCard({ item, onPrimaryAction, onEdit, onDelete, titleSize }: EventCardProps) {
  return (
    <View className="rounded-3xl border border-[#E3E8F3] bg-white p-4">
      {/* Header: Icon, Edit, Delete, Status */}
      <View className="flex-row items-start justify-between">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F0FB]">
          <Feather name="calendar" size={20} color="#4387C0" />
        </View>
        <View className="flex-row items-center">
          <Pressable onPress={() => onEdit(item)} className="p-2 active:opacity-50">
            <Feather name="edit-2" size={16} color="#6B7690" />
          </Pressable>
          <Pressable onPress={() => onDelete(item)} className="p-2 active:opacity-50">
            <Feather name="trash-2" size={16} color="#D8283A" />
          </Pressable>
          <View className="ml-1">
            <StatusBadge status={item.status} />
          </View>
        </View>
      </View>

      {/* Detail Kegiatan */}
      <Text
        className="mt-4 font-bold text-[#0A0A6B]"
        style={{ fontSize: titleSize }}
        numberOfLines={2}
      >
        {item.nama}
      </Text>
      <View className="mt-2 flex-row items-center">
        <Feather name="clock" size={14} color="#8A94A6" />
        <Text className="ml-2 flex-1 text-sm text-[#6B7690]" numberOfLines={1}>
          {item.tanggal} · {item.jam}
        </Text>
      </View>
      {item.lokasi ? (
        <View className="mt-1.5 flex-row items-center">
          <Feather name="map-pin" size={14} color="#8A94A6" />
          <Text className="ml-2 flex-1 text-sm text-[#6B7690]" numberOfLines={1}>
            {item.lokasi}
          </Text>
        </View>
      ) : null}

      <View className="my-3 h-px bg-[#EDF0F7]" />

      {/* Tombol Aksi Status */}
      {item.status === "dibuka" && (
        <Pressable
          onPress={() => onPrimaryAction(item)}
          className="flex-row items-center justify-center rounded-xl border border-[#D6DCEA] bg-white py-3 active:bg-[#F3F6FC]"
        >
          <Feather name="stop-circle" size={16} color="#4387C0" />
          <Text className="ml-2 text-sm font-semibold text-[#4387C0]">Tutup sesi</Text>
        </Pressable>
      )}
      {item.status === "belum" && (
        <Pressable
          onPress={() => onPrimaryAction(item)}
          className="flex-row items-center justify-center rounded-xl bg-[#4387C0] py-3 active:opacity-80"
        >
          <Feather name="play-circle" size={16} color="#FFFFFF" />
          <Text className="ml-2 text-sm font-semibold text-white">Buka sesi</Text>
        </Pressable>
      )}
      {item.status === "selesai" && (
        <Pressable
          onPress={() => onPrimaryAction(item)}
          className="flex-row items-center justify-center rounded-xl border border-[#D6DCEA] bg-white py-3 active:bg-[#F3F6FC]"
        >
          <Feather name="bar-chart-2" size={16} color="#4387C0" />
          <Text className="ml-2 text-sm font-semibold text-[#4387C0]">Lihat rekap</Text>
        </Pressable>
      )}
    </View>
  );
}

function EmptyEvents({ onAdd }: { onAdd: () => void }) {
  return (
    <View className="items-center rounded-3xl border border-dashed border-[#D6DCF0] bg-white px-6 py-12">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E8F0FB]">
        <Feather name="calendar" size={24} color="#4387C0" />
      </View>
      <Text className="mt-3 text-base font-semibold text-[#0A0A6B]">Belum ada kegiatan</Text>
      <Text className="mt-1 text-center text-xs text-[#6B7690]">
        Tambahkan kegiatan pertama agar sesi presensi dapat dibuka.
      </Text>
      <Pressable onPress={onAdd} className="mt-4 rounded-xl bg-[#4387C0] px-5 py-2.5 active:opacity-80">
        <Text className="text-sm font-semibold text-white">Tambah kegiatan</Text>
      </Pressable>
    </View>
  );
}

/* ========================= POP-UP FORM KEGIATAN ========================= */

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

interface DateParts { y: number; m: number; d: number; }
interface Draft { nama: string; tanggal: DateParts | null; mulai: string; selesai: string; lokasi: string; }
type DraftErrors = Partial<Record<"nama" | "tanggal" | "jam", string>>;
type PickerKind = null | "tanggal" | "mulai" | "selesai";

const EMPTY_DRAFT: Draft = { nama: "", tanggal: null, mulai: "", selesai: "", lokasi: "" };
const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (p: DateParts) => `${pad(p.d)} ${BULAN_SINGKAT[p.m]} ${p.y}`;

function FieldShell({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">{label}</Text>
      {children}
      {error ? <Text className="mt-1 text-[11px] text-[#D64545]">{error}</Text> : null}
    </View>
  );
}
const rowClass = (error?: string) => `flex-row items-center rounded-xl border bg-white px-4 ${error ? "border-[#D64545]" : "border-[#E3E8F3]"}`;

function TextField({ value, placeholder, icon, error, onChangeText }: any) {
  return (
    <View className={rowClass(error)}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A94A6"
        className="flex-1 py-3.5 text-sm text-[#0A0A6B]"
      />
      {icon ? <Feather name={icon} size={18} color="#8A94A6" /> : null}
    </View>
  );
}

function DateField({ value, error, onPress }: any) {
  return (
    <Pressable onPress={onPress} className={`${rowClass(error)} active:bg-[#F6F8FC]`}>
      <Text className={`flex-1 py-3.5 text-sm ${value ? "text-[#0A0A6B]" : "text-[#8A94A6]"}`}>
        {value ? formatDate(value) : "Pilih tanggal"}
      </Text>
      <Feather name="calendar" size={18} color="#8A94A6" />
    </Pressable>
  );
}

function TimeRangeField({ mulai, selesai, error, onPick }: any) {
  return (
    <View className={rowClass(error)}>
      <Pressable onPress={() => onPick("mulai")} hitSlop={6} className="py-3.5">
        <Text className={`text-sm ${mulai ? "text-[#0A0A6B]" : "text-[#8A94A6]"}`}>{mulai || "--:--"}</Text>
      </Pressable>
      <Text className="mx-3 text-sm text-[#8A94A6]">–</Text>
      <Pressable onPress={() => onPick("selesai")} hitSlop={6} className="py-3.5">
        <Text className={`text-sm ${selesai ? "text-[#0A0A6B]" : "text-[#8A94A6]"}`}>{selesai || "--:--"}</Text>
      </Pressable>
      <View className="flex-1" />
      <Pressable onPress={() => onPick(mulai && !selesai ? "selesai" : "mulai")} hitSlop={10}>
        <Feather name="clock" size={18} color="#8A94A6" />
      </Pressable>
    </View>
  );
}

// Komponen Picker Tanggal & Jam bawaan disederhanakan
function CalendarPicker({ value, onSelect }: any) {
  const today = new Date();
  const [view, setView] = useState({ y: value?.y ?? today.getFullYear(), m: value?.m ?? today.getMonth() });
  const cells = useMemo(() => {
    const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const arr: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [view]);

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable onPress={() => setView({ ...view, m: view.m - 1 })} className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F4FA]">
          <Feather name="chevron-left" size={18} color="#0A0A6B" />
        </Pressable>
        <Text className="text-base font-bold text-[#0F1B3D]">{BULAN[view.m]} {view.y}</Text>
        <Pressable onPress={() => setView({ ...view, m: view.m + 1 })} className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F4FA]">
          <Feather name="chevron-right" size={18} color="#0A0A6B" />
        </Pressable>
      </View>
      <View className="flex-row flex-wrap">
        {cells.map((d, i) => (
          <View key={i} style={{ width: `${100 / 7}%` }} className="items-center py-0.5">
            {d !== null && (
              <Pressable
                onPress={() => onSelect({ y: view.y, m: view.m, d })}
                className={`h-10 w-10 items-center justify-center rounded-full ${value?.d === d && value.m === view.m ? "bg-[#4B45C9]" : "bg-transparent"}`}
              >
                <Text className={`text-sm ${value?.d === d && value.m === view.m ? "font-bold text-white" : "text-[#0F1B3D]"}`}>{d}</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- Pemilih jam (kolom jam & menit, tanpa dependensi tambahan) ---------- */

const ITEM_H = 44;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // kelipatan 5 menit

function WheelColumn({
  items,
  selected,
  onSelect,
}: {
  items: number[];
  selected: number;
  onSelect: (n: number) => void;
}) {
  const ref = useRef<ScrollView>(null);

  // Gulir otomatis ke nilai terpilih saat pertama kali tampil
  useEffect(() => {
    const idx = Math.max(0, items.indexOf(selected));
    const t = setTimeout(
      () => ref.current?.scrollTo({ y: Math.max(0, idx - 2) * ITEM_H, animated: false }),
      0,
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      ref={ref}
      className="flex-1"
      style={{ height: ITEM_H * 5 }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {items.map((n) => {
        const isSel = n === selected;
        return (
          <Pressable
            key={n}
            onPress={() => onSelect(n)}
            style={{ height: ITEM_H }}
            className={`mx-1 items-center justify-center rounded-xl ${
              isSel ? "bg-[#EEF0FF]" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-lg ${isSel ? "font-bold text-[#4B45C9]" : "text-[#6B7690]"}`}
            >
              {pad(n)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function TimePicker({
  title,
  value,
  onConfirm,
  onCancel,
}: {
  title: string;
  value: string;
  onConfirm: (v: string) => void;
  onCancel: () => void;
}) {
  const [h, m] = value ? value.split(":").map(Number) : [19, 0];
  const [hour, setHour] = useState(h);
  const [minute, setMinute] = useState(m - (m % 5));
  return (
    <View>
      <Text className="mb-3 text-base font-bold text-[#0F1B3D]">{title}</Text>
      <View className="flex-row justify-center gap-4">
        <Text className="text-3xl font-bold text-[#4B45C9]">{pad(hour)}</Text>
        <Text className="text-3xl font-bold text-[#0F1B3D]">:</Text>
        <Text className="text-3xl font-bold text-[#4B45C9]">{pad(minute)}</Text>
      </View>
      <View className="mt-4 flex-row gap-2 justify-center">
        <Pressable onPress={() => setHour(hour > 0 ? hour - 1 : 23)} className="px-4 py-2 bg-gray-100 rounded"><Text>- Jam</Text></Pressable>
        <Pressable onPress={() => setHour(hour < 23 ? hour + 1 : 0)} className="px-4 py-2 bg-gray-100 rounded"><Text>+ Jam</Text></Pressable>
        <Pressable onPress={() => setMinute(minute > 0 ? minute - 5 : 55)} className="px-4 py-2 bg-gray-100 rounded"><Text>- Mnt</Text></Pressable>
        <Pressable onPress={() => setMinute(minute < 55 ? minute + 5 : 0)} className="px-4 py-2 bg-gray-100 rounded"><Text>+ Mnt</Text></Pressable>
      </View>
      <View className="mt-4 flex-row gap-3">
        <Pressable onPress={onCancel} className="flex-1 items-center rounded-xl border border-[#E3E8F3] py-3"><Text className="text-[#4B45C9] font-semibold">Batal</Text></Pressable>
        <Pressable onPress={() => onConfirm(`${pad(hour)}:${pad(minute)}`)} className="flex-1 items-center rounded-xl bg-[#4B45C9] py-3"><Text className="text-white font-semibold">Pilih</Text></Pressable>
      </View>
    </View>
  );
}

interface EventModalProps {
  visible: boolean;
  initialData: EventItem | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (form: EventForm, isEdit: boolean) => Promise<boolean>;
}

function EventFormModal({ visible, initialData, submitting, onClose, onSubmit }: EventModalProps) {
  const [draft, setDraft] = useState<Draft>(() => {
    if (!initialData) return EMPTY_DRAFT;
    const [mulai, selesai] = initialData.jam.split(/[–-]/);
    return {
      nama: initialData.nama,
      tanggal: parseDisplayDate(initialData.tanggal),
      mulai: mulai?.trim() || "",
      selesai: selesai?.trim() || "",
      lokasi: initialData.lokasi || "",
    };
  });
  const [errors, setErrors] = useState<DraftErrors>({});
  const [picker, setPicker] = useState<PickerKind>(null);

  const update = (key: keyof Draft, value: any) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = async () => {
    const next: DraftErrors = {};
    if (!draft.nama.trim()) next.nama = "Nama kegiatan wajib diisi";
    if (!draft.tanggal) next.tanggal = "Tanggal wajib dipilih";
    if (!draft.mulai || !draft.selesai) next.jam = "Jam mulai dan selesai wajib diisi";
    setErrors(next);
    
    if (Object.keys(next).length === 0 && draft.tanggal) {
      const saved = await onSubmit({
        nama: draft.nama.trim(),
        tanggal: formatDate(draft.tanggal),
        jam: `${draft.mulai}–${draft.selesai}`,
        lokasi: draft.lokasi.trim(),
      }, !!initialData);
      if (saved) onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <Pressable className="flex-1 items-center justify-center bg-black/50 px-4" onPress={onClose}>
          <Pressable onPress={() => {}} className="max-h-[92%] w-full overflow-hidden rounded-3xl bg-white" style={{ maxWidth: 480 }}>
            
            <View className="flex-row items-center justify-between px-5 pb-3 pt-5 border-b border-[#E3E8F3]">
              <Text className="text-xl font-bold text-[#0F1B3D]">{initialData ? "Edit Kegiatan" : "Tambah Kegiatan"}</Text>
              <Pressable onPress={onClose}><Feather name="x-circle" size={26} color="#D8283A" /></Pressable>
            </View>

            <ScrollView className="px-5 pt-4">
              <FieldShell label="Nama kegiatan" error={errors.nama}>
                <TextField value={draft.nama} placeholder="Masukkan nama kegiatan" onChangeText={(v: string) => update("nama", v)} />
              </FieldShell>
              <FieldShell label="Tanggal" error={errors.tanggal}>
                <DateField value={draft.tanggal} onPress={() => setPicker("tanggal")} />
              </FieldShell>
              <FieldShell label="Jam mulai–selesai" error={errors.jam}>
                <TimeRangeField mulai={draft.mulai} selesai={draft.selesai} onPick={setPicker} />
              </FieldShell>
              <FieldShell label="Lokasi">
                <TextField value={draft.lokasi} placeholder="Masukkan lokasi" icon="map-pin" onChangeText={(v: string) => update("lokasi", v)} />
              </FieldShell>
            </ScrollView>

            <View className="px-5 pb-5 pt-3">
              <Pressable
                onPress={() => { void submit(); }}
                disabled={submitting}
                className="flex-row items-center justify-center rounded-xl bg-[#4B45C9] py-4 active:opacity-80 disabled:opacity-60"
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
            </View>
          </Pressable>
        </Pressable>

        {picker !== null && (
          <View style={StyleSheet.absoluteFill} className="items-center justify-center bg-black/40 px-6">
            <View className="w-full rounded-3xl bg-white p-4" style={{ maxWidth: 360 }}>
              {picker === "tanggal" ? (
                <CalendarPicker value={draft.tanggal} onSelect={(d: any) => { update("tanggal", d); setPicker(null); }} />
              ) : (
                <TimePicker 
                  title={picker === "mulai" ? "Jam Mulai" : "Jam Selesai"} 
                  value={picker === "mulai" ? draft.mulai : draft.selesai} 
                  onCancel={() => setPicker(null)} 
                  onConfirm={(v: any) => { update(picker, v); setPicker(null); }} 
                />
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ================================== SCREEN ================================= */

export default function KegiatanFix() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const columns = width >= 768 ? 2 : 1;
  const titleSize = width >= 768 ? 20 : width < 360 ? 16 : 18;

  // STATE CRUD
  const [events, setEvents] = useState<EventItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handlePrimaryAction = useCallback(
    (item: EventItem) => {
      if (item.status === "dibuka") {
        Alert.alert("Tutup sesi?", `Presensi "${item.nama}" akan ditutup dan kegiatan ditandai selesai.`, [
          { text: "Batal", style: "cancel" },
          { text: "Tutup sesi", style: "destructive", onPress: () => updateStatus(item.id, "selesai") },
        ]);
        return;
      }

      if (item.status === "belum") {
        const sedangDibuka = events.find((e) => e.status === "dibuka");
        if (sedangDibuka) {
          Alert.alert(
            "Masih ada sesi dibuka",
            `Tutup sesi "${sedangDibuka.nama}" terlebih dahulu sebelum membuka sesi baru.`,
          );
          return;
        }
        updateStatus(item.id, "dibuka");
        return;
      }

      // selesai -> buka halaman Rekap
      router.push("/rekapfix");
    },
    [events, updateStatus, router],
  );

  const handleOpenDetail = useCallback((item: EventItem) => {
    // TODO: navigasi ke halaman detail kegiatan
    Alert.alert(item.nama, `${item.tanggal} · ${item.jam}${item.lokasi ? `\n${item.lokasi}` : ""}`);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadEvents);
  }, [loadEvents]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void loadEvents();
  }, [loadEvents]);

  /* ---------- Aksi UPDATE Status ---------- */
  const updateStatus = useCallback(async (item: EventItem, status: EventStatus) => {
    try {
      const updatedEvent = parseEventResponse(await requestApi(
        `/activities/${encodeURIComponent(item.id)}/status`,
        { method: "PATCH", body: JSON.stringify({ status }) },
      ));
      setEvents((previous) =>
        previous.map((event) => event.id === updatedEvent.id ? updatedEvent : event),
      );
    } catch (error) {
      Alert.alert(
        "Gagal mengubah sesi",
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengubah status sesi.",
      );
    }
  }, []);

  const handlePrimaryAction = useCallback((item: EventItem) => {
    if (item.status === "dibuka") {
      Alert.alert("Tutup sesi?", `Presensi "${item.nama}" akan ditutup.`, [
        { text: "Batal", style: "cancel" },
        { text: "Tutup sesi", style: "destructive", onPress: () => { void updateStatus(item, "selesai"); } },
      ]);
    } else if (item.status === "belum") {
      const sedangDibuka = events.find((e) => e.status === "dibuka");
      if (sedangDibuka) {
        Alert.alert("Masih ada sesi dibuka", `Tutup sesi "${sedangDibuka.nama}" terlebih dahulu.`);
        return;
      }
      void updateStatus(item, "dibuka");
    } else {
      router.push("/rekap_admin");
    }
  }, [events, updateStatus, router]);

  /* ---------- Aksi CREATE & UPDATE Data ---------- */
  const openAddModal = () => {
    setSelectedEvent(null);
    setModalVisible(true);
  };

  const openEditModal = (item: EventItem) => {
    setSelectedEvent(item);
    setModalVisible(true);
  };

  const handleFormSubmit = async (form: EventForm, isEdit: boolean): Promise<boolean> => {
    setSubmitting(true);
    try {
      const body = JSON.stringify({
        ...form,
        tanggal: toApiDate(form.tanggal),
      });
      const updatedEvent = isEdit && selectedEvent
        ? parseEventResponse(await requestApi(`/activities/${encodeURIComponent(selectedEvent.id)}`, {
            method: "PUT",
            body,
          }))
        : parseEventResponse(await requestApi("/activities", { method: "POST", body }));

      setEvents((previous) =>
        isEdit
          ? previous.map((event) => event.id === updatedEvent.id ? updatedEvent : event)
          : [updatedEvent, ...previous],
      );
      setModalVisible(false);
      return true;
    } catch (error) {
      Alert.alert(
        "Gagal menyimpan kegiatan",
        error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan kegiatan.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Aksi DELETE ---------- */
  const handleDeleteEvent = (item: EventItem) => {
    Alert.alert("Hapus Kegiatan?", `Data "${item.nama}" akan diarsipkan dan tidak ditampilkan lagi.`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void requestApi(`/activities/${encodeURIComponent(item.id)}`, { method: "DELETE" })
            .then(() => setEvents((previous) => previous.filter((event) => event.id !== item.id)))
            .catch((error: unknown) => {
              Alert.alert(
                "Gagal menghapus kegiatan",
                error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus kegiatan.",
              );
            });
        },
      },
    ]);
  };

  /* ---------- Render ---------- */
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <HimaforHeader role="Admin" />

      <ScrollView
        className="flex-1 bg-[#F6F8FC]"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4387C0" />}
      >
        <View className="w-full self-center" style={{ maxWidth: 960 }}>
          
          <Pressable onPress={openAddModal} className="flex-row items-center justify-center rounded-2xl bg-[#4387C0] py-4 active:opacity-80">
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text className="ml-2 text-[15px] font-semibold text-white">Tambah kegiatan</Text>
          </Pressable>

          <View className="mb-3 mt-5 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0A0A6B]">Daftar kegiatan</Text>
            <Text className="text-xs text-[#6B7690]">{events.length} kegiatan</Text>
          </View>

          {loading && events.length === 0 ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#4387C0" />
              <Text className="mt-3 text-sm text-[#6B7690]">Memuat kegiatan...</Text>
            </View>
          ) : loadError ? (
            <View className="items-center rounded-3xl border border-[#E3E8F3] bg-white px-6 py-10">
              <Text className="text-center text-sm text-[#D64545]">{loadError}</Text>
              <Pressable onPress={() => { setLoading(true); void loadEvents(); }} className="mt-4 rounded-xl bg-[#4387C0] px-5 py-2.5">
                <Text className="text-sm font-semibold text-white">Coba lagi</Text>
              </Pressable>
            </View>
          ) : events.length === 0 ? (
            <EmptyEvents onAdd={openAddModal} />
          ) : (
            <View className="-m-1.5 flex-row flex-wrap">
              {events.map((item) => (
                <View key={item.id} className="p-1.5" style={{ width: `${100 / columns}%` }}>
                  <EventCard
                    item={item}
                    titleSize={titleSize}
                    onPrimaryAction={handlePrimaryAction}
                    onEdit={openEditModal}
                    onDelete={handleDeleteEvent}
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

      <EventFormModal
        key={`${modalVisible ? "open" : "closed"}-${selectedEvent?.id ?? "new"}`}
        visible={modalVisible}
        initialData={selectedEvent}
        submitting={submitting}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
      />
    </SafeAreaView>
  );
}