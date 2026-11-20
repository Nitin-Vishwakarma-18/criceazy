import { Player, Team } from '../types/auction';

export const DEFAULT_PURSE_POINTS = 10000;
export const MAX_SQUAD_PER_TEAM = 10;

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-csk',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    primaryColor: '#eab308', // Gold / Yellow
    secondaryColor: '#1e3a8a',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2b/Chennai_Super_Kings_Logo.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM, // 10 Players
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
  {
    id: 'team-mi',
    name: 'Mumbai Indians',
    shortName: 'MI',
    primaryColor: '#004ba0', // Royal Blue
    secondaryColor: '#f59e0b',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Mumbai_Indians_Logo.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM, // 10 Players
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
  {
    id: 'team-rcb',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    primaryColor: '#dc2626', // Crimson Red
    secondaryColor: '#000000',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Royal_Challengers_Bangalore_2020.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM, // 10 Players
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
  {
    id: 'team-kkr',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    primaryColor: '#3b0764', // Deep Purple & Gold
    secondaryColor: '#facc15',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kolkata_Knight_Riders_Logo.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM, // 10 Players
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
  {
    id: 'team-rr',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    primaryColor: '#db2777', // Royal Pink
    secondaryColor: '#1d4ed8',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/60/Rajasthan_Royals_Logo.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM, // 10 Players
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
  {
    id: 'team-srh',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    primaryColor: '#ea580c', // Fiery Orange
    secondaryColor: '#000000',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/81/Sunrisers_Hyderabad.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM, // 10 Players
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
  {
    id: 'team-gt',
    name: 'Gujarat Titans',
    shortName: 'GT',
    primaryColor: '#1b2838', // Deep Navy & Gold
    secondaryColor: '#d4af37',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/09/Gujarat_Titans_Logo.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM,
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
  {
    id: 'team-dc',
    name: 'Delhi Capitals',
    shortName: 'DC',
    primaryColor: '#0047ab', // Cobalt Blue & Crimson
    secondaryColor: '#dc2626',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Delhi_Capitals_Logo.svg',
    totalBudget: DEFAULT_PURSE_POINTS, // 10,000 Points
    remainingBudget: DEFAULT_PURSE_POINTS,
    maxSquadSize: MAX_SQUAD_PER_TEAM,
    maxOverseas: MAX_SQUAD_PER_TEAM,
  },
];

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'player-1',
    name: 'Virat Kohli',
    role: 'Batsman',
    country: '',
    basePrice: 2000, // 2,000 Points
    status: 'IN_AUCTION',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 1,
    stats: {
      matches: 252,
      runs: 8004,
      strikeRate: 131.97,
      highestScore: '113',
      specialty: 'Right-hand Top Order Anchor & Chaser',
      rating: 98,
    },
  },
  {
    id: 'player-2',
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    country: '',
    basePrice: 2000, // 2,000 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 2,
    stats: {
      matches: 133,
      wickets: 165,
      economy: 7.30,
      bestBowling: '5/10',
      specialty: 'Right-arm Fast Death-Overs Specialist',
      rating: 99,
    },
  },
  {
    id: 'player-3',
    name: 'Heinrich Klaasen',
    role: 'Wicketkeeper',
    country: '',
    basePrice: 1500, // 1,500 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 3,
    stats: {
      matches: 35,
      runs: 993,
      strikeRate: 168.31,
      highestScore: '104*',
      specialty: 'Explosive Spin Destroyer & Gloveman',
      rating: 95,
    },
  },
  {
    id: 'player-4',
    name: 'Hardik Pandya',
    role: 'All-Rounder',
    country: '',
    basePrice: 1500, // 1,500 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 4,
    stats: {
      matches: 137,
      runs: 2525,
      wickets: 64,
      strikeRate: 145.86,
      economy: 8.92,
      specialty: 'Pace-Bowling All-Rounder & Finisher',
      rating: 94,
    },
  },
  {
    id: 'player-5',
    name: 'Travis Head',
    role: 'Batsman',
    country: '',
    basePrice: 1500, // 1,500 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 5,
    stats: {
      matches: 25,
      runs: 772,
      strikeRate: 182.50,
      highestScore: '102',
      specialty: 'High-Octane Powerplay Destroyer',
      rating: 96,
    },
  },
  {
    id: 'player-6',
    name: 'Rashid Khan',
    role: 'Bowler',
    country: '',
    basePrice: 1500, // 1,500 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 6,
    stats: {
      matches: 121,
      wickets: 149,
      economy: 6.82,
      bestBowling: '4/24',
      specialty: 'Mystery Leg-Spin & Hard Hitter',
      rating: 97,
    },
  },
  {
    id: 'player-7',
    name: 'Rishabh Pant',
    role: 'Wicketkeeper',
    country: '',
    basePrice: 1500, // 1,500 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 7,
    stats: {
      matches: 111,
      runs: 3284,
      strikeRate: 148.93,
      highestScore: '128*',
      specialty: 'Fearless Middle-Order Attacker & Wicketkeeper',
      rating: 95,
    },
  },
  {
    id: 'player-8',
    name: 'Andre Russell',
    role: 'All-Rounder',
    country: '',
    basePrice: 1200, // 1,200 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 8,
    stats: {
      matches: 127,
      runs: 2484,
      wickets: 115,
      strikeRate: 174.93,
      economy: 9.25,
      specialty: 'Match-Winning Power Striker & Death Bowler',
      rating: 96,
    },
  },
  {
    id: 'player-9',
    name: 'Rinku Singh',
    role: 'Batsman',
    country: '',
    basePrice: 800, // 800 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 9,
    stats: {
      matches: 45,
      runs: 893,
      strikeRate: 143.34,
      highestScore: '67*',
      specialty: 'Ice-Cold Death-Overs Finisher',
      rating: 91,
    },
  },
  {
    id: 'player-10',
    name: 'Kuldeep Yadav',
    role: 'Bowler',
    country: '',
    basePrice: 1000, // 1,000 Points
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 10,
    stats: {
      matches: 84,
      wickets: 87,
      economy: 8.04,
      bestBowling: '4/14',
      specialty: 'Left-Arm Wrist Spinner & Wicket Taker',
      rating: 92,
    },
  },
  {
    id: 'player-11',
    name: 'Rohit Sharma',
    role: 'Batsman',
    country: '',
    basePrice: 2000,
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 11,
    stats: {
      matches: 257,
      runs: 6628,
      strikeRate: 131.14,
      highestScore: '109*',
      specialty: 'Powerplay Dominator & 5-Time Champion Captain',
      rating: 97,
    },
  },
  {
    id: 'player-12',
    name: 'Shubman Gill',
    role: 'Batsman',
    country: '',
    basePrice: 1500,
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 12,
    stats: {
      matches: 103,
      runs: 3216,
      strikeRate: 135.78,
      highestScore: '129',
      specialty: 'Graceful Opener & Orange Cap Record Holder',
      rating: 94,
    },
  },
  {
    id: 'player-13',
    name: 'Travis Head',
    role: 'Batsman',
    country: '',
    basePrice: 1500,
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 13,
    stats: {
      matches: 25,
      runs: 772,
      strikeRate: 189.68,
      highestScore: '102',
      specialty: 'Fierce Powerplay Annihilator & Fast Starter',
      rating: 95,
    },
  },
  {
    id: 'player-14',
    name: 'Ravindra Jadeja',
    role: 'All-Rounder',
    country: '',
    basePrice: 1500,
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 14,
    stats: {
      matches: 240,
      runs: 2959,
      wickets: 160,
      strikeRate: 129.82,
      economy: 7.62,
      specialty: 'Elite 3D Weapon: Finisher, Arm Ball Spinner & Gun Fielder',
      rating: 96,
    },
  },
  {
    id: 'player-15',
    name: 'Mitchell Starc',
    role: 'Bowler',
    country: '',
    basePrice: 1800,
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 15,
    stats: {
      matches: 41,
      wickets: 51,
      economy: 8.84,
      bestBowling: '4/15',
      specialty: 'Lethal Left-Arm Inswinging Yorker Machine',
      rating: 96,
    },
  },
  {
    id: 'player-16',
    name: 'Trent Boult',
    role: 'Bowler',
    country: '',
    basePrice: 1200,
    status: 'UPCOMING',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80',
    isOverseas: false,
    order: 16,
    stats: {
      matches: 104,
      wickets: 121,
      economy: 8.29,
      bestBowling: '4/18',
      specialty: 'Master of 1st-Over Breakthroughs & New Ball Swing',
      rating: 94,
    },
  },
];
