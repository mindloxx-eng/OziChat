// ══════════════════════════════════════════════════════════════
//  OziChat — WebSocket STOMP Service
//  Real-time messaging, receipts, typing, and presence
// ══════════════════════════════════════════════════════════════

import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken, setLastSeenAt, getLastSeenAt } from './tokenService';
import { WS_URL, WS_NATIVE_URL, getMissedMessages, type MessageData, type WsNotification } from './apiService';

// ── Types ────────────────────────────────────────────────────

export interface SendMessagePayload {
  conversationId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION';
  tempId: string;
  replyTo?: string;
  // Optional media fields — for IMAGE/VIDEO/AUDIO/DOCUMENT messages
  mediaUrl?: string;
  mediaThumbnailUrl?: string;
  mediaMimeType?: string;
  mediaFileSize?: number;
  mediaFileName?: string;
  mediaDuration?: number;
  mediaWidth?: number;
  mediaHeight?: number;
}

export interface ReadReceiptPayload {
  conversationId: number;
  lastReadMessageId: string;
}

export interface TypingPayload {
  conversationId: number;
  isTyping: boolean;
}

type MessageHandler = (message: MessageData) => void;
type NotificationHandler = (notification: WsNotification) => void;
type ConnectionHandler = (connected: boolean) => void;

// ── Call signaling types ─────────────────────────────────────

export type CallEventType =
  | 'incoming_call'
  | 'call_initiated'
  | 'call_accepted'
  | 'call_rejected'
  | 'call_cancelled'
  | 'call_ended'
  | 'call_missed'
  | 'offer'
  | 'answer'
  | 'ice_candidate';

export interface CallSignalEnvelope {
  event: CallEventType;
  callId: string;
  fromUserId?: number;
  fromUserName?: string;
  fromUserAvatarUrl?: string;
  callType?: 'AUDIO' | 'VIDEO';
  sdp?: string;
  sdpType?: 'offer' | 'answer';
  candidate?: string | null;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  reason?: string;
  timestamp?: string;
}

type CallEventHandler = (envelope: CallSignalEnvelope) => void;

// ── Singleton WebSocket Manager ──────────────────────────────

// Feature flag — controls whether WebSocket is used for real-time messaging.
const ENABLE_WEBSOCKET = true;

// Max number of consecutive failed connection attempts before giving up
// (prevents console spam on CORS-blocked /ws/chat endpoint)
const MAX_CONSECUTIVE_FAILURES = 3;

// Use native WebSocket by default — avoids SockJS /info endpoint CORS issues.
// Falls back to SockJS if native fails.
const USE_NATIVE_WS = true;

class WebSocketService {
  private client: Client | null = null;
  private messageHandlers: MessageHandler[] = [];
  private notificationHandlers: NotificationHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private callEventHandlers: CallEventHandler[] = [];
  // Active STOMP subscription objects (only valid when connected)
  private conversationSubscriptions = new Map<number, { unsubscribe: () => void }>();
  // Desired conversation IDs — survives disconnects, used to (re)subscribe on connect
  private desiredConversations = new Set<number>();
  private connected = false;
  // Track consecutive failures to stop retrying on CORS errors
  private failureCount = 0;
  private gaveUp = false;
  private fallbackToSockJS = false;

  /** Connect to the WebSocket server with JWT auth.
   *  Always reads a fresh token on each (re)connect attempt. */
  connect(): void {
    if (!ENABLE_WEBSOCKET) {
      console.log('🔌 WebSocket disabled — using REST-only mode');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.warn('🔌 WebSocket: No access token — skipping connect');
      return;
    }

    if (this.client?.active) {
      console.log('🔌 WebSocket: Already active — skipping duplicate connect');
      return;
    }

    if (this.gaveUp) {
      console.warn('🔌 WebSocket: Giving up — backend CORS or endpoint unreachable. Call retry() to try again.');
      return;
    }

    // Reset failure tracking on manual connect
    this.failureCount = 0;

    const useNative = USE_NATIVE_WS && !this.fallbackToSockJS;
    console.log(`🔌 WebSocket connecting via ${useNative ? 'native WebSocket' : 'SockJS'} with Authorization: Bearer ...`);
    console.log(`🔌 Endpoint: ${useNative ? WS_NATIVE_URL : WS_URL}`);

    this.client = new Client({
      webSocketFactory: () => useNative
        ? (new WebSocket(WS_NATIVE_URL) as any)
        : (new SockJS(WS_URL) as any),
      // Fresh token on every connection attempt (handles token refresh)
      beforeConnect: () => {
        const freshToken = getAccessToken();
        if (freshToken && this.client) {
          this.client.connectHeaders = {
            Authorization: `Bearer ${freshToken}`,
          };
          console.log('🔑 WS CONNECT frame: Authorization header attached');
        }
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000, // auto-reconnect after 5s
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log('🟢 WebSocket CONNECTED (STOMP authenticated via JWT)');
        this.connected = true;
        this.failureCount = 0; // Reset on successful connect
        this.connectionHandlers.forEach((h) => h(true));

        // Step 1: Subscribe to personal queues immediately after CONNECTED
        this.client!.subscribe('/user/queue/messages', (frame: IMessage) => {
          try {
            const message: MessageData = JSON.parse(frame.body);
            console.log('📨 WS Message:', message);
            this.messageHandlers.forEach((h) => h(message));
          } catch (e) {
            console.error('Failed to parse WS message:', e);
          }
        });

        this.client!.subscribe('/user/queue/notifications', (frame: IMessage) => {
          try {
            const notification: WsNotification = JSON.parse(frame.body);
            console.log('🔔 WS Notification:', notification);
            this.notificationHandlers.forEach((h) => h(notification));
          } catch (e) {
            console.error('Failed to parse WS notification:', e);
          }
        });

        this.client!.subscribe('/user/queue/call', (frame: IMessage) => {
          try {
            const envelope: CallSignalEnvelope = JSON.parse(frame.body);
            console.log('📞 WS Call:', envelope.event, envelope);
            this.callEventHandlers.forEach((h) => h(envelope));
          } catch (e) {
            console.error('Failed to parse WS call envelope:', e);
          }
        });

        // Step 2: Subscribe to all desired conversation rooms
        // (some may have been requested before connection completed)
        this.conversationSubscriptions.clear();
        this.desiredConversations.forEach((convId) => this._activateRoomSubscription(convId));

        // Step 3: Sync missed messages since last disconnect
        this.syncMissedMessages();
      },

      onDisconnect: () => {
        console.log('🔴 WebSocket DISCONNECTED');
        this.connected = false;
        setLastSeenAt(new Date().toISOString());
        this.connectionHandlers.forEach((h) => h(false));
      },

      onStompError: (frame: IFrame) => {
        console.error('🔴 STOMP Error:', frame.headers['message'], frame.body);
      },

      onWebSocketError: (event: Event) => {
        this.failureCount++;
        if (this.failureCount === 1) {
          console.error(`🔴 WebSocket Error (${USE_NATIVE_WS && !this.fallbackToSockJS ? 'native' : 'SockJS'}):`, event);
        }
        // After 2 native-WS failures, try SockJS fallback
        if (USE_NATIVE_WS && !this.fallbackToSockJS && this.failureCount >= 2) {
          console.warn('🔄 Native WS failed — falling back to SockJS...');
          this.fallbackToSockJS = true;
          this.failureCount = 0;
          try { this.client?.deactivate(); } catch {}
          this.client = null;
          setTimeout(() => this.connect(), 500);
          return;
        }
        if (this.failureCount >= MAX_CONSECUTIVE_FAILURES) {
          console.warn(`🔌 WebSocket: Gave up after ${MAX_CONSECUTIVE_FAILURES} failures. Backend CORS on /ws/chat likely needs fixing. App will run in REST-only mode.`);
          console.warn('💡 Once backend CORS is fixed, call window.wsService.retry() to reconnect.');
          this.gaveUp = true;
          try { this.client?.deactivate(); } catch {}
        }
      },
    });

    this.client.activate();
  }

  /** Retry connection after giving up (e.g. after backend CORS is fixed). */
  retry(): void {
    console.log('🔌 WebSocket: Retrying connection...');
    this.gaveUp = false;
    this.failureCount = 0;
    this.fallbackToSockJS = false; // Try native again first
    this.connect();
  }

  /** Disconnect from WebSocket (e.g. on logout). */
  disconnect(): void {
    if (this.client?.active) {
      setLastSeenAt(new Date().toISOString());
      this.conversationSubscriptions.forEach((sub) => { try { sub.unsubscribe(); } catch {} });
      this.conversationSubscriptions.clear();
      this.desiredConversations.clear();
      this.client.deactivate();
      this.connected = false;
      console.log('🔌 WebSocket disconnected (manual)');
    }
  }

  /** Check if connected. */
  isConnected(): boolean {
    return this.connected;
  }

  /** Subscribe to a conversation room for real-time messages.
   *  Safe to call even if WS isn't connected yet — will activate on connect. */
  subscribeToConversation(conversationId: number): void {
    if (!ENABLE_WEBSOCKET) return;

    // Always track as desired (survives disconnects)
    this.desiredConversations.add(conversationId);

    // If already connected, activate immediately
    if (this.client?.active && this.connected) {
      this._activateRoomSubscription(conversationId);
    } else {
      console.log(`📥 Queued subscription for conversation ${conversationId} (WS not yet connected)`);
    }
  }

  /** Internal: actually open a STOMP subscription for a conversation room. */
  private _activateRoomSubscription(conversationId: number): void {
    if (!this.client?.active) return;
    if (this.conversationSubscriptions.has(conversationId)) return; // already active

    const sub = this.client.subscribe(
      `/topic/conversation/${conversationId}`,
      (frame: IMessage) => {
        try {
          const message: MessageData = JSON.parse(frame.body);
          console.log(`📨 WS Room ${conversationId}:`, message);
          this.messageHandlers.forEach((h) => h(message));
        } catch (e) {
          console.error('Failed to parse conversation message:', e);
        }
      }
    );

    this.conversationSubscriptions.set(conversationId, sub);
    console.log(`🟢 Subscribed to /topic/conversation/${conversationId}`);
  }

  /** Unsubscribe from a conversation room. */
  unsubscribeFromConversation(conversationId: number): void {
    this.desiredConversations.delete(conversationId);
    const sub = this.conversationSubscriptions.get(conversationId);
    if (sub) {
      sub.unsubscribe();
      this.conversationSubscriptions.delete(conversationId);
    }
  }

  // ── Sending ──────────────────────────────────────────────

  /** Send a chat message via STOMP. */
  sendMessage(payload: SendMessagePayload): void {
    if (!this.client?.active) {
      console.error('🔴 Cannot send — WebSocket not connected');
      return;
    }
    this.client.publish({
      destination: '/app/chat/send',
      body: JSON.stringify(payload),
    });
  }

  /** Mark messages as read in a conversation. */
  sendReadReceipt(payload: ReadReceiptPayload): void {
    if (!this.client?.active) return;
    this.client.publish({
      destination: '/app/chat/read',
      body: JSON.stringify(payload),
    });
  }

  /** Send typing indicator. */
  sendTyping(payload: TypingPayload): void {
    if (!this.client?.active) return;
    this.client.publish({
      destination: '/app/chat/typing',
      body: JSON.stringify(payload),
    });
  }

  // ── Call signaling publishes ─────────────────────────────

  private publishCall(destination: string, body: Record<string, unknown>): void {
    if (!this.client?.active) {
      console.error(`🔴 Cannot publish ${destination} — WebSocket not connected`);
      return;
    }
    this.client.publish({ destination, body: JSON.stringify(body) });
  }

  callInitiate(calleeId: number, type: 'AUDIO' | 'VIDEO'): void {
    this.publishCall('/app/call/initiate', { calleeId, type });
  }

  callAccept(callId: string): void {
    this.publishCall('/app/call/accept', { callId });
  }

  callReject(callId: string): void {
    this.publishCall('/app/call/reject', { callId });
  }

  callCancel(callId: string): void {
    this.publishCall('/app/call/cancel', { callId });
  }

  callEnd(callId: string): void {
    this.publishCall('/app/call/end', { callId });
  }

  callOffer(callId: string, sdp: string): void {
    this.publishCall('/app/call/offer', { callId, sdp, sdpType: 'offer' });
  }

  callAnswer(callId: string, sdp: string): void {
    this.publishCall('/app/call/answer', { callId, sdp, sdpType: 'answer' });
  }

  callIceCandidate(
    callId: string,
    candidate: string | null,
    sdpMid: string | null,
    sdpMLineIndex: number | null
  ): void {
    this.publishCall('/app/call/ice-candidate', { callId, candidate, sdpMid, sdpMLineIndex });
  }

  // ── Event Handlers ───────────────────────────────────────

  /** Register a handler for incoming messages. Returns unsubscribe fn. */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  /** Register a handler for notifications (receipts, typing, presence). */
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }

  /** Register a handler for connection state changes. */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler);
    };
  }

  /** Register a handler for call signaling events from /user/queue/call. */
  onCallEvent(handler: CallEventHandler): () => void {
    this.callEventHandlers.push(handler);
    return () => {
      this.callEventHandlers = this.callEventHandlers.filter((h) => h !== handler);
    };
  }

  // ── Internal ─────────────────────────────────────────────

  private async syncMissedMessages(): Promise<void> {
    try {
      const since = getLastSeenAt();
      console.log('🔄 Syncing missed messages since:', since);
      const res = await getMissedMessages(since);
      if (res.data && Array.isArray(res.data)) {
        res.data.forEach((msg) => {
          this.messageHandlers.forEach((h) => h(msg));
        });
        console.log(`🔄 Synced ${res.data.length} missed messages`);
      }
    } catch (e) {
      console.warn('Failed to sync missed messages:', e);
    }
  }
}

// ── Export singleton ─────────────────────────────────────────
export const wsService = new WebSocketService();
