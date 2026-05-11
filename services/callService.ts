// ══════════════════════════════════════════════════════════════
//  OziChat — Call Service (WebRTC + STOMP signaling)
// ══════════════════════════════════════════════════════════════

import { wsService, type CallSignalEnvelope } from './websocketService';
import { getIceServers, type IceServer } from './apiService';

export type CallMediaType = 'AUDIO' | 'VIDEO';

export type CallPhase =
  | 'idle'
  | 'outgoing-ringing'  // caller waiting for accept
  | 'incoming-ringing'  // callee being rung
  | 'connecting'        // negotiating SDP/ICE
  | 'connected'         // media flowing
  | 'ended';

export interface CallState {
  phase: CallPhase;
  callId: string | null;
  type: CallMediaType;
  remoteUserId: number | null;
  remoteUserName: string;
  remoteUserAvatarUrl: string;
  isMuted: boolean;
  isVideoEnabled: boolean;
  endReason?: string;
}

const initialState: CallState = {
  phase: 'idle',
  callId: null,
  type: 'AUDIO',
  remoteUserId: null,
  remoteUserName: '',
  remoteUserAvatarUrl: '',
  isMuted: false,
  isVideoEnabled: false,
};

type StateListener = (state: CallState) => void;
type StreamListener = (kind: 'local' | 'remote', stream: MediaStream | null) => void;

class CallService {
  private state: CallState = { ...initialState };
  private stateListeners: StateListener[] = [];
  private streamListeners: StreamListener[] = [];

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private iceServers: IceServer[] = [];
  private pendingRemoteIce: RTCIceCandidateInit[] = [];

  private wsUnsubscribe: (() => void) | null = null;
  private initialized = false;

  /** Start listening for incoming call signals. Idempotent. */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.wsUnsubscribe = wsService.onCallEvent((env) => this.handleEvent(env));
    this.refreshIceServers();
  }

  destroy(): void {
    this.wsUnsubscribe?.();
    this.wsUnsubscribe = null;
    this.cleanup();
    this.initialized = false;
  }

  // ── State subscription ─────────────────────────────────────

  subscribe(listener: StateListener): () => void {
    this.stateListeners.push(listener);
    listener(this.state);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }

  onStream(listener: StreamListener): () => void {
    this.streamListeners.push(listener);
    if (this.localStream) listener('local', this.localStream);
    if (this.remoteStream) listener('remote', this.remoteStream);
    return () => {
      this.streamListeners = this.streamListeners.filter((l) => l !== listener);
    };
  }

  getState(): CallState {
    return this.state;
  }

  private setState(patch: Partial<CallState>): void {
    this.state = { ...this.state, ...patch };
    this.stateListeners.forEach((l) => l(this.state));
  }

  private emitStream(kind: 'local' | 'remote', stream: MediaStream | null): void {
    this.streamListeners.forEach((l) => l(kind, stream));
  }

  // ── Public actions ─────────────────────────────────────────

  async startCall(params: {
    calleeId: number;
    calleeName: string;
    calleeAvatarUrl?: string;
    type: CallMediaType;
  }): Promise<void> {
    if (this.state.phase !== 'idle' && this.state.phase !== 'ended') {
      console.warn('callService: ignoring startCall — phase is', this.state.phase);
      return;
    }

    await this.refreshIceServers();

    this.setState({
      phase: 'outgoing-ringing',
      callId: null,
      type: params.type,
      remoteUserId: params.calleeId,
      remoteUserName: params.calleeName,
      remoteUserAvatarUrl: params.calleeAvatarUrl || '',
      isMuted: false,
      isVideoEnabled: params.type === 'VIDEO',
      endReason: undefined,
    });

    // Acquire local media early so we're ready to send tracks once accepted.
    try {
      await this.acquireLocalStream(params.type);
    } catch (err) {
      console.error('Failed to acquire local media:', err);
      this.setState({ phase: 'ended', endReason: 'MEDIA_ERROR' });
      this.cleanup();
      return;
    }

    wsService.callInitiate(params.calleeId, params.type);
  }

  acceptIncoming(): void {
    if (!this.state.callId || this.state.phase !== 'incoming-ringing') return;
    wsService.callAccept(this.state.callId);
    this.setState({ phase: 'connecting' });
    // Acquire local media + create peer connection now; we wait for offer.
    this.acquireLocalStream(this.state.type)
      .then(() => this.ensurePeerConnection())
      .catch((err) => {
        console.error('Failed to acquire local media on accept:', err);
        this.endCall();
      });
  }

  rejectIncoming(): void {
    if (!this.state.callId) return;
    wsService.callReject(this.state.callId);
    this.setState({ phase: 'ended', endReason: 'REJECTED' });
    this.cleanup();
  }

  cancelOutgoing(): void {
    if (!this.state.callId) {
      // Server hasn't ack'd yet — just cleanup locally.
      this.setState({ phase: 'ended', endReason: 'CANCELLED' });
      this.cleanup();
      return;
    }
    wsService.callCancel(this.state.callId);
    this.setState({ phase: 'ended', endReason: 'CANCELLED' });
    this.cleanup();
  }

  endCall(): void {
    if (this.state.callId) {
      wsService.callEnd(this.state.callId);
    }
    this.setState({ phase: 'ended', endReason: 'NORMAL' });
    this.cleanup();
  }

  toggleMute(): void {
    if (!this.localStream) return;
    const track = this.localStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    this.setState({ isMuted: !track.enabled });
  }

  toggleVideo(): void {
    if (!this.localStream) return;
    const track = this.localStream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    this.setState({ isVideoEnabled: track.enabled });
  }

  // ── Event dispatcher ───────────────────────────────────────

  private handleEvent(env: CallSignalEnvelope): void {
    switch (env.event) {
      case 'incoming_call':
        this.onIncomingCall(env);
        break;
      case 'call_initiated':
        this.onCallInitiated(env);
        break;
      case 'call_accepted':
        this.onCallAccepted(env);
        break;
      case 'call_rejected':
        this.onCallRejected(env);
        break;
      case 'call_cancelled':
        this.onCallCancelled(env);
        break;
      case 'call_ended':
        this.onCallEnded(env);
        break;
      case 'call_missed':
        this.onCallMissed(env);
        break;
      case 'offer':
        this.onRemoteOffer(env);
        break;
      case 'answer':
        this.onRemoteAnswer(env);
        break;
      case 'ice_candidate':
        this.onRemoteIceCandidate(env);
        break;
      default:
        console.warn('Unknown call event:', env.event);
    }
  }

  private onIncomingCall(env: CallSignalEnvelope): void {
    if (this.state.phase !== 'idle' && this.state.phase !== 'ended') {
      // Already busy. Auto-reject.
      if (env.callId) wsService.callReject(env.callId);
      return;
    }
    this.setState({
      phase: 'incoming-ringing',
      callId: env.callId,
      type: (env.callType as CallMediaType) || 'AUDIO',
      remoteUserId: env.fromUserId ?? null,
      remoteUserName: env.fromUserName || 'Unknown',
      remoteUserAvatarUrl: env.fromUserAvatarUrl || '',
      isMuted: false,
      isVideoEnabled: env.callType === 'VIDEO',
      endReason: undefined,
    });
  }

  private onCallInitiated(env: CallSignalEnvelope): void {
    this.setState({ callId: env.callId });
  }

  private async onCallAccepted(env: CallSignalEnvelope): Promise<void> {
    this.setState({ phase: 'connecting', callId: env.callId });
    await this.ensurePeerConnection();
    if (!this.peerConnection) return;
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      wsService.callOffer(env.callId, offer.sdp || '');
    } catch (err) {
      console.error('Failed to create/send offer:', err);
      this.endCall();
    }
  }

  private onCallRejected(_env: CallSignalEnvelope): void {
    this.setState({ phase: 'ended', endReason: 'REJECTED' });
    this.cleanup();
  }

  private onCallCancelled(_env: CallSignalEnvelope): void {
    this.setState({ phase: 'ended', endReason: 'CANCELLED' });
    this.cleanup();
  }

  private onCallEnded(env: CallSignalEnvelope): void {
    this.setState({ phase: 'ended', endReason: env.reason || 'NORMAL' });
    this.cleanup();
  }

  private onCallMissed(_env: CallSignalEnvelope): void {
    this.setState({ phase: 'ended', endReason: 'MISSED' });
    this.cleanup();
  }

  private async onRemoteOffer(env: CallSignalEnvelope): Promise<void> {
    await this.ensurePeerConnection();
    if (!this.peerConnection || !env.sdp) return;
    try {
      await this.peerConnection.setRemoteDescription({ type: 'offer', sdp: env.sdp });
      await this.flushPendingIce();
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      wsService.callAnswer(env.callId, answer.sdp || '');
    } catch (err) {
      console.error('Failed to handle offer:', err);
      this.endCall();
    }
  }

  private async onRemoteAnswer(env: CallSignalEnvelope): Promise<void> {
    if (!this.peerConnection || !env.sdp) return;
    try {
      await this.peerConnection.setRemoteDescription({ type: 'answer', sdp: env.sdp });
      await this.flushPendingIce();
    } catch (err) {
      console.error('Failed to set remote answer:', err);
      this.endCall();
    }
  }

  private async onRemoteIceCandidate(env: CallSignalEnvelope): Promise<void> {
    if (!this.peerConnection) return;
    if (!env.candidate) {
      // null = end-of-candidates
      try {
        await this.peerConnection.addIceCandidate(null as any);
      } catch {
        /* some browsers reject null — safe to ignore */
      }
      return;
    }
    const init: RTCIceCandidateInit = {
      candidate: env.candidate,
      sdpMid: env.sdpMid ?? undefined,
      sdpMLineIndex: env.sdpMLineIndex ?? undefined,
    };
    if (!this.peerConnection.remoteDescription) {
      this.pendingRemoteIce.push(init);
      return;
    }
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(init));
    } catch (err) {
      console.warn('addIceCandidate failed:', err);
    }
  }

  // ── WebRTC plumbing ────────────────────────────────────────

  private async refreshIceServers(): Promise<void> {
    try {
      const res = await getIceServers();
      if (res?.success && Array.isArray(res.data)) {
        this.iceServers = res.data;
      }
    } catch (err) {
      console.warn('getIceServers failed:', err);
    }
  }

  private async acquireLocalStream(type: CallMediaType): Promise<MediaStream> {
    if (this.localStream) return this.localStream;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'VIDEO',
    });
    this.localStream = stream;
    this.emitStream('local', stream);
    return stream;
  }

  private async ensurePeerConnection(): Promise<void> {
    if (this.peerConnection) return;

    const config: RTCConfiguration = {
      iceServers: this.iceServers.map((s) => ({
        urls: s.urls,
        username: s.username || undefined,
        credential: s.credential || undefined,
      })),
    };
    const pc = new RTCPeerConnection(config);
    this.peerConnection = pc;

    pc.onicecandidate = (event) => {
      if (!this.state.callId) return;
      wsService.callIceCandidate(
        this.state.callId,
        event.candidate?.candidate ?? null,
        event.candidate?.sdpMid ?? null,
        event.candidate?.sdpMLineIndex ?? null
      );
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        this.remoteStream = stream;
        this.emitStream('remote', stream);
      }
      if (this.state.phase !== 'connected') {
        this.setState({ phase: 'connected' });
      }
    };

    pc.onconnectionstatechange = () => {
      const cs = pc.connectionState;
      console.log('[WebRTC] connection state:', cs);
      if (cs === 'connected') {
        this.setState({ phase: 'connected' });
      } else if (cs === 'failed' || cs === 'closed' || cs === 'disconnected') {
        // Don't auto-end on transient disconnected; only on failed/closed.
        if (cs === 'failed' || cs === 'closed') {
          this.endCall();
        }
      }
    };

    if (!this.localStream) {
      await this.acquireLocalStream(this.state.type);
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => pc.addTrack(track, this.localStream!));
    }
  }

  private async flushPendingIce(): Promise<void> {
    if (!this.peerConnection) return;
    const pending = this.pendingRemoteIce.splice(0);
    for (const init of pending) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(init));
      } catch (err) {
        console.warn('flushPendingIce failed:', err);
      }
    }
  }

  private cleanup(): void {
    try {
      this.peerConnection?.getSenders().forEach((s) => {
        try { s.track?.stop(); } catch {}
      });
      this.peerConnection?.close();
    } catch {
      /* ignore */
    }
    this.peerConnection = null;

    this.localStream?.getTracks().forEach((t) => {
      try { t.stop(); } catch {}
    });
    this.localStream = null;
    this.remoteStream = null;
    this.pendingRemoteIce = [];

    this.emitStream('local', null);
    this.emitStream('remote', null);

    // Snap to idle after a short delay so UI can show "ended" briefly.
    setTimeout(() => {
      if (this.state.phase === 'ended') {
        this.setState({ ...initialState });
      }
    }, 600);
  }
}

export const callService = new CallService();
