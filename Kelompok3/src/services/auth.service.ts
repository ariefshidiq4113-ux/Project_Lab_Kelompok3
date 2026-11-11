/**
 * auth.service.ts
 * Login, token storage, dan helper auth.
 * Web: pakai localStorage
 * Native: pakai expo-secure-store
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'anggota';

export interface MemberPayload {
  id: string;
  nama: string;
  nim: string;
  email: string;
  jabatan: string;
  departemen: string;
  kodeDepartemen?: string;
  isAdmin: boolean;
  mustChangePassword: boolean;
}

export interface LoginResponse {
  token: string;
  member: MemberPayload;
}

// ─── Storage helpers (web: localStorage, native: SecureStore) ────────────────
async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'himafor_token';
const MEMBER_KEY = 'himafor_member';

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function saveSession(token: string, member: MemberPayload): Promise<void> {
  await setItem(TOKEN_KEY, token);
  await setItem(MEMBER_KEY, JSON.stringify(member));
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function getMember(): Promise<MemberPayload | null> {
  const raw = await getItem(MEMBER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberPayload;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await deleteItem(TOKEN_KEY);
  await deleteItem(MEMBER_KEY);
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Login ke backend.
 * Otomatis menyimpan token + data member ke SecureStore.
 * Mengembalikan data member termasuk flag `isAdmin`.
 */
export async function login(email: string, password: string): Promise<MemberPayload> {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  await saveSession(data.token, data.member);
  return data.member;
}

/**
 * Ubah password anggota.
 * Membutuhkan token yang tersimpan.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const token = await getToken();
  await apiFetch<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
    token,
  });
}

/**
 * Ambil data member dari API (verifikasi token masih valid).
 */
export async function fetchMe(): Promise<MemberPayload> {
  const token = await getToken();
  const data = await apiFetch<{ member: MemberPayload }>('/auth/me', { token });
  return data.member;
}
