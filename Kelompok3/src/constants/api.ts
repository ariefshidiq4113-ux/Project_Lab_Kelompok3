// ─── URL Backend ──────────────────────────────────────────────────────────────
// Ganti dengan IP komputer yang menjalankan backend saat testing di HP
// Contoh: 'http://192.168.1.5:3000'
// Di browser/web: 'http://localhost:3000' sudah cukup
export const API_BASE_URL = 'http://localhost:3000';

// ─── Helper fetch dengan token ────────────────────────────────────────────────
export async function apiFetch(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<Response> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });
}
