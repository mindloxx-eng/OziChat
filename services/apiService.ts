// ══════════════════════════════════════════════════════════════
//  OziChat — Complete REST API Service
//  Backend: Spring Boot 3.4 · JWT Auth · MySQL + MongoDB + Redis
// ══════════════════════════════════════════════════════════════

import {
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
  clearAuthTokens,
} from './tokenService';

// ── Configuration ────────────────────────────────────────────
const NGROK_BASE = 'https://unfeeling-appeasingly-natacha.ngrok-free.dev';
const API_BASE_URL = process.env.API_BASE_URL || `${NGROK_BASE}/api/v1`;

export const WS_URL = `${NGROK_BASE}/ws/chat`;
// Native WebSocket endpoint (Spring STOMP default). Avoids SockJS /info CORS.
export const WS_NATIVE_URL = `${NGROK_BASE.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/chat/websocket`;

/**
 * Fix backend URLs that point to localhost (dev misconfiguration).
 * Replaces `http://localhost:8080` with the public ngrok base URL.
 * Safe for null/undefined — returns empty string.
 */
export function normalizeMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://localhost:8080')) {
    return url.replace('http://localhost:8080', NGROK_BASE);
  }
  if (url.startsWith('https://localhost:8080')) {
    return url.replace('https://localhost:8080', NGROK_BASE);
  }
  return url;
}

// ── Types ────────────────────────────────────────────────────

// Generic API wrapper from backend
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
}

// Auth
export interface AuthUser {
  id: number;
  email: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string;
  about?: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

// User
export interface UserProfile {
  id: number;
  email?: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string;
  about?: string;
  role: string;
  isVerified: boolean;
  lastSeenAt?: string;
  createdAt: string;
}

// Conversation
export interface ConversationMember {
  userId: number;
  displayName: string;
  avatarUrl?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | string;
  joinedAt?: string;
  lastSeenAt?: string;
  lastReadMessageId?: string;
  lastReadAt?: string;
}

export interface ConversationLastMessage {
  messageId: string;
  senderId: number;
  contentPreview: string;
  type: string;
  sentAt: string;
}

// List API response (simplified)
export interface ConversationData {
  conversationId: number;
  displayName: string;
  avatarUrl: string | null;
  updatedAt: string;
  type: 'DIRECT' | 'GROUP' | string;
}

// Detail API response (full)
export interface ConversationDetail {
  id: number;
  type: 'DIRECT' | 'GROUP' | string;
  members: ConversationMember[];
  lastMessage?: ConversationLastMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  groupName?: string | null;
  groupAvatarUrl?: string | null;
}

// Message
export interface MessageData {
  id: string;
  conversationId: number;
  senderId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION';
  status: 'SENT' | 'DELIVERED' | 'READ';
  replyTo?: string;
  readAt?: string;
  media?: {
    url: string;
    thumbnailUrl?: string;
    mimeType: string;
    fileSize?: number;
    fileName?: string;
    duration?: number;
    width?: number;
    height?: number;
  };
  isEdited: boolean;
  editedAt?: string;
  isDeletedForEveryone: boolean;
  tempId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CursorPagedMessages {
  content: MessageData[];
  nextCursor: string | null;
  previousCursor?: string | null;
  hasMore: boolean;
  limit: number;
}

// Group
export interface GroupData {
  conversationId: number;
  groupName: string;
  groupDescription?: string;
  groupAvatarUrl?: string;
  maxMembers: number;
  currentMemberCount: number;
  onlyAdminsCanSend: boolean;
  onlyAdminsCanEditInfo: boolean;
  announcementText?: string | null;
  announcementAt?: string | null;
  announcementBy?: number | null;
  createdBy: number;
  members: ConversationMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMemberPage {
  content: (ConversationMember & { muted?: boolean })[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PinnedMessageData {
  id: number;
  conversationId: number;
  messageId: string;
  pinnedBy: number;
  pinnedAt: string;
}

export interface InviteLinkData {
  token: string;
  inviteLink: string;
}

// Search
export interface PagedUsers {
  content: UserProfile[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Notification types from WebSocket
export interface WsNotification {
  type: 'DELIVERED' | 'READ' | 'TYPING' | 'PRESENCE';
  messageId?: string;
  conversationId?: number;
  byUserId: number;
  isTyping?: boolean;
  status?: 'ONLINE' | 'OFFLINE';
  lastSeenAt?: string;
}

// ── Legacy OTP types (kept for backward compat) ──────────────
export interface SendOtpResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    message: string;
    otpExpiresAt: number;
  };
  code: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: any;
  code: number;
}

// ── Core HTTP Client ─────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processRefreshQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

async function apiRequest<T = any>(
  endpoint: string,
  method: string,
  body?: any,
  authenticated = true
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`\n🔵 API REQUEST`);
  console.log(`   URL:    ${method} ${url}`);
  if (body) console.log(`   Body:  `, body);

  const start = performance.now();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (body) headers['Content-Type'] = 'application/json';
  if (authenticated) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err: any) {
    const duration = Math.round(performance.now() - start);
    console.log(`🔴 API NETWORK ERROR (${duration}ms)`, err.message);
    throw err;
  }

  const duration = Math.round(performance.now() - start);

  // Handle 401 — attempt token refresh
  if (response.status === 401 && authenticated && !endpoint.includes('/auth/refresh')) {
    console.log(`🟡 401 received — attempting token refresh...`);
    const newToken = await handleTokenRefresh();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      clearAuthTokens();
      window.dispatchEvent(new CustomEvent('ozichat:auth-expired'));
      throw new ApiError('Session expired. Please log in again.', 401);
    }
  }

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(`Invalid JSON response`, response.status);
  }

  if (response.ok) {
    console.log(`🟢 API RESPONSE [${response.status}] (${duration}ms)`, data);
  } else {
    console.log(`🔴 API ERROR [${response.status}] (${duration}ms)`, data);
    throw new ApiError(
      data?.message || `Request failed: ${response.status}`,
      response.status,
      data?.errors
    );
  }

  return data;
}

async function handleTokenRefresh(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;
  try {
    const rt = getRefreshToken();
    if (!rt) return null;

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ refreshToken: rt }),
    });

    if (!res.ok) {
      processRefreshQueue(null);
      return null;
    }

    const json: ApiResponse<AuthData> = await res.json();
    saveAuthTokens({
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
      user: json.data.user,
    });
    processRefreshQueue(json.data.accessToken);
    return json.data.accessToken;
  } catch {
    processRefreshQueue(null);
    return null;
  } finally {
    isRefreshing = false;
  }
}

export class ApiError extends Error {
  status: number;
  errors: any;
  constructor(message: string, status: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// ══════════════════════════════════════════════════════════════
//  AUTH ENDPOINTS
// ══════════════════════════════════════════════════════════════

/** Register a new user. Returns access + refresh tokens. */
export async function register(params: {
  email?: string;
  phone?: string;
  password: string;
  displayName: string;
}): Promise<ApiResponse<AuthData>> {
  const res = await apiRequest<AuthData>('/auth/register', 'POST', params, false);
  saveAuthTokens({
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
    user: res.data.user,
  });
  return res;
}

/** Login with email/phone + password. */
export async function login(params: {
  identifier: string;
  password: string;
  platform?: 'ANDROID' | 'IOS' | 'WEB';
  deviceFingerprint?: string;
}): Promise<ApiResponse<AuthData>> {
  const res = await apiRequest<AuthData>('/auth/login', 'POST', {
    ...params,
    platform: params.platform || 'WEB',
  }, false);
  saveAuthTokens({
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
    user: res.data.user,
  });
  return res;
}

/** Exchange refresh token for new access + refresh token pair. */
export async function refreshToken(): Promise<ApiResponse<AuthData>> {
  const rt = getRefreshToken();
  if (!rt) throw new ApiError('No refresh token available', 401);
  const res = await apiRequest<AuthData>('/auth/refresh', 'POST', { refreshToken: rt }, false);
  saveAuthTokens({
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
    user: res.data.user,
  });
  return res;
}

/** Revoke the current session's refresh token. */
export async function logout(): Promise<ApiResponse<void>> {
  const rt = getRefreshToken();
  const res = await apiRequest<void>('/auth/logout', 'POST', { refreshToken: rt });
  clearAuthTokens();
  return res;
}

/** Revoke all sessions for the authenticated user. */
export async function logoutAll(): Promise<ApiResponse<void>> {
  const res = await apiRequest<void>('/auth/logout-all', 'POST');
  clearAuthTokens();
  return res;
}

// ── OTP Endpoints ────────────────────────────────────────────

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

/** Send a 6-digit OTP code to the user's email. */
export async function sendOtp(
  email: string,
  purpose: OtpPurpose = 'EMAIL_VERIFICATION'
): Promise<SendOtpResponse> {
  const url = `${API_BASE_URL}/auth/send-otp`;
  console.log(`\n🔵 API REQUEST\n   URL:    POST ${url}\n   Body:  `, { email, purpose });
  const start = performance.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ email, purpose }),
    });
    const duration = Math.round(performance.now() - start);
    const data = await response.json();
    console.log(response.ok
      ? `🟢 API RESPONSE [${response.status}] (${duration}ms)`
      : `🔴 API ERROR [${response.status}] (${duration}ms)`, data);
    return data;
  } catch (err: any) {
    console.log(`🔴 API NETWORK ERROR (${Math.round(performance.now() - start)}ms)`, err.message);
    throw err;
  }
}

/** Verify the 6-digit OTP code. */
export async function verifyOtp(
  email: string,
  code: string,
  purpose: OtpPurpose = 'EMAIL_VERIFICATION'
): Promise<VerifyOtpResponse> {
  const url = `${API_BASE_URL}/auth/otp/verify`;
  const payload = { email, code, purpose };
  console.log(`\n🔵 API REQUEST\n   URL:    POST ${url}\n   Body:  `, payload);
  const start = performance.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(payload),
    });
    const duration = Math.round(performance.now() - start);
    const data = await response.json();
    console.log(response.ok
      ? `🟢 API RESPONSE [${response.status}] (${duration}ms)`
      : `🔴 API ERROR [${response.status}] (${duration}ms)`, data);

    // If verify-otp returns tokens, save them
    if (data.success && data.data?.accessToken) {
      saveAuthTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        user: data.data.user,
      });
    }
    return data;
  } catch (err: any) {
    console.log(`🔴 API NETWORK ERROR (${Math.round(performance.now() - start)}ms)`, err.message);
    throw err;
  }
}

// ══════════════════════════════════════════════════════════════
//  USER ENDPOINTS
// ══════════════════════════════════════════════════════════════

/** Get the authenticated user's full profile. */
export async function getMyProfile(): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>('/users/me', 'GET');
}

/** Update the authenticated user's profile. */
export async function updateMyProfile(params: {
  displayName?: string;
  about?: string;
  avatarUrl?: string;
}): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>('/users/me', 'PATCH', params);
}

/** Soft-delete the authenticated user's account. */
export async function deleteMyAccount(): Promise<ApiResponse<void>> {
  return apiRequest<void>('/users/me', 'DELETE');
}

/** Get public profile of any user by ID. */
export async function getUserById(userId: number): Promise<ApiResponse<UserProfile>> {
  return apiRequest<UserProfile>(`/users/${userId}`, 'GET');
}

/** Search users by name, email, or phone. */
export async function searchUsers(query: string, page = 0, size = 20): Promise<ApiResponse<PagedUsers>> {
  return apiRequest<PagedUsers>(`/users/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, 'GET');
}

// ══════════════════════════════════════════════════════════════
//  CONVERSATION ENDPOINTS
// ══════════════════════════════════════════════════════════════

/** List all conversations for the authenticated user. */
export async function getConversations(): Promise<ApiResponse<ConversationData[]>> {
  return apiRequest<ConversationData[]>('/conversations', 'GET');
}

/** Get or create a 1-to-1 conversation with a target user. */
export async function getOrCreateDirectConversation(targetUserId: number): Promise<ApiResponse<ConversationDetail>> {
  return apiRequest<ConversationDetail>(`/conversations/direct?targetUserId=${targetUserId}`, 'GET');
}

/** Get a specific conversation by ID. */
export async function getConversationById(conversationId: number): Promise<ApiResponse<ConversationDetail>> {
  return apiRequest<ConversationDetail>(`/conversations/${conversationId}`, 'GET');
}

// ══════════════════════════════════════════════════════════════
//  MESSAGE ENDPOINTS
// ══════════════════════════════════════════════════════════════

/** Fetch message history with cursor-based pagination. */
export async function getMessages(
  conversationId: number,
  params?: { cursor?: string; limit?: number; direction?: 'BEFORE' | 'AFTER' }
): Promise<ApiResponse<CursorPagedMessages>> {
  const queryParts: string[] = [];
  if (params?.cursor) queryParts.push(`cursor=${params.cursor}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  if (params?.direction) queryParts.push(`direction=${params.direction}`);
  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiRequest<CursorPagedMessages>(
    `/conversations/${conversationId}/messages${qs}`,
    'GET'
  );
}

/** Get all messages across all conversations since a given timestamp. */
export async function getMissedMessages(since: string): Promise<ApiResponse<MessageData[]>> {
  return apiRequest<MessageData[]>(`/messages/missed?since=${encodeURIComponent(since)}`, 'GET');
}

/** Edit a message (sender only, within 15 minutes). */
export async function editMessage(messageId: string, content: string): Promise<ApiResponse<MessageData>> {
  return apiRequest<MessageData>(`/messages/${messageId}`, 'PATCH', { content });
}

/** Delete a message. */
export async function deleteMessage(
  messageId: string,
  scope: 'FOR_ME' | 'FOR_EVERYONE' = 'FOR_ME'
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/messages/${messageId}?scope=${scope}`, 'DELETE');
}

// ══════════════════════════════════════════════════════════════
//  GROUP ENDPOINTS
// ══════════════════════════════════════════════════════════════

/** Create a new group. */
export async function createGroup(params: {
  groupName: string;
  groupDescription?: string;
  groupAvatarUrl?: string;
  memberIds: number[];
}): Promise<ApiResponse<GroupData>> {
  return apiRequest<GroupData>('/groups', 'POST', params);
}

/** Get group info including members, roles, and announcement. */
export async function getGroup(conversationId: number): Promise<ApiResponse<GroupData>> {
  return apiRequest<GroupData>(`/groups/${conversationId}`, 'GET');
}

/** Update group name, description, avatar, or posting rules (admin/owner only). */
export async function updateGroup(
  conversationId: number,
  params: {
    groupName?: string;
    groupDescription?: string;
    groupAvatarUrl?: string;
    onlyAdminsCanSend?: boolean;
    onlyAdminsCanEditInfo?: boolean;
  }
): Promise<ApiResponse<GroupData>> {
  return apiRequest<GroupData>(`/groups/${conversationId}`, 'PATCH', params);
}

/** Get paginated member list for a group. */
export async function getGroupMembers(
  conversationId: number,
  page = 0,
  size = 20
): Promise<ApiResponse<GroupMemberPage>> {
  return apiRequest<GroupMemberPage>(`/groups/${conversationId}/members?page=${page}&size=${size}`, 'GET');
}

/** Add members to a group (admin/owner only). */
export async function addGroupMembers(
  conversationId: number,
  memberIds: number[]
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/groups/${conversationId}/members`, 'POST', { memberIds });
}

/** Remove a member from a group (or leave if removing yourself). */
export async function removeGroupMember(
  conversationId: number,
  targetUserId: number
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/groups/${conversationId}/members/${targetUserId}`, 'DELETE');
}

/** Promote or demote a member (owner only). */
export async function changeGroupMemberRole(
  conversationId: number,
  targetUserId: number,
  role: 'ADMIN' | 'MEMBER'
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/groups/${conversationId}/members/${targetUserId}/role`, 'PATCH', { role });
}

/** Generate an invite link (admin/owner only). */
export async function createGroupInviteLink(
  conversationId: number
): Promise<ApiResponse<InviteLinkData>> {
  return apiRequest<InviteLinkData>(`/groups/${conversationId}/invite-link`, 'POST');
}

/** Revoke the active invite link (admin/owner only). */
export async function revokeGroupInviteLink(
  conversationId: number
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/groups/${conversationId}/invite-link`, 'DELETE');
}

/** Join a group via invite link token. */
export async function joinGroupByToken(token: string): Promise<ApiResponse<GroupData>> {
  return apiRequest<GroupData>(`/groups/join/${token}`, 'POST');
}

/** Get all pinned messages in a group. */
export async function getGroupPinnedMessages(
  conversationId: number
): Promise<ApiResponse<PinnedMessageData[]>> {
  return apiRequest<PinnedMessageData[]>(`/groups/${conversationId}/pinned`, 'GET');
}

/** Pin a message in a group (admin/owner only, max 5). */
export async function pinGroupMessage(
  conversationId: number,
  messageId: string
): Promise<ApiResponse<PinnedMessageData>> {
  return apiRequest<PinnedMessageData>(`/groups/${conversationId}/pinned/${messageId}`, 'POST');
}

/** Unpin a message in a group (admin/owner only). */
export async function unpinGroupMessage(
  conversationId: number,
  messageId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/groups/${conversationId}/pinned/${messageId}`, 'DELETE');
}

/** Set or clear the group announcement (admin/owner only). */
export async function setGroupAnnouncement(
  conversationId: number,
  text: string
): Promise<ApiResponse<GroupData>> {
  return apiRequest<GroupData>(`/groups/${conversationId}/announcement`, 'PUT', { text });
}

// ══════════════════════════════════════════════════════════════
//  MEDIA ENDPOINTS
// ══════════════════════════════════════════════════════════════

export interface MediaUploadData {
  s3Key: string;
  url: string;
  mimeType: string;
  fileSize: number;
  fileName: string;
  width?: number;
  height?: number;
}

export interface PresignedUrlData {
  uploadUrl: string;
  s3Key: string;
  publicUrl: string;
  expiresAt: string;
}

/**
 * Upload a file to S3 via the server. Returns the public URL + metadata.
 * Uses multipart/form-data (not JSON).
 */
export async function uploadMedia(
  file: File | Blob,
  folder = 'chat'
): Promise<ApiResponse<MediaUploadData>> {
  const url = `${API_BASE_URL}/media/upload`;

  console.log(`\n🔵 MEDIA UPLOAD`);
  console.log(`   URL:    POST ${url}`);
  console.log(`   Folder: ${folder}`);
  console.log(`   File:   ${file instanceof File ? file.name : 'blob'} (${(file.size / 1024).toFixed(1)} KB)`);

  const start = performance.now();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const formData = new FormData();
  formData.append('folder', folder);
  formData.append('file', file, file instanceof File ? file.name : 'upload');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const duration = Math.round(performance.now() - start);
    const text = await response.text();
    let data: ApiResponse<MediaUploadData> | null = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* empty/non-JSON body */ }

    if (response.ok) {
      if (!data) throw new ApiError('Upload succeeded but response was empty', response.status);
      console.log(`🟢 MEDIA UPLOAD OK [${response.status}] (${duration}ms)`, data.data?.url);
      return data;
    }

    console.log(`🔴 MEDIA UPLOAD ERROR [${response.status}] (${duration}ms)`, data ?? text);
    throw new ApiError(
      data?.message || `Upload failed (HTTP ${response.status})`,
      response.status,
      data?.errors
    );
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    const duration = Math.round(performance.now() - start);
    console.log(`🔴 MEDIA UPLOAD NETWORK ERROR (${duration}ms)`, err.message);
    throw err;
  }
}

/** Get a pre-signed PUT URL for direct-to-S3 upload. */
export async function getPresignedUrl(
  fileName: string,
  folder = 'chat'
): Promise<ApiResponse<PresignedUrlData>> {
  return apiRequest<PresignedUrlData>(
    `/media/presign?fileName=${encodeURIComponent(fileName)}&folder=${encodeURIComponent(folder)}`,
    'POST'
  );
}

/** Delete a media object from S3 by its key. */
export async function deleteMedia(s3Key: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/media?s3Key=${encodeURIComponent(s3Key)}`, 'DELETE');
}

// ══════════════════════════════════════════════════════════════
//  REELS ENDPOINTS
// ══════════════════════════════════════════════════════════════

export interface ReelData {
  id: string;
  userId: number;
  uploaderName: string;
  uploaderAvatarUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  caption?: string;
  hashtags?: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReelCommentData {
  id: string;
  reelId: string;
  userId: number;
  userDisplayName: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface CursorPaged<T> {
  content: T[];
  nextCursor: string | null;
  previousCursor?: string | null;
  hasMore: boolean;
  limit: number;
}

export interface CreateReelPayload {
  videoKey?: string;
  videoUrl: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  caption?: string;
  duration?: number;
  fileSize?: number;
  width?: number;
  height?: number;
  mimeType?: string;
}

function buildCursorQuery(params?: { cursor?: string; limit?: number }): string {
  const parts: string[] = [];
  if (params?.cursor) parts.push(`cursor=${encodeURIComponent(params.cursor)}`);
  if (params?.limit) parts.push(`limit=${params.limit}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

/** GET /api/v1/reels — global reel feed (newest first, cursor-paginated). */
export async function getReels(
  params?: { cursor?: string; limit?: number }
): Promise<ApiResponse<CursorPaged<ReelData>>> {
  return apiRequest<CursorPaged<ReelData>>(`/reels${buildCursorQuery(params)}`, 'GET');
}

/** GET /api/v1/reels/{reelId} — get a single reel by ID. */
export async function getReelById(reelId: string): Promise<ApiResponse<ReelData>> {
  return apiRequest<ReelData>(`/reels/${encodeURIComponent(reelId)}`, 'GET');
}

/** GET /api/v1/reels/user/{targetUserId} — get reels posted by a specific user. */
export async function getUserReels(
  targetUserId: number,
  params?: { cursor?: string; limit?: number }
): Promise<ApiResponse<CursorPaged<ReelData>>> {
  return apiRequest<CursorPaged<ReelData>>(
    `/reels/user/${targetUserId}${buildCursorQuery(params)}`,
    'GET'
  );
}

/** GET /api/v1/reels/me — get the current user's own reels. */
export async function getMyReels(
  params?: { cursor?: string; limit?: number }
): Promise<ApiResponse<CursorPaged<ReelData>>> {
  return apiRequest<CursorPaged<ReelData>>(`/reels/me${buildCursorQuery(params)}`, 'GET');
}

/** POST /api/v1/reels — publish a reel (video must already be uploaded). */
export async function createReel(payload: CreateReelPayload): Promise<ApiResponse<ReelData>> {
  return apiRequest<ReelData>('/reels', 'POST', payload);
}

/** DELETE /api/v1/reels/{reelId} — soft-delete your own reel. */
export async function deleteReel(reelId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/reels/${encodeURIComponent(reelId)}`, 'DELETE');
}

/** POST /api/v1/reels/{reelId}/views — record a view (dedup per user per 24h). */
export async function recordReelView(reelId: string): Promise<ApiResponse<boolean>> {
  return apiRequest<boolean>(`/reels/${encodeURIComponent(reelId)}/views`, 'POST');
}

/** POST /api/v1/reels/{reelId}/like — like a reel (idempotent). */
export async function likeReel(reelId: string): Promise<ApiResponse<ReelData>> {
  return apiRequest<ReelData>(`/reels/${encodeURIComponent(reelId)}/like`, 'POST');
}

/** DELETE /api/v1/reels/{reelId}/like — unlike a reel. */
export async function unlikeReel(reelId: string): Promise<ApiResponse<ReelData>> {
  return apiRequest<ReelData>(`/reels/${encodeURIComponent(reelId)}/like`, 'DELETE');
}

/** POST /api/v1/reels/{reelId}/share/{conversationId} — share a reel into a chat. */
export async function shareReelToConversation(
  reelId: string,
  conversationId: number
): Promise<ApiResponse<void>> {
  return apiRequest<void>(
    `/reels/${encodeURIComponent(reelId)}/share/${conversationId}`,
    'POST'
  );
}

/** GET /api/v1/reels/{reelId}/comments — list comments for a reel. */
export async function getReelComments(
  reelId: string,
  params?: { cursor?: string; limit?: number }
): Promise<ApiResponse<CursorPaged<ReelCommentData>>> {
  return apiRequest<CursorPaged<ReelCommentData>>(
    `/reels/${encodeURIComponent(reelId)}/comments${buildCursorQuery(params)}`,
    'GET'
  );
}

/** POST /api/v1/reels/{reelId}/comments — post a comment on a reel. */
export async function postReelComment(
  reelId: string,
  content: string
): Promise<ApiResponse<ReelCommentData>> {
  return apiRequest<ReelCommentData>(
    `/reels/${encodeURIComponent(reelId)}/comments`,
    'POST',
    { content }
  );
}

/** DELETE /api/v1/reels/{reelId}/comments/{commentId} — delete your own comment. */
export async function deleteReelComment(
  reelId: string,
  commentId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(
    `/reels/${encodeURIComponent(reelId)}/comments/${encodeURIComponent(commentId)}`,
    'DELETE'
  );
}
