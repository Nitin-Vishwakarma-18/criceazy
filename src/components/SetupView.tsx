import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { PlayerRole } from '../types/auction';
import { formatCurrency } from '../utils/currency';
import { DEFAULT_PURSE_POINTS } from '../data/initialData';
import { ShieldCheck, UserPlus, RefreshCw, Trash2, Users, Image as ImageIcon, Edit3, Check, X } from 'lucide-react';

export const SetupView: React.FC = () => {
  const { teams, players, addTeam, updateTeamSquadLimit, removeTeam, addPlayer, removePlayer, resetAuction } = useAuction();

  // Tab: 'players' | 'teams'
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamShortName, setTeamShortName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#dc2626'); // Default Crimson Red
  const [budgetPoints, setBudgetPoints] = useState(DEFAULT_PURSE_POINTS.toString());
  const [squadLimit, setSquadLimit] = useState('10');
  const [teamLogoUrl, setTeamLogoUrl] = useState('');

  // Editing existing team squad limit state
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('10');

  // Player Form State
  const [playerName, setPlayerName] = useState('');
  const [role, setRole] = useState<PlayerRole>('Batsman');
  const [basePricePoints, setBasePricePoints] = useState('1000'); // 1,000 Points
  const [photoUrl, setPhotoUrl] = useState('');
  const [specialty, setSpecialty] = useState('');

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamShortName.trim()) return;

    const points = parseInt(budgetPoints, 10) || DEFAULT_PURSE_POINTS;
    const maxSquad = parseInt(squadLimit, 10) || 10;

    addTeam({
      name: teamName.trim(),
      shortName: teamShortName.trim().toUpperCase(),
      primaryColor,
      secondaryColor: '#000000',
      logoUrl: teamLogoUrl.trim() || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=120&auto=format&fit=crop&q=80',
      totalBudget: points,
      maxSquadSize: maxSquad,
      maxOverseas: maxSquad,
    });

    setTeamName('');
    setTeamShortName('');
    setTeamLogoUrl('');
    setBudgetPoints(DEFAULT_PURSE_POINTS.toString());
    setSquadLimit('10');
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const price = parseInt(basePricePoints, 10) || 500;

    addPlayer({
      name: playerName.trim(),
      role,
      country: '',
      basePrice: price,
      isOverseas: false,
      photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      stats: {
        matches: 0,
        runs: 0,
        wickets: 0,
        strikeRate: 0,
        specialty: specialty.trim() || `${role} Specialist`,
      },
    });

    setPlayerName('');
    setPhotoUrl('');
    setSpecialty('');
    setBasePricePoints('1000');
  };

  const handleRemoveTeam = (teamId: string, teamName: string) => {
    if (window.confirm(`Are you sure you want to remove team "${teamName}"? Any players bought by this team will return to the auction pool.`)) {
      removeTeam(teamId);
    }
  };

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    if (window.confirm(`Are you sure you want to remove player "${playerName}"? If sold, points will be refunded to the team.`)) {
      removePlayer(playerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            EPL Auction Registry &amp; Setup
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register teams &amp; players • Customizable squad limits &amp; purse
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-1">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'players'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Players Pool ({players.length})
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'teams'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Franchises ({teams.length})
            </button>
          </div>

          <button
            onClick={resetAuction}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Auction Pool</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left, List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registration Forms */}
        <div className="lg:col-span-5">
          {activeTab === 'players' ? (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                Register New Player
              </div>

              <form onSubmit={handleAddPlayer} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Player Full Name</label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Bukayo Saka"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Playing Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as PlayerRole)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-Rounder">All-Rounder</option>
                      <option value="Wicketkeeper">Wicketkeeper</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price (Points)</label>
                    <input
                      type="number"
                      step="50"
                      min="50"
                      max="10000"
                      required
                      value={basePricePoints}
                      onChange={(e) => setBasePricePoints(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Default 1,000 PTS</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Player Photo URL (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-mono"
                    />
                    {photoUrl && (
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialty Description</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Opening Batsman &amp; Powerplay Specialist"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white transition shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Add Player to Auction Pool
                </button>
              </form>
            </div>
          ) : (
            /* Add Franchise Team Form with Photo URL */
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Register New Franchise Team
              </div>

              <form onSubmit={handleAddTeam} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Franchise Name</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Arsenal FC or Gujarat Titans"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Short Code (2-4 letters)</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={teamShortName}
                      onChange={(e) => setTeamShortName(e.target.value)}
                      placeholder="e.g. ARS"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Purse (Points)</label>
                    <input
                      type="number"
                      required
                      value={budgetPoints}
                      onChange={(e) => setBudgetPoints(e.target.value)}
                      placeholder="10000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Default: 10,000 Points</span>
                  </div>
                </div>

                {/* Franchise Photo / Logo URL Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Franchise Logo / Photo URL (Optional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">PNG / SVG / JPG</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={teamLogoUrl}
                      onChange={(e) => setTeamLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-mono"
                    />
                    {teamLogoUrl ? (
                      <img
                        src={teamLogoUrl}
                        alt="Logo Preview"
                        className="w-10 h-10 rounded-xl object-contain border border-slate-300 p-1 bg-white shadow-xs shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Color Accent</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-700">{primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Squad Limit (Players)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={squadLimit}
                      onChange={(e) => setSquadLimit(e.target.value)}
                      placeholder="10"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Default: 10 players</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white transition shadow-md shadow-red-600/30 cursor-pointer"
                >
                  Create Franchise Team
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Existing Records with Remove/Delete Option */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                {activeTab === 'players' ? `Active Player Pool (${players.length})` : `Registered Franchises (${teams.length})`}
              </h3>
              <span className="text-xs text-slate-400">Click the trash icon to remove</span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {activeTab === 'players' ? (
                players.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No players registered. Add players using the form on the left.
                  </div>
                ) : (
                  players.map(p => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover object-top border border-slate-200 shrink-0 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="text-xs text-slate-400 font-mono">#{p.order}</span>
                            <span className="truncate">{p.name}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="font-medium text-slate-700">{p.role}</span>
                            <span>•</span>
                            <span>Base: <strong className="text-red-600">{formatCurrency(p.basePrice)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'SOLD'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : p.status === 'UNSOLD'
                              ? 'bg-red-100 text-red-700 border border-red-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>

                        {/* Remove Player Button */}
                        <button
                          onClick={() => handleRemovePlayer(p.id, p.name)}
                          className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title={`Remove ${p.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                teams.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No franchises registered. Add a team using the form on the left.
                  </div>
                ) : (
                  teams.map(t => {
                    const squadMembers = players.filter(p => p.soldToTeamId === t.id);
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {t.logoUrl ? (
                            <img
                              src={t.logoUrl}
                              alt={t.shortName}
                              className="w-11 h-11 rounded-xl object-contain p-1 bg-white border border-slate-200 shadow-xs shrink-0"
                              onError={(e) => {
                                // Fallback to color initial badge
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: t.primaryColor, display: t.logoUrl ? 'none' : 'flex' }}
                          >
                            {t.shortName}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{t.name}</div>
                            {editingTeamId === t.id ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-slate-600 font-semibold">Squad Limit:</span>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={editLimitValue}
                                  onChange={(e) => setEditLimitValue(e.target.value)}
                                  className="w-14 px-2 py-0.5 text-xs font-bold bg-white border border-red-500 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = parseInt(editLimitValue, 10);
                                      if (!isNaN(val) && val > 0) updateTeamSquadLimit(t.id, val);
                                      setEditingTeamId(null);
                                    } else if (e.key === 'Escape') {
                                      setEditingTeamId(null);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = parseInt(editLimitValue, 10);
                                    if (!isNaN(val) && val > 0) updateTeamSquadLimit(t.id, val);
                                    setEditingTeamId(null);
                                  }}
                                  className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs"
                                  title="Save squad limit"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTeamId(null)}
                                  className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span>Squad: <strong className="text-slate-800">{squadMembers.length}/{t.maxSquadSize || 10}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTeamId(t.id);
                                    setEditLimitValue((t.maxSquadSize || 10).toString());
                                  }}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-[10px] font-semibold text-slate-600 hover:text-red-600 transition cursor-pointer"
                                  title="Edit squad limit"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                  <span>Edit Limit</span>
                                </button>
                                <span>• Initial Purse: {formatCurrency(t.totalBudget)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Available</div>
                            <div className="text-sm font-bold text-emerald-600 font-mono">
                              {formatCurrency(t.remainingBudget)}
                            </div>
                          </div>

                          {/* Edit Team Squad Limit Button */}
                          <button
                            onClick={() => {
                              if (editingTeamId === t.id) {
                                setEditingTeamId(null);
                              } else {
                                setEditingTeamId(t.id);
                                setEditLimitValue((t.maxSquadSize || 10).toString());
                              }
                            }}
                            className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-500 hover:text-red-600 transition cursor-pointer"
                            title={`Edit squad limit for ${t.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove Team Button */}
                          <button
                            onClick={() => handleRemoveTeam(t.id, t.name)}
                            className="p-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title={`Remove franchise ${t.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
