

import React, { useState, useEffect } from 'react';
import { Server, Channel, User, MusicTrack } from '../types';
import { Avatar, ProgressBar, ConfirmModal } from './UIComponents';
import { Hash, Volume2, Mic, MicOff, Headphones, VolumeX, Settings, Plus, Play, Pause, SkipForward, Disc, Trophy, Globe, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { MUSIC_TRACKS } from '../constants';

// --- Music Player Widget ---
const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const track = MUSIC_TRACKS[currentTrackIndex];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 1));
      }, track.duration * 10);
    }
    return () => clearInterval(interval);
  }, [isPlaying, track]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length);
    setProgress(0);
  };

  return (
    <div className="bg-slate-900/50 p-3 border-t border-slate-800">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded overflow-hidden relative ${isPlaying ? 'animate-pulse' : ''}`}>
           <img src={track.cover} alt="Cover" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
             <Disc size={16} className={`text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
           </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">{track.title}</div>
          <div className="text-[10px] text-slate-400 truncate">{track.artist}</div>
        </div>
      </div>
      <ProgressBar value={progress} max={100} className="h-1 mb-2 bg-slate-800" color="bg-nexus-glow" />
      <div className="flex justify-between items-center text-slate-400">
        <span className="text-[10px]">0:{(progress * track.duration / 100 / 60).toFixed(0).padStart(1,'0')}:{(progress * track.duration / 100 % 60).toFixed(0).padStart(2,'0')}</span>
        <div className="flex gap-3">
           <button onClick={togglePlay} className="hover:text-white transition-colors">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
           </button>
           <button onClick={nextTrack} className="hover:text-white transition-colors">
              <SkipForward size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Server Sidebar ---
interface ServerSidebarProps {
  servers: Server[];
  activeServerId: string;
  onSelectServer: (id: string) => void;
  onAddServer: () => void;
}

export const ServerSidebar: React.FC<ServerSidebarProps> = ({ servers, activeServerId, onSelectServer, onAddServer }) => {
  return (
    <div className="w-[72px] flex-shrink-0 bg-slate-900 flex flex-col items-center py-4 gap-4 overflow-y-auto border-r border-slate-800 no-scrollbar">
      {/* Home Button */}
      <button 
        className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-slate-700 hover:bg-nexus-accent transition-all duration-300 flex items-center justify-center group ${activeServerId === 'home' ? 'bg-nexus-accent rounded-[16px]' : ''}`}
        onClick={() => onSelectServer('home')}
        title="Direct Messages"
      >
        <img src="https://picsum.photos/id/10/50/50" className="w-6 h-6 rounded-full" />
      </button>

      {/* Hub Button (New) */}
      <button 
        className={`w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-slate-800 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-all duration-300 flex items-center justify-center group ${activeServerId === 'hub' ? 'bg-yellow-500 text-white rounded-[16px]' : ''}`}
        onClick={() => onSelectServer('hub')}
        title="Gaming Hub"
      >
        <Trophy size={24} />
      </button>

      <div className="w-8 h-[2px] bg-slate-800 rounded-full" />

      {/* Server List */}
      {servers.map((server) => (
        <div key={server.id} className="relative group w-full flex justify-center">
          {activeServerId === server.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
          )}
          <button
            onClick={() => onSelectServer(server.id)}
            className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-300 overflow-hidden relative ${activeServerId === server.id ? 'rounded-[16px] ring-2 ring-nexus-accent ring-offset-2 ring-offset-slate-900' : ''}`}
          >
             <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
          </button>
          {/* Tooltip */}
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-bold tracking-wide">
            {server.name}
          </div>
        </div>
      ))}
      
      <button 
        onClick={onAddServer}
        className="w-12 h-12 rounded-[24px] bg-slate-800 hover:bg-green-600 text-green-500 hover:text-white transition-all flex items-center justify-center mt-2 group"
        title="Add a Server"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

// --- Channel Sidebar ---
interface ChannelSidebarProps {
  server: Server | undefined;
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  currentUser: User;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenServerSettings?: () => void;
  users?: User[];
  onJoinVoice?: (channel: Channel) => void;
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({ server, activeChannelId, onSelectChannel, currentUser, onOpenSettings, onOpenProfile, onOpenServerSettings, users = [], onJoinVoice }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeafened && isMuted) return;
    setIsMuted(!isMuted);
  };

  const handleToggleDeafen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willDeafen = !isDeafened;
    setIsDeafened(willDeafen);
    if (willDeafen) {
      setIsMuted(true);
    }
  };

  const handleVoiceClick = (channel: Channel) => {
    if (activeChannelId === channel.id) return; // Already in this channel
    if (onJoinVoice) onJoinVoice(channel);
  };

  return (
    <div className="w-64 bg-slate-800/50 flex flex-col border-r border-slate-800 backdrop-blur-sm relative">
      {/* Header */}
      <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4 font-bold shadow-sm cursor-pointer hover:bg-slate-700/30 transition-colors">
        <span className="truncate">{server ? server.name : 'Direct Messages'}</span>
        {server && (
          <button 
            onClick={(e) => { e.stopPropagation(); onOpenServerSettings?.(); }} 
            className="text-slate-400 hover:text-white transition-colors"
            title="Server Settings"
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {server ? (
          <>
            <div className="mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1 flex items-center justify-between group cursor-pointer">
                <span>Text Channels</span>
                <Plus size={12} className="opacity-0 group-hover:opacity-100" />
              </h3>
              {server.channels.filter(c => c.type === 'TEXT').map(channel => (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`w-full flex items-center px-2 py-1.5 rounded-md group transition-all duration-300 ${
                    activeChannelId === channel.id 
                      ? 'bg-gradient-to-r from-slate-700 to-slate-700/50 text-white translate-x-1 shadow-[0_0_15px_rgba(139,92,246,0.15)] border-l-2 border-nexus-accent animate-pulse-glow' 
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  <Hash className={`w-4 h-4 mr-1.5 transition-opacity ${activeChannelId === channel.id ? 'opacity-100 text-nexus-accent' : 'opacity-60'}`} />
                  <span className={`truncate font-medium ${activeChannelId === channel.id ? 'text-shadow-sm' : ''}`}>{channel.name}</span>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-1 flex items-center justify-between group cursor-pointer">
                <span>Voice Channels</span>
                <Plus size={12} className="opacity-0 group-hover:opacity-100" />
              </h3>
              {server.channels.filter(c => c.type === 'VOICE').map(channel => (
                <div key={channel.id}>
                  <button
                    onClick={() => handleVoiceClick(channel)}
                    className={`w-full flex items-center px-2 py-1.5 rounded-md group transition-all duration-300 ${
                      activeChannelId === channel.id 
                        ? 'bg-gradient-to-r from-slate-700 to-slate-700/50 text-white translate-x-1 shadow-[0_0_15px_rgba(139,92,246,0.15)] border-l-2 border-nexus-accent animate-pulse-glow' 
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 mr-1.5 transition-opacity ${activeChannelId === channel.id ? 'opacity-100 text-nexus-accent' : 'opacity-60'}`} />
                    <span className="truncate font-medium">{channel.name}</span>
                  </button>
                  {/* Active Voice Channel Users */}
                  {activeChannelId === channel.id && (
                    <div className="ml-6 mt-1 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs px-2 py-1 rounded bg-slate-700/30 cursor-pointer group/user animate-slide-up">
                         <div className="flex items-center gap-2 overflow-hidden">
                           <Avatar src={currentUser.avatar} status={currentUser.status} size="sm" className="w-5 h-5 flex-shrink-0" />
                           <span className="truncate font-bold text-slate-300">{currentUser.username}</span>
                         </div>
                         <div className="flex gap-1">
                            <button 
                              onClick={handleToggleMute}
                              className={`p-0.5 rounded hover:bg-slate-600 ${isMuted ? 'text-red-500' : 'text-slate-500'}`}
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                               {isMuted ? <MicOff size={12} /> : <Mic size={12} />}
                            </button>
                            <button 
                              onClick={handleToggleDeafen}
                              className={`p-0.5 rounded hover:bg-slate-600 ${isDeafened ? 'text-red-500' : 'text-slate-500'}`}
                              title={isDeafened ? "Undeafen" : "Deafen"}
                            >
                               {isDeafened ? <VolumeX size={12} /> : <Headphones size={12} />}
                            </button>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Collapsible Members List */}
            <div className="mt-2">
                <button 
                    onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                    className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-500 uppercase hover:text-slate-300 transition-colors"
                >
                    <span>Server Members</span>
                    {isMembersExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {isMembersExpanded && (
                    <div className="space-y-1 mt-1 pl-2 animate-slide-up">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-700/50 cursor-pointer group">
                                <Avatar src={user.avatar} status={user.status} size="sm" className="w-6 h-6" />
                                <div className="min-w-0">
                                    <div className={`text-xs font-bold truncate ${user.id === '4' ? 'text-nexus-glow' : 'text-slate-300'} group-hover:text-white`}>
                                        {user.username}
                                    </div>
                                    {user.customStatus && (
                                        <div className="text-[10px] text-slate-500 truncate group-hover:text-slate-400">
                                            {user.customStatus}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

          </>
        ) : (
          <div className="space-y-1">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-2 mt-2">Online</h3>
             {users.filter(u => u.id !== currentUser.id).map(user => (
               <button 
                  key={user.id} 
                  onClick={() => onSelectChannel(user.id)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors group ${activeChannelId === user.id ? 'bg-slate-700 text-white shadow-md border-l-2 border-nexus-accent' : 'hover:bg-slate-700/50 text-slate-300'}`}
               >
                  <Avatar src={user.avatar} status={user.status} size="md" className="w-8 h-8" />
                  <div className="text-left overflow-hidden min-w-0 flex-1">
                     <div className={`font-bold truncate text-sm ${activeChannelId === user.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>{user.username}</div>
                     {user.customStatus ? (
                        <div className="text-[10px] truncate font-medium text-nexus-glow">
                           {user.customStatus}
                        </div>
                     ) : (
                        <div className="text-[10px] truncate flex items-center gap-1 font-medium">
                           {user.status === 'PLAYING' ? (
                              <span className="text-nexus-accent">Playing {user.gameActivity}</span>
                           ) : user.status === 'ONLINE' ? (
                              <span className="text-green-500">Online</span>
                           ) : user.status === 'IDLE' ? (
                              <span className="text-yellow-500">Idle</span>
                           ) : user.status === 'DND' ? (
                              <span className="text-red-500">Do Not Disturb</span>
                           ) : (
                              <span className="text-slate-500">Offline</span>
                           )}
                        </div>
                     )}
                  </div>
               </button>
             ))}
          </div>
        )}
      </div>

      <MusicPlayer />

      {/* User Controls */}
      <div className="bg-slate-900/80 p-2 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-slate-800 rounded p-1 transition-colors" onClick={onOpenProfile}>
          <Avatar src={currentUser.avatar} status={currentUser.status} size="md" className="w-9 h-9" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate flex items-center gap-1">
               {currentUser.username}
               <span className="text-[10px] text-nexus-accent bg-nexus-accent/10 px-1 rounded border border-nexus-accent/20">LVL {currentUser.level}</span>
            </div>
            {currentUser.customStatus ? (
                <div className="text-[10px] text-nexus-glow truncate font-medium" title={currentUser.customStatus}>
                    {currentUser.customStatus}
                </div>
            ) : (
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                   #{currentUser.id.padStart(4, '0')}
                   {isDeafened ? <span className="text-red-400 font-bold">• Deafened</span> : isMuted ? <span className="text-red-400 font-bold">• Muted</span> : null}
                </div>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpenSettings(); }} className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-transform hover:rotate-90">
             <Settings size={16} />
          </button>
        </div>
        
        {/* XP Bar */}
        <div className="relative group cursor-help mb-2">
           <ProgressBar value={currentUser.xp} max={100} className="h-1.5 bg-slate-800" color="bg-gradient-to-r from-nexus-accent to-nexus-glow" />
           <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {currentUser.xp} / 100 XP (Level {currentUser.level})
           </div>
        </div>
        
        <div className="flex items-center justify-between px-1">
           <button 
              onClick={handleToggleMute}
              className={`flex-1 flex justify-center py-1 rounded hover:bg-slate-700 transition-colors ${isMuted ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
              title={isMuted ? "Unmute" : "Mute"}
           >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
           </button>
           <button 
              onClick={handleToggleDeafen}
              className={`flex-1 flex justify-center py-1 rounded hover:bg-slate-700 transition-colors ${isDeafened ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
              title={isDeafened ? "Undeafen" : "Deafen"}
           >
              {isDeafened ? <VolumeX size={16} /> : <Headphones size={16} />}
           </button>
           <button 
               onClick={onOpenProfile}
               className="flex-1 flex justify-center py-1 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-yellow-400"
               title="Achievements"
           >
               <Trophy size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};