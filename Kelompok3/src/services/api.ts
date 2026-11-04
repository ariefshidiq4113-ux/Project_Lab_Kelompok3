/**
 * api.ts
 * Base fetch wrapper ke HIMAFOR Attendance backend.
 *
 * ── Cara set BASE_URL ────────────────────────────────────────────────────────
 *
 * 1. HP fisik via Expo Go (--tunnel / --lan):
 *    Jalankan backend dengan ngrok:
 *      cd be && npx ngrok http 3000
 *    Salin URL https yang muncul, contoh: https://abc123.ngrok-free.app
 *    Set BASE_URL ke URL ngrok tersebut.
 *
 * 2. HP fisik, satu WiFi dengan laptop (--lan):
 *    Cari IP lokal laptop: ip addr (Linux) / ipconfig (Windows) / ifconfig (Mac)
 *    Set BASE_URL ke: http://<IP_LOKAL>:3000
 *
 * 3. Android emulator:
 *    Set BASE_URL ke: http://10.0.2.2:3000
 *
 * 4. iOS simulator:
 *    Set BASE_URL ke: http://localhost:3000
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ✏️  GANTI INI sesuai environment kamu:
export const BASE_URL = 'http://43.129.49.191:3005';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
}

export interface ApiError {
  message: string;
  status: number;
}

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, token }: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({ message: 'Respons tidak valid dari server.' }));

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message ?? `Error ${response.status}`,
      status: response.status,
    };
    throw error;
  }

  return data as T;
}
