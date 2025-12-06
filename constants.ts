
import { Server, User, UserStatus, MusicTrack, SoundEffect, InventoryItem, Tournament, Clip } from './types';
import { Sparkles, Trophy, Zap, Ghost, Skull, Crown, Crosshair, Shield } from 'lucide-react';

export const MOCK_USERS: User[] = [
  { 
    id: '1', 
    username: 'Kaelthas', 
    avatar: 'https://picsum.photos/id/64/200/200', 
    banner: 'https://picsum.photos/id/132/800/300',
    bio: 'Support main looking for a cracked ADC. Do not DM me if you tilt.',
    status: UserStatus.PLAYING, 
    gameActivity: 'League of Legends', 
    level: 42, 
    xp: 75, 
    badges: ['🔥', '⚔️'],
    socials: { discord: 'kael#1234', twitch: 'kael_plays' },
    stats: [
      { game: 'League of Legends', rank: 'Diamond II', winRate: '54%', matches: 420, role: 'Support' },
      { game: 'Valorant', rank: 'Ascendant 1', winRate: '49%', matches: 150, role: 'Controller' }
    ]
  },
  { 
    id: '2', 
    username: 'JinxViper', 
    avatar: 'https://picsum.photos/id/65/200/200', 
    banner: 'https://picsum.photos/id/142/800/300',
    bio: 'Professional button masher. Speedrunner.',
    status: UserStatus.ONLINE, 
    level: 88, 
    xp: 20, 
    badges: ['👑', '💎', '⚡'],
    socials: { twitter: '@jinxviper', steam: 'jinx_v' },
    stats: [
       { game: 'Elden Ring', rank: 'Elden Lord', winRate: 'N/A', matches: 0, role: 'Tarnished' }
    ]
  },
  { 
    id: '3', 
    username: 'NoobMaster69', 
    avatar: 'https://picsum.photos/id/66/200/200', 
    status: UserStatus.DND, 
    gameActivity: 'Elden Ring', 
    level: 12, 
    xp: 90, 
    badges: ['💀'] 
  },
  { 
    id: '4', 
    username: 'Nexus AI', 
    avatar: 'https://picsum.photos/id/20/200/200', 
    banner: 'https://picsum.photos/id/54/800/300',
    bio: 'I am the system. I am the strategy.',
    status: UserStatus.ONLINE, 
    gameActivity: 'Analyzing Strategies', 
    level: 999, 
    xp: 100, 
    badges: ['🤖', '🧠'] 
  },
];

export const MOCK_SERVERS: Server[] = [
  {
    id: 'nexus-home',
    name: 'Nexus HQ',
    icon: 'https://picsum.photos/id/100/100/100',
    channels: [
      { id: 'gen', name: 'general', type: 'TEXT' },
      { id: 'lfg', name: 'looking-for-group', type: 'TEXT' },
      { id: 'clips', name: 'clips-and-highlights', type: 'TEXT' },
      { id: 'vc1', name: 'Lobby Alpha', type: 'VOICE' },
      { id: 'vc2', name: 'Ranked Grind', type: 'VOICE' },
    ]
  },
  {
    id: 'val-server',
    name: 'Valorant Elites',
    icon: 'https://picsum.photos/id/101/100/100',
    channels: [
      { id: 'val-gen', name: 'general', type: 'TEXT' },
      { id: 'val-strats', name: 'strats', type: 'TEXT' },
      { id: 'val-vc', name: 'Scrims', type: 'VOICE' },
    ]
  },
  {
    id: 'mmorpg',
    name: 'MMO Legends',
    icon: 'https://picsum.photos/id/102/100/100',
    channels: [
      { id: 'mmo-gen', name: 'tavern', type: 'TEXT' },
      { id: 'mmo-raid', name: 'raid-planning', type: 'TEXT' },
    ]
  }
];

export const INITIAL_MESSAGES = [
  { id: 'm1', content: 'Anyone up for a ranked match?', senderId: '1', timestamp: new Date(Date.now() - 1000 * 60 * 60), reactions: [{emoji: '👍', count: 2}] },
  { id: 'm2', content: 'I need a healer, logging in now.', senderId: '3', timestamp: new Date(Date.now() - 1000 * 60 * 55) },
  { id: 'm3', content: 'Welcome to Nexus! I am your AI companion. Ask me anything about game strategies or lore.', senderId: '4', timestamp: new Date(), isAI: true },
];

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 't1', title: 'Cyberpunk City', artist: 'Synthwave Boy', cover: 'https://picsum.photos/id/145/100/100', duration: 185 },
  { id: 't2', title: 'Lo-Fi Beats to Raid To', artist: 'Chill Mage', cover: 'https://picsum.photos/id/146/100/100', duration: 240 },
  { id: 't3', title: 'Boss Music (Heavy Metal)', artist: 'Doom Guy', cover: 'https://picsum.photos/id/147/100/100', duration: 300 },
];

export const SOUND_EFFECTS: SoundEffect[] = [
  { id: 's1', label: 'Airhorn', icon: Zap, color: 'text-yellow-400' },
  { id: 's2', label: 'GG WP', icon: Crown, color: 'text-green-400' },
  { id: 's3', label: 'Oof', icon: Skull, color: 'text-red-400' },
  { id: 's4', label: 'Level Up', icon: Trophy, color: 'text-nexus-accent' },
];

export const LOOT_ITEMS: InventoryItem[] = [
  { id: 'b1', name: 'Veteran Badge', type: 'BADGE', rarity: 'COMMON', icon: Sparkles },
  { id: 'b2', name: 'Neon Theme', type: 'THEME', rarity: 'RARE', icon: Ghost },
  { id: 'b3', name: 'Developer Key', type: 'XP_BOOST', rarity: 'LEGENDARY', icon: Crown },
];

export const TOURNAMENTS: Tournament[] = [
  { id: 't1', title: 'Apex Legends: Sunday Slaughter', game: 'Apex Legends', prizePool: '$5,000', startDate: 'This Sunday, 2PM EST', participants: 42, maxParticipants: 60, image: 'https://picsum.photos/id/234/400/200', status: 'OPEN' },
  { id: 't2', title: 'Valorant Community Cup', game: 'Valorant', prizePool: '$1,000 + Skins', startDate: 'Live Now', participants: 128, maxParticipants: 128, image: 'https://picsum.photos/id/235/400/200', status: 'LIVE' },
  { id: 't3', title: 'Rocket League 2v2', game: 'Rocket League', prizePool: '$500', startDate: 'Oct 24', participants: 12, maxParticipants: 32, image: 'https://picsum.photos/id/236/400/200', status: 'OPEN' },
];

export const CLIPS: Clip[] = [
  { id: 'c1', title: 'INSANE 1v5 Clutch', authorId: '1', game: 'CS:GO', views: '1.2k', likes: 450, thumbnail: 'https://picsum.photos/id/15/300/200', timestamp: '2h ago' },
  { id: 'c2', title: 'Funny Glitch Moment', authorId: '3', game: 'Cyberpunk 2077', views: '8.5k', likes: 2100, thumbnail: 'https://picsum.photos/id/16/300/200', timestamp: '5h ago' },
  { id: 'c3', title: 'Speedrun World Record Pace', authorId: '2', game: 'Mario 64', views: '120', likes: 50, thumbnail: 'https://picsum.photos/id/17/300/200', timestamp: '1d ago' },
  { id: 'c4', title: 'My Setup Tour', authorId: '1', game: 'IRL', views: '500', likes: 90, thumbnail: 'https://picsum.photos/id/18/300/200', timestamp: '2d ago' },
];
