
export enum UserStatus {
  ONLINE = 'ONLINE',
  IDLE = 'IDLE',
  DND = 'DND',
  OFFLINE = 'OFFLINE',
  PLAYING = 'PLAYING'
}

export interface SocialLinks {
  discord?: string;
  steam?: string;
  twitch?: string;
  twitter?: string;
  xbox?: string;
}

export interface GameStat {
  game: string;
  rank: string;
  winRate: string;
  matches: number;
  role: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  banner?: string;
  bio?: string;
  status: UserStatus;
  gameActivity?: string;
  level: number;
  xp: number;
  badges: string[];
  socials?: SocialLinks;
  stats?: GameStat[];
  joinDate?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isSystem?: boolean;
  isAI?: boolean;
  isRead?: boolean;
  replyToId?: string;
  reactions?: { emoji: string; count: number }[];
  type?: 'TEXT' | 'IMAGE' | 'SYSTEM' | 'GIFT' | 'POLL';
  imageUrl?: string;
  giftData?: { title: string; tier: string; icon: string };
  pollData?: { question: string; options: { label: string; votes: number }[] };
  groundingUrls?: { title: string; uri: string }[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'TEXT' | 'VOICE';
  unreadCount?: number;
}

export interface Server {
  id: string;
  name: string;
  icon: string;
  channels: Channel[];
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number; // in seconds
}

export interface SoundEffect {
  id: string;
  label: string;
  icon: any; // Lucide icon component
  color: string;
  src: string; // URL to audio file
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'BADGE' | 'THEME' | 'XP_BOOST';
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  icon: any;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  prizePool: string;
  startDate: string;
  participants: number;
  maxParticipants: number;
  image: string;
  status: 'OPEN' | 'LIVE' | 'ENDED';
}

export interface Clip {
  id: string;
  title: string;
  authorId: string;
  game: string;
  views: string;
  likes: number;
  thumbnail: string;
  timestamp: string;
}

export type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER' | 'APP';
