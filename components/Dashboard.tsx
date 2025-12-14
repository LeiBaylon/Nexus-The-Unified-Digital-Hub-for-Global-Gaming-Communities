
import React, { useState, useEffect, useRef } from 'react';
import { ServerSidebar, ChannelSidebar } from './Sidebars';
import { ChatInterface } from './ChatInterface';
import { GamingHub } from './GamingHub';
import Profile from './Profile';
import { Modal, Button, Badge, Input, Switch, Keycap, RadioCard, ConfirmModal } from './UIComponents';
import { MOCK_SERVERS, MOCK_USERS, INITIAL_MESSAGES, LOOT_ITEMS, NOTIFICATION_SOUNDS } from '../constants';
import { User, Message, SoundEffect, InventoryItem, Server, Role, ServerEmoji, Channel } from '../types';
import { Gift, Shield, User as UserIcon, Keyboard, Palette, LogOut, Check, Plus, UploadCloud, Monitor, RefreshCw, X, Volume2, Smile, Globe, Ban, Trash2, Lock, Users, Swords, Coffee, Gamepad2 } from 'lucide-react';

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

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    let initialChannels: any[] = [];
    let initialRoles: any[] = [{ id: `r-${Date.now()}-1`, name: 'Owner', color: '#ef4444', isHoisted: true }];

    // Template Logic
    if (newServerTemplate === 'GAMING') {
        initialChannels = [
            { id: `c-${Date.now()}-1`, name: 'general', type: 'TEXT' },
            { id: `c-${Date.now()}-2`, name: 'clips', type: 'TEXT' },
            { id: `c-${Date.now()}-3`, name: 'ranked-lfg', type: 'TEXT' },
            { id: `c-${Date.now()}-4`, name: 'Lobby', type: 'VOICE' },
            { id: `c-${Date.now()}-5`, name: 'Ranked', type: 'VOICE' },
        ];
        initialRoles.push({ id: `r-${Date.now()}-2`, name: 'Gamer', color: '#3b82f6' });
    } else if (newServerTemplate === 'SOCIAL') {
        initialChannels = [
            { id: `c-${Date.now()}-1`, name: 'lounge', type: 'TEXT' },
            { id: `c-${Date.now()}-2`, name: 'music', type: 'TEXT' },
            { id: `c-${Date.now()}-3`, name: 'memes', type: 'TEXT' },
            { id: `c-${Date.now()}-4`, name: 'Voice Chat', type: 'VOICE' },
        ];
        initialRoles.push({ id: `r-${Date.now()}-2`, name: 'Friend', color: '#22c55e' });
    } else if (newServerTemplate === 'CLAN') {
         initialChannels = [
            { id: `c-${Date.now()}-1`, name: 'announcements', type: 'TEXT' },
            { id: `c-${Date.now()}-2`, name: 'war-room', type: 'TEXT' },
            { id: `c-${Date.now()}-3`, name: 'scrims', type: 'TEXT' },
            { id: `c-${Date.now()}-4`, name: 'Meeting Room', type: 'VOICE' },
            { id: `c-${Date.now()}-5`, name: 'Battle Station', type: 'VOICE' },
        ];
        initialRoles.push({ id: `r-${Date.now()}-2`, name: 'Officer', color: '#f59e0b', isHoisted: true });
        initialRoles.push({ id: `r-${Date.now()}-3`, name: 'Recruit', color: '#94a3b8' });
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
    setNewServerRegion('US East');
    setNewServerTemplate('GAMING');
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
      <Modal isOpen={isCreateServerOpen} onClose={() => setIsCreateServerOpen(false)} title="Create Your Server" size="md">
        <form onSubmit={handleCreateServer} className="p-6 space-y-6">
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
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'GAMING' ? 'bg-nexus-accent/20 border-nexus-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
               >
                  <Gamepad2 size={24} className={newServerTemplate === 'GAMING' ? 'text-nexus-accent' : 'text-slate-500'} />
                  <span className="text-xs font-bold">Gaming</span>
               </div>
               <div 
                  onClick={() => setNewServerTemplate('SOCIAL')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'SOCIAL' ? 'bg-nexus-accent/20 border-nexus-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
               >
                  <Coffee size={24} className={newServerTemplate === 'SOCIAL' ? 'text-nexus-accent' : 'text-slate-500'} />
                  <span className="text-xs font-bold">Social</span>
               </div>
               <div 
                  onClick={() => setNewServerTemplate('CLAN')}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'CLAN' ? 'bg-nexus-accent/20 border-nexus-accent text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
               >
                  <Swords size={24} className={newServerTemplate === 'CLAN' ? 'text-nexus-accent' : 'text-slate-500'} />
                  <span className="text-xs font-bold">Clan</span>
               </div>
            </div>
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

          <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="ghost" onClick={() => setIsCreateServerOpen(false)}>Cancel</Button>
             <Button type="submit" variant="primary" disabled={!newServerName.trim()}>Create Server</Button>
          </div>
        </form>
      </Modal>

      {/* Server Settings Modal - UPGRADED */}
      <Modal isOpen={isServerSettingsOpen} onClose={() => setIsServerSettingsOpen(false)} title="Server Settings" size="lg">
        <div className="flex h-[500px]">
           {/* Sidebar */}
           <div className="w-48 border-r border-slate-800 py-2 pr-2 flex flex-col gap-1">
              {['OVERVIEW', 'ROLES', 'EMOJIS', 'BANS'].map(tab => (
                 <button
                    key={tab}
                    onClick={() => setServerSettingsTab(tab as any)}
                    className={`text-left px-4 py-2 rounded font-bold text-sm transition-colors ${serverSettingsTab === tab ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                 >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                 </button>
              ))}
           </div>

           {/* Content */}
           <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {activeServer ? (
                 <>
                    {serverSettingsTab === 'OVERVIEW' && (
                       <div className="space-y-6 animate-fade-in">
                          <div className="flex gap-6 items-start">
                              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-slate-800 relative group cursor-pointer flex-shrink-0">
                                 <img src={activeServer.icon} className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">CHANGE</div>
                              </div>
                              <div className="flex-1 space-y-4">
                                 <Input 
                                    label="Server Name" 
                                    defaultValue={activeServer.name} 
                                    onChange={(e: any) => handleUpdateServer({ name: e.target.value })}
                                 />
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Server Region</label>
                                    <div className="relative">
                                       <select 
                                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-nexus-accent appearance-none cursor-pointer"
                                          defaultValue={activeServer.region || 'US East'}
                                          onChange={(e) => handleUpdateServer({ region: e.target.value })}
                                       >
                                          <option value="US East">🇺🇸 US East</option>
                                          <option value="US West">🇺🇸 US West</option>
                                          <option value="EU West">🇪🇺 EU West</option>
                                          <option value="Asia">🇯🇵 Asia</option>
                                       </select>
                                       <Globe className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={16} />
                                    </div>
                                 </div>
                              </div>
                          </div>
                          
                          <div className="pt-8 border-t border-slate-800 mt-8">
                             <h4 className="text-xs font-bold text-red-400 uppercase mb-4">Danger Zone</h4>
                             <div className="border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                   <div className="font-bold text-white">Delete Server</div>
                                   <div className="text-xs text-slate-400">Permanently remove this server and all contents.</div>
                                </div>
                                <Button variant="danger" onClick={() => { setIsServerSettingsOpen(false); setServerToDelete(activeServer.id); }}>Delete Server</Button>
                             </div>
                          </div>
                       </div>
                    )}

                    {serverSettingsTab === 'ROLES' && (
                       <div className="space-y-4 animate-fade-in">
                          <div className="flex justify-between items-center mb-4">
                             <h3 className="font-bold text-white">Roles ({activeServer.roles?.length || 0})</h3>
                             <Button variant="secondary" className="text-xs h-8" onClick={handleAddRole}><Plus size={14} /> Create Role</Button>
                          </div>
                          <div className="space-y-2">
                             {activeServer.roles?.map(role => (
                                <div key={role.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-nexus-accent transition-colors group">
                                   <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: role.color }}></div>
                                      <span className="font-medium text-slate-200">{role.name}</span>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Edit Role"><Palette size={14} /></button>
                                      <button 
                                         className="p-2 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400" 
                                         title="Delete Role"
                                         onClick={() => handleDeleteRole(role.id)}
                                      >
                                         <Trash2 size={14} />
                                      </button>
                                   </div>
                                </div>
                             ))}
                             {(!activeServer.roles || activeServer.roles.length === 0) && (
                                <div className="text-center text-slate-500 py-8">No roles created.</div>
                             )}
                          </div>
                       </div>
                    )}

                    {serverSettingsTab === 'EMOJIS' && (
                       <div className="space-y-6 animate-fade-in">
                          <div className="flex justify-between items-center">
                             <div>
                                <h3 className="font-bold text-white">Server Emojis</h3>
                                <p className="text-xs text-slate-400">Upload custom emojis for your community.</p>
                             </div>
                             <Button variant="primary" className="text-xs h-8"><UploadCloud size={14} /> Upload Emoji</Button>
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                             {activeServer.emojis?.map(emoji => (
                                <div key={emoji.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-2 hover:bg-slate-750 transition-colors group relative">
                                   <img src={emoji.url} className="w-8 h-8 object-contain" />
                                   <span className="text-xs font-mono text-slate-400">:{emoji.name}:</span>
                                   <button className="absolute top-1 right-1 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <X size={12} />
                                   </button>
                                </div>
                             ))}
                             {/* Placeholder slots */}
                             {[1,2,3,4].map(i => (
                                <div key={i} className="bg-slate-800/30 border border-slate-700 border-dashed rounded-xl p-4 flex items-center justify-center opacity-50">
                                   <Smile className="text-slate-600" />
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {serverSettingsTab === 'BANS' && (
                       <div className="space-y-4 animate-fade-in">
                          <h3 className="font-bold text-white mb-4">Banned Users</h3>
                          {bannedUsers.length > 0 ? (
                             bannedUsers.map(ban => (
                                <div key={ban.id} className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
                                         <Ban size={20} />
                                      </div>
                                      <div>
                                         <div className="font-bold text-white">{ban.username}</div>
                                         <div className="text-xs text-red-400">Reason: {ban.reason}</div>
                                      </div>
                                   </div>
                                   <Button variant="secondary" className="text-xs h-8" onClick={() => handleUnban(ban.id)}>Revoke Ban</Button>
                                </div>
                             ))
                          ) : (
                             <div className="text-center py-10 text-slate-500">
                                <Shield size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No banned users. Good vibes only!</p>
                             </div>
                          )}
                       </div>
                    )}
                 </>
              ) : (
                 <p className="text-slate-400">No server selected.</p>
              )}
           </div>
        </div>
        
        {/* Footer actions for Modal (Common) */}
        {serverSettingsTab === 'OVERVIEW' && (
           <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-0 px-6 pb-6 bg-slate-900 rounded-b-xl">
              <Button variant="ghost" onClick={() => setIsServerSettingsOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsServerSettingsOpen(false)}>Save Changes</Button>
           </div>
        )}
      </Modal>
      
      {/* Delete Server Confirm Modal */}
      <ConfirmModal 
        isOpen={!!serverToDelete} 
        onClose={() => setServerToDelete(null)}
        onConfirm={handleDeleteServer}
        title="Delete Server"
        message={`Are you sure you want to delete this server? This action cannot be undone and all channels will be lost.`}
      />

      {/* Profile Modal */}
      <Modal isOpen={!!viewingProfile} onClose={() => setViewingProfile(null)} size="lg">
         {viewingProfile && (
            <Profile 
               user={viewingProfile} 
               isCurrentUser={viewingProfile.id === currentUser.id} 
               onUpdate={(u) => {
                  setCurrentUser(u);
                  const idx = MOCK_USERS.findIndex(mu => mu.id === u.id);
                  if (idx !== -1) MOCK_USERS[idx] = u;
               }}
               onMessageUser={handleMessageUser}
               onClose={() => setViewingProfile(null)}
            />
         )}
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Nexus Settings" size="lg">
         <div className="flex gap-6 h-[500px]">
            {/* Settings Sidebar */}
            <div className="w-48 flex flex-col gap-2 border-r border-slate-800 pr-4 py-2">
               <button 
                  onClick={() => setSettingsTab('PROFILE')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${settingsTab === 'PROFILE' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
               >
                  <UserIcon size={16} /> My Profile
               </button>
               <button 
                  onClick={() => setSettingsTab('APPEARANCE')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${settingsTab === 'APPEARANCE' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
               >
                  <Palette size={16} /> Appearance
               </button>
               <button 
                  onClick={() => setSettingsTab('AUDIO')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${settingsTab === 'AUDIO' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
               >
                  <Volume2 size={16} /> Audio & Notifications
               </button>
               <button 
                  onClick={() => setSettingsTab('KEYBINDS')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${settingsTab === 'KEYBINDS' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
               >
                  <Keyboard size={16} /> Keybinds
               </button>
               <div className="flex-1"></div>
               <button onClick={onLogout} className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded border border-red-500/20"><LogOut size={16} /> Log Out</button>
            </div>
            
            {/* Settings Content */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 py-2 custom-scrollbar">
               {settingsTab === 'PROFILE' && (
                  <div className="space-y-4">
                     <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">Profile Settings</h3>
                     <p className="text-slate-400 text-sm">To edit your public profile, banner, or bio, please visit your Profile page directly.</p>
                     <Button onClick={() => { setIsSettingsOpen(false); openProfile(currentUser.id); }}>Go to My Profile</Button>
                     
                     <h3 className="text-lg font-bold text-white mt-8 mb-4 border-b border-slate-800 pb-2">Account Status</h3>
                     <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-nexus-accent/20 rounded-full flex items-center justify-center text-nexus-accent">
                              <Shield size={24} />
                           </div>
                           <div>
                              <div className="font-bold text-white">Nexus Verified</div>
                              <div className="text-xs text-slate-500">Your email is verified and secure.</div>
                           </div>
                           <Check className="ml-auto text-green-500" />
                        </div>
                     </div>
                  </div>
               )}

               {settingsTab === 'APPEARANCE' && (
                  <div className="space-y-8 animate-fade-in">
                     <div>
                        <h3 className="text-lg font-bold text-white mb-4">Theme</h3>
                        <div className="grid grid-cols-3 gap-4">
                           <RadioCard 
                              title="Cyberpunk" 
                              selected={preferences.theme === 'cyberpunk'} 
                              onClick={() => setPreferences(p => ({...p, theme: 'cyberpunk'}))} 
                              color="bg-nexus-900"
                           />
                           <RadioCard 
                              title="Midnight" 
                              selected={preferences.theme === 'midnight'} 
                              onClick={() => setPreferences(p => ({...p, theme: 'midnight'}))} 
                              color="bg-black"
                           />
                           <RadioCard 
                              title="Daylight" 
                              selected={preferences.theme === 'light'} 
                              onClick={() => setPreferences(p => ({...p, theme: 'light'}))} 
                              color="bg-slate-200"
                           />
                        </div>
                     </div>

                     <div>
                        <h3 className="text-lg font-bold text-white mb-4">Display</h3>
                        <div className="space-y-2">
                           <Switch 
                              label="Compact Mode" 
                              checked={preferences.density === 'compact'} 
                              onChange={(v: boolean) => setPreferences(p => ({...p, density: v ? 'compact' : 'comfortable'}))} 
                           />
                           <Switch 
                              label="Reduced Motion" 
                              checked={preferences.reducedMotion} 
                              onChange={(v: boolean) => setPreferences(p => ({...p, reducedMotion: v}))} 
                           />
                           <Switch 
                              label="Streamer Mode (Hide Personal Info)" 
                              checked={preferences.streamerMode} 
                              onChange={(v: boolean) => setPreferences(p => ({...p, streamerMode: v}))} 
                           />
                        </div>
                     </div>
                     
                     <div>
                        <h3 className="text-lg font-bold text-white mb-4">Developer</h3>
                        <Switch 
                           label="Enable Developer Options" 
                           checked={preferences.devMode} 
                           onChange={(v: boolean) => setPreferences(p => ({...p, devMode: v}))} 
                        />
                     </div>
                  </div>
               )}

               {settingsTab === 'AUDIO' && (
                  <div className="space-y-6 animate-fade-in">
                     <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">Sound Settings</h3>
                     
                     <div className="space-y-4">
                        <Switch 
                           label="Message Sounds" 
                           checked={preferences.enableSounds} 
                           onChange={(v: boolean) => setPreferences(p => ({...p, enableSounds: v}))} 
                        />
                        <Switch 
                           label="Mention Sounds (@username)" 
                           checked={preferences.enableMentionSounds} 
                           onChange={(v: boolean) => setPreferences(p => ({...p, enableMentionSounds: v}))} 
                        />
                        
                        <div className="pt-4">
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notification Volume</label>
                           <input 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.1" 
                              value={preferences.notificationVolume}
                              onChange={(e) => setPreferences(p => ({...p, notificationVolume: parseFloat(e.target.value)}))}
                              className="w-full accent-nexus-accent h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                           />
                           <div className="flex justify-between text-xs text-slate-400 mt-1">
                              <span>Silent</span>
                              <span>{(preferences.notificationVolume * 100).toFixed(0)}%</span>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {settingsTab === 'KEYBINDS' && (
                  <div className="space-y-6 animate-fade-in">
                     <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
                        <Button variant="ghost" className="text-xs py-1">Reset Defaults</Button>
                     </div>

                     <div className="space-y-1">
                        {keybinds.map((kb) => (
                           <div key={kb.id} className="flex items-center justify-between p-3 hover:bg-slate-800/30 rounded-lg transition-colors group">
                              <span className="font-medium text-slate-300">{kb.label}</span>
                              <div className="flex items-center gap-2">
                                 {rebindId === kb.id ? (
                                    <span className="text-nexus-glow font-mono font-bold animate-pulse text-sm border-2 border-nexus-glow px-3 py-1 rounded">Press Any Key...</span>
                                 ) : (
                                    <div className="flex gap-1" onClick={() => handleRebind(kb.id)}>
                                       {kb.keys.map((k, i) => (
                                          <Keycap key={i} onClick={() => handleRebind(kb.id)}>{k}</Keycap>
                                       ))}
                                    </div>
                                 )}
                                 <button 
                                    onClick={() => handleRebind(kb.id)}
                                    className="p-1.5 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Edit Keybind"
                                 >
                                    <RefreshCw size={14} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                     
                     <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3 items-start mt-6">
                        <Keyboard className="text-yellow-500 flex-shrink-0" />
                        <div className="text-sm text-yellow-200/80">
                           <span className="font-bold block text-yellow-500 mb-1">Pro Tip</span>
                           You can use <Keycap className="inline-block scale-75 mx-1">CTRL</Keycap> + <Keycap className="inline-block scale-75 mx-1">K</Keycap> to open the Quick Switcher anywhere in the app to jump between servers and channels instantly.
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
