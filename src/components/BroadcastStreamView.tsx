import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { formatCurrency } from '../utils/currency';
import { PlayerRole } from '../types/auction';
import { Flame, Zap, Trophy, Radio, Shield, CheckCircle2, XCircle } from 'lucide-react';

export const BroadcastStreamView: React.FC = () => {
  const {
    currentPlayer,
    currentBid,
    highestBidder,
    hammerStatus,
    teams,
    players,
    soldHistory,
  } = useAuction();

  if (!currentPlayer) {
    return (
      <div className="w-screen h-screen overflow-hidden bg-[#F4F6F9] text-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-black tracking-wider uppercase text-slate-800">
            Connecting to EPL Auction Live Broadcast...
          </h2>
        </div>
      </div>
    );
  }

  const roleLabels: Record<PlayerRole, string> = {
    'Batsman': 'Batter',
    'Bowler': 'Bowler',
    'All-Rounder': 'All-Rounder',
    'Wicketkeeper': 'Wicketkeeper',
  };

  const roleBadgeStyles: Record<PlayerRole, string> = {
    'Batsman': 'bg-blue-50 text-blue-800 border-blue-300',
    'Bowler': 'bg-rose-50 text-rose-800 border-rose-300',
    'All-Rounder': 'bg-amber-50 text-amber-800 border-amber-300',
    'Wicketkeeper': 'bg-emerald-50 text-emerald-800 border-emerald-300',
  };

  const roleStyle = roleBadgeStyles[currentPlayer.role] || roleBadgeStyles['Batsman'];
  const roleName = roleLabels[currentPlayer.role] || currentPlayer.role;

  // Duplicate sold history items for pure CSS continuous marquee looping
  const marqueeList = soldHistory.length > 2 ? [...soldHistory, ...soldHistory] : soldHistory;

  return (
    <div
      className="w-screen h-screen max-w-[100vw] max-h-[100vh] overflow-hidden select-none bg-[#F4F6F9] text-slate-900 flex flex-col justify-between p-4 sm:p-5 relative font-sans"
      style={{
        background: highestBidder
          ? `radial-gradient(circle at 75% 35%, ${highestBidder.primaryColor}12 0%, transparent 55%), radial-gradient(ellipse at 50% 0%, #FFFFFF 0%, #F4F6F9 70%, #E2E8F0 100%)`
          : 'radial-gradient(ellipse at 50% 0%, #FFFFFF 0%, #F4F6F9 70%, #E2E8F0 100%)',
      }}
    >
      {/* ========================================================================= */}
      {/* MODULE 1: TEAMS OVERVIEW PANEL (TOP BAR - TV BROADCAST STYLE)             */}
      {/* ========================================================================= */}
      <header className="relative z-20 flex flex-col gap-2 shrink-0">
        {/* Top Channel Bug Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            {/* Live On-Air Broadcast Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-widest uppercase shadow-md shadow-red-600/30">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>LIVE ON AIR • 1080p60</span>
            </div>

            <div className="h-4 w-px bg-slate-300" />

            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 drop-shadow-xs">
                <span className="text-red-600">EPL</span> AUCTION
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white text-slate-700 font-bold tracking-wider uppercase border border-slate-300 shadow-2xs">
                Official Broadcast
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="hidden sm:inline font-bold">Lot {currentPlayer.order} of {players.length}</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-300 shadow-2xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-emerald-700 font-extrabold">INDEPENDENT SYNC</span>
            </div>
          </div>
        </div>

        {/* 8 Participating Teams Horizontal Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {teams.map((t) => {
            const isHighest = highestBidder?.id === t.id;
            const squadCount = players.filter((p) => p.soldToTeamId === t.id).length;
            const maxSquad = t.maxSquadSize || 10;
            const isFull = squadCount >= maxSquad;

            return (
              <div
                key={t.id}
                style={{
                  borderColor: isHighest ? t.primaryColor : '#e2e8f0',
                  boxShadow: isHighest ? `0 8px 24px -2px ${t.primaryColor}40` : undefined,
                }}
                className={`relative rounded-2xl p-2.5 transition-all duration-300 flex flex-col justify-between overflow-hidden border ${
                  isHighest
                    ? 'bg-white ring-2 ring-offset-1 ring-slate-900 scale-[1.03] z-10 shadow-lg'
                    : 'bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Team Top Bidder Highlight Line */}
                {isHighest && (
                  <div
                    className="absolute top-0 right-0 left-0 h-1.5"
                    style={{ backgroundColor: t.primaryColor }}
                  />
                )}

                <div className="flex items-center gap-2">
                  {t.logoUrl ? (
                    <img
                      src={t.logoUrl}
                      alt={t.shortName}
                      className="w-8 h-8 rounded-xl object-contain p-0.5 bg-white border border-slate-200 shadow-2xs shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: t.primaryColor, display: t.logoUrl ? 'none' : 'flex' }}
                  >
                    {t.shortName}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-slate-900 truncate">{t.shortName}</span>
                      {isHighest && (
                        <span
                          className="text-[9px] font-black px-1 rounded uppercase tracking-wider text-white shadow-2xs"
                          style={{ backgroundColor: t.primaryColor }}
                        >
                          LEAD
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate hidden xl:block font-medium">{t.name}</div>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-black font-mono tabular-nums text-emerald-700">
                    {formatCurrency(t.remainingBudget)}
                  </div>
                  <div className={`text-[10px] font-bold ${isFull ? 'text-rose-600' : 'text-slate-500'}`}>
                    {squadCount}/{maxSquad}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODULE 2: CURRENT PLAYER SPOTLIGHT (CLEANED OF ALL STATS & RATINGS)       */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 my-2 flex items-center justify-center min-h-0">
        <div className="w-full max-w-7xl h-full max-h-[540px] grid grid-cols-12 gap-5 items-stretch">
          {/* Left Hero Card: Player Photo & Essential Identity Only (Col 1-5) */}
          <div className="col-span-12 lg:col-span-5 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden flex flex-col justify-between p-6">
            {/* Top Identity Tags */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-slate-100 border border-slate-300 text-slate-800">
                  LOT #{currentPlayer.order}
                </span>
                <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-2xs ${roleStyle}`}>
                  {roleName}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Base Price</span>
                <span className="text-base font-black font-mono tabular-nums text-amber-600">
                  {formatCurrency(currentPlayer.basePrice)}
                </span>
              </div>
            </div>

            {/* Central Large Player Portrait (No ratings, no overlays) */}
            <div className="relative my-auto py-2 flex items-center justify-center">
              <div
                className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 shadow-xl bg-slate-100 transition-colors duration-300"
                style={{
                  borderColor: highestBidder ? `${highestBidder.primaryColor}` : '#e2e8f0',
                  boxShadow: highestBidder ? `0 12px 35px -5px ${highestBidder.primaryColor}30` : undefined,
                }}
              >
                <img
                  src={currentPlayer.photoUrl}
                  alt={currentPlayer.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            </div>

            {/* Player Full Name (Bold & Crisp) */}
            <div className="relative z-10 pt-3 border-t border-slate-100 text-center">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight truncate drop-shadow-xs">
                {currentPlayer.name}
              </h1>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Role:</span>
                <span className="text-sm font-extrabold text-slate-800">{roleName} Specialist</span>
              </div>
            </div>
          </div>

          {/* Right Hero Card: Live Bidding Arena & Current Highest Bid (Col 6-12) */}
          <div className="col-span-12 lg:col-span-7 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden flex flex-col justify-between p-7">
            {/* Top Live Auction Status Bar - Clean, steady, no flickering */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              {hammerStatus === 'LIVE_BIDDING' && (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-red-600 text-white font-black text-sm uppercase tracking-widest shadow-md shadow-red-600/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>LIVE BIDDING IN PROGRESS</span>
                </div>
              )}

              {hammerStatus === 'GOING_ONCE' && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest shadow-md shadow-amber-500/40">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>GOING ONCE... CALL 1</span>
                </div>
              )}

              {hammerStatus === 'GOING_TWICE' && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-orange-600 text-white font-black text-sm uppercase tracking-widest shadow-md shadow-orange-600/40">
                  <Flame className="w-4 h-4 fill-current text-yellow-300" />
                  <span>GOING TWICE... FINAL CALL!</span>
                </div>
              )}

              {hammerStatus === 'SOLD' && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-black text-sm uppercase tracking-widest shadow-md shadow-emerald-600/30">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>HAMMER DOWN • SOLD!</span>
                </div>
              )}

              {hammerStatus === 'UNSOLD' && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-700 text-white font-black text-sm uppercase tracking-widest shadow-md">
                  <XCircle className="w-5 h-5" />
                  <span>HAMMER DOWN • UNSOLD</span>
                </div>
              )}

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Auction Currency</span>
                <span className="text-xs font-black text-slate-700">10,000 Points System</span>
              </div>
            </div>

            {/* Prominent Current Bid Counter Box - Rock-solid, non-jumping */}
            <div className="relative z-10 my-auto py-3 text-center">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-500 block mb-2">
                CURRENT HIGHEST BID
              </span>

              <div
                className="inline-flex items-baseline justify-center gap-3 px-8 py-5 rounded-3xl bg-slate-50 border border-slate-300 shadow-sm transition-colors duration-200"
                style={{
                  borderColor: highestBidder ? `${highestBidder.primaryColor}80` : '#cbd5e1',
                  boxShadow: highestBidder ? `0 8px 25px -4px ${highestBidder.primaryColor}20` : undefined,
                }}
              >
                <span className="font-black text-6xl sm:text-7xl xl:text-8xl font-mono tabular-nums tracking-tight text-slate-900">
                  {currentBid.toLocaleString()}
                </span>
                <span className="text-xl sm:text-2xl font-black text-red-600 font-mono tracking-wider">
                  PTS
                </span>
              </div>
            </div>

            {/* Current Highest Bidding Franchise Banner */}
            <div className="relative z-10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                HOLDING THE BID
              </span>

              {highestBidder ? (
                <div
                  className="p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 shadow-sm"
                  style={{
                    backgroundColor: `${highestBidder.primaryColor}10`,
                    borderColor: `${highestBidder.primaryColor}80`,
                    boxShadow: `0 8px 25px -3px ${highestBidder.primaryColor}20`,
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
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
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-sm shrink-0"
                      style={{ backgroundColor: highestBidder.primaryColor, display: highestBidder.logoUrl ? 'none' : 'flex' }}
                    >
                      {highestBidder.shortName}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
                          {highestBidder.name}
                        </span>
                        <span
                          className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase text-white shadow-2xs"
                          style={{ backgroundColor: highestBidder.primaryColor }}
                        >
                          {highestBidder.shortName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 flex items-center gap-3 font-medium">
                        <span>Purse: <strong className="text-emerald-700 font-mono font-bold">{formatCurrency(highestBidder.remainingBudget)}</strong></span>
                        <span>•</span>
                        <span>Squad: <strong className="text-slate-900">{players.filter((p) => p.soldToTeamId === highestBidder.id).length}/{highestBidder.maxSquadSize || 10}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 shadow-sm"
                      style={{ backgroundColor: highestBidder.primaryColor }}
                    >
                      <Trophy className="w-4 h-4" />
                      <span>TOP BIDDER</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center text-slate-500 gap-3">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Awaiting Opening Bid ({formatCurrency(currentPlayer.basePrice)})
                  </span>
                </div>
              )}
            </div>

            {/* LIGHT-MODE DRAMATIC SOLD STAMP OVERLAY */}
            {hammerStatus === 'SOLD' && highestBidder && (
              <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
                <div
                  className="p-8 rounded-3xl border-4 text-center max-w-lg shadow-2xl animate-stamp-in"
                  style={{
                    borderColor: '#059669',
                    backgroundColor: '#ecfdf5',
                  }}
                >
                  <div className="text-xs font-black tracking-widest text-emerald-800 uppercase mb-1">
                    OFFICIAL TRANSFER CONFIRMED
                  </div>
                  <div className="text-5xl sm:text-6xl font-black text-emerald-700 tracking-wider font-mono drop-shadow-xs">
                    SOLD!
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-300">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {highestBidder.name}
                    </div>
                    <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
                      {formatCurrency(currentBid)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LIGHT-MODE UNSOLD STAMP OVERLAY */}
            {hammerStatus === 'UNSOLD' && (
              <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="p-8 rounded-3xl border-4 border-rose-600 bg-rose-50 text-center max-w-md shadow-2xl animate-stamp-in">
                  <div className="text-5xl font-black text-rose-700 tracking-wider font-mono">
                    UNSOLD
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-2">
                    Player returns to the auction pool
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODULE 3: THE HEAVYWEIGHT, HIGH-VISIBILITY AUCTION WIRE (BOTTOM TICKER)    */}
      {/* ========================================================================= */}
      <footer className="relative z-20 rounded-2xl bg-white border-2 border-slate-300 shadow-xl p-3 flex items-center gap-4 overflow-hidden shrink-0">
        {/* Prominent Lead Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-wider shrink-0 shadow-md">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm tracking-tight text-white">AUCTION WIRE</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[11px] font-bold">
            {soldHistory.length} SOLD
          </span>
        </div>

        {/* Live Pure CSS Continuous Scrolling Marquee */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          {soldHistory.length === 0 ? (
            <div className="text-sm text-slate-400 font-semibold italic">
              Auction wire initialized • Awaiting first player sale on the hammer...
            </div>
          ) : (
            <div className="overflow-hidden w-full flex items-center">
              <div className={`${soldHistory.length > 2 ? 'animate-wire-marquee' : 'flex'} items-center gap-4`}>
                {marqueeList.map((item, idx) => {
                  const isLatestSale = idx === 0 || (soldHistory.length > 2 && idx === soldHistory.length);

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all shrink-0 ${
                        isLatestSale
                          ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-400/40 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Highlight Pill for the Latest Sold Player */}
                      {isLatestSale && (
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                          LATEST SALE
                        </span>
                      )}

                      <img
                        src={item.player.photoUrl}
                        alt={item.player.name}
                        className="w-10 h-10 rounded-xl object-cover object-top border border-slate-300 shadow-2xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                        }}
                      />

                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col">
                          <span className="font-black text-sm text-slate-900 whitespace-nowrap">
                            {item.player.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {roleLabels[item.player.role] || item.player.role}
                          </span>
                        </div>

                        <span className="text-slate-400 font-bold">➔</span>

                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-black text-white whitespace-nowrap shadow-xs flex items-center gap-1.5"
                          style={{ backgroundColor: item.winningTeam.primaryColor }}
                        >
                          <span>{item.winningTeam.shortName}</span>
                        </span>

                        <span className="font-mono text-base font-black text-emerald-700 whitespace-nowrap bg-emerald-100/60 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                          {formatCurrency(item.soldPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Total Points Traded Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs shrink-0">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Total Traded:</span>
          <span className="font-mono font-black text-sm text-emerald-700">
            {formatCurrency(soldHistory.reduce((acc, curr) => acc + curr.soldPrice, 0))}
          </span>
        </div>
      </footer>
    </div>
  );
};
