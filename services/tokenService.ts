// ── Token Management Service ─────────────────────────────────
// Handles JWT access/refresh token storage, retrieval, and lifecycle.

const KEYS = {
  accessToken: 'ozichat_access_token',
  refreshToken: 'ozichat_refresh_token',
  userId: 'ozichat_user_id',
  userRole: 'ozichat_user_role',
  userEmail: 'ozichat_user_email',
  lastSeenAt: 'ozichat_last_seen_at',
} as const;

export function getAccessToken(): string | null {
  return localStorage.getItem(KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.refreshToken);
}

export function getUserId(): number | null {
  const id = localStorage.getItem(KEYS.userId);
  return id ? Number(id) : null;
}

export function getUserRole(): string | null {
  return localStorage.getItem(KEYS.userRole);
}

export function getUserEmail(): string | null {
  return localStorage.getItem(KEYS.userEmail);
}

export function getLastSeenAt(): string {
  return localStorage.getItem(KEYS.lastSeenAt) || new Date(0).toISOString();
}

export function setLastSeenAt(iso: string): void {
  localStorage.setItem(KEYS.lastSeenAt, iso);
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: number;
    email?: string;
    role?: string;
    displayName?: string;
    isVerified?: boolean;
  };
}

export function saveAuthTokens(tokens: AuthTokens): void {
  localStorage.setItem(KEYS.accessToken, tokens.accessToken);
  localStorage.setItem(KEYS.refreshToken, tokens.refreshToken);
  if (tokens.user) {
    localStorage.setItem(KEYS.userId, String(tokens.user.id));
    if (tokens.user.email) localStorage.setItem(KEYS.userEmail, tokens.user.email);
    if (tokens.user.role) localStorage.setItem(KEYS.userRole, tokens.user.role);
    if (tokens.user.displayName) localStorage.setItem('ozichat_display_name', tokens.user.displayName);
  }
}

export function clearAuthTokens(): void {
  localStorage.removeItem(KEYS.accessToken);
  localStorage.removeItem(KEYS.refreshToken);
  localStorage.removeItem(KEYS.userId);
  localStorage.removeItem(KEYS.userRole);
  localStorage.removeItem(KEYS.userEmail);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
