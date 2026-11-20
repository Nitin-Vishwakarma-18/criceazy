import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { Player, Team, BidRecord, AuctionHistoryAction, HammerCallStatus } from '../types/auction';
import { INITIAL_TEAMS, INITIAL_PLAYERS, DEFAULT_PURSE_POINTS, MAX_SQUAD_PER_TEAM } from '../data/initialData';
import { sound } from '../utils/audio';
import { formatCurrency } from '../utils/currency';
import { realtimeSync, SoldRecord, AuctionSyncState } from '../utils/realtimeSync';

const STORAGE_KEY_TEAMS = 'cricket_auction_teams_v4';
const STORAGE_KEY_PLAYERS = 'cricket_auction_players_v4';
const STORAGE_KEY_ACTIONS = 'cricket_auction_actions_v4';
const STORAGE_KEY_SOLD_HISTORY = 'cricket_auction_sold_history_v4';

interface AuctionContextType {
  teams: Team[];
  players: Player[];
  currentPlayer: Player | null;
  currentBid: number;
  highestBidder: Team | null;
  bidHistory: BidRecord[];
  soldHistory: SoldRecord[];
  lastSoldEvent?: SoldRecord;
  hammerStatus: HammerCallStatus;
  isTimerRunning: boolean;
  timerSeconds: number;
  soundMuted: boolean;
  projectorMode: boolean;
  lastMessage: { type: 'success' | 'error' | 'info'; text: string } | null;
  theme: 'light';
  logoStyle: 'realistic' | 'edited';

  // Actions
  placeBid: (teamId: string, amount: number) => { success: boolean; error?: string };
  increaseBidBy: (increment: number, specificTeamId?: string) => { success: boolean; error?: string };
  markSold: () => boolean;
  markUnsold: () => boolean;
  callGoingOnce: () => void;
  callGoingTwice: () => void;
  setHammerStatus: (status: HammerCallStatus) => void;
  undoLastAction: () => boolean;
  nextPlayer: () => void;
  prevPlayer: () => void;
  selectPlayer: (playerId: string) => void;
  startTimer: (seconds?: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  toggleSound: () => void;
  toggleProjectorMode: () => void;
  toggleLogoStyle: () => void;
  addTeam: (team: Omit<Team, 'id' | 'remainingBudget'>) => void;
  updateTeamSquadLimit: (teamId: string, newLimit: number) => void;
  removeTeam: (teamId: string) => void;
  addPlayer: (player: Omit<Player, 'id' | 'status' | 'order'>) => void;
  removePlayer: (playerId: string) => void;
  resetAuction: () => void;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export const AuctionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme: 'light' = 'light';
  const latestKnownTimestampRef = useRef<number>(0);

  // Logo variant state: 'realistic' | 'edited'
  const [logoStyle, setLogoStyle] = useState<'realistic' | 'edited'>(() => {
    const saved = localStorage.getItem('epl_auction_logo_style');
    return saved === 'edited' || saved === 'realistic' ? saved : 'realistic';
  });

  // Load initial or persisted state
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TEAMS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: Team) => ({
            ...t,
            maxSquadSize: t.maxSquadSize || MAX_SQUAD_PER_TEAM,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TEAMS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PLAYERS;
  });

  const [actions, setActions] = useState<AuctionHistoryAction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // Live Sold History for broadcast ticker
  const [soldHistory, setSoldHistory] = useState<SoldRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SOLD_HISTORY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [lastSoldEvent, setLastSoldEvent] = useState<SoldRecord | undefined>(undefined);

  // Active player selection
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(() => {
    const activeIdx = players.findIndex(p => p.status === 'IN_AUCTION');
    if (activeIdx !== -1) return activeIdx;
    const firstUpcoming = players.findIndex(p => p.status === 'UPCOMING');
    return firstUpcoming !== -1 ? firstUpcoming : 0;
  });

  const currentPlayer = players[currentPlayerIndex] || null;

  // Active bidding state on current player
  const [currentBid, setCurrentBid] = useState<number>(currentPlayer ? currentPlayer.basePrice : 0);
  const [currentHighestBidderId, setCurrentHighestBidderId] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<BidRecord[]>([]);

  // Hammer Call Status: LIVE_BIDDING | GOING_ONCE | GOING_TWICE | SOLD | UNSOLD
  const [hammerStatus, setHammerStatus] = useState<HammerCallStatus>('LIVE_BIDDING');

  // Auction Controls & Timer (wall-clock based so it never freezes in background)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(20);
  const [timerEndTimestamp, setTimerEndTimestamp] = useState<number | undefined>(undefined);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Local Storage Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams));
    } catch (e) {
      console.error(e);
    }
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error(e);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(actions));
    } catch (e) {
      console.error(e);
    }
  }, [actions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOLD_HISTORY, JSON.stringify(soldHistory));
    } catch (e) {
      console.error(e);
    }
  }, [soldHistory]);

  // When switching current player, initialize bidding price & hammer status
  useEffect(() => {
    if (currentPlayer) {
      if (currentPlayer.status === 'SOLD' && currentPlayer.soldPrice) {
        setCurrentBid(currentPlayer.soldPrice);
        setCurrentHighestBidderId(currentPlayer.soldToTeamId || null);
        setHammerStatus('SOLD');
      } else if (currentPlayer.status === 'UNSOLD') {
        setCurrentBid(currentPlayer.basePrice);
        setCurrentHighestBidderId(null);
        setHammerStatus('UNSOLD');
      } else {
        setCurrentBid(currentPlayer.basePrice);
        setCurrentHighestBidderId(null);
        setHammerStatus('LIVE_BIDDING');
      }
      setBidHistory([]);
      setIsTimerRunning(false);
      setTimerEndTimestamp(undefined);
      setTimerSeconds(20);
    }
  }, [currentPlayerIndex, players.length]);

  // Timer Countdown Effect using wall-clock timestamp (never freezes in background tabs)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && timerEndTimestamp) {
      const checkClock = () => {
        const remaining = Math.max(0, Math.ceil((timerEndTimestamp - Date.now()) / 1000));
        setTimerSeconds(remaining);
        if (remaining <= 0) {
          setIsTimerRunning(false);
          setTimerEndTimestamp(undefined);
          sound.playHammer();
        } else if (remaining <= 3) {
          sound.playHammer();
        }
      };

      checkClock();
      interval = setInterval(checkClock, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerEndTimestamp]);

  /**
   * Action-Driven State Broadcast:
   * Explicitly broadcast state ONLY when actions happen, avoiding feedback loops & blinking!
   */
  const broadcastCurrentState = (overrides?: Partial<AuctionSyncState>) => {
    const now = Date.now();
    latestKnownTimestampRef.current = now;

    const syncPayload: AuctionSyncState = {
      version: 1,
      timestamp: now,
      source: 'admin',
      currentPlayerId: currentPlayer?.id || null,
      currentBid,
      highestBidderId: currentHighestBidderId,
      hammerStatus,
      teams,
      players,
      soldHistory,
      lastSoldEvent,
      timerSeconds,
      timerEndTimestamp,
      isTimerRunning,
      ...overrides,
    };

    realtimeSync.broadcast({
      type: 'STATE_SYNC',
      payload: syncPayload,
    });
  };

  // REAL-TIME LISTENER: Receive updates from other tabs / backend (drops own echoes)
  useEffect(() => {
    realtimeSync.requestLatestState();

    const unsubscribe = realtimeSync.subscribe((msg) => {
      if (msg.type === 'STATE_SYNC') {
        const payload = msg.payload;

        // Skip stale states
        if (payload.timestamp && payload.timestamp < latestKnownTimestampRef.current) {
          return;
        }
        latestKnownTimestampRef.current = payload.timestamp || Date.now();

        setTeams(payload.teams);
        setPlayers(payload.players);
        setCurrentBid(payload.currentBid);
        setCurrentHighestBidderId(payload.highestBidderId);
        setHammerStatus(payload.hammerStatus);
        setSoldHistory(payload.soldHistory);
        if (payload.lastSoldEvent) {
          setLastSoldEvent(payload.lastSoldEvent);
        }
        if (payload.currentPlayerId) {
          const idx = payload.players.findIndex(p => p.id === payload.currentPlayerId);
          if (idx !== -1) {
            setCurrentPlayerIndex(idx);
          }
        }

        // Calculate wall-clock timer so background tabs sync instantly
        if (payload.isTimerRunning && payload.timerEndTimestamp) {
          setTimerEndTimestamp(payload.timerEndTimestamp);
          const remaining = Math.max(0, Math.ceil((payload.timerEndTimestamp - Date.now()) / 1000));
          setTimerSeconds(remaining);
          setIsTimerRunning(remaining > 0);
        } else {
          setIsTimerRunning(false);
          setTimerSeconds(payload.timerSeconds);
          setTimerEndTimestamp(undefined);
        }
      } else if (msg.type === 'TRIGGER_CELEBRATION') {
        setHammerStatus('SOLD');
        setLastSoldEvent(msg.soldRecord);
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 },
          colors: [msg.soldRecord.winningTeam.primaryColor, '#dc2626', '#eab308', '#ffffff'],
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const highestBidder = teams.find(t => t.id === currentHighestBidderId) || null;

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setLastMessage({ type, text });
    setTimeout(() => {
      setLastMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const toggleLogoStyle = () => {
    setLogoStyle(prev => (prev === 'realistic' ? 'edited' : 'realistic'));
  };

  /**
   * Place Bid: atomic local update + immediate broadcast
   */
  const placeBid = (teamId: string, amount: number): { success: boolean; error?: string } => {
    if (!currentPlayer) {
      return { success: false, error: 'No player currently on auction hammer.' };
    }

    if (currentPlayer.status === 'SOLD') {
      return { success: false, error: 'Player is already sold.' };
    }

    const team = teams.find(t => t.id === teamId);
    if (!team) {
      return { success: false, error: 'Team not found.' };
    }

    // Validation 1: Remaining budget check
    if (team.remainingBudget < amount) {
      const err = `Insufficient points! ${team.name} has only ${formatCurrency(team.remainingBudget)} remaining.`;
      showNotification('error', err);
      return { success: false, error: err };
    }

    // Validation 2: Squad limit check
    const currentSquad = players.filter(p => p.soldToTeamId === team.id);
    const maxAllowed = team.maxSquadSize || MAX_SQUAD_PER_TEAM;
    if (currentSquad.length >= maxAllowed) {
      const err = `${team.name} has reached the maximum squad limit of ${maxAllowed} players!`;
      showNotification('error', err);
      return { success: false, error: err };
    }

    // Validation 3: Must exceed current bid (or equal base price on first bid)
    if (currentHighestBidderId !== null && amount <= currentBid) {
      const err = `Bid must exceed current highest bid of ${formatCurrency(currentBid)}`;
      showNotification('error', err);
      return { success: false, error: err };
    }

    const newRecord: BidRecord = {
      id: `bid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: currentPlayer.id,
      teamId: team.id,
      teamName: team.name,
      teamShortName: team.shortName,
      teamColor: team.primaryColor,
      amount,
      timestamp: Date.now(),
    };

    const nextEnd = Date.now() + 15 * 1000;

    setCurrentBid(amount);
    setCurrentHighestBidderId(team.id);
    setBidHistory(prev => [newRecord, ...prev]);
    setHammerStatus('LIVE_BIDDING');
    setTimerEndTimestamp(nextEnd);
    setTimerSeconds(15);
    setIsTimerRunning(true);

    sound.playBid();
    showNotification('info', `${team.shortName} raised bid to ${formatCurrency(amount)}`);

    broadcastCurrentState({
      currentBid: amount,
      highestBidderId: team.id,
      hammerStatus: 'LIVE_BIDDING',
      timerEndTimestamp: nextEnd,
      timerSeconds: 15,
      isTimerRunning: true,
    });

    return { success: true };
  };

  const increaseBidBy = (increment: number, specificTeamId?: string): { success: boolean; error?: string } => {
    const targetTeamId = specificTeamId || currentHighestBidderId;
    if (!targetTeamId) {
      showNotification('error', 'Select a franchise paddle first to place the bid.');
      return { success: false, error: 'Select a team paddle first.' };
    }

    const nextAmount = (currentHighestBidderId === null && currentBid === currentPlayer?.basePrice)
      ? currentPlayer.basePrice
      : currentBid + increment;

    return placeBid(targetTeamId, nextAmount);
  };

  /**
   * Hammer Calls: Going Once & Going Twice
   */
  const callGoingOnce = () => {
    if (!currentHighestBidderId) {
      showNotification('error', 'Cannot call Going Once without an active bid.');
      return;
    }
    setHammerStatus('GOING_ONCE');
    sound.playTick();
    const team = teams.find(t => t.id === currentHighestBidderId);
    showNotification('info', `Going Once at ${formatCurrency(currentBid)} to ${team?.shortName || 'Franchise'}!`);

    broadcastCurrentState({
      hammerStatus: 'GOING_ONCE',
    });
  };

  const callGoingTwice = () => {
    if (!currentHighestBidderId) {
      showNotification('error', 'Cannot call Going Twice without an active bid.');
      return;
    }
    setHammerStatus('GOING_TWICE');
    sound.playTick();
    const team = teams.find(t => t.id === currentHighestBidderId);
    showNotification('info', `Going Twice at ${formatCurrency(currentBid)} to ${team?.shortName || 'Franchise'}! Final Call!`);

    broadcastCurrentState({
      hammerStatus: 'GOING_TWICE',
    });
  };

  /**
   * Mark as SOLD
   */
  const markSold = (): boolean => {
    if (!currentPlayer) return false;

    if (!currentHighestBidderId) {
      showNotification('error', 'Cannot sell without a bidding franchise! Place at least one bid.');
      return false;
    }

    const winningTeam = teams.find(t => t.id === currentHighestBidderId);
    if (!winningTeam) return false;

    const finalAmount = currentBid;
    const prevBudget = winningTeam.remainingBudget;

    const updatedTeams = teams.map(t =>
      t.id === winningTeam.id
        ? { ...t, remainingBudget: t.remainingBudget - finalAmount }
        : t
    );

    const updatedPlayer: Player = {
      ...currentPlayer,
      status: 'SOLD',
      soldPrice: finalAmount,
      soldToTeamId: winningTeam.id,
    };

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id ? updatedPlayer : p
    );

    const soldRecord: SoldRecord = {
      id: `sold-${Date.now()}`,
      player: updatedPlayer,
      winningTeam,
      soldPrice: finalAmount,
      timestamp: Date.now(),
    };

    const updatedSoldHistory = [soldRecord, ...soldHistory];

    setTeams(updatedTeams);
    setPlayers(updatedPlayers);
    setSoldHistory(updatedSoldHistory);
    setLastSoldEvent(soldRecord);
    setHammerStatus('SOLD');
    setIsTimerRunning(false);
    setTimerEndTimestamp(undefined);

    const historyItem: AuctionHistoryAction = {
      id: `act-${Date.now()}`,
      type: 'SOLD',
      playerId: currentPlayer.id,
      teamId: winningTeam.id,
      amount: finalAmount,
      previousTeamRemainingBudget: prevBudget,
      timestamp: Date.now(),
    };
    setActions(prev => [historyItem, ...prev]);

    // Audio & Confetti Celebrations
    sound.playSold();
    confetti({
      particleCount: 160,
      spread: 95,
      origin: { y: 0.6 },
      colors: [winningTeam.primaryColor, '#dc2626', '#eab308', '#ffffff'],
    });

    realtimeSync.broadcast({
      type: 'TRIGGER_CELEBRATION',
      soldRecord,
      timestamp: Date.now(),
    });

    broadcastCurrentState({
      teams: updatedTeams,
      players: updatedPlayers,
      soldHistory: updatedSoldHistory,
      lastSoldEvent: soldRecord,
      hammerStatus: 'SOLD',
      isTimerRunning: false,
      timerEndTimestamp: undefined,
    });

    showNotification('success', `SOLD! ${currentPlayer.name} joins ${winningTeam.name} for ${formatCurrency(finalAmount)}!`);
    return true;
  };

  /**
   * Mark as UNSOLD
   */
  const markUnsold = (): boolean => {
    if (!currentPlayer) return false;

    const updatedPlayers = players.map(p =>
      p.id === currentPlayer.id
        ? { ...p, status: 'UNSOLD' as const, soldPrice: undefined, soldToTeamId: undefined }
        : p
    );

    setPlayers(updatedPlayers);
    setHammerStatus('UNSOLD');
    setIsTimerRunning(false);
    setTimerEndTimestamp(undefined);

    const historyItem: AuctionHistoryAction = {
      id: `act-${Date.now()}`,
      type: 'UNSOLD',
      playerId: currentPlayer.id,
      timestamp: Date.now(),
    };
    setActions(prev => [historyItem, ...prev]);

    sound.playUnsold();
    showNotification('info', `${currentPlayer.name} goes UNSOLD.`);

    broadcastCurrentState({
      players: updatedPlayers,
      hammerStatus: 'UNSOLD',
      isTimerRunning: false,
      timerEndTimestamp: undefined,
    });

    return true;
  };

  /**
   * Undo Last Action
   */
  const undoLastAction = (): boolean => {
    if (actions.length === 0) {
      showNotification('error', 'No auction actions to undo.');
      return false;
    }

    const [lastAction, ...remainingActions] = actions;
    setActions(remainingActions);

    if (lastAction.type === 'SOLD' && lastAction.teamId && lastAction.amount) {
      const updatedTeams = teams.map(t =>
        t.id === lastAction.teamId
          ? { ...t, remainingBudget: t.remainingBudget + lastAction.amount! }
          : t
      );

      const updatedPlayers = players.map(p =>
        p.id === lastAction.playerId
          ? { ...p, status: 'IN_AUCTION' as const, soldPrice: undefined, soldToTeamId: undefined }
          : p
      );

      const updatedSoldHistory = soldHistory.filter(s => s.player.id !== lastAction.playerId);

      setTeams(updatedTeams);
      setPlayers(updatedPlayers);
      setSoldHistory(updatedSoldHistory);
      setHammerStatus('LIVE_BIDDING');

      const targetIdx = players.findIndex(p => p.id === lastAction.playerId);
      if (targetIdx !== -1) {
        setCurrentPlayerIndex(targetIdx);
      }

      broadcastCurrentState({
        teams: updatedTeams,
        players: updatedPlayers,
        soldHistory: updatedSoldHistory,
        hammerStatus: 'LIVE_BIDDING',
        currentPlayerId: lastAction.playerId,
      });

      showNotification('info', 'Undo successful: Player sale reversed and points refunded.');
      return true;
    }

    if (lastAction.type === 'UNSOLD') {
      const updatedPlayers = players.map(p =>
        p.id === lastAction.playerId
          ? { ...p, status: 'IN_AUCTION' as const }
          : p
      );

      setPlayers(updatedPlayers);
      setHammerStatus('LIVE_BIDDING');

      const targetIdx = players.findIndex(p => p.id === lastAction.playerId);
      if (targetIdx !== -1) {
        setCurrentPlayerIndex(targetIdx);
      }

      broadcastCurrentState({
        players: updatedPlayers,
        hammerStatus: 'LIVE_BIDDING',
        currentPlayerId: lastAction.playerId,
      });

      showNotification('info', 'Undo successful: Player unsold status reversed.');
      return true;
    }

    return false;
  };

  const nextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      const nextIdx = currentPlayerIndex + 1;
      const nextP = players[nextIdx];
      setCurrentPlayerIndex(nextIdx);
      setCurrentBid(nextP.basePrice);
      setCurrentHighestBidderId(null);
      setHammerStatus('LIVE_BIDDING');
      setBidHistory([]);
      setIsTimerRunning(false);
      setTimerEndTimestamp(undefined);
      setTimerSeconds(20);

      broadcastCurrentState({
        currentPlayerId: nextP.id,
        currentBid: nextP.basePrice,
        highestBidderId: null,
        hammerStatus: 'LIVE_BIDDING',
        isTimerRunning: false,
        timerEndTimestamp: undefined,
        timerSeconds: 20,
      });
    }
  };

  const prevPlayer = () => {
    if (currentPlayerIndex > 0) {
      const prevIdx = currentPlayerIndex - 1;
      const prevP = players[prevIdx];
      setCurrentPlayerIndex(prevIdx);
      setCurrentBid(prevP.basePrice);
      setCurrentHighestBidderId(null);
      setHammerStatus('LIVE_BIDDING');
      setBidHistory([]);
      setIsTimerRunning(false);
      setTimerEndTimestamp(undefined);
      setTimerSeconds(20);

      broadcastCurrentState({
        currentPlayerId: prevP.id,
        currentBid: prevP.basePrice,
        highestBidderId: null,
        hammerStatus: 'LIVE_BIDDING',
        isTimerRunning: false,
        timerEndTimestamp: undefined,
        timerSeconds: 20,
      });
    }
  };

  const selectPlayer = (playerId: string) => {
    const idx = players.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      const p = players[idx];
      setCurrentPlayerIndex(idx);
      setCurrentBid(p.status === 'SOLD' && p.soldPrice ? p.soldPrice : p.basePrice);
      setCurrentHighestBidderId(p.status === 'SOLD' && p.soldToTeamId ? p.soldToTeamId : null);
      setHammerStatus(p.status === 'SOLD' ? 'SOLD' : p.status === 'UNSOLD' ? 'UNSOLD' : 'LIVE_BIDDING');
      setBidHistory([]);
      setIsTimerRunning(false);
      setTimerEndTimestamp(undefined);
      setTimerSeconds(20);

      broadcastCurrentState({
        currentPlayerId: p.id,
        currentBid: p.status === 'SOLD' && p.soldPrice ? p.soldPrice : p.basePrice,
        highestBidderId: p.status === 'SOLD' && p.soldToTeamId ? p.soldToTeamId : null,
        hammerStatus: p.status === 'SOLD' ? 'SOLD' : p.status === 'UNSOLD' ? 'UNSOLD' : 'LIVE_BIDDING',
        isTimerRunning: false,
        timerEndTimestamp: undefined,
        timerSeconds: 20,
      });
    }
  };

  const startTimer = (seconds = 20) => {
    const end = Date.now() + seconds * 1000;
    setTimerSeconds(seconds);
    setTimerEndTimestamp(end);
    setIsTimerRunning(true);

    broadcastCurrentState({
      timerSeconds: seconds,
      timerEndTimestamp: end,
      isTimerRunning: true,
    });
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    setTimerEndTimestamp(undefined);

    broadcastCurrentState({
      isTimerRunning: false,
      timerEndTimestamp: undefined,
    });
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(20);
    setTimerEndTimestamp(undefined);

    broadcastCurrentState({
      isTimerRunning: false,
      timerSeconds: 20,
      timerEndTimestamp: undefined,
    });
  };

  const toggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const toggleProjectorMode = () => {
    setProjectorMode(prev => !prev);
  };

  const addTeam = (teamData: Omit<Team, 'id' | 'remainingBudget'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      totalBudget: teamData.totalBudget || DEFAULT_PURSE_POINTS,
      remainingBudget: teamData.totalBudget || DEFAULT_PURSE_POINTS,
      maxSquadSize: teamData.maxSquadSize || MAX_SQUAD_PER_TEAM,
      maxOverseas: teamData.maxSquadSize || MAX_SQUAD_PER_TEAM,
      logoUrl: teamData.logoUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=120&auto=format&fit=crop&q=80',
    };
    const updated = [...teams, newTeam];
    setTeams(updated);
    showNotification('success', `Franchise "${newTeam.name}" registered.`);

    broadcastCurrentState({
      teams: updated,
    });
  };

  const updateTeamSquadLimit = (teamId: string, newLimit: number) => {
    if (isNaN(newLimit) || newLimit < 1) {
      showNotification('error', 'Squad limit must be at least 1 player.');
      return;
    }
    const updated = teams.map(t =>
      t.id === teamId
        ? { ...t, maxSquadSize: newLimit, maxOverseas: newLimit }
        : t
    );
    setTeams(updated);
    const target = teams.find(t => t.id === teamId);
    showNotification('success', `Squad limit for "${target?.name || 'Franchise'}" updated to ${newLimit}.`);

    broadcastCurrentState({
      teams: updated,
    });
  };

  const removeTeam = (teamId: string) => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return;

    const updatedPlayers = players.map(p =>
      p.soldToTeamId === teamId
        ? { ...p, status: 'IN_AUCTION' as const, soldToTeamId: undefined, soldPrice: undefined }
        : p
    );

    const updatedTeams = teams.filter(t => t.id !== teamId);
    setPlayers(updatedPlayers);
    setTeams(updatedTeams);

    let nextBidder = currentHighestBidderId;
    let nextBid = currentBid;
    if (currentHighestBidderId === teamId) {
      nextBidder = null;
      if (currentPlayer) nextBid = currentPlayer.basePrice;
      setCurrentHighestBidderId(null);
      setCurrentBid(nextBid);
    }

    showNotification('info', `Franchise "${targetTeam.name}" removed from auction.`);

    broadcastCurrentState({
      teams: updatedTeams,
      players: updatedPlayers,
      highestBidderId: nextBidder,
      currentBid: nextBid,
    });
  };

  const addPlayer = (playerData: Omit<Player, 'id' | 'status' | 'order'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: `player-${Date.now()}`,
      status: 'UPCOMING',
      order: players.length + 1,
      country: '',
      isOverseas: false,
    };
    const updated = [...players, newPlayer];
    setPlayers(updated);
    showNotification('success', `Player "${newPlayer.name}" added to auction pool.`);

    broadcastCurrentState({
      players: updated,
    });
  };

  const removePlayer = (playerId: string) => {
    const targetPlayer = players.find(p => p.id === playerId);
    if (!targetPlayer) return;

    let updatedTeams = teams;
    if (targetPlayer.status === 'SOLD' && targetPlayer.soldToTeamId && targetPlayer.soldPrice) {
      updatedTeams = teams.map(t =>
        t.id === targetPlayer.soldToTeamId
          ? { ...t, remainingBudget: t.remainingBudget + targetPlayer.soldPrice! }
          : t
      );
      setTeams(updatedTeams);
    }

    const updatedPlayers = players
      .filter(p => p.id !== playerId)
      .map((p, index) => ({ ...p, order: index + 1 }));

    setPlayers(updatedPlayers);

    if (currentPlayerIndex >= updatedPlayers.length) {
      setCurrentPlayerIndex(Math.max(0, updatedPlayers.length - 1));
    }

    showNotification('info', `Player "${targetPlayer.name}" removed from roster.`);

    broadcastCurrentState({
      teams: updatedTeams,
      players: updatedPlayers,
    });
  };

  const resetAuction = () => {
    if (window.confirm('Reset auction state? This will clear all sales and restore squad size to 10 and budgets to 10,000 points.')) {
      setTeams(INITIAL_TEAMS);
      setPlayers(INITIAL_PLAYERS);
      setActions([]);
      setSoldHistory([]);
      setLastSoldEvent(undefined);
      setHammerStatus('LIVE_BIDDING');
      setCurrentPlayerIndex(0);
      localStorage.removeItem(STORAGE_KEY_TEAMS);
      localStorage.removeItem(STORAGE_KEY_PLAYERS);
      localStorage.removeItem(STORAGE_KEY_ACTIONS);
      localStorage.removeItem(STORAGE_KEY_SOLD_HISTORY);
      showNotification('info', 'Auction pool reset to default 10,000 points & 8 franchises.');

      broadcastCurrentState({
        teams: INITIAL_TEAMS,
        players: INITIAL_PLAYERS,
        soldHistory: [],
        lastSoldEvent: undefined,
        hammerStatus: 'LIVE_BIDDING',
        currentPlayerId: INITIAL_PLAYERS[0]?.id || null,
        currentBid: INITIAL_PLAYERS[0]?.basePrice || 2000,
        highestBidderId: null,
        isTimerRunning: false,
        timerEndTimestamp: undefined,
        timerSeconds: 20,
      });
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        teams,
        players,
        currentPlayer,
        currentBid,
        highestBidder,
        bidHistory,
        soldHistory,
        lastSoldEvent,
        hammerStatus,
        isTimerRunning,
        timerSeconds,
        soundMuted,
        projectorMode,
        lastMessage,
        theme,
        logoStyle,
        placeBid,
        increaseBidBy,
        markSold,
        markUnsold,
        callGoingOnce,
        callGoingTwice,
        setHammerStatus,
        undoLastAction,
        nextPlayer,
        prevPlayer,
        selectPlayer,
        startTimer,
        pauseTimer,
        resetTimer,
        toggleSound,
        toggleProjectorMode,
        toggleLogoStyle,
        addTeam,
        updateTeamSquadLimit,
        removeTeam,
        addPlayer,
        removePlayer,
        resetAuction,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = (): AuctionContextType => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
