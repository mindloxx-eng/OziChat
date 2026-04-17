// ══════════════════════════════════════════════════════════════
//  OziChat — WebSocket STOMP Service
//  Real-time messaging, receipts, typing, and presence
// ══════════════════════════════════════════════════════════════

import { Client, IFrame, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken, setLastSeenAt, getLastSeenAt } from './tokenService';
import { WS_URL, getMissedMessages, type MessageData, type WsNotification } from './apiService';

// ── Types ────────────────────────────────────────────────────

export interface SendMessagePayload {
  conversationId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'LOCATION';
  tempId: string;
  replyTo?: string;
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

// ── Singleton WebSocket Manager ──────────────────────────────

// Feature flag — disable WebSocket entirely until backend CORS is configured.
// Set to true once backend allows localhost:3000 on /ws/chat endpoint.
const ENABLE_WEBSOCKET = false;

class WebSocketService {
  private client: Client | null = null;
  private messageHandlers: MessageHandler[] = [];
  private notificationHandlers: NotificationHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private conversationSubscriptions = new Map<number, { unsubscribe: () => void }>();
  private connected = false;

  /** Connect to the WebSocket server with JWT auth. */
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
      console.log('🔌 WebSocket: Already connected');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 0, // no auto-reconnect to avoid infinite CORS error loop
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log('🟢 WebSocket CONNECTED');
        this.connected = true;
        this.connectionHandlers.forEach((h) => h(true));

        // Subscribe to personal queues
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

        // Sync missed messages since last disconnect
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
        console.error('🔴 WebSocket Error:', event);
      },
    });

    this.client.activate();
  }

  /** Disconnect from WebSocket. */
  disconnect(): void {
    if (this.client?.active) {
      setLastSeenAt(new Date().toISOString());
      this.conversationSubscriptions.forEach((sub) => sub.unsubscribe());
      this.conversationSubscriptions.clear();
      this.client.deactivate();
      this.connected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  /** Check if connected. */
  isConnected(): boolean {
    return this.connected;
  }

  /** Subscribe to a conversation room for real-time messages. */
  subscribeToConversation(conversationId: number): void {
    if (!ENABLE_WEBSOCKET) return;
    if (!this.client?.active) {
      console.warn('🔌 WebSocket not connected — cannot subscribe to conversation');
      return;
    }

    if (this.conversationSubscriptions.has(conversationId)) {
      return; // Already subscribed
    }

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
  }

  /** Unsubscribe from a conversation room. */
  unsubscribeFromConversation(conversationId: number): void {
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
