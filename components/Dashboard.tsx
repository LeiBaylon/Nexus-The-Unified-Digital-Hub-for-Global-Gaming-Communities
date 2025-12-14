import React, { useState, useEffect, useRef } from 'react';
import { ServerSidebar, ChannelSidebar } from './Sidebars';
import { ChatInterface } from './ChatInterface';
import { GamingHub } from './GamingHub';
import Profile from './Profile';
import { Modal, Button, Badge, Input, Switch, Keycap, RadioCard, ConfirmModal } from './UIComponents';
import { MOCK_SERVERS, MOCK_USERS, INITIAL_MESSAGES, LOOT_ITEMS, NOTIFICATION_SOUNDS } from '../constants';
import { User, Message, SoundEffect, InventoryItem, Server, Role, ServerEmoji, Channel } from '../types';
import { Gift, Shield, User as UserIcon, Keyboard, Palette, LogOut, Check, Plus, UploadCloud, Monitor, RefreshCw, X, Volume2, Smile, Globe, Ban, Trash2, Lock, Users, Swords, Coffee, Gamepad2, Mic, Music, Hash, Settings, Tv, AlertTriangle, Link as LinkIcon, Calendar, Zap, ShieldAlert } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

// Initial Settings State
const DEFAULT_PREFERENCES = {
  theme: 'cyberpunk',
  density: 'comfortable',
  reducedMotion: false,
  streamerMode: false,
  devMode: false,
  enableSounds: true,
  enableMentionSounds: true,
  notificationVolume: 0.5
};

const DEFAULT_KEYBINDS = [
  { id: 'mute', label: 'Toggle Mute', keys: ['CTRL', 'M'] },
  { id: 'deafen', label: 'Toggle Deafen', keys: ['CTRL', 'D'] },
  { id: 'overlay', label: 'Toggle Overlay', keys: ['SHIFT', '`'] },
  { id: 'push_to_talk', label: 'Push to Talk', keys: ['V'] },
  { id: 'screenshot', label: 'Quick Screenshot', keys: ['PRT_SC'] }
];

const Dashboard: React.FC<DashboardProps> = ({ currentUser: initialUser, onLogout }) => {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [servers, setServers] = useState<Server[]>(MOCK_SERVERS);
  const [activeServerId, setActiveServerId] = useState('nexus-home');
  const [activeChannelId, setActiveChannelId] = useState('gen');
  const [activeView, setActiveView] = useState<'CHAT' | 'HUB'>('CHAT');
  
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  
  // Modals & Overlays
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'PROFILE' | 'APPEARANCE' | 'KEYBINDS' | 'AUDIO'>('PROFILE');
  
  const [isLootModalOpen, setIsLootModalOpen] = useState(false);
  const [isCreateServerOpen, setIsCreateServerOpen] = useState(false);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [serverSettingsTab, setServerSettingsTab] = useState<'OVERVIEW' | 'ROLES' | 'EMOJIS' | 'BANS'>('OVERVIEW');
  const [serverToDelete, setServerToDelete] = useState<string | null>(null);
  
  // Pending Voice Channel Join
  const [pendingVoiceChannel, setPendingVoiceChannel] = useState<Channel | null>(null);

  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  
  // App Preferences State
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [keybinds, setKeybinds] = useState(DEFAULT_KEYBINDS);
  const [rebindId, setRebindId] = useState<string | null>(null);

  // Create Server Form State
  const [newServerName, setNewServerName] = useState('');
  const [newServerRegion, setNewServerRegion] = useState('US East');
  const [newServerTemplate, setNewServerTemplate] = useState<'GAMING' | 'SOCIAL' | 'CLAN'>('GAMING');
  const [newServerPrivacy, setNewServerPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');

  // Template Specific Settings
  const [gamingConfig, setGamingConfig] = useState({ 
    game: 'General', 
    style: 'Casual',
    platform: 'ALL',
    skillLevel: 'INTERMEDIATE',
    autoMod: true
  });
  const [socialConfig, setSocialConfig] = useState({ 
    focus: 'General', 
    enableMusic: true, 
    enableMemes: true,
    ageRestricted: false,
    enableEvents: false,
    language: 'English'
  });
  const [clanConfig, setClanConfig] = useState({ 
    tag: '', 
    recruitmentOpen: true, 
    minRank: '',
    website: '',
    focus: 'PVP',
    requireVoice: true
  });
  
  // Loot State
  const [openingLoot, setOpeningLoot] = useState(false);
  const [lootResult, setLootResult] = useState<InventoryItem | null>(null);

  // Mock Bans Data (Local state for demo)
  const [bannedUsers, setBannedUsers] = useState([
     { id: 'b1', username: 'ToxicPlayer1', reason: 'Harassment', date: '2024-10-15' },
     { id: 'b2', username: 'SpamBot9000', reason: 'Spamming', date: '2024-10-18' }
  ]);

  // Sound Effect Logic
  const isMounted = useRef(false);

  useEffect(() => {
    // Skip sound on initial mount
    if (!isMounted.current) {
        isMounted.current = true;
        return;
    }
    
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.senderId === currentUser.id) return;

    // Determine sound
    let soundSrc = null;
    const isMention = lastMsg.content.includes(`@${currentUser.username}`) || lastMsg.content.toLowerCase().includes('@everyone');

    if (isMention && preferences.enableMentionSounds) {
        soundSrc = NOTIFICATION_SOUNDS.MENTION;
    } else if (preferences.enableSounds && !lastMsg.isSystem) {
        soundSrc = NOTIFICATION_SOUNDS.MESSAGE;
    }

    if (soundSrc) {
        const audio = new Audio(soundSrc);
        audio.volume = preferences.notificationVolume;
        audio.play().catch(err => console.error("Error playing notification:", err));
    }

  }, [messages, currentUser.id, currentUser.username, preferences]);

  const activeServer = servers.find(s => s.id === activeServerId);
  
  // Resolve Active Channel (Handle Server Channels vs Direct Messages)
  const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId) || (() => {
      if (activeServerId === 'home') {
         // Try to find if activeChannelId matches a user for DM
         const dmUser = MOCK_USERS.find(u => u.id === activeChannelId);
         const channelName = dmUser 
            ? `@${dmUser.username}` 
            : (activeChannelId === 'dm-nexus' || activeChannelId === '4' ? 'Nexus AI' : 'Direct Message');
            
         return {
            id: activeChannelId,
            name: channelName,
            type: 'TEXT'
         } as Channel;
      }
      return {
         id: activeChannelId,
         name: 'unknown',
         type: 'TEXT'
      } as Channel;
  })();

  const handleSendMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
    if (msg.senderId === currentUser.id && !msg.isSystem) {
       // Mock XP gain
       setCurrentUser(prev => {
         const newXp = prev.xp + 10;
         if (newXp >= 100) {
            return { ...prev, xp: 0, level: prev.level + 1 };
         }
         return { ...prev, xp: newXp };
       });
    }
  };

  const handleUpdateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, ...updates } : msg));
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        let newReactions;
        if (existingReaction) {
          newReactions = msg.reactions?.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
        } else {
          newReactions = [...(msg.reactions || []), { emoji, count: 1 }];
        }
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));
  };

  const handleOpenLoot = () => {
     setOpeningLoot(true);
     setLootResult(null);
     setTimeout(() => {
        setOpeningLoot(false);
        const randomItem = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)];
        setLootResult(randomItem);
     }, 2000); 
  };

  const handlePlaySound = (sound: SoundEffect) => {
     // Play Audio
     try {
        const audio = new Audio(sound.src);
        audio.volume = preferences.notificationVolume; // Use setting volume
        audio.play().catch(e => console.error("Failed to play sound:", e));
     } catch(e) {
        console.error("Audio error", e);
     }

     const msg: Message = {
        id: Date.now().toString(),
        content: `played sound: *${sound.label}* 🔊`,
        senderId: currentUser.id,
        timestamp: new Date(),
        isSystem: true,
        type: 'TEXT'
     };
     setMessages(prev => [...prev, msg]);
  };

  const handleSelectServer = (id: string) => {
    if (id === 'hub') {
       setActiveView('HUB');
       setActiveServerId('hub'); // Deselect visual server
    } else {
       setActiveView('CHAT');
       setActiveServerId(id);
       if(id !== 'home') {
         const server = servers.find(s => s.id === id);
         if(server) setActiveChannelId(server.channels[0].id);
       } else {
         setActiveChannelId('dm-nexus');
       }
    }
  };

  const handleJoinVoiceRequest = (channel: Channel) => {
    setPendingVoiceChannel(channel);
  };

  const handleConfirmJoinVoice = () => {
    if (pendingVoiceChannel) {
        setActiveChannelId(pendingVoiceChannel.id);
        setPendingVoiceChannel(null);
    }
  };

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    let initialChannels: Channel[] = [];
    let initialRoles: Role[] = [{ id: `r-${Date.now()}-1`, name: 'Owner', color: '#ef4444', isHoisted: true }];

    // Template Logic with Custom Settings
    if (newServerTemplate === 'GAMING') {
        // Basic Channels
        initialChannels.push({ id: `c-${Date.now()}-1`, name: 'general', type: 'TEXT' });
        
        // Platform Specific
        if (gamingConfig.platform === 'PC') {
            initialChannels.push({ id: `c-${Date.now()}-pc`, name: 'pc-specs', type: 'TEXT' });
        } else if (gamingConfig.platform === 'CONSOLE') {
            initialChannels.push({ id: `c-${Date.now()}-con`, name: 'console-war', type: 'TEXT' });
        } else {
            initialChannels.push({ id: `c-${Date.now()}-cross`, name: 'crossplay-lfg', type: 'TEXT' });
        }

        // Game Specific Config
        if (gamingConfig.game !== 'General') {
             initialChannels.push({ id: `c-${Date.now()}-sub`, name: `${gamingConfig.game.toLowerCase().replace(/\s/g, '-')}-chat`, type: 'TEXT' });
        }

        // Style Config
        if (gamingConfig.style === 'Competitive') {
            initialChannels.push(
                { id: `c-${Date.now()}-strat`, name: 'strats-and-lineups', type: 'TEXT' },
                { id: `c-${Date.now()}-scrim`, name: 'scrim-results', type: 'TEXT' },
                { id: `c-${Date.now()}-vod`, name: 'vod-review', type: 'VOICE' }
            );
            initialRoles.push({ id: `r-${Date.now()}-comp`, name: 'Team Captain', color: '#f59e0b', isHoisted: true });
        } else {
             initialChannels.push(
                { id: `c-${Date.now()}-clips`, name: 'clips', type: 'TEXT' },
                { id: `c-${Date.now()}-meme`, name: 'memes', type: 'TEXT' }
             );
        }

        // Auto Mod
        if (gamingConfig.autoMod) {
            initialChannels.push({ id: `c-${Date.now()}-rules`, name: 'rules', type: 'TEXT' });
        }

        // Standard Voice
        initialChannels.push(
            { id: `c-${Date.now()}-vc1`, name: 'Lobby', type: 'VOICE' },
            { id: `c-${Date.now()}-vc2`, name: 'Ranked', type: 'VOICE' }
        );
        
        initialRoles.push({ id: `r-${Date.now()}-2`, name: 'Gamer', color: '#3b82f6' });

    } else if (newServerTemplate === 'SOCIAL') {
        initialChannels.push({ id: `c-${Date.now()}-1`, name: 'lounge', type: 'TEXT' });
        
        if (socialConfig.focus !== 'General') {
             initialChannels.push({ id: `c-${Date.now()}-focus`, name: `${socialConfig.focus.toLowerCase().replace(/\s/g, '-')}-talk`, type: 'TEXT' });
        }

        if (socialConfig.enableMusic) {
             initialChannels.push(
                 { id: `c-${Date.now()}-m-cmd`, name: 'music-commands', type: 'TEXT' },
                 { id: `c-${Date.now()}-m-vc`, name: 'Listening Party', type: 'VOICE' }
             );
        }
        
        if (socialConfig.enableMemes) {
             initialChannels.push({ id: `c-${Date.now()}-meme`, name: 'memes-only', type: 'TEXT' });
        }

        if (socialConfig.ageRestricted) {
             initialChannels.push({ id: `c-${Date.now()}-nsfw`, name: 'after-dark-nsfw', type: 'TEXT' });
        }

        if (socialConfig.enableEvents) {
             initialChannels.push({ id: `c-${Date.now()}-events`, name: 'event-calendar', type: 'TEXT' });
        }

        initialChannels.push({ id: `c-${Date.now()}-vc-gen`, name: 'Voice Chat', type: 'VOICE' });
        initialRoles.push({ id: `r-${Date.now()}-2`, name: 'Friend', color: '#22c55e' });

    } else if (newServerTemplate === 'CLAN') {
         initialChannels.push({ id: `c-${Date.now()}-1`, name: 'announcements', type: 'TEXT' });
         
         if (clanConfig.recruitmentOpen) {
             initialChannels.push({ id: `c-${Date.now()}-app`, name: 'applications', type: 'TEXT' });
         }

         if (clanConfig.focus === 'PVE') {
             initialChannels.push({ id: `c-${Date.now()}-raid`, name: 'raid-guides', type: 'TEXT' });
         } else if (clanConfig.focus === 'PVP') {
             initialChannels.push({ id: `c-${Date.now()}-pvp`, name: 'scrim-schedule', type: 'TEXT' });
         } else {
             initialChannels.push({ id: `c-${Date.now()}-rp`, name: 'roleplay', type: 'TEXT' });
         }

         initialChannels.push(
            { id: `c-${Date.now()}-war`, name: 'war-room', type: 'TEXT' },
            { id: `c-${Date.now()}-vc1`, name: 'Meeting Room', type: 'VOICE' },
            { id: `c-${Date.now()}-vc2`, name: 'Battle Station', type: 'VOICE' }
         );

         initialRoles.push({ id: `r-${Date.now()}-2`, name: 'Officer', color: '#f59e0b', isHoisted: true });
         initialRoles.push({ id: `r-${Date.now()}-3`, name: 'Member', color: '#94a3b8' });
         
         if (clanConfig.tag) {
             initialRoles.push({ id: `r-${Date.now()}-tag`, name: `[${clanConfig.tag}]`, color: '#ffffff' });
         }
    }

    const newServer: Server = {
      id: `server-${Date.now()}`,
      name: newServerName,
      icon: `https://picsum.photos/seed/${Date.now()}/100/100`, // Random generic icon
      channels: initialChannels,
      region: newServerRegion,
      roles: initialRoles
    };

    setServers([...servers, newServer]);
    setNewServerName('');
    
    // Reset specific states
    setGamingConfig({ game: 'General', style: 'Casual', platform: 'ALL', skillLevel: 'INTERMEDIATE', autoMod: true });
    setSocialConfig({ focus: 'General', enableMusic: true, enableMemes: true, ageRestricted: false, enableEvents: false, language: 'English' });
    setClanConfig({ tag: '', recruitmentOpen: true, minRank: '', website: '', focus: 'PVP', requireVoice: true });
    
    setIsCreateServerOpen(false);
    handleSelectServer(newServer.id);
  };

  const handleDeleteServer = () => {
     if (activeServerId && activeServerId !== 'home') {
        setServers(prev => prev.filter(s => s.id !== activeServerId));
        setActiveServerId('home');
        setActiveChannelId('dm-nexus');
        setIsServerSettingsOpen(false);
        setServerToDelete(null); // Ensure modal closes
     }
  };

  const handleUpdateServer = (updates: Partial<Server>) => {
     if (!activeServer) return;
     setServers(prev => prev.map(s => s.id === activeServer.id ? { ...s, ...updates } : s));
  };

  const handleAddRole = () => {
     if (!activeServer) return;
     const newRole: Role = {
        id: `role-${Date.now()}`,
        name: 'New Role',
        color: '#94a3b8'
     };
     handleUpdateServer({ roles: [...(activeServer.roles || []), newRole] });
  };

  const handleDeleteRole = (roleId: string) => {
      if (!activeServer) return;
      handleUpdateServer({ roles: activeServer.roles?.filter(r => r.id !== roleId) });
  };

  const handleUnban = (userId: string) => {
      setBannedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const openProfile = (userId: string) => {
     const user = MOCK_USERS.find(u => u.id === userId) || (userId === currentUser.id ? currentUser : null);
     if (user) setViewingProfile(user);
  };
  
  const handleMessageUser = (userId: string) => {
    // Navigate to home/DM view and select specific user
    setViewingProfile(null);
    setActiveServerId('home');
    setActiveView('CHAT');
    setActiveChannelId(userId);
  };

  // Mock Rebind Function
  const handleRebind = (id: string) => {
    setRebindId(id);
    // Simulate listening for key press
    const possibleKeys = [['ALT', 'X'], ['SHIFT', 'P'], ['F12'], ['G']];
    setTimeout(() => {
       const randomKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
       setKeybinds(prev => prev.map(kb => kb.id === id ? { ...kb, keys: randomKey } : kb));
       setRebindId(null);
    }, 1500);
  };

  return (
    <div className={`flex h-screen bg-nexus-900 overflow-hidden text-slate-200 ${preferences.theme === 'light' ? 'brightness-125 saturate-50' : ''}`}>
      <ServerSidebar 
        servers={servers} 
        activeServerId={activeServerId} 
        onSelectServer={handleSelectServer} 
        onAddServer={() => setIsCreateServerOpen(true)}
      />
      
      {activeView === 'CHAT' ? (
         <>
            <ChannelSidebar 
               server={activeServer}
               activeChannelId={activeChannelId}
               onSelectChannel={setActiveChannelId}
               currentUser={currentUser}
               onOpenSettings={() => { setIsSettingsOpen(true); setSettingsTab('PROFILE'); }}
               onOpenProfile={() => setViewingProfile(currentUser)}
               onOpenServerSettings={() => { setServerSettingsTab('OVERVIEW'); setIsServerSettingsOpen(true); }}
               users={MOCK_USERS}
               onJoinVoice={handleJoinVoiceRequest}
            />

            <ChatInterface 
               channel={activeChannel}
               messages={messages}
               currentUser={currentUser}
               onSendMessage={handleSendMessage}
               onUpdateMessage={handleUpdateMessage}
               onClearMessages={handleClearMessages}
               onDeleteMessage={handleDeleteMessage}
               onAddReaction={handleAddReaction}
               users={MOCK_USERS}
               onPlaySound={handlePlaySound}
               onUserClick={openProfile}
               density={preferences.density as 'comfortable' | 'compact'}
            />
         </>
      ) : (
         <GamingHub />
      )}

      {/* Daily Loot Button */}
      <button 
         onClick={() => setIsLootModalOpen(true)}
         className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-nexus-accent to-nexus-glow rounded-full shadow-lg shadow-nexus-accent/30 flex items-center justify-center animate-bounce hover:scale-110 transition-transform z-30 group"
      >
         <Gift className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Loot Modal */}
      <Modal isOpen={isLootModalOpen} onClose={() => setIsLootModalOpen(false)} title="Daily Loot Drop">
         <div className="flex flex-col items-center justify-center py-12 min-h-[350px] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-nexus-accent/5 to-transparent pointer-events-none" />

            {!lootResult && !openingLoot && (
               <div className="flex flex-col items-center animate-fade-in z-10">
                  <div className="mb-10 relative">
                     <div className="absolute inset-0 bg-nexus-accent blur-3xl opacity-20 animate-pulse-slow rounded-full"></div>
                     <Gift size={100} className="text-nexus-accent relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] fill-nexus-accent/10" strokeWidth={1.5} />
                  </div>
                  <p className="text-xl text-center mb-10 text-slate-200 font-medium tracking-wide">You have a Legendary Lootbox waiting!</p>
                  <Button 
                    onClick={handleOpenLoot} 
                    className="text-lg px-12 py-4 uppercase font-bold tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
                    variant="primary"
                  >
                    Open Now
                  </Button>
               </div>
            )}
            
            {openingLoot && (
               <div className="flex flex-col items-center justify-center z-10">
                  <div className="relative animate-bounce">
                      <div className="w-32 h-32 bg-nexus-glow blur-xl rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                      <Gift size={120} className="text-white relative z-10 animate-spin-slow" strokeWidth={1.5} />
                  </div>
                  <p className="mt-8 text-nexus-glow font-bold tracking-widest animate-pulse">OPENING...</p>
               </div>
            )}

            {lootResult && (
               <div className="flex flex-col items-center animate-scale-in z-10">
                  <div className={`w-36 h-36 rounded-full border-4 flex items-center justify-center mb-6 shadow-2xl bg-slate-800/80 relative overflow-hidden ${lootResult.rarity === 'LEGENDARY' ? 'border-yellow-500 shadow-yellow-500/30' : 'border-nexus-accent shadow-nexus-accent/30'}`}>
                     <div className={`absolute inset-0 opacity-20 ${lootResult.rarity === 'LEGENDARY' ? 'bg-yellow-500' : 'bg-nexus-accent'}`}></div>
                     <lootResult.icon size={64} className={`relative z-10 ${lootResult.rarity === 'LEGENDARY' ? 'text-yellow-400' : 'text-nexus-accent'}`} />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">{lootResult.name}</h3>
                  
                  <Badge 
                    className="mb-8 px-3 py-1 text-xs" 
                    color={lootResult.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' : 'bg-nexus-accent'}
                  >
                    {lootResult.rarity}
                  </Badge>
                  
                  <p className="text-slate-500 text-sm">Item added to your inventory.</p>
               </div>
            )}
         </div>
      </Modal>

      {/* Create Server Modal - UPGRADED */}
      <Modal isOpen={isCreateServerOpen} onClose={() => setIsCreateServerOpen(false)} title="Create Your Server" size="lg">
        <form onSubmit={handleCreateServer} className="flex flex-col h-[500px]">
           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
               <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center border-2 border-dashed border-slate-600 hover:border-nexus-accent cursor-pointer group transition-colors relative overflow-hidden">
                     <UploadCloud size={32} className="text-slate-500 group-hover:text-nexus-accent" />
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">
                        UPLOAD
                     </div>
                  </div>
                  <p className="text-slate-400 text-xs mt-3">Icons help users identify your server.</p>
               </div>
               
               <Input 
                  label="Server Name" 
                  placeholder="My Awesome Guild" 
                  value={newServerName}
                  onChange={(e: any) => setNewServerName(e.target.value)}
                  autoFocus
               />

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Server Template</label>
                  <div className="grid grid-cols-3 gap-3">
                     <div 
                        onClick={() => setNewServerTemplate('GAMING')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'GAMING' ? 'bg-nexus-accent/20 border-nexus-accent text-white ring-1 ring-nexus-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                     >
                        <Gamepad2 size={24} className={newServerTemplate === 'GAMING' ? 'text-nexus-accent' : 'text-slate-500'} />
                        <span className="text-xs font-bold">Gaming</span>
                     </div>
                     <div 
                        onClick={() => setNewServerTemplate('SOCIAL')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'SOCIAL' ? 'bg-nexus-accent/20 border-nexus-accent text-white ring-1 ring-nexus-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                     >
                        <Coffee size={24} className={newServerTemplate === 'SOCIAL' ? 'text-nexus-accent' : 'text-slate-500'} />
                        <span className="text-xs font-bold">Social</span>
                     </div>
                     <div 
                        onClick={() => setNewServerTemplate('CLAN')}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'CLAN' ? 'bg-nexus-accent/20 border-nexus-accent text-white ring-1 ring-nexus-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                     >
                        <Swords size={24} className={newServerTemplate === 'CLAN' ? 'text-nexus-accent' : 'text-slate-500'} />
                        <span className="text-xs font-bold">Clan</span>
                     </div>
                  </div>
               </div>
               
               {/* DYNAMIC SETTINGS PANEL */}
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 animate-fade-in">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                     <Settings size={12} /> {newServerTemplate} Configuration
                  </div>
                  
                  {newServerTemplate === 'GAMING' && (
                     <div className="space-y-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Game</label>
                           <select 
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-accent"
                              value={gamingConfig.game}
                              onChange={(e) => setGamingConfig({...gamingConfig, game: e.target.value})}
                           >
                              <option value="General">General / Variety</option>
                              <option value="Valorant">Valorant</option>
                              <option value="League of Legends">League of Legends</option>
                              <option value="Counter-Strike 2">Counter-Strike 2</option>
                              <option value="Minecraft">Minecraft</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Play Style</label>
                           <div className="grid grid-cols-2 gap-3">
                              <RadioCard 
                                 title="Casual" 
                                 selected={gamingConfig.style === 'Casual'} 
                                 onClick={() => setGamingConfig({...gamingConfig, style: 'Casual'})} 
                                 color="bg-green-500" 
                              />
                              <RadioCard 
                                 title="Competitive" 
                                 selected={gamingConfig.style === 'Competitive'} 
                                 onClick={() => setGamingConfig({...gamingConfig, style: 'Competitive'})} 
                                 color="bg-red-500" 
                              />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Platform Preference</label>
                           <div className="grid grid-cols-3 gap-3">
                              <div 
                                onClick={() => setGamingConfig({...gamingConfig, platform: 'PC'})}
                                className={`p-3 rounded-lg border cursor-pointer text-center text-sm font-bold flex flex-col items-center gap-1 ${gamingConfig.platform === 'PC' ? 'bg-nexus-accent/20 border-nexus-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                              >
                                <Monitor size={16} /> PC
                              </div>
                              <div 
                                onClick={() => setGamingConfig({...gamingConfig, platform: 'CONSOLE'})}
                                className={`p-3 rounded-lg border cursor-pointer text-center text-sm font-bold flex flex-col items-center gap-1 ${gamingConfig.platform === 'CONSOLE' ? 'bg-nexus-accent/20 border-nexus-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                              >
                                <Tv size={16} /> Console
                              </div>
                              <div 
                                onClick={() => setGamingConfig({...gamingConfig, platform: 'ALL'})}
                                className={`p-3 rounded-lg border cursor-pointer text-center text-sm font-bold flex flex-col items-center gap-1 ${gamingConfig.platform === 'ALL' ? 'bg-nexus-accent/20 border-nexus-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                              >
                                <Users size={16} /> Crossplay
                              </div>
                           </div>
                        </div>
                        <Switch 
                           label="Enable Auto-Moderation" 
                           checked={gamingConfig.autoMod} 
                           onChange={(v: boolean) => setGamingConfig({...gamingConfig, autoMod: v})} 
                        />
                     </div>
                  )}

                  {newServerTemplate === 'SOCIAL' && (
                     <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Community Focus</label>
                               <select 
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-accent"
                                  value={socialConfig.focus}
                                  onChange={(e) => setSocialConfig({...socialConfig, focus: e.target.value})}
                               >
                                  <option value="General">General Hangout</option>
                                  <option value="Anime">Anime & Manga</option>
                                  <option value="Tech">Tech & Coding</option>
                                  <option value="Music">Music Production</option>
                               </select>
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Primary Language</label>
                               <select 
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-accent"
                                  value={socialConfig.language}
                                  onChange={(e) => setSocialConfig({...socialConfig, language: e.target.value})}
                               >
                                  <option value="English">English</option>
                                  <option value="Spanish">Spanish</option>
                                  <option value="French">French</option>
                                  <option value="German">German</option>
                                  <option value="Japanese">Japanese</option>
                               </select>
                            </div>
                         </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                           <Switch 
                              label="Music Channels" 
                              checked={socialConfig.enableMusic} 
                              onChange={(v: boolean) => setSocialConfig({...socialConfig, enableMusic: v})} 
                           />
                           <Switch 
                              label="Meme Channels" 
                              checked={socialConfig.enableMemes} 
                              onChange={(v: boolean) => setSocialConfig({...socialConfig, enableMemes: v})} 
                           />
                           <Switch 
                              label="Event Calendar" 
                              checked={socialConfig.enableEvents} 
                              onChange={(v: boolean) => setSocialConfig({...socialConfig, enableEvents: v})} 
                           />
                           <Switch 
                              label="NSFW / 18+ Content" 
                              checked={socialConfig.ageRestricted} 
                              onChange={(v: boolean) => setSocialConfig({...socialConfig, ageRestricted: v})} 
                           />
                        </div>
                     </div>
                  )}

                  {newServerTemplate === 'CLAN' && (
                     <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                           <div className="col-span-1">
                              <Input 
                                 label="Clan Tag" 
                                 placeholder="NEX" 
                                 maxLength={4}
                                 value={clanConfig.tag}
                                 onChange={(e: any) => setClanConfig({...clanConfig, tag: e.target.value.toUpperCase()})}
                              />
                           </div>
                           <div className="col-span-2">
                              <Input 
                                 label="Min Rank (Optional)" 
                                 placeholder="e.g. Diamond+" 
                                 value={clanConfig.minRank}
                                 onChange={(e: any) => setClanConfig({...clanConfig, minRank: e.target.value})}
                              />
                           </div>
                        </div>
                        
                        <Input 
                           label="Clan Website" 
                           placeholder="https://myclan.gg"
                           value={clanConfig.website}
                           onChange={(e: any) => setClanConfig({...clanConfig, website: e.target.value})}
                        />

                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Clan Focus</label>
                           <div className="grid grid-cols-3 gap-3">
                              <RadioCard 
                                 title="PvP" 
                                 selected={clanConfig.focus === 'PVP'} 
                                 onClick={() => setClanConfig({...clanConfig, focus: 'PVP'})} 
                                 color="bg-red-500" 
                              />
                              <RadioCard 
                                 title="PvE" 
                                 selected={clanConfig.focus === 'PVE'} 
                                 onClick={() => setClanConfig({...clanConfig, focus: 'PVE'})} 
                                 color="bg-blue-500" 
                              />
                              <RadioCard 
                                 title="Hybrid" 
                                 selected={clanConfig.focus === 'HYBRID'} 
                                 onClick={() => setClanConfig({...clanConfig, focus: 'HYBRID'})} 
                                 color="bg-purple-500" 
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <Switch 
                              label="Recruitment Open" 
                              checked={clanConfig.recruitmentOpen} 
                              onChange={(v: boolean) => setClanConfig({...clanConfig, recruitmentOpen: v})} 
                           />
                           <Switch 
                              label="Require Mic" 
                              checked={clanConfig.requireVoice} 
                              onChange={(v: boolean) => setClanConfig({...clanConfig, requireVoice: v})} 
                           />
                        </div>
                     </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Server Region</label>
                     <div className="relative">
                        <select 
                           className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-nexus-accent appearance-none cursor-pointer text-sm"
                           value={newServerRegion}
                           onChange={(e) => setNewServerRegion(e.target.value)}
                        >
                           <option value="US East">🇺🇸 US East</option>
                           <option value="US West">🇺🇸 US West</option>
                           <option value="EU West">🇪🇺 EU West</option>
                           <option value="Asia">🇯🇵 Asia</option>
                        </select>
                        <Globe className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" size={16} />
                     </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Privacy</label>
                      <div className="relative">
                          <select 
                              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-nexus-accent appearance-none cursor-pointer text-sm"
                              value={newServerPrivacy}
                              onChange={(e) => setNewServerPrivacy(e.target.value as any)}
                          >
                              <option value="PRIVATE">Private (Invite Only)</option>
                              <option value="PUBLIC">Public (Discoverable)</option>
                          </select>
                          <Lock className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" size={16} />
                      </div>
                  </div>
               </div>
           </div>

          <div className="flex justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900">
             <Button type="button" variant="ghost" onClick={() => setIsCreateServerOpen(false)}>Cancel</Button>
             <Button type="submit" variant="primary" disabled={!newServerName.trim()}>Create Server</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;