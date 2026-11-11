export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

// ─── Helper fetch dengan token ────────────────────────────────────────────────
export async function apiFetch(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<Response> {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL belum dikonfigurasi.');
  }

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
