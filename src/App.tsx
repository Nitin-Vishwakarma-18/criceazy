import React, { useState, useEffect } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { LiveAuctionDashboard } from './components/LiveAuctionDashboard';
import { TeamSquadsView } from './components/TeamSquadsView';
import { SetupView } from './components/SetupView';
import { BroadcastStreamView } from './components/BroadcastStreamView';
import { formatCurrency } from './utils/currency';
import { Radio, Users, Settings, Sparkles, Tv, Copy, ExternalLink } from 'lucide-react';

const getActiveRoute = (): 'admin' | 'stream' => {
  if (typeof window === 'undefined') return 'admin';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  if (path === '/stream' || path.startsWith('/stream/') || hash.includes('stream')) {
    return 'stream';
  }
  return 'admin';
};

const AdminAppContent: React.FC<{ onNavigateToStream: () => void }> = ({ onNavigateToStream }) => {
  const [activeTab, setActiveTab] = useState<'auction' | 'squads' | 'setup'>('auction');
  const { projectorMode, players, teams, logoStyle, toggleLogoStyle } = useAuction();
  const [copiedObs, setCopiedObs] = useState<boolean>(false);

  const totalSold = players.filter(p => p.status === 'SOLD').length;
  const totalSpent = teams.reduce((acc, t) => acc + (t.totalBudget - t.remainingBudget), 0);

  const logoSrc = logoStyle === 'realistic' ? '/epl-logo-realistic.jpg' : '/epl-logo-transparent.png';

  const handleCopyObsLink = () => {
    const streamUrl = `${window.location.origin}/stream`;
    navigator.clipboard.writeText(streamUrl);
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 2500);
  };

  const handleOpenStreamNewTab = () => {
    window.open('/stream', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-red-600 selection:text-white">
      {/* Top Header - Hidden in Projector Mode */}
      {!projectorMode && (
        <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
          {/* OBS Stream Banner Announcement */}
          <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-white text-xs py-2 px-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-slate-300">OBS YouTube Broadcast Route Active:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400">
                /stream (1920x1080 OBS Browser Source)
              </code>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyObsLink}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition font-semibold text-[11px] cursor-pointer"
                title="Copy Browser Source URL for OBS Studio"
              >
                <Copy className="w-3 h-3 text-red-400" />
                <span>{copiedObs ? 'Copied OBS URL!' : 'Copy OBS Browser Source URL'}</span>
              </button>

              <button
                onClick={handleOpenStreamNewTab}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                title="Open Broadcast Overlay in a new tab"
              >
                <Tv className="w-3 h-3" />
                <span>Open /stream in New Tab</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-80" />
              </button>

              <button
                onClick={onNavigateToStream}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-[11px] font-semibold transition cursor-pointer"
                title="Preview Broadcast Overlay in this window"
              >
                <span>Switch View</span>
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            {/* Branding with New Logo & Clean EPL Auction Title */}
            <div className="flex items-center gap-3">
              <div
                onClick={toggleLogoStyle}
                className="relative group cursor-pointer"
                title="Click to switch between Realistic 3D Logo and Classic Crest"
              >
                <img
                  src={logoSrc}
                  alt="EPL Auction Logo"
                  className="w-11 h-11 rounded-xl object-contain shadow-sm border border-red-500/20 bg-slate-50 group-hover:scale-105 transition duration-200 p-0.5"
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 bg-red-600 rounded-full text-white text-[8px] opacity-0 group-hover:opacity-100 transition shadow">
                  <Sparkles className="w-2.5 h-2.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-2xl tracking-tight flex items-center gap-1 font-display">
                    <span className="text-red-600 drop-shadow-xs">EPL</span>
                    <span className="text-slate-900">AUCTION</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 border border-slate-300 text-slate-700">
                    Admin Panel
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Premier League Live Auction Platform • Real-Time Automated Budget &amp; Squad Engine
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setActiveTab('auction')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'auction'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Live Auction</span>
              </button>

              <button
                onClick={() => setActiveTab('squads')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'squads'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Squads</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full border bg-white border-slate-300 text-slate-700 font-bold">
                  {totalSold}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('setup')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'setup'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Registry &amp; Setup</span>
                <span className="sm:hidden">Setup</span>
              </button>
            </nav>

            {/* Auction Ticker Metric */}
            <div className="hidden lg:flex items-center gap-4 border-l border-slate-200 pl-4 text-xs">
              <div>
                <span className="font-semibold uppercase text-[10px] text-slate-400">Total Spent</span>
                <div className="font-bold text-red-600 font-mono text-sm">{formatCurrency(totalSpent)}</div>
              </div>
              <div>
                <span className="font-semibold uppercase text-[10px] text-slate-400">Players Sold</span>
                <div className="font-bold text-slate-900 text-sm">
                  {totalSold}/{players.length}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${projectorMode ? 'p-2' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full'}`}>
        {activeTab === 'auction' && <LiveAuctionDashboard />}
        {activeTab === 'squads' && <TeamSquadsView />}
        {activeTab === 'setup' && <SetupView />}
      </main>

      {/* Footer */}
      {!projectorMode && (
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>EPL Auction Platform • Premier League Real-Time Auction &amp; Squad Engine</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<'admin' | 'stream'>(getActiveRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getActiveRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: 'admin' | 'stream') => {
    const path = route === 'stream' ? '/stream' : '/admin';
    window.history.pushState({}, '', path);
    setCurrentRoute(route);
  };

  return (
    <AuctionProvider>
      {currentRoute === 'stream' ? (
        <BroadcastStreamView />
      ) : (
        <AdminAppContent onNavigateToStream={() => navigateTo('stream')} />
      )}
    </AuctionProvider>
  );
};

export default App;
