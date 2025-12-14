
import React, { useState, useEffect, useRef } from 'react';
import { ServerSidebar, ChannelSidebar } from './Sidebars';
import { ChatInterface } from './ChatInterface';
import { GamingHub } from './GamingHub';
import Profile from './Profile';
import { Modal, Button, Badge, Input, Switch, Keycap, RadioCard, ConfirmModal, Avatar } from './UIComponents';
import { MOCK_SERVERS, MOCK_USERS, INITIAL_MESSAGES, LOOT_ITEMS, NOTIFICATION_SOUNDS, MOCK_AUDIT_LOGS } from '../constants';
import { User, Message, SoundEffect, InventoryItem, Server, Role, ServerEmoji, Channel, AuditLogEntry } from '../types';
import { Gift, Shield, User as UserIcon, Keyboard, Palette, LogOut, Check, Plus, UploadCloud, Monitor, RefreshCw, X, Volume2, VolumeX, Smile, Globe, Ban, Trash2, Lock, Users, Swords, Coffee, Gamepad2, Mic, Music, Hash, Settings, Tv, AlertTriangle, Link as LinkIcon, Calendar, Zap, ShieldAlert, Gavel, Smartphone, Mail, Edit3, GripVertical, Search, FileText, Camera, Sliders, Type, Layout, MousePointer, Signal, AudioWaveform, MicOff, Headphones } from 'lucide-react';

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
  notificationVolume: 0.5,
  inputVolume: 0.8,
  fontSize: 14,
  saturation: 100,
  accentColor: '#8b5cf6'
};

const DEFAULT_KEYBINDS = [
  { id: 'mute', label: 'Toggle Mute', keys: ['CTRL', 'M'] },
  { id: 'deafen', label: 'Toggle Deafen', keys: ['CTRL', 'D'] },
  { id: 'overlay', label: 'Toggle Overlay', keys: ['SHIFT', '`'] },
  { id: 'push_to_talk', label: 'Push to Talk', keys: ['V'] },
  { id: 'screenshot', label: 'Quick Screenshot', keys: ['PRT_SC'] },
  { id: 'search', label: 'Quick Search', keys: ['CTRL', 'K'] },
  { id: 'emoji', label: 'Emoji Picker', keys: ['CTRL', 'E'] }
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
  const [serverSettingsTab, setServerSettingsTab] = useState<'OVERVIEW' | 'ROLES' | 'EMOJIS' | 'MODERATION'>('OVERVIEW');
  const [serverToDelete, setServerToDelete] = useState<string | null>(null);
  
  // Role Editing State
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Pending Voice Channel Join
  const [pendingVoiceChannel, setPendingVoiceChannel] = useState<Channel | null>(null);
  const [joinMuted, setJoinMuted] = useState(false);
  const [joinDeafened, setJoinDeafened] = useState(false);

  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  
  // App Preferences State
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [keybinds, setKeybinds] = useState<{id: string, label: string, keys: string[]}[]>(DEFAULT_KEYBINDS);
  const [rebindId, setRebindId] = useState<string | null>(null);

  // Audio Visualizer Mock
  const [micLevel, setMicLevel] = useState(0);

  // Video Preview State
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  // Create Server Form State
  const [newServerName, setNewServerName] = useState('');
  const [newServerIcon, setNewServerIcon] = useState<string>('');
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
  
  // Moderation State
  const [bannedUsers, setBannedUsers] = useState([
     { id: 'b1', username: 'ToxicPlayer1', reason: 'Harassment', date: '2024-10-15' },
     { id: 'b2', username: 'SpamBot9000', reason: 'Spamming', date: '2024-10-18' }
  ]);
  const [autoModConfig, setAutoModConfig] = useState({
      strictness: 'MEDIUM', // LOW, MEDIUM, HIGH
      bannedWords: '',
      blockLinks: false
  });
  const [auditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);

  // Sound Effect Logic
  const isMounted = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Mic Visualizer Interval
  useEffect(() => {
      let interval: any;
      if (settingsTab === 'AUDIO') {
          interval = setInterval(() => {
              setMicLevel(Math.random() * 100);
          }, 100);
      } else {
          setMicLevel(0);
      }
      return () => clearInterval(interval);
  }, [settingsTab]);

  const activeServer = servers.find(s => s.id === activeServerId);
  
  // Resolve Active Channel (Handle Server Channels vs Direct Messages)
  const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId) || (() => {
      if (activeServerId === 'home') {
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
    setJoinMuted(false);
    setJoinDeafened(false);
  };

  const handleConfirmJoinVoice = () => {
    if (pendingVoiceChannel) {
        setActiveChannelId(pendingVoiceChannel.id);
        setPendingVoiceChannel(null);
    }
  };
  
  const handleServerIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewServerIcon(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;
    setIsCreateServerOpen(false);
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
        color: '#94a3b8',
        permissions: ['SEND_MESSAGES']
     };
     handleUpdateServer({ roles: [...(activeServer.roles || []), newRole] });
     setEditingRoleId(newRole.id); // Auto-open editor
  };

  const handleDeleteRole = (roleId: string) => {
      if (!activeServer) return;
      handleUpdateServer({ roles: activeServer.roles?.filter(r => r.id !== roleId) });
      if (editingRoleId === roleId) setEditingRoleId(null);
  };

  const handleUpdateRole = (roleId: string, updates: Partial<Role>) => {
      if (!activeServer || !activeServer.roles) return;
      const updatedRoles = activeServer.roles.map(r => r.id === roleId ? { ...r, ...updates } : r);
      handleUpdateServer({ roles: updatedRoles });
  };

  const handleUnban = (userId: string) => {
      setBannedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const openProfile = (userId: string) => {
     const user = MOCK_USERS.find(u => u.id === userId) || (userId === currentUser.id ? currentUser : null);
     if (user) setViewingProfile(user);
  };
  
  const handleMessageUser = (userId: string) => {
    setViewingProfile(null);
    setActiveServerId('home');
    setActiveView('CHAT');
    setActiveChannelId(userId);
  };

  const handleRebind = (id: string) => {
    setRebindId(id);
    const possibleKeys = [['ALT', 'X'], ['SHIFT', 'P'], ['F12'], ['G']];
    setTimeout(() => {
       const randomKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)];
       setKeybinds(prev => prev.map(kb => kb.id === id ? { ...kb, keys: randomKey } : kb));
       setRebindId(null);
    }, 1500);
  };

  const handleAddKeybind = () => {
      const newId = `custom-${Date.now()}`;
      setKeybinds(prev => [...prev, { id: newId, label: 'New Action', keys: ['NONE'] }]);
      // Automatically trigger rebind for the new key
      setTimeout(() => handleRebind(newId), 100);
  };

  const roleColors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#d946ef', '#ffffff', '#94a3b8'];

  return (
    <div 
        className={`flex h-screen bg-nexus-900 overflow-hidden text-slate-200 ${preferences.theme === 'light' ? 'brightness-125 saturate-50' : ''}`} 
        style={{ 
            filter: `saturate(${preferences.saturation}%)`,
            '--nexus-accent': preferences.accentColor 
        } as React.CSSProperties}
    >
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
         {/* ... Loot Modal Content ... */}
         <div className="flex flex-col items-center justify-center py-12 min-h-[350px] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-nexus-accent/5 to-transparent pointer-events-none" />
            {!lootResult && !openingLoot && (
               <div className="flex flex-col items-center animate-fade-in z-10">
                  <div className="mb-10 relative">
                     <div className="absolute inset-0 bg-nexus-accent blur-3xl opacity-20 animate-pulse-slow rounded-full"></div>
                     <Gift size={100} className="text-nexus-accent relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] fill-nexus-accent/10" strokeWidth={1.5} />
                  </div>
                  <p className="text-xl text-center mb-10 text-slate-200 font-medium tracking-wide">You have a Legendary Lootbox waiting!</p>
                  <Button onClick={handleOpenLoot} className="text-lg px-12 py-4 uppercase font-bold tracking-widest" variant="primary">Open Now</Button>
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
                  <Badge className="mb-8 px-3 py-1 text-xs" color={lootResult.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' : 'bg-nexus-accent'}>{lootResult.rarity}</Badge>
                  <p className="text-slate-500 text-sm">Item added to your inventory.</p>
               </div>
            )}
         </div>
      </Modal>
      
      {/* Profile Modal */}
      {viewingProfile && (
        <Modal isOpen={!!viewingProfile} onClose={() => setViewingProfile(null)} size="lg">
          <Profile 
            user={viewingProfile} 
            isCurrentUser={viewingProfile.id === currentUser.id}
            onUpdate={(u) => { setCurrentUser(u); setViewingProfile(u); }}
            onClose={() => setViewingProfile(null)}
            onMessageUser={handleMessageUser}
          />
        </Modal>
      )}
      
      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings" size="xl">
           <div className="flex h-[500px]">
             {/* Sidebar */}
             <div className="w-48 bg-slate-900 border-r border-slate-800 p-2 flex flex-col gap-1">
                 <button onClick={() => setSettingsTab('PROFILE')} className={`text-left px-4 py-2 rounded text-sm font-bold ${settingsTab === 'PROFILE' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>My Account</button>
                 <button onClick={() => setSettingsTab('APPEARANCE')} className={`text-left px-4 py-2 rounded text-sm font-bold ${settingsTab === 'APPEARANCE' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Appearance</button>
                 <button onClick={() => setSettingsTab('AUDIO')} className={`text-left px-4 py-2 rounded text-sm font-bold ${settingsTab === 'AUDIO' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Voice & Video</button>
                 <button onClick={() => setSettingsTab('KEYBINDS')} className={`text-left px-4 py-2 rounded text-sm font-bold ${settingsTab === 'KEYBINDS' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Keybinds</button>
                 <div className="flex-1"></div>
                 <button onClick={onLogout} className="text-left px-4 py-2 rounded text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2"><LogOut size={16} /> Log Out</button>
             </div>
             
             {/* Content */}
             <div className="flex-1 bg-slate-800/50 p-6 overflow-y-auto custom-scrollbar">
                 {settingsTab === 'PROFILE' && (
                    <Profile user={currentUser} isCurrentUser={true} onUpdate={setCurrentUser} />
                 )}
                 {settingsTab === 'APPEARANCE' && (
                    <div className="space-y-8 animate-fade-in">
                       <section>
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Palette size={18}/> Theme & Color</h3>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                             <div onClick={() => setPreferences({...preferences, theme: 'cyberpunk'})} className={`h-24 rounded-lg bg-[#0f172a] border-2 cursor-pointer flex items-center justify-center ${preferences.theme === 'cyberpunk' ? 'border-nexus-accent' : 'border-slate-700'}`}>
                                <span className="text-nexus-glow font-bold">Cyberpunk</span>
                             </div>
                             <div onClick={() => setPreferences({...preferences, theme: 'dark'})} className={`h-24 rounded-lg bg-black border-2 cursor-pointer flex items-center justify-center ${preferences.theme === 'dark' ? 'border-nexus-accent' : 'border-slate-700'}`}>
                                <span className="text-white font-bold">Midnight</span>
                             </div>
                             <div onClick={() => setPreferences({...preferences, theme: 'light'})} className={`h-24 rounded-lg bg-slate-200 border-2 cursor-pointer flex items-center justify-center ${preferences.theme === 'light' ? 'border-nexus-accent' : 'border-slate-700'}`}>
                                <span className="text-slate-900 font-bold">Daylight</span>
                             </div>
                          </div>
                          
                          <div className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Accent Color</label>
                                  <div className="flex gap-2">
                                      {['#8b5cf6', '#06b6d4', '#ef4444', '#22c55e', '#f59e0b', '#ec4899'].map(c => (
                                          <button 
                                            key={c}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${preferences.accentColor === c ? 'border-white ring-2 ring-offset-1 ring-offset-slate-900 ring-white shadow-lg' : 'border-transparent'}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setPreferences({...preferences, accentColor: c})}
                                          />
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Saturation ({preferences.saturation}%)</label>
                                  <input type="range" min="0" max="200" value={preferences.saturation} onChange={(e) => setPreferences({...preferences, saturation: parseInt(e.target.value)})} className="w-full accent-nexus-accent" />
                              </div>
                          </div>
                       </section>

                       <section>
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Layout size={18}/> Display</h3>
                          <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Font Size ({preferences.fontSize}px)</label>
                                <div className="flex items-center gap-4">
                                    <Type size={16} />
                                    <input type="range" min="12" max="20" step="1" value={preferences.fontSize} onChange={(e) => setPreferences({...preferences, fontSize: parseInt(e.target.value)})} className="flex-1 accent-nexus-accent" />
                                    <Type size={24} />
                                </div>
                             </div>
                             
                             <div>
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Message Spacing</label>
                                 <div className="grid grid-cols-2 gap-4">
                                     <RadioCard title="Comfortable" selected={preferences.density === 'comfortable'} onClick={() => setPreferences({...preferences, density: 'comfortable'})} color="bg-slate-700" />
                                     <RadioCard title="Compact" selected={preferences.density === 'compact'} onClick={() => setPreferences({...preferences, density: 'compact'})} color="bg-slate-700" />
                                 </div>
                             </div>

                             <Switch label="Reduced Motion" checked={preferences.reducedMotion} onChange={(v: boolean) => setPreferences({...preferences, reducedMotion: v})} />
                             <Switch label="Streamer Mode" checked={preferences.streamerMode} onChange={(v: boolean) => setPreferences({...preferences, streamerMode: v})} />
                          </div>
                       </section>
                    </div>
                 )}
                 {settingsTab === 'KEYBINDS' && (
                    <div className="space-y-6 animate-fade-in">
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="text-white font-bold flex items-center gap-2"><Keyboard size={18}/> Keyboard Shortcuts</h3>
                           <Button variant="secondary" className="text-xs py-1 px-3">Reset Defaults</Button>
                       </div>
                       <div className="space-y-2">
                           {keybinds.map(kb => (
                              <div key={kb.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-nexus-accent/50 transition-colors group">
                                 <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{kb.label}</span>
                                 <div className="flex gap-2">
                                    {kb.keys.map(key => <Keycap key={key}>{key}</Keycap>)}
                                    <button 
                                      onClick={() => handleRebind(kb.id)}
                                      className="ml-2 text-xs text-nexus-accent hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                       {rebindId === kb.id ? 'Press Key...' : 'Edit'}
                                    </button>
                                 </div>
                              </div>
                           ))}
                       </div>
                       <Button variant="primary" className="w-full mt-4 flex items-center justify-center gap-2" onClick={handleAddKeybind}><Plus size={16}/> Add Keybind</Button>
                    </div>
                 )}
                 {settingsTab === 'AUDIO' && (
                    <div className="space-y-8 animate-fade-in">
                       <section>
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Mic size={18}/> Voice Settings</h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Input Device</label>
                                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                                      <option>Default Microphone</option>
                                      <option>Yeti Stereo Microphone</option>
                                      <option>NVIDIA Broadcast</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Output Device</label>
                                  <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                                      <option>Default Output</option>
                                      <option>Headphones (Realtek Audio)</option>
                                  </select>
                              </div>
                          </div>
                          
                          <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Input Volume</label>
                              <input type="range" min="0" max="1" step="0.01" value={preferences.inputVolume} onChange={(e) => setPreferences({...preferences, inputVolume: parseFloat(e.target.value)})} className="w-full accent-nexus-accent" />
                          </div>

                          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-4">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mic Test</label>
                              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                  <div 
                                    className="h-full bg-green-500 transition-all duration-100" 
                                    style={{ width: `${micLevel}%`, opacity: micLevel > 0 ? 1 : 0.2 }}
                                  />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <Switch label="Noise Suppression" checked={true} onChange={() => {}} />
                              <Switch label="Echo Cancellation" checked={true} onChange={() => {}} />
                          </div>
                       </section>

                       <section>
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Camera size={18}/> Video Settings</h3>
                          <div className="mb-4">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Camera</label>
                              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                                  <option>HD Pro Webcam C920</option>
                                  <option>OBS Virtual Camera</option>
                              </select>
                          </div>
                          <div className="bg-black aspect-video rounded-lg border border-slate-700 relative overflow-hidden flex items-center justify-center mb-4">
                              {showVideoPreview ? (
                                  <div className="text-slate-500 animate-pulse">Camera Preview Active</div>
                              ) : (
                                  <div className="text-slate-600 text-sm">Preview Disabled</div>
                              )}
                          </div>
                          <Button variant="secondary" onClick={() => setShowVideoPreview(!showVideoPreview)} className="w-full">
                              {showVideoPreview ? 'Stop Preview' : 'Test Video'}
                          </Button>
                       </section>

                       <section>
                          <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Volume2 size={18}/> Sound Output</h3>
                          <div className="flex items-center gap-4 mb-4">
                             <Volume2 className="text-slate-400" />
                             <input type="range" min="0" max="1" step="0.1" value={preferences.notificationVolume} onChange={(e) => setPreferences({...preferences, notificationVolume: parseFloat(e.target.value)})} className="flex-1 accent-nexus-accent" />
                          </div>
                          <div className="space-y-2">
                             <Switch label="Enable Sound Effects" checked={preferences.enableSounds} onChange={(v: boolean) => setPreferences({...preferences, enableSounds: v})} />
                             <Switch label="Mention Sounds" checked={preferences.enableMentionSounds} onChange={(v: boolean) => setPreferences({...preferences, enableMentionSounds: v})} />
                          </div>
                       </section>
                    </div>
                 )}
             </div>
          </div>
      </Modal>

      {/* Server Settings Modal */}
      <Modal isOpen={isServerSettingsOpen} onClose={() => setIsServerSettingsOpen(false)} title="Server Settings" size="xl">
        <div className="flex h-[500px]">
             {/* Sidebar */}
             <div className="w-48 bg-slate-900 border-r border-slate-800 p-2 flex flex-col gap-1">
                 <button onClick={() => setServerSettingsTab('OVERVIEW')} className={`text-left px-4 py-2 rounded text-sm font-bold ${serverSettingsTab === 'OVERVIEW' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Overview</button>
                 <button onClick={() => setServerSettingsTab('ROLES')} className={`text-left px-4 py-2 rounded text-sm font-bold ${serverSettingsTab === 'ROLES' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Roles</button>
                 <button onClick={() => setServerSettingsTab('EMOJIS')} className={`text-left px-4 py-2 rounded text-sm font-bold ${serverSettingsTab === 'EMOJIS' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Emojis</button>
                 <button onClick={() => setServerSettingsTab('MODERATION')} className={`text-left px-4 py-2 rounded text-sm font-bold ${serverSettingsTab === 'MODERATION' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Moderation</button>
                 <div className="flex-1"></div>
                 <button onClick={() => setServerToDelete(activeServerId)} className="text-left px-4 py-2 rounded text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2"><Trash2 size={16} /> Delete Server</button>
             </div>
             
             {/* Content */}
             <div className="flex-1 bg-slate-800/50 p-6 overflow-y-auto custom-scrollbar">
                {/* Content based on tab */}
                {activeServer && (
                    <>
                        {serverSettingsTab === 'OVERVIEW' && (
                             <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center relative group cursor-pointer overflow-hidden border-2 border-dashed border-slate-600 hover:border-nexus-accent">
                                        <img src={activeServer.icon} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">CHANGE</div>
                                   </div>
                                   <div className="flex-1">
                                       <Input label="Server Name" value={activeServer.name} onChange={(e: any) => handleUpdateServer({ name: e.target.value })} />
                                   </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Region</label>
                                        <select 
                                            value={activeServer.region} 
                                            onChange={(e) => handleUpdateServer({ region: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-accent focus:outline-none"
                                        >
                                           <option>US East</option>
                                           <option>US West</option>
                                           <option>EU West</option>
                                           <option>Asia</option>
                                        </select>
                                    </div>
                                    <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Privacy</label>
                                         <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                                             <Lock size={14} className="text-slate-400" />
                                             Private Server
                                         </div>
                                    </div>
                                </div>
                                <Input label="Description" value={activeServer.description || ''} onChange={(e: any) => handleUpdateServer({ description: e.target.value })} />
                             </div>
                        )}
                        {serverSettingsTab === 'ROLES' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white">Roles ({activeServer.roles?.length || 0})</h3>
                                    <Button variant="primary" className="text-xs py-1 px-3" onClick={handleAddRole}>Create Role</Button>
                                </div>
                                <div className="space-y-2">
                                    {activeServer.roles?.map(role => (
                                        <div key={role.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }}></div>
                                                {editingRoleId === role.id ? (
                                                    <input 
                                                        className="bg-transparent border-b border-nexus-accent text-white text-sm focus:outline-none"
                                                        value={role.name}
                                                        onChange={(e) => handleUpdateRole(role.id, { name: e.target.value })}
                                                        autoFocus
                                                        onBlur={() => setEditingRoleId(null)}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-slate-200">{role.name}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingRoleId(role.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><Edit3 size={14} /></button>
                                                <button onClick={() => handleDeleteRole(role.id)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {serverSettingsTab === 'EMOJIS' && (
                            <div className="text-center py-10">
                                <Smile size={48} className="mx-auto text-slate-600 mb-4" />
                                <h3 className="text-lg font-bold text-slate-400">Server Emojis</h3>
                                <p className="text-sm text-slate-500 mb-6">Upload custom emojis for your members to use.</p>
                                <Button variant="secondary">Upload Emoji</Button>
                                <div className="grid grid-cols-4 gap-4 mt-8">
                                    {activeServer.emojis?.map(emoji => (
                                        <div key={emoji.id} className="bg-slate-900 p-2 rounded-lg border border-slate-700 flex flex-col items-center">
                                            <img src={emoji.url} className="w-8 h-8 mb-2" />
                                            <span className="text-xs text-slate-400 truncate w-full text-center">:{emoji.name}:</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {serverSettingsTab === 'MODERATION' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-white mb-2">Safety Setup</h3>
                                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-bold text-white">Verification Level</div>
                                                <div className="text-xs text-slate-500">Require email or phone verification</div>
                                            </div>
                                            <select 
                                                value={activeServer.verificationLevel}
                                                onChange={(e) => handleUpdateServer({ verificationLevel: e.target.value as any })}
                                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                                            >
                                                <option value="NONE">None</option>
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Banned Users</h3>
                                    <div className="space-y-2">
                                        {bannedUsers.map(user => (
                                            <div key={user.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center"><UserIcon size={14} /></div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{user.username}</div>
                                                        <div className="text-xs text-slate-500">Reason: {user.reason}</div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" className="text-xs text-red-400 hover:text-red-300" onClick={() => handleUnban(user.id)}>Revoke Ban</Button>
                                            </div>
                                        ))}
                                        {bannedUsers.length === 0 && (
                                            <div className="text-center text-slate-500 text-sm py-4">No banned users</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
             </div>
        </div>
      </Modal>
      
      {/* ... (Existing Modals) ... */}
      <Modal isOpen={isCreateServerOpen} onClose={() => setIsCreateServerOpen(false)} title="Create Your Server" size="lg">
        {/* ... (Create Server Content) ... */}
        <form onSubmit={handleCreateServer} className="flex flex-col h-[500px]">
           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
               {/* ... (Form Fields) ... */}
               <div className="text-center mb-6">
                  <div 
                    className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center border-2 border-dashed border-slate-600 hover:border-nexus-accent cursor-pointer group transition-colors relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                     {newServerIcon ? (
                        <img src={newServerIcon} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        <>
                            <UploadCloud size={32} className="text-slate-500 group-hover:text-nexus-accent" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">
                                UPLOAD
                            </div>
                        </>
                     )}
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleServerIconUpload} />
                  </div>
                  <p className="text-slate-400 text-xs mt-3">Icons help users identify your server.</p>
               </div>
               
               <Input label="Server Name" placeholder="My Awesome Guild" value={newServerName} onChange={(e: any) => setNewServerName(e.target.value)} autoFocus />
               
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Server Template</label>
                  <div className="grid grid-cols-3 gap-3">
                     <div onClick={() => setNewServerTemplate('GAMING')} className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'GAMING' ? 'bg-nexus-accent/20 border-nexus-accent text-white ring-1 ring-nexus-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                        <Gamepad2 size={24} className={newServerTemplate === 'GAMING' ? 'text-nexus-accent' : 'text-slate-500'} />
                        <span className="text-xs font-bold">Gaming</span>
                     </div>
                     <div onClick={() => setNewServerTemplate('SOCIAL')} className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'SOCIAL' ? 'bg-nexus-accent/20 border-nexus-accent text-white ring-1 ring-nexus-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                        <Coffee size={24} className={newServerTemplate === 'SOCIAL' ? 'text-nexus-accent' : 'text-slate-500'} />
                        <span className="text-xs font-bold">Social</span>
                     </div>
                     <div onClick={() => setNewServerTemplate('CLAN')} className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${newServerTemplate === 'CLAN' ? 'bg-nexus-accent/20 border-nexus-accent text-white ring-1 ring-nexus-accent' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                        <Swords size={24} className={newServerTemplate === 'CLAN' ? 'text-nexus-accent' : 'text-slate-500'} />
                        <span className="text-xs font-bold">Clan</span>
                     </div>
                  </div>
               </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Server Region</label>
                     <div className="relative">
                        <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-nexus-accent appearance-none cursor-pointer text-sm" value={newServerRegion} onChange={(e) => setNewServerRegion(e.target.value)}>
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
                          <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-nexus-accent appearance-none cursor-pointer text-sm" value={newServerPrivacy} onChange={(e) => setNewServerPrivacy(e.target.value as any)}>
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

      <ConfirmModal isOpen={!!serverToDelete} onClose={() => setServerToDelete(null)} onConfirm={handleDeleteServer} title="Delete Server" message="Are you sure you want to delete this server? This action cannot be undone and all channels and messages will be lost." />
      
      {/* Enhanced Voice Channel Join Modal */}
      {pendingVoiceChannel && (
          <Modal isOpen={!!pendingVoiceChannel} onClose={() => setPendingVoiceChannel(null)} title="" size="md">
              <div className="relative overflow-hidden bg-slate-900">
                  {/* Decorative Background */}
                  <div className="absolute inset-0 bg-nexus-accent/10 pointer-events-none"></div>
                  <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-nexus-accent/20 rounded-full blur-[60px] pointer-events-none"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-8 flex flex-col items-center">
                      <div className="mb-4 bg-slate-800 rounded-full p-4 border border-slate-700 shadow-[0_0_20px_rgba(139,92,246,0.2)] animate-pulse-glow">
                          <AudioWaveform size={48} className="text-nexus-accent" />
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mb-1">{pendingVoiceChannel.name}</h2>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mb-8">
                          <Signal size={14} className="text-green-500" />
                          <span>US East • 12ms</span>
                      </div>

                      {/* User Avatars Preview */}
                      <div className="flex items-center justify-center gap-2 mb-8">
                          {MOCK_USERS.slice(0, 3).map((u, i) => (
                              <div key={i} className="relative group">
                                  <Avatar src={u.avatar} size="md" className="border-2 border-slate-800 ring-2 ring-slate-700" />
                                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-black px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      {u.username}
                                  </div>
                              </div>
                          ))}
                          <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs text-slate-400 font-bold">
                              +2
                          </div>
                      </div>

                      {/* Controls */}
                      <div className="w-full grid grid-cols-2 gap-4 mb-8">
                          <div 
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${joinMuted ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                            onClick={() => setJoinMuted(!joinMuted)}
                          >
                              {joinMuted ? <MicOff size={24} /> : <Mic size={24} />}
                              <span className="text-xs font-bold">{joinMuted ? 'Muted' : 'Mute'}</span>
                          </div>
                          <div 
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${joinDeafened ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                            onClick={() => setJoinDeafened(!joinDeafened)}
                          >
                              {joinDeafened ? <VolumeX size={24} /> : <Headphones size={24} />}
                              <span className="text-xs font-bold">{joinDeafened ? 'Deafened' : 'Deafen'}</span>
                          </div>
                      </div>

                      <div className="w-full flex gap-3">
                          <Button variant="ghost" onClick={() => setPendingVoiceChannel(null)} className="flex-1">Cancel</Button>
                          <Button variant="primary" onClick={handleConfirmJoinVoice} className="flex-[2] py-3 text-lg">Connect</Button>
                      </div>
                  </div>
              </div>
          </Modal>
      )}
    </div>
  );
};

export default Dashboard;
