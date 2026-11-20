import React, { useState } from 'react';
import {
  Gavel,
  CheckCircle,
  XCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Clock,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Flame,
  Copy,
  ExternalLink,
  Tv
} from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { formatCurrency, getRecommendedIncrements } from '../utils/currency';
import { PlayerRole } from '../types/auction';

export const LiveAuctionDashboard: React.FC = () => {
  const {
    teams,
    players,
    currentPlayer,
    currentBid,
    highestBidder,
    bidHistory,
    hammerStatus,
    callGoingOnce,
    callGoingTwice,
    isTimerRunning,
    timerSeconds,
    soundMuted,
    projectorMode,
    lastMessage,
    placeBid,
    increaseBidBy,
    markSold,
    markUnsold,
    undoLastAction,
    nextPlayer,
    prevPlayer,
    selectPlayer,
    startTimer,
    pauseTimer,
    resetTimer,
    toggleSound,
    toggleProjectorMode,
  } = useAuction();

  const [customBidAmount, setCustomBidAmount] = useState<string>('');
  const [selectedPaddleTeamId, setSelectedPaddleTeamId] = useState<string | null>(null);
  const [copiedObs, setCopiedObs] = useState<boolean>(false);

  const handleCopyObsLink = () => {
    const streamUrl = `${window.location.origin}/stream`;
    navigator.clipboard.writeText(streamUrl);
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 2500);
  };

  const handleOpenStream = () => {
    window.open('/stream', '_blank');
  };

  if (!currentPlayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-md">
        <Award className="w-16 h-16 text-red-600 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-slate-900">No Players in Auction Pool</h2>
        <p className="text-slate-500 mt-2">Add players in the registry to begin the live auction.</p>
      </div>
    );
  }

  const roleBadgeColors: Record<PlayerRole, string> = {
    'Batsman': 'bg-blue-100 text-blue-700 border-blue-300 font-bold',
    'Bowler': 'bg-red-100 text-red-700 border-red-300 font-bold',
    'All-Rounder': 'bg-amber-100 text-amber-700 border-amber-300 font-bold',
    'Wicketkeeper': 'bg-emerald-100 text-emerald-700 border-emerald-300 font-bold',
  };

  const increments = getRecommendedIncrements(currentBid);

  const handleCustomBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeamId = selectedPaddleTeamId || highestBidder?.id;
    if (!targetTeamId) {
      alert('Please click on a franchise paddle first to select which team is bidding.');
      return;
    }

    const numericAmount = parseInt(customBidAmount, 10); // entered in Points
    if (isNaN(numericAmount) || numericAmount <= currentBid) {
      alert(`Custom bid must be greater than current bid of ${formatCurrency(currentBid)}`);
      return;
    }

    placeBid(targetTeamId, numericAmount);
    setCustomBidAmount('');
  };

  const getTeamSquadCount = (teamId: string) => {
    return players.filter(p => p.soldToTeamId === teamId).length;
  };

  const canTeamAfford = (teamRemainingBudget: number, targetAmount: number) => {
    return teamRemainingBudget >= targetAmount;
  };

  return (
    <div className={`space-y-6 ${projectorMode ? 'max-w-[1920px] mx-auto px-6 py-4' : ''}`}>
      {/* Toast Notification Banner */}
      {lastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md border animate-in slide-in-from-top-4 duration-300 ${
            lastMessage.type === 'success'
              ? 'bg-emerald-900/95 border-emerald-500/50 text-white shadow-emerald-950/20'
              : lastMessage.type === 'error'
              ? 'bg-red-900/95 border-red-500/60 text-white shadow-red-950/20'
              : 'bg-slate-900/95 border-slate-700 text-white'
          }`}
        >
          {lastMessage.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
          {lastMessage.type === 'error' && <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />}
          {lastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
          <span className="font-semibold text-sm sm:text-base">{lastMessage.text}</span>
        </div>
      )}

      {/* Top Quick-Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/25 text-red-600 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Live Broadcast Stage
          </div>
          <span className="text-slate-600 text-sm hidden sm:inline font-medium">
            Lot: <strong className="text-slate-900">Player #{currentPlayer.order}</strong> of {players.length}
          </span>
        </div>

        {/* Center Quick Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevPlayer}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-red-600 transition cursor-pointer"
            title="Previous Player"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <select
            value={currentPlayer.id}
            onChange={(e) => selectPlayer(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg px-3 py-2 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.order} {p.name} ({p.role}) - {p.status}
              </option>
            ))}
          </select>
          <button
            onClick={nextPlayer}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-red-600 transition cursor-pointer"
            title="Next Player"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          {/* Gavel Countdown Display */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 shadow-xs">
            <Clock className={`w-4 h-4 ${timerSeconds <= 5 ? 'text-red-600' : 'text-slate-500'}`} />
            <span
              className={`font-mono font-bold text-lg ${
                timerSeconds <= 5 ? 'text-red-600 font-extrabold' : 'text-slate-900'
              }`}
            >
              {timerSeconds}s
            </span>
            <div className="flex items-center gap-1 ml-1 border-l border-slate-300 pl-2">
              {isTimerRunning ? (
                <button
                  onClick={pauseTimer}
                  className="p-1 hover:text-red-600 text-slate-500 cursor-pointer"
                  title="Pause Clock"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => startTimer(timerSeconds || 15)}
                  className="p-1 hover:text-emerald-600 text-slate-500 cursor-pointer"
                  title="Resume Clock"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={resetTimer}
                className="p-1 hover:text-slate-900 text-slate-400 cursor-pointer"
                title="Reset Clock to 20s"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sound & Projector Toggles */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              soundMuted
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'bg-white border-slate-300 text-slate-600 hover:text-red-600 shadow-xs'
            }`}
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio Effects'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleProjectorMode}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              projectorMode
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-white border-slate-300 text-slate-600 hover:text-red-600 shadow-xs'
            }`}
            title="Toggle Big Screen Projector Mode"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={undoLastAction}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:text-red-600 transition cursor-pointer shadow-xs"
            title="Undo Last Sold / Unsold Action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Undo Sale</span>
          </button>

          {/* Direct Stream Overlay & OBS link buttons */}
          <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
            <button
              onClick={handleOpenStream}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-sm shadow-red-600/30 cursor-pointer"
              title="Open 1080p Stream View (/stream) in a new window"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>/stream View</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </button>

            <button
              onClick={handleCopyObsLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Copy direct Browser Source URL for OBS Studio"
            >
              <Copy className="w-3.5 h-3.5 text-red-600" />
              <span>{copiedObs ? 'Copied OBS URL!' : 'Copy OBS Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Broadcast Stage (Hero Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player Card (Col 1-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-md group transition-all duration-500"
            style={{
              borderColor: highestBidder ? `${highestBidder.primaryColor}80` : '#e2e8f0',
            }}
          >
            {/* Status & Role Ribbon */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border shadow-md ${
                  hammerStatus === 'SOLD'
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : hammerStatus === 'UNSOLD'
                    ? 'bg-rose-700 text-white border-rose-500'
                    : hammerStatus === 'GOING_ONCE'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-extrabold'
                    : hammerStatus === 'GOING_TWICE'
                    ? 'bg-orange-600 text-white border-orange-400 font-extrabold'
                    : 'bg-red-600 text-white border-red-500 font-extrabold'
                }`}
              >
                {hammerStatus === 'GOING_ONCE'
                  ? 'GOING ONCE...'
                  : hammerStatus === 'GOING_TWICE'
                  ? 'GOING TWICE... FINAL CALL'
                  : currentPlayer.status === 'IN_AUCTION'
                  ? 'ON THE HAMMER'
                  : currentPlayer.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${roleBadgeColors[currentPlayer.role]}`}>
                {currentPlayer.role}
              </span>
            </div>

            {/* Player Photo Showcase (Streamlined without rating & stats) */}
            <div className="relative h-96 sm:h-[460px] w-full overflow-hidden bg-gradient-to-b from-slate-200 to-slate-900 flex items-end justify-center">
              <img
                src={currentPlayer.photoUrl}
                alt={currentPlayer.name}
                className="w-full h-full object-cover object-top transition duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Player Name Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-red-400 text-xs font-tech font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  EPL LOT #{currentPlayer.order}
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md mt-1">
                  {currentPlayer.name}
                </h1>
                {currentPlayer.stats.specialty && (
                  <p className="text-slate-200 text-sm sm:text-base mt-2 line-clamp-2 italic font-medium">
                    "{currentPlayer.stats.specialty}"
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Live Auction Engine & Bidding Deck (Col 6-12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Big Bid Spotlight Card */}
          <div
            className="relative rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-md overflow-hidden transition-all duration-500"
            style={{
              borderColor: highestBidder ? `${highestBidder.primaryColor}80` : '#e2e8f0',
            }}
          >
            {/* Base vs Current Bid Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Base Price</span>
                <div className="text-xl font-bold text-slate-800 mt-0.5">
                  {formatCurrency(currentPlayer.basePrice, { fullLabel: true })}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-red-600 font-bold flex items-center justify-end gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Current Standing Bid
                </span>
                <div className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 tracking-tight drop-shadow font-display">
                  {formatCurrency(currentBid)}
                </div>
              </div>
            </div>

            {/* Leading Franchise Spotlight */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-4">
                {highestBidder ? (
                  <>
                    {highestBidder.logoUrl ? (
                      <img
                        src={highestBidder.logoUrl}
                        alt={highestBidder.shortName}
                        className="w-14 h-14 rounded-2xl object-contain p-1.5 bg-white border border-slate-200 shadow-sm shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-md shrink-0"
                      style={{ backgroundColor: highestBidder.primaryColor, display: highestBidder.logoUrl ? 'none' : 'flex' }}
                    >
                      {highestBidder.shortName}
                    </div>
                    <div>
                      <div className="text-xs text-red-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-600" />
                        Current Highest Bidder
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900">
                        {highestBidder.name}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold">
                      --
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">No Bids Placed Yet</div>
                      <div className="text-xs text-slate-500">Awaiting opening bid at base price ({formatCurrency(currentPlayer.basePrice)})</div>
                    </div>
                  </div>
                )}
              </div>

              {highestBidder && (
                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5">
                  <div className="text-xs text-slate-500 font-medium">Franchise Purse Left</div>
                  <div className="text-lg font-bold text-emerald-600 font-mono">
                    {formatCurrency(highestBidder.remainingBudget - (currentPlayer.status === 'SOLD' ? 0 : currentBid))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Increment Buttons in Points */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Quick Increments (+Points)</span>
                {selectedPaddleTeamId && (
                  <span className="text-red-600 font-bold">
                    Active paddle: <strong>{teams.find(t => t.id === selectedPaddleTeamId)?.shortName}</strong>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {increments.map((inc) => (
                  <button
                    key={inc.value}
                    onClick={() => increaseBidBy(inc.value, selectedPaddleTeamId || undefined)}
                    disabled={currentPlayer.status === 'SOLD'}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-red-50 border border-slate-300 hover:border-red-400 text-slate-800 hover:text-red-600 shadow-xs active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4 text-red-600" />
                    {inc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Bid Entry Form in Points */}
            <form onSubmit={handleCustomBidSubmit} className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="50"
                  min="50"
                  value={customBidAmount}
                  onChange={(e) => setCustomBidAmount(e.target.value)}
                  placeholder={`Custom Bid in Points (e.g. ${currentBid + 500})`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-xs text-red-600 font-bold">PTS</span>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white transition shadow-sm shadow-red-600/30 cursor-pointer"
              >
                Place Custom
              </button>
            </form>
          </div>

          {/* Franchise Bidding Paddles Grid (Dynamic Squad Limits) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-600" />
                Franchise Bidding Paddles (Click to Bid)
              </h3>
              <span className="text-xs text-slate-500 font-medium">Dynamic Squad Limits Enforced</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {teams.map((team) => {
                const maxSquad = team.maxSquadSize || 10;
                const nextBidPrice = (highestBidder === null && currentBid === currentPlayer.basePrice)
                  ? currentPlayer.basePrice
                  : currentBid + increments[0].value;
                const isAffordable = canTeamAfford(team.remainingBudget, nextBidPrice);
                const squadCount = getTeamSquadCount(team.id);
                const isSquadFull = squadCount >= maxSquad;
                const isLeader = highestBidder?.id === team.id;
                const isSelectedPaddle = selectedPaddleTeamId === team.id;

                const canBid = isAffordable && !isSquadFull;

                return (
                  <div
                    key={team.id}
                    onClick={() => {
                      if (!canBid) return;
                      setSelectedPaddleTeamId(team.id);
                      placeBid(team.id, nextBidPrice);
                    }}
                    style={{
                      borderColor: isLeader ? team.primaryColor : isSelectedPaddle ? '#dc2626' : undefined,
                    }}
                    className={`relative p-3.5 rounded-2xl border transition-all select-none ${
                      isLeader
                        ? 'bg-red-50/50 ring-2 ring-offset-2 ring-offset-white shadow-md scale-[1.02]'
                        : isSelectedPaddle
                        ? 'bg-red-50 border-red-500'
                        : canBid
                        ? 'bg-white border-slate-200 hover:border-red-400 hover:bg-slate-50 cursor-pointer active:scale-95 shadow-xs'
                        : 'bg-slate-100 border-slate-200 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {isLeader && (
                      <span
                        className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        LEADING
                      </span>
                    )}

                    <div className="flex items-center gap-2.5">
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.shortName}
                          className="w-10 h-10 rounded-xl object-contain p-1 bg-white border border-slate-200 shadow-xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0"
                        style={{ backgroundColor: team.primaryColor, display: team.logoUrl ? 'none' : 'flex' }}
                      >
                        {team.shortName}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{team.name}</div>
                        <div className="text-[11px] font-mono text-emerald-600 font-semibold">
                          Purse: {formatCurrency(team.remainingBudget)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Squad: <strong className="text-slate-800">{squadCount}/{maxSquad}</strong></span>
                      {isSquadFull ? (
                        <span className="text-rose-600 font-bold">Squad Full ({maxSquad}/{maxSquad})</span>
                      ) : !isAffordable ? (
                        <span className="text-red-600 font-bold">Low Purse</span>
                      ) : (
                        <span className="text-red-600 hover:underline font-semibold flex items-center">
                          Raise <ArrowUpRight className="w-3 h-3 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Decision Controls Bar with Hammer Calls */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* GOING ONCE */}
              <button
                onClick={callGoingOnce}
                disabled={!highestBidder || currentPlayer.status === 'SOLD'}
                className={`flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider border shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  hammerStatus === 'GOING_ONCE'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 ring-2 ring-amber-300 font-black'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                }`}
                title="Broadcast Going Once Call 1"
              >
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Going Once</span>
              </button>

              {/* GOING TWICE */}
              <button
                onClick={callGoingTwice}
                disabled={!highestBidder || currentPlayer.status === 'SOLD'}
                className={`flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider border shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  hammerStatus === 'GOING_TWICE'
                    ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-300 font-black'
                    : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-300'
                }`}
                title="Broadcast Going Twice Final Call"
              >
                <Flame className="w-4 h-4 text-orange-600" />
                <span>Going Twice</span>
              </button>

              {/* SOLD BUTTON */}
              <button
                onClick={markSold}
                disabled={!highestBidder || currentPlayer.status === 'SOLD'}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-extrabold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Gavel className="w-5 h-5 animate-hammer" />
                <span>Sold to {highestBidder ? highestBidder.shortName : '...'}</span>
              </button>

              {/* UNSOLD BUTTON */}
              <button
                onClick={markUnsold}
                disabled={currentPlayer.status === 'SOLD'}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider bg-slate-100 hover:bg-red-50 hover:text-red-600 border border-slate-300 hover:border-red-300 text-slate-700 shadow-xs active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <XCircle className="w-5 h-5 text-red-600" />
                <span>Mark Unsold</span>
              </button>
            </div>

            {/* Next Player Shortcut */}
            <button
              onClick={nextPlayer}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition cursor-pointer shadow-xs"
            >
              <span>Next Player In Pool</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Live Hammer Bid History Ticker */}
          {bidHistory.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                Hammer Bid Trail
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {bidHistory.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-2xs"
                  >
                    <span className="font-bold text-slate-400">#{bidHistory.length - idx}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: item.teamColor }}
                    >
                      {item.teamShortName}
                    </span>
                    <span className="font-bold text-red-600 font-mono">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
