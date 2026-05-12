// Admin API service layer.
//
// All endpoints hit the backend defined by API_BASE_URL (set via .env at build
// time and inlined by vite.config.ts). API_BASE_URL must already include the
// /api/v1 prefix — matching the convention used by services/apiService.ts.
//
// All admin endpoints require a Bearer token (set after register/login). The
// request() helper:
//   • injects Authorization header automatically
//   • parses the {success, message, data, errors} envelope
//   • throws ApiError(message, status, fieldErrors) on non-2xx / success:false
//   • on 401, clears the session and reloads the page (auto sign-out)

// vite.config.ts inlines this as a string literal. Falls back to '' so calls
// use relative paths when no env var is set (useful for same-origin proxying).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_BASE: string = ((globalThis as any).process?.env?.API_BASE_URL ?? '') as string;

// ─────────────────────────── Types — match server DTOs ───────────────────────────

export type Role = 'USER' | 'ADMIN';
export type StatusFilter = 'ALL' | 'ACTIVE' | 'DELETED';

/**
 * Sort keys accepted by GET /admin/users.
 * Defaults to NEWEST. Add/adjust values if the backend supports more options.
 */
export type SortKey = 'NEWEST' | 'OLDEST' | 'LAST_SEEN' | 'NAME_ASC';

/**
 * User resource shape returned by all /admin/users endpoints.
 * IDs are numeric (int64 on the server).
 */
export interface ApiUser {
  id: number;
  phone: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  about?: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/**
 * Spring-style page response shape used by GET /admin/users.
 * `page` is **0-indexed**.
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ListUsersParams {
  /** free-text search across displayName/email/phone */
  q?: string;
  role?: Role;
  /** undefined = all */
  verified?: boolean;
  status?: StatusFilter;
  /** ISO date — inclusive lower bound for createdAt */
  from?: string;
  /** ISO date — inclusive upper bound for createdAt */
  to?: string;
  sort?: SortKey;
  /** 0-indexed */
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export interface RegisterAdminPayload {
  displayName: string;
  email: string;
  phone: string;
  password: string;
  adminSecret: string;
}

export interface LoginPayload {
  /** Email or phone — backend accepts either. */
  identifier: string;
  password: string;
  /** Client platform identifier (auto-filled by loginAdmin). */
  platform?: string;
  /** Stable per-device id (auto-filled by loginAdmin). */
  deviceFingerprint?: string;
}

export interface AuthUser {
  id: number;
  phone: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  about?: string;
  role: Role;
  isVerified: boolean;
  lastSeenAt: string;
  createdAt: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, unknown>;
  timestamp: string;
}

// ─────────────────────────── Errors ───────────────────────────

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, unknown>;
  constructor(message: string, status: number, fieldErrors?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// ─────────────────────────── Session ───────────────────────────

const SESSION_KEY = 'ozi_admin_session_v1';

interface PersistedSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: number; // epoch ms
  user: AuthUser;
}

export const getSession = (): PersistedSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as PersistedSession;
    if (s.expiresAt && s.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
};

const persistSession = (data: AuthData) => {
  const s: PersistedSession = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenType: data.tokenType || 'Bearer',
    expiresAt: Date.now() + (data.expiresIn || 0) * 1000,
    user: data.user,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

const authHeader = (): Record<string, string> => {
  const s = getSession();
  if (!s) return {};
  return { Authorization: `${s.tokenType} ${s.accessToken}` };
};

// ─────────────────────────── HTTP helper ───────────────────────────

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeader(),
        ...(init.headers || {}),
      },
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ApiError(
      `Could not reach the server${API_BASE ? ` at ${API_BASE}` : ''}. Check your network.`,
      0
    );
  }

  // Global 401 — token expired or invalid → sign the admin out cleanly.
  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined') window.location.reload();
    throw new ApiError('Session expired. Please sign in again.', 401);
  }

  const text = await res.text();
  let body: ApiEnvelope<T> | { message?: string; errors?: Record<string, unknown> } | null = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      /* non-JSON */
    }
  }

  if (!res.ok) {
    const env = body as Partial<ApiEnvelope<T>> | null;
    throw new ApiError(
      env?.message || `Request failed (${res.status})`,
      res.status,
      env?.errors
    );
  }

  const env = body as ApiEnvelope<T>;
  if (env && typeof env.success === 'boolean' && !env.success) {
    throw new ApiError(env.message || 'Request failed', res.status, env.errors);
  }
  return env ? env.data : (undefined as T);
};

// ─────────────────────────── Auth ───────────────────────────

/** POST /auth/register/admin */
export const registerAdmin = async (payload: RegisterAdminPayload): Promise<AuthData> => {
  const data = await request<AuthData>('/auth/register/admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  persistSession(data);
  return data;
};

// Stable per-browser device id — persisted so the backend sees the same
// fingerprint across reloads / token refreshes from this admin console.
const DEVICE_FP_KEY = 'ozi_admin_device_fp';
const getDeviceFingerprint = (): string => {
  try {
    let fp = localStorage.getItem(DEVICE_FP_KEY);
    if (!fp) {
      // crypto.randomUUID is available in all modern browsers; fall back just in case.
      fp = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `admin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(DEVICE_FP_KEY, fp);
    }
    return fp;
  } catch {
    return 'admin-web';
  }
};

/** POST /auth/login */
export const loginAdmin = async (payload: LoginPayload): Promise<AuthData> => {
  const body: LoginPayload = {
    identifier: payload.identifier.trim(),
    password: payload.password,
    platform: payload.platform || 'admin-web',
    deviceFingerprint: payload.deviceFingerprint || getDeviceFingerprint(),
  };
  const data = await request<AuthData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  persistSession(data);
  return data;
};

// ─────────────────────────── Admin · User management ───────────────────────────

/** GET /admin/users — list/search with filters, 0-indexed pagination. */
export const listUsers = async (params: ListUsersParams = {}): Promise<PageResponse<ApiUser>> => {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.role) qs.set('role', params.role);
  if (typeof params.verified === 'boolean') qs.set('verified', String(params.verified));
  if (params.status && params.status !== 'ALL') qs.set('status', params.status);
  if (params.from) qs.set('from', toIsoStart(params.from));
  if (params.to) qs.set('to', toIsoEnd(params.to));
  qs.set('sort', params.sort || 'NEWEST');
  qs.set('page', String(params.page ?? 0));
  qs.set('size', String(params.size ?? 20));

  return request<PageResponse<ApiUser>>(`/admin/users?${qs.toString()}`, {
    method: 'GET',
    signal: params.signal,
  });
};

/** GET /admin/users/{id} — full user record, even if deleted. */
export const getUser = (id: number): Promise<ApiUser> =>
  request<ApiUser>(`/admin/users/${id}`, { method: 'GET' });

/** POST /admin/users/{id}/verify — force-verify without OTP. */
export const verifyUser = (id: number): Promise<ApiUser> =>
  request<ApiUser>(`/admin/users/${id}/verify`, { method: 'POST' });

/** POST /admin/users/{id}/role — promote/demote. */
export const changeUserRole = (id: number, role: Role): Promise<ApiUser> =>
  request<ApiUser>(`/admin/users/${id}/role`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });

/** POST /admin/users/{id}/restore — clear deletedAt. */
export const restoreUser = (id: number): Promise<ApiUser> =>
  request<ApiUser>(`/admin/users/${id}/restore`, { method: 'POST' });

/** POST /admin/users/{id}/reset-password — server BCrypt-hashes & revokes sessions. */
export const resetUserPassword = (id: number, newPassword: string): Promise<void> =>
  request<void>(`/admin/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });

/** POST /admin/users/{id}/delete — soft-delete. */
export const deleteUser = (id: number): Promise<ApiUser> =>
  request<ApiUser>(`/admin/users/${id}/delete`, { method: 'POST' });

// ─────────────────────────── helpers ───────────────────────────

// A bare date input gives 'YYYY-MM-DD' — backend expects ISO date-time, so
// expand to start-of-day / end-of-day in the user's local TZ.
const toIsoStart = (yyyyMmDd: string): string => {
  const d = new Date(yyyyMmDd);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const toIsoEnd = (yyyyMmDd: string): string => {
  const d = new Date(yyyyMmDd);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};
