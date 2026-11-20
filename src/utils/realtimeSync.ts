import { Player, Team, HammerCallStatus } from '../types/auction';

export interface SoldRecord {
  id: string;
  player: Player;
  winningTeam: Team;
  soldPrice: number;
  timestamp: number;
}

export interface AuctionSyncState {
  version: number;
  timestamp: number;
  source: 'admin' | 'stream';
  currentPlayerId: string | null;
  currentBid: number;
  highestBidderId: string | null;
  hammerStatus: HammerCallStatus;
  teams: Team[];
  players: Player[];
  soldHistory: SoldRecord[];
  lastSoldEvent?: SoldRecord;
  timerSeconds: number;
  timerEndTimestamp?: number;
  isTimerRunning: boolean;
}

export type SyncMessage =
  | { type: 'STATE_SYNC'; payload: AuctionSyncState; clientId?: string }
  | { type: 'REQUEST_SYNC'; timestamp: number; clientId?: string }
  | { type: 'HAMMER_CALL'; status: HammerCallStatus; timestamp: number; clientId?: string }
  | { type: 'BID_UPDATE'; currentBid: number; highestBidderId: string | null; timestamp: number; clientId?: string }
  | { type: 'TRIGGER_CELEBRATION'; soldRecord: SoldRecord; timestamp: number; clientId?: string }
  | { type: 'RESET_AUCTION'; timestamp: number; clientId?: string };

type SyncListener = (msg: SyncMessage) => void;

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private ws: WebSocket | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isDestroyed = false;
  private lastProcessedTimestamp = 0;
  private reconnectTimeout: any = null;
  private lastRequestTime = 0;
  // Unique client identifier for this tab/window to prevent self-echoes
  public readonly clientId: string =
    'tab-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();

  constructor() {
    this.initBroadcastChannel();
    this.initWebSocket();
    this.initStorageListener();
    this.initVisibilityAndFocusListeners();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('epl_auction_sync_channel');
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.handleIncoming(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed, falling back to WS/storage:', err);
      }
    }
  }

  private initWebSocket() {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/auction`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Request latest state immediately on connect
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          try {
            this.ws.send(JSON.stringify({ type: 'REQUEST_SYNC', timestamp: Date.now(), clientId: this.clientId }));
          } catch {}
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncoming(data);
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = setTimeout(() => this.initWebSocket(), 2000);
        }
      };

      this.ws.onerror = () => {
        // Silent fallback to BroadcastChannel and localStorage
      };
    } catch {
      // WS unavailable, BroadcastChannel and storage handle sync
    }
  }

  private initStorageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (e) => {
      if (e.key === 'epl_auction_broadcast_state' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          // Check clientId embedded in wrapper
          if (parsed && parsed.clientId === this.clientId) {
            return; // Ignore self-echo from localStorage
          }
          if (parsed && parsed.payload) {
            this.handleIncoming({
              type: 'STATE_SYNC',
              payload: parsed.payload,
              clientId: parsed.clientId,
            });
          }
        } catch (err) {
          console.error('Failed to parse storage sync event', err);
        }
      }
    });
  }

  /**
   * Debounced Wakeup Recovery:
   * When tab wakes up from background throttling or gains focus,
   * re-fetch the latest state without hammering the network.
   */
  private initVisibilityAndFocusListeners() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const wakeHandler = () => {
      this.requestLatestState();
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        wakeHandler();
      }
    });

    window.addEventListener('focus', wakeHandler);
  }

  public async requestLatestState() {
    const now = Date.now();
    if (now - this.lastRequestTime < 400) return;
    this.lastRequestTime = now;

    // 1. Try instant HTTP snapshot from server memory
    try {
      const res = await fetch('/api/auction/state', {
        headers: {
          'Cache-Control': 'no-cache',
          'X-Client-Id': this.clientId,
        },
      });
      if (res.ok) {
        const snapshot = await res.json();
        if (snapshot && snapshot.timestamp && snapshot.timestamp > this.lastProcessedTimestamp) {
          this.handleIncoming({
            type: 'STATE_SYNC',
            payload: snapshot,
            clientId: 'server',
          });
        }
      }
    } catch {}

    // 2. Try WebSocket sync request
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'REQUEST_SYNC', timestamp: Date.now(), clientId: this.clientId }));
      } catch {}
    }
  }

  public handleIncoming(msg: SyncMessage) {
    // CRITICAL: Filter out own messages to prevent echo loops and blinking!
    if (msg.clientId && msg.clientId === this.clientId) {
      return;
    }

    const msgTimestamp = 'payload' in msg ? msg.payload.timestamp : msg.timestamp;
    if (msgTimestamp && msgTimestamp < this.lastProcessedTimestamp) {
      return;
    }
    if (msgTimestamp) {
      this.lastProcessedTimestamp = msgTimestamp;
    }

    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('Error in sync listener', e);
      }
    });
  }

  public broadcast(msg: SyncMessage) {
    // Stamp the message with this tab's clientId
    msg.clientId = this.clientId;

    // 1. Send over BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('BroadcastChannel postMessage failed', err);
      }
    }

    // 2. Send over WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (err) {
        console.warn('WebSocket send failed', err);
      }
    }

    // 3. Post to HTTP backend endpoint and update localStorage
    if (msg.type === 'STATE_SYNC') {
      try {
        // Save wrapped state with clientId to prevent storage loop
        const storageWrapper = {
          clientId: this.clientId,
          payload: msg.payload,
          timestamp: Date.now(),
        };
        localStorage.setItem('epl_auction_broadcast_state', JSON.stringify(storageWrapper));

        if (typeof fetch !== 'undefined') {
          fetch('/api/auction/state', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Client-Id': this.clientId,
            },
            body: JSON.stringify({
              clientId: this.clientId,
              payload: msg.payload,
            }),
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed writing state to storage/API', err);
      }
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.channel) {
      this.channel.close();
    }
    if (this.ws) {
      this.ws.close();
    }
    clearTimeout(this.reconnectTimeout);
    this.listeners.clear();
  }
}

export const realtimeSync = new RealtimeSyncManager();
