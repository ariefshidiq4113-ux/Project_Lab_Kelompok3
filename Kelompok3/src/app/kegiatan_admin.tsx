/**
 * kegiatanfix.tsx
 * ---------------------------------------------------------------------------
 * Halaman "Kegiatan" (Admin) — HIMAFOR Attendance System
 *
 * Stack     : React Native (Expo) + NativeWind (Tailwind CSS)
 * Dependensi: nativewind, react-native-safe-area-context, @expo/vector-icons
 *             (sama dengan presensifix.tsx, tidak ada dependensi baru)
 *
 * Fitur:
 *  - Daftar kegiatan dapat di-scroll (pull-to-refresh simulasi)
 *  - "Tambah kegiatan" membuka pop-up di tengah layar: nama, tanggal (kalender),
 *    jam mulai–selesai (pemilih jam), lokasi, dengan validasi dan tombol Simpan
 *  - "Buka sesi" / "Tutup sesi" mengubah status kegiatan (dengan konfirmasi)
 *  - Kegiatan selesai punya tombol "Lihat rekap"
 *  - Responsif: 1 kolom (HP) -> 2 kolom (tablet / layar lebar), konten dibatasi
 *    lebar maksimum dan diletakkan di tengah, ukuran font menyesuaikan lebar layar
 *
 * Pemakaian: <KegiatanFix /> sebagai screen, atau jadikan default export route.
 * ---------------------------------------------------------------------------
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
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

/** Ganti dengan data dari API saat integrasi backend. */
const INITIAL_EVENTS: EventItem[] = [
  {
    id: "1",
    nama: "Rapat Pengurus HIMAFOR",
    tanggal: "08 Okt 2026",
    jam: "19:00–21:00",
    lokasi: "Sekre HIMAFOR",
    status: "dibuka",
  },
  {
    id: "2",
    nama: "Evaluasi Program Kerja",
    tanggal: "10 Okt 2026",
    jam: "19:30–21:30",
    lokasi: "Sekre HIMAFOR",
    status: "belum",
  },
  {
    id: "3",
    nama: "[Nama Kegiatan]",
    tanggal: "[Tanggal]",
    jam: "[Jam]",
    status: "selesai",
  },
];

const STATUS_META: Record<
  EventStatus,
  { label: string; bg: string; dot: string; text: string }
> = {
  dibuka: { label: "Dibuka", bg: "bg-[#E3F6F1]", dot: "bg-[#2DB5A3]", text: "text-[#14705F]" },
  belum: { label: "Belum dibuka", bg: "bg-[#FFF1D6]", dot: "bg-[#C77A00]", text: "text-[#8A5200]" },
  selesai: { label: "Selesai", bg: "bg-[#EDF0F5]", dot: "bg-[#8A94A6]", text: "text-[#5B667D]" },
};

/* =============================== SUB-COMPONENTS ============================ */

function StatusBadge({ status }: { status: EventStatus }) {
  const m = STATUS_META[status];
  return (
    <View className={`flex-row items-center rounded-full px-3 py-1 ${m.bg}`}>
      <View className={`mr-1.5 h-1.5 w-1.5 rounded-full ${m.dot}`} />
      <Text className={`text-xs font-semibold ${m.text}`}>{m.label}</Text>
    </View>
  );
}

interface EventCardProps {
  item: EventItem;
  onPrimaryAction: (item: EventItem) => void;
  onPress: (item: EventItem) => void;
  titleSize: number;
}

function EventCard({ item, onPrimaryAction, onPress, titleSize }: EventCardProps) {
  return (
    <Pressable
      onPress={() => onPress(item)}
      className="rounded-3xl border border-[#E3E8F3] bg-white p-4 active:bg-[#FAFBFE]"
      accessibilityRole="button"
      accessibilityLabel={`Detail kegiatan ${item.nama}`}
    >
      {/* Ikon kalender + badge status */}
      <View className="flex-row items-center justify-between">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#E8F0FB]">
          <Feather name="calendar" size={18} color="#4387C0" />
        </View>
        <StatusBadge status={item.status} />
      </View>

      {/* Judul */}
      <Text
        className="mt-4 font-bold text-[#0A0A6B]"
        style={{ fontSize: titleSize }}
        numberOfLines={2}
      >
        {item.nama}
      </Text>

      {/* Tanggal & jam */}
      <View className="mt-2 flex-row items-center">
        <Feather name="clock" size={14} color="#8A94A6" />
        <Text className="ml-2 flex-1 text-sm text-[#6B7690]" numberOfLines={1}>
          {item.tanggal} · {item.jam}
        </Text>
      </View>

      {/* Lokasi (opsional) */}
      {item.lokasi ? (
        <View className="mt-1.5 flex-row items-center">
          <Feather name="map-pin" size={14} color="#8A94A6" />
          <Text className="ml-2 flex-1 text-sm text-[#6B7690]" numberOfLines={1}>
            {item.lokasi}
          </Text>
        </View>
      ) : null}

      <View className="my-3 h-px bg-[#EDF0F7]" />

      {/* Tombol aksi sesuai status */}
      {item.status === "dibuka" && (
        <Pressable
          onPress={() => onPrimaryAction(item)}
          className="flex-row items-center justify-center rounded-xl border border-[#D6DCEA] bg-white py-3 active:bg-[#F3F6FC]"
          accessibilityRole="button"
          accessibilityLabel="Tutup sesi"
        >
          <Feather name="stop-circle" size={16} color="#4387C0" />
          <Text className="ml-2 text-sm font-semibold text-[#4387C0]">Tutup sesi</Text>
        </Pressable>
      )}

      {item.status === "belum" && (
        <Pressable
          onPress={() => onPrimaryAction(item)}
          className="flex-row items-center justify-center rounded-xl bg-[#4387C0] py-3 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Buka sesi"
        >
          <Feather name="play-circle" size={16} color="#FFFFFF" />
          <Text className="ml-2 text-sm font-semibold text-white">Buka sesi</Text>
        </Pressable>
      )}

      {item.status === "selesai" && (
        <Pressable
          onPress={() => onPrimaryAction(item)}
          className="flex-row items-center justify-center rounded-xl border border-[#D6DCEA] bg-white py-3 active:bg-[#F3F6FC]"
          accessibilityRole="button"
          accessibilityLabel="Lihat rekap"
        >
          <Feather name="bar-chart-2" size={16} color="#4387C0" />
          <Text className="ml-2 text-sm font-semibold text-[#4387C0]">Lihat rekap</Text>
        </Pressable>
      )}
    </Pressable>
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
      <Pressable
        onPress={onAdd}
        className="mt-4 rounded-xl bg-[#4387C0] px-5 py-2.5 active:opacity-80"
      >
        <Text className="text-sm font-semibold text-white">Tambah kegiatan</Text>
      </Pressable>
    </View>
  );
}

/* ========================= POP-UP TAMBAH KEGIATAN ========================= */

/** Warna ungu tombol Simpan & aksen pada pop-up (sesuai desain). */
const PRIMARY = "#4B45C9";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const BULAN_SINGKAT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

interface DateParts {
  y: number;
  m: number; // 0-11
  d: number;
}

interface Draft {
  nama: string;
  tanggal: DateParts | null;
  mulai: string; // "HH:MM"
  selesai: string; // "HH:MM"
  lokasi: string;
}

type DraftErrors = Partial<Record<"nama" | "tanggal" | "jam", string>>;
type PickerKind = null | "tanggal" | "mulai" | "selesai";

const EMPTY_DRAFT: Draft = { nama: "", tanggal: null, mulai: "", selesai: "", lokasi: "" };

const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (p: DateParts) => `${pad(p.d)} ${BULAN_SINGKAT[p.m]} ${p.y}`;

/* ---------- Pembungkus label + error ---------- */

function FieldShell({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-[#0F1B3D]">{label}</Text>
      {children}
      {error ? <Text className="mt-1 text-[11px] text-[#D64545]">{error}</Text> : null}
    </View>
  );
}

const rowClass = (error?: string) =>
  `flex-row items-center rounded-xl border bg-white px-4 ${
    error ? "border-[#D64545]" : "border-[#E3E8F3]"
  }`;

/* ---------- Input teks (nama & lokasi) ---------- */

function TextField({
  value,
  placeholder,
  icon,
  error,
  onChangeText,
}: {
  value: string;
  placeholder: string;
  icon?: keyof typeof Feather.glyphMap;
  error?: string;
  onChangeText: (v: string) => void;
}) {
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

/* ---------- Kolom tanggal (membuka kalender) ---------- */

function DateField({
  value,
  error,
  onPress,
}: {
  value: DateParts | null;
  error?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className={`${rowClass(error)} active:bg-[#F6F8FC]`}>
      <Text
        className={`flex-1 py-3.5 text-sm ${value ? "text-[#0A0A6B]" : "text-[#8A94A6]"}`}
      >
        {value ? formatDate(value) : "Pilih tanggal"}
      </Text>
      <Feather name="calendar" size={18} color="#8A94A6" />
    </Pressable>
  );
}

/* ---------- Kolom jam mulai–selesai (membuka pemilih jam) ---------- */

function TimeRangeField({
  mulai,
  selesai,
  error,
  onPick,
}: {
  mulai: string;
  selesai: string;
  error?: string;
  onPick: (which: "mulai" | "selesai") => void;
}) {
  return (
    <View className={rowClass(error)}>
      <Pressable onPress={() => onPick("mulai")} hitSlop={6} className="py-3.5">
        <Text className={`text-sm ${mulai ? "text-[#0A0A6B]" : "text-[#8A94A6]"}`}>
          {mulai || "--:--"}
        </Text>
      </Pressable>
      <Text className="mx-3 text-sm text-[#8A94A6]">–</Text>
      <Pressable onPress={() => onPick("selesai")} hitSlop={6} className="py-3.5">
        <Text className={`text-sm ${selesai ? "text-[#0A0A6B]" : "text-[#8A94A6]"}`}>
          {selesai || "--:--"}
        </Text>
      </Pressable>
      <View className="flex-1" />
      <Pressable
        onPress={() => onPick(mulai && !selesai ? "selesai" : "mulai")}
        hitSlop={10}
        accessibilityLabel="Pilih jam"
      >
        <Feather name="clock" size={18} color="#8A94A6" />
      </Pressable>
    </View>
  );
}

/* ---------- Kalender sederhana (tanpa dependensi tambahan) ---------- */

function CalendarPicker({
  value,
  onSelect,
}: {
  value: DateParts | null;
  onSelect: (d: DateParts) => void;
}) {
  const today = new Date();
  const [view, setView] = useState({
    y: value?.y ?? today.getFullYear(),
    m: value?.m ?? today.getMonth(),
  });

  const cells = useMemo(() => {
    const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Senin = kolom pertama
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const arr: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [view]);

  const shift = (delta: number) =>
    setView((v) => {
      const next = new Date(v.y, v.m + delta, 1);
      return { y: next.getFullYear(), m: next.getMonth() };
    });

  const isSelected = (d: number) =>
    !!value && value.y === view.y && value.m === view.m && value.d === d;
  const isToday = (d: number) =>
    today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d;

  return (
    <View>
      {/* Navigasi bulan */}
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => shift(-1)}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F4FA]"
          accessibilityLabel="Bulan sebelumnya"
        >
          <Feather name="chevron-left" size={18} color="#0A0A6B" />
        </Pressable>
        <Text className="text-base font-bold text-[#0F1B3D]">
          {BULAN[view.m]} {view.y}
        </Text>
        <Pressable
          onPress={() => shift(1)}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center rounded-full bg-[#F1F4FA]"
          accessibilityLabel="Bulan berikutnya"
        >
          <Feather name="chevron-right" size={18} color="#0A0A6B" />
        </Pressable>
      </View>

      {/* Nama hari */}
      <View className="mb-1 flex-row">
        {HARI.map((h) => (
          <View key={h} style={{ width: `${100 / 7}%` }} className="items-center py-1">
            <Text className="text-[11px] font-semibold text-[#8A94A6]">{h}</Text>
          </View>
        ))}
      </View>

      {/* Tanggal */}
      <View className="flex-row flex-wrap">
        {cells.map((d, i) => (
          <View key={i} style={{ width: `${100 / 7}%` }} className="items-center py-0.5">
            {d === null ? (
              <View className="h-10 w-10" />
            ) : (
              <Pressable
                onPress={() => onSelect({ y: view.y, m: view.m, d })}
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  isSelected(d)
                    ? "bg-[#4B45C9]"
                    : isToday(d)
                    ? "border border-[#4B45C9]"
                    : "bg-transparent"
                }`}
                accessibilityLabel={`Pilih tanggal ${d}`}
              >
                <Text
                  className={`text-sm ${
                    isSelected(d) ? "font-bold text-white" : "text-[#0F1B3D]"
                  }`}
                >
                  {d}
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => onSelect({ y: today.getFullYear(), m: today.getMonth(), d: today.getDate() })}
        className="mt-3 items-center rounded-xl bg-[#EEF0FF] py-3 active:opacity-80"
      >
        <Text className="text-sm font-semibold text-[#4B45C9]">Hari ini</Text>
      </Pressable>
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
  const [minute, setMinute] = useState(m - (m % 5)); // bulatkan ke kelipatan 5

  return (
    <View>
      <Text className="mb-3 text-base font-bold text-[#0F1B3D]">{title}</Text>

      <View className="flex-row items-center">
        <WheelColumn items={HOURS} selected={hour} onSelect={setHour} />
        <Text className="mx-1 text-xl font-bold text-[#0F1B3D]">:</Text>
        <WheelColumn items={MINUTES} selected={minute} onSelect={setMinute} />
      </View>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={onCancel}
          className="flex-1 items-center rounded-xl border border-[#E3E8F3] bg-white py-3 active:bg-[#F6F8FC]"
        >
          <Text className="text-sm font-semibold text-[#4B45C9]">Batal</Text>
        </Pressable>
        <Pressable
          onPress={() => onConfirm(`${pad(hour)}:${pad(minute)}`)}
          className="flex-1 items-center rounded-xl bg-[#4B45C9] py-3 active:opacity-80"
        >
          <Text className="text-sm font-semibold text-white">Pilih</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------- Pop-up utama ---------- */

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (form: EventForm) => void;
}

function AddEventModal({ visible, onClose, onSubmit }: AddEventModalProps) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [picker, setPicker] = useState<PickerKind>(null);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    const errKey = key === "mulai" || key === "selesai" ? "jam" : key;
    if (errKey in errors) setErrors((e) => ({ ...e, [errKey]: undefined }));
  };

  const openPicker = (kind: Exclude<PickerKind, null>) => {
    Keyboard.dismiss();
    setPicker(kind);
  };

  const reset = () => {
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setPicker(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    const next: DraftErrors = {};
    if (!draft.nama.trim()) next.nama = "Nama kegiatan wajib diisi";
    if (!draft.tanggal) next.tanggal = "Tanggal wajib dipilih";
    if (!draft.mulai || !draft.selesai) next.jam = "Jam mulai dan selesai wajib diisi";
    else if (draft.selesai <= draft.mulai) next.jam = "Jam selesai harus setelah jam mulai";

    setErrors(next);
    if (Object.keys(next).length > 0 || !draft.tanggal) return;

    onSubmit({
      nama: draft.nama.trim(),
      tanggal: formatDate(draft.tanggal),
      jam: `${draft.mulai}–${draft.selesai}`,
      lokasi: draft.lokasi.trim(),
    });
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => (picker ? setPicker(null) : close())}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Overlay gelap: ketuk di luar dialog untuk menutup */}
        <Pressable className="flex-1 items-center justify-center bg-black/50 px-4" onPress={close}>
          {/* Dialog di tengah layar (Pressable kosong agar ketukan di dalam tidak menutup) */}
          <Pressable
            onPress={() => {}}
            className="max-h-[92%] w-full overflow-hidden rounded-3xl bg-white"
            style={{ maxWidth: 480 }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-3 pt-5">
              <Text className="text-xl font-bold text-[#0F1B3D]">Tambah kegiatan</Text>
              <Pressable
                onPress={close}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Tutup pop up"
              >
                <Feather name="x-circle" size={26} color="#D8283A" />
              </Pressable>
            </View>
            <View className="h-px bg-[#E3E8F3]" />

            {/* Isi form (bisa di-scroll di layar pendek) */}
            <ScrollView
              style={{ flexGrow: 0 }}
              className="px-5 pt-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FieldShell label="Nama kegiatan" error={errors.nama}>
                <TextField
                  value={draft.nama}
                  placeholder="Masukkan nama kegiatan"
                  error={errors.nama}
                  onChangeText={(v) => update("nama", v)}
                />
              </FieldShell>

              <FieldShell label="Tanggal" error={errors.tanggal}>
                <DateField
                  value={draft.tanggal}
                  error={errors.tanggal}
                  onPress={() => openPicker("tanggal")}
                />
              </FieldShell>

              <FieldShell label="Jam mulai–selesai" error={errors.jam}>
                <TimeRangeField
                  mulai={draft.mulai}
                  selesai={draft.selesai}
                  error={errors.jam}
                  onPick={openPicker}
                />
              </FieldShell>

              <FieldShell label="Lokasi">
                <TextField
                  value={draft.lokasi}
                  placeholder="Masukkan lokasi kegiatan"
                  icon="map-pin"
                  onChangeText={(v) => update("lokasi", v)}
                />
              </FieldShell>
            </ScrollView>

            {/* Tombol simpan */}
            <View className="px-5 pb-5 pt-1">
              <Pressable
                onPress={submit}
                className="flex-row items-center justify-center rounded-xl py-4 active:opacity-80"
                style={{
                  backgroundColor: PRIMARY,
                  shadowColor: PRIMARY,
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
                accessibilityRole="button"
                accessibilityLabel="Simpan kegiatan"
              >
                <Feather name="check" size={18} color="#FFFFFF" />
                <Text className="ml-2 text-[15px] font-semibold text-white">Simpan</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>

        {/* Pemilih tanggal / jam: tampil di atas dialog */}
        {picker !== null && (
          <View
            style={StyleSheet.absoluteFill}
            className="items-center justify-center bg-black/40 px-6"
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setPicker(null)} />
            <View className="w-full rounded-3xl bg-white p-4" style={{ maxWidth: 360 }}>
              {picker === "tanggal" ? (
                <CalendarPicker
                  value={draft.tanggal}
                  onSelect={(d) => {
                    update("tanggal", d);
                    setPicker(null);
                  }}
                />
              ) : (
                <TimePicker
                  key={picker}
                  title={picker === "mulai" ? "Jam mulai" : "Jam selesai"}
                  value={picker === "mulai" ? draft.mulai : draft.selesai}
                  onCancel={() => setPicker(null)}
                  onConfirm={(v) => {
                    update(picker, v);
                    setPicker(null);
                  }}
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

  // ---- Responsif ----
  // < 768  : HP      -> 1 kolom
  // >= 768 : tablet  -> 2 kolom, konten maksimum 960px dan di tengah
  const columns = width >= 768 ? 2 : 1;
  const titleSize = width >= 768 ? 20 : width < 360 ? 16 : 18;
  const sidePadding = width >= 768 ? 24 : 20;

  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const countLabel = useMemo(() => `${events.length} kegiatan`, [events.length]);

  /* ---------- Aksi ---------- */

  const updateStatus = useCallback((id: string, status: EventStatus) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

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

  const handleAddEvent = useCallback((form: EventForm) => {
    const baru: EventItem = {
      id: Date.now().toString(),
      nama: form.nama,
      tanggal: form.tanggal,
      jam: form.jam,
      lokasi: form.lokasi || undefined,
      status: "belum",
    };
    setEvents((prev) => [baru, ...prev]);
    setModalVisible(false);
  }, []);

  const handleRefresh = useCallback(() => {
    // TODO: ganti dengan fetch ulang data dari API
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4387C0" />
        }
      >
        {/* Wrapper responsif: lebar penuh di HP, maksimum 960 di layar besar */}
        <View className="w-full self-center" style={{ maxWidth: 960 }}>
          {/* Tombol tambah kegiatan */}
          <Pressable
            onPress={() => setModalVisible(true)}
            className="flex-row items-center justify-center rounded-2xl bg-[#4387C0] py-4 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Tambah kegiatan"
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text className="ml-2 text-[15px] font-semibold text-white">Tambah kegiatan</Text>
          </Pressable>

          {/* Judul daftar */}
          <View className="mb-3 mt-5 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-[#0A0A6B]">Daftar kegiatan</Text>
            <Text className="text-xs text-[#6B7690]">{countLabel}</Text>
          </View>

          {/* Daftar kegiatan (grid 1 / 2 kolom) */}
          {events.length === 0 ? (
            <EmptyEvents onAdd={() => setModalVisible(true)} />
          ) : (
            <View className="-m-1.5 flex-row flex-wrap">
              {events.map((item) => (
                <View
                  key={item.id}
                  className="p-1.5"
                  style={{ width: `${100 / columns}%` }}
                >
                  <EventCard
                    item={item}
                    titleSize={titleSize}
                    onPrimaryAction={handlePrimaryAction}
                    onPress={handleOpenDetail}
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

      <AddEventModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddEvent}
      />
    </SafeAreaView>
  );
}