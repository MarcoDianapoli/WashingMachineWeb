const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const AUTH_STORAGE_KEY = 'autolavado_auth';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'washer' | 'client';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface StoredAuth {
  token: string;
  user: AuthUser;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function loadStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth | null) {
  try {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {}
}

async function apiFetch<T>(path: string, options: RequestInit = {}, tokenOverride?: string): Promise<T> {
  const token = tokenOverride ?? loadStoredAuth()?.token;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0);
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    // Nest's ValidationPipe returns message as an array
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message ?? 'Error del servidor.';
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export const api = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Revokes the session in Redis. Pass a token to log out a session not yet stored. */
  logout: (tokenOverride?: string) =>
    apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }, tokenOverride),

  me: () => apiFetch<AuthUser>('/auth/me'),
};
