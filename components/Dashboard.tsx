import React, { useState, useEffect, useRef } from 'react';
import { ServerSidebar, ChannelSidebar } from './Sidebars';
import { ChatInterface } from './ChatInterface';
import { GamingHub } from './GamingHub';
import Profile from './Profile';
import { Modal, Button, Badge, Input, Switch, Keycap, RadioCard, ConfirmModal, Avatar, ProgressBar } from './UIComponents';
import { MOCK_SERVERS, MOCK_USERS, INITIAL_MESSAGES, LOOT_ITEMS, NOTIFICATION_SOUNDS, MOCK_AUDIT_LOGS } from '../constants';
import { User, Message, SoundEffect, InventoryItem, Server, Role, ServerEmoji, Channel, AuditLogEntry, ServerFeatures } from '../types';
import { Gift, Shield, User as UserIcon, Keyboard, Palette, LogOut, Check, Plus, UploadCloud, Monitor, RefreshCw, X, Volume2, VolumeX, Smile, Globe, Ban, Trash2, Lock, Users, Swords, Coffee, Gamepad2, Mic, Music, Hash, Settings, Tv, AlertTriangle, Link as LinkIcon, Calendar, Zap, ShieldAlert, Gavel, Smartphone, Mail, Edit3, GripVertical, Search, FileText, Camera, Sliders, Type, Layout, MousePointer, Signal, AudioWaveform, MicOff, Headphones, ArrowRight, ArrowLeft, Image as ImageIcon, Copy, AlertOctagon, ShieldCheck, Eye, EyeOff, CheckCircle, Filter } from 'lucide-react';

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

// Configuration definitions for server templates
const TEMPLATE_CONFIGS = {
  GAMING: [
    { key: 'gameTitle', label: 'Primary Game', type: 'select', options: ['League of Legends', 'Valorant', 'Apex Legends', 'CS:GO', 'General Gaming'] },
    { key: 'minRank', label: 'Rank Verification', type: 'select', options: ['None', 'Bronze+', 'Gold+', 'Diamond+', 'Pro Verified'] },
    { key: 'scrimScheduler', label: 'Scrimmage Scheduler', type: 'switch' },
    { key: 'clipFeed', label: 'Auto-Clip Feed', type: 'switch' },
    { key: 'patchNotes', label: 'Patch Notes Bot', type: 'switch' },
    { key: 'voiceOverlays', label: 'In-Game Voice Overlay', type: 'switch' },
    { key: 'stratBoard', label: 'Strategy Whiteboard', type: 'switch' },
    { key: 'streamerMode', label: 'Force Streamer Mode', type: 'switch' },
    { key: 'toxicityFilter', label: 'Toxicity Sensitivity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'] },
    { key: 'lfgBot', label: 'LFG Auto-Match', type: 'switch' },
  ],
  SOCIAL: [
    { key: 'welcomeSystem', label: 'Welcome Greeter', type: 'switch' },
    { key: 'musicBot', label: '24/7 Lo-Fi Bot', type: 'switch' },
    { key: 'levelingSystem', label: 'XP & Leveling', type: 'switch' },
    { key: 'eventCalendar', label: 'Event Calendar', type: 'switch' },
    { key: 'memeGenerator', label: 'Meme Commands', type: 'switch' },
    { key: 'birthdayBot', label: 'Birthday Celebrations', type: 'switch' },
    { key: 'reactionRoles', label: 'Self-Assign Roles', type: 'switch' },
    { key: 'tempVoiceChannels', label: 'Private Voice Rooms', type: 'switch' },
    { key: 'polls', label: 'Community Polls', type: 'switch' },
    { key: 'mediaGallery', label: 'Media Gallery View', type: 'switch' },
  ],
  CLAN: [
    { key: 'applicationSystem', label: 'Require Application', type: 'switch' },
    { key: 'attendanceTracker', label: 'Raid Attendance', type: 'switch' },
    { key: 'lootSystem', label: 'Loot Distribution', type: 'select', options: ['ROLL', 'DKP', 'COUNCIL'] },
    { key: 'diplomacyTracker', label: 'Diplomacy Status', type: 'switch' },
    { key: 'hierarchyView', label: 'Chain of Command', type: 'switch' },
    { key: 'duesTracker', label: 'Clan Bank/Dues', type: 'switch' },
    { key: 'squads', label: 'Squad Management', type: 'switch' },
    { key: 'warRoom', label: 'War Room Channels', type: 'switch' },
    { key: 'emergencyAlerts', label: 'SMS/Push Alerts', type: 'switch' },
    { key: 'recruitmentStatus', label: 'Recruitment', type: 'select', options: ['OPEN', 'CLOSED', 'INVITE'] },
  ]
};

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
  const [moderationSubTab, setModerationSubTab] = useState<'SAFETY' | 'AUTOMOD' | 'AUDIT' | 'BANS'>('SAFETY');
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
  const [createServerStep, setCreateServerStep] = useState(1);
  const [newServerName, setNewServerName] = useState('');
  const [newServerIcon, setNewServerIcon] = useState<string>('');
  const [newServerRegion, setNewServerRegion] = useState('US East');
  const [newServerTemplate, setNewServerTemplate] = useState<'GAMING' | 'SOCIAL' | 'CLAN'>('GAMING');
  const [newServerPrivacy, setNewServerPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  
  // Advanced Server Config State (Dynamic based on template)
  const [serverFeatureConfig, setServerFeatureConfig] = useState<ServerFeatures>({});

  // Reset config when template changes
  useEffect(() => {
    const defaults: any = {};
    TEMPLATE_CONFIGS[newServerTemplate].forEach(conf => {
        if (conf.type === 'switch') defaults[conf.key] = false;
        if (conf.type === 'select') defaults[conf.key] = (conf.options as string[])[0];
    });
    setServerFeatureConfig(defaults);
  }, [newServerTemplate]);
  
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
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  const handleServerBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && activeServer) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleUpdateServer({ banner: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;
    
    const newServer: Server = {
        id: `server-${Date.now()}`,
        name: newServerName,
        icon: newServerIcon || `https://picsum.photos/seed/${newServerName}/100/100`,
        region: newServerRegion,
        channels: [
            { id: `ch-${Date.now()}-1`, name: 'general', type: 'TEXT' },
            { id: `ch-${Date.now()}-2`, name: 'Lobby', type: 'VOICE' }
        ],
        template: newServerTemplate,
        features: serverFeatureConfig
    };
    
    setServers(prev => [...prev, newServer]);
    setActiveServerId(newServer.id);
    setActiveChannelId(newServer.channels[0].id);

    setIsCreateServerOpen(false);
    // Reset Form
    setCreateServerStep(1);
    setNewServerName('');
    setNewServerIcon('');
  };
  
  const handleFeatureConfigChange = (key: string, value: any) => {
     setServerFeatureConfig(prev => ({ ...prev, [key]: value }));
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
        permissions: ['SEND_MESSAGES'],
        isHoisted: false,
        isMentionable: false
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
  
  const togglePermission = (roleId: string, perm: string) => {
      if (!activeServer || !activeServer.roles) return;
      const role = activeServer.roles.find(r => r.id === roleId);
      if (!role) return;
      
      const currentPerms = role.permissions || [];
      const newPerms = currentPerms.includes(perm) 
         ? currentPerms.filter(p => p !== perm) 
         : [...currentPerms, perm];
         
      handleUpdateRole(roleId, { permissions: newPerms });
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
                       {/* Appearance settings content omitted for brevity, logic remains same */}
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
                    </div>
                 )}
                 {settingsTab === 'KEYBINDS' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Keybinds content */}
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
                       {/* Audio content */}
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
                       </section>
                    </div>
                 )}
             </div>
          </div>
      </Modal>

      {/* Server Settings Modal */}
      <Modal isOpen={isServerSettingsOpen} onClose={() => setIsServerSettingsOpen(false)} title="Server Settings" size="xl">
        <div className="flex h-[600px] bg-nexus-900 rounded-xl overflow-hidden">
             {/* Sidebar */}
             <div className="w-60 bg-slate-900 border-r border-slate-800 p-3 flex flex-col gap-1">
                 <div className="px-3 pb-3 mb-2 border-b border-slate-800">
                    <h3 className="font-bold text-white truncate text-sm">{activeServer?.name}</h3>
                    <span className="text-xs text-slate-500">Server Configuration</span>
                 </div>
                 <button onClick={() => setServerSettingsTab('OVERVIEW')} className={`text-left px-4 py-2 rounded text-sm font-bold flex items-center gap-3 transition-colors ${serverSettingsTab === 'OVERVIEW' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Layout size={16} /> Overview
                 </button>
                 <button onClick={() => setServerSettingsTab('ROLES')} className={`text-left px-4 py-2 rounded text-sm font-bold flex items-center gap-3 transition-colors ${serverSettingsTab === 'ROLES' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <ShieldCheck size={16} /> Roles
                 </button>
                 <button onClick={() => setServerSettingsTab('EMOJIS')} className={`text-left px-4 py-2 rounded text-sm font-bold flex items-center gap-3 transition-colors ${serverSettingsTab === 'EMOJIS' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Smile size={16} /> Emojis
                 </button>
                 <button onClick={() => setServerSettingsTab('MODERATION')} className={`text-left px-4 py-2 rounded text-sm font-bold flex items-center gap-3 transition-colors ${serverSettingsTab === 'MODERATION' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Gavel size={16} /> Moderation
                 </button>
                 <div className="flex-1"></div>
                 <button onClick={() => setServerToDelete(activeServerId)} className="text-left px-4 py-2 rounded text-sm font-bold text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"><Trash2 size={16} /> Delete Server</button>
             </div>
             
             {/* Content */}
             <div className="flex-1 bg-slate-800/50 p-8 overflow-y-auto custom-scrollbar relative">
                {/* Content based on tab */}
                {activeServer && (
                    <>
                        {serverSettingsTab === 'OVERVIEW' && (
                             <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                                {/* Banner Section */}
                                <div className="relative group rounded-xl overflow-hidden h-32 bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-nexus-accent transition-colors" onClick={() => bannerInputRef.current?.click()}>
                                    {activeServer.banner ? (
                                        <img src={activeServer.banner} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-500 group-hover:text-nexus-accent">
                                            <ImageIcon size={32} className="mb-2" />
                                            <span className="text-xs font-bold uppercase">Upload Banner</span>
                                        </div>
                                    )}
                                    <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleServerBannerUpload} />
                                    
                                    {/* Icon Overlay */}
                                    <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-full border-4 border-slate-800 bg-slate-700 z-10 shadow-xl overflow-hidden group/icon cursor-pointer" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                        <img src={activeServer.icon} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/icon:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleServerIconUpload} />
                                    </div>
                                </div>
                                
                                <div className="mt-8 grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <Input label="Server Name" value={activeServer.name} onChange={(e: any) => handleUpdateServer({ name: e.target.value })} />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Region</label>
                                        <div className="relative">
                                            <select 
                                                value={activeServer.region} 
                                                onChange={(e) => handleUpdateServer({ region: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-accent focus:outline-none appearance-none"
                                            >
                                            <option>US East</option>
                                            <option>US West</option>
                                            <option>EU West</option>
                                            <option>Asia</option>
                                            </select>
                                            <Globe size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span>Operational</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-4">
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2"><Settings size={14}/> Widget Settings</h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">System Messages Channel</label>
                                        <select 
                                            value={activeServer.systemChannelId || ''} 
                                            onChange={(e) => handleUpdateServer({ systemChannelId: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-accent focus:outline-none"
                                        >
                                            <option value="">No System Messages</option>
                                            {activeServer.channels.filter(c => c.type === 'TEXT').map(c => (
                                                <option key={c.id} value={c.id}>#{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">AFK Voice Channel</label>
                                        <select 
                                            value={activeServer.afkChannelId || ''} 
                                            onChange={(e) => handleUpdateServer({ afkChannelId: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-accent focus:outline-none"
                                        >
                                            <option value="">No AFK Channel</option>
                                            {activeServer.channels.filter(c => c.type === 'VOICE').map(c => (
                                                <option key={c.id} value={c.id}>🔊 {c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <div className="text-sm font-medium text-white">Default Notification Settings</div>
                                            <div className="text-xs text-slate-500">All messages vs mentions only</div>
                                        </div>
                                        <Switch checked={true} onChange={() => {}} />
                                    </div>
                                </div>

                                {/* Invite Link Widget */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Invite Link</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-nexus-glow font-mono flex items-center justify-between">
                                            <span>nexus.gg/{activeServer.id.slice(0,8)}</span>
                                            <button className="text-slate-500 hover:text-white" title="Copy"><Copy size={14}/></button>
                                        </div>
                                        <Button variant="secondary" className="text-xs">Regenerate</Button>
                                    </div>
                                </div>
                             </div>
                        )}
                        
                        {serverSettingsTab === 'ROLES' && (
                            <div className="flex h-full gap-6 animate-fade-in">
                                {/* Role List */}
                                <div className="w-1/3 flex flex-col gap-2 border-r border-slate-700 pr-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-slate-500">Roles ({activeServer.roles?.length || 0})</h3>
                                        <button onClick={handleAddRole} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Plus size={16} /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                        {activeServer.roles?.map(role => (
                                            <div 
                                                key={role.id} 
                                                onClick={() => setEditingRoleId(role.id)}
                                                className={`p-2 rounded-lg flex items-center justify-between cursor-pointer border border-transparent transition-all ${editingRoleId === role.id ? 'bg-slate-700 border-slate-600' : 'hover:bg-slate-800'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={14} className="text-slate-600 cursor-grab" />
                                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: role.color }}></div>
                                                    <span className={`text-sm font-bold ${editingRoleId === role.id ? 'text-white' : 'text-slate-300'}`}>{role.name}</span>
                                                </div>
                                                <div className="text-xs text-slate-600">0</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Role Editor */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {editingRoleId && activeServer.roles ? (
                                        (() => {
                                            const role = activeServer.roles.find(r => r.id === editingRoleId);
                                            if (!role) return null;
                                            return (
                                                <div className="space-y-6">
                                                    <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                                                        <h3 className="text-xl font-bold text-white">Edit Role: {role.name}</h3>
                                                        <Button variant="danger" className="text-xs py-1 px-3" onClick={() => handleDeleteRole(role.id)}>Delete Role</Button>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <Input label="Role Name" value={role.name} onChange={(e: any) => handleUpdateRole(role.id, { name: e.target.value })} />
                                                        
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role Color</label>
                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                <input type="color" value={role.color} onChange={(e) => handleUpdateRole(role.id, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                                                                {roleColors.map(color => (
                                                                    <button 
                                                                        key={color}
                                                                        className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${role.color === color ? 'border-white ring-2 ring-slate-800 scale-110' : 'border-transparent'}`}
                                                                        style={{ backgroundColor: color }}
                                                                        onClick={() => handleUpdateRole(role.id, { color })}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pt-4 border-t border-slate-700">
                                                        <h4 className="text-sm font-bold text-white mb-2">Display</h4>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-200">Display role members separately</div>
                                                                <div className="text-xs text-slate-500">Group members by this role in the member list</div>
                                                            </div>
                                                            <Switch checked={role.isHoisted} onChange={(v: boolean) => handleUpdateRole(role.id, { isHoisted: v })} />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="text-sm font-medium text-slate-200">Allow anyone to @mention this role</div>
                                                                <div className="text-xs text-slate-500">Members can ping this role</div>
                                                            </div>
                                                            <Switch checked={role.isMentionable} onChange={(v: boolean) => handleUpdateRole(role.id, { isMentionable: v })} />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pt-4 border-t border-slate-700">
                                                        <h4 className="text-sm font-bold text-white mb-2">Permissions</h4>
                                                        {['View Channels', 'Send Messages', 'Manage Messages', 'Connect', 'Speak', 'Manage Server', 'Ban Members', 'Kick Members'].map(perm => {
                                                            const hasPerm = role.permissions?.includes(perm.toUpperCase().replace(' ', '_'));
                                                            const permKey = perm.toUpperCase().replace(' ', '_');
                                                            return (
                                                                <div key={perm} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                                                    <div className="text-sm text-slate-300 font-medium">{perm}</div>
                                                                    <Switch checked={hasPerm} onChange={() => togglePermission(role.id, permKey)} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                            <ShieldCheck size={48} className="mb-4 opacity-20" />
                                            <p>Select a role to edit permissions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {serverSettingsTab === 'EMOJIS' && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Server Emojis</h3>
                                        <p className="text-xs text-slate-400">Slots Available: {50 - (activeServer.emojis?.length || 0)} / 50</p>
                                    </div>
                                    <Button variant="primary" className="flex items-center gap-2"><UploadCloud size={16}/> Upload Emoji</Button>
                                </div>
                                
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-900/30 mb-8 hover:bg-slate-900/50 hover:border-nexus-accent transition-colors cursor-pointer group">
                                    <Smile size={48} className="text-slate-600 mb-4 group-hover:scale-110 transition-transform group-hover:text-nexus-accent" />
                                    <p className="font-bold text-slate-400 group-hover:text-white">Drag & Drop or Click to Upload</p>
                                    <p className="text-xs text-slate-600 mt-2">Recommended: 256x256 PNG</p>
                                </div>

                                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                                    {activeServer.emojis?.map(emoji => (
                                        <div key={emoji.id} className="relative group bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col items-center hover:border-nexus-glow transition-colors">
                                            <img src={emoji.url} className="w-10 h-10 mb-2 object-contain group-hover:scale-110 transition-transform" />
                                            <div className="text-xs font-bold text-slate-300 truncate w-full text-center group-hover:text-white">:{emoji.name}:</div>
                                            <button className="absolute top-1 right-1 bg-red-500/80 p-1 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Empty slots placeholders */}
                                    {[1,2,3].map(i => (
                                        <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-lg p-3 flex items-center justify-center min-h-[80px]">
                                            <div className="w-8 h-8 rounded-full bg-slate-800"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {serverSettingsTab === 'MODERATION' && (
                            <div className="h-full flex flex-col animate-fade-in">
                                {/* Sub-nav */}
                                <div className="flex gap-4 border-b border-slate-700 pb-4 mb-6">
                                    <button onClick={() => setModerationSubTab('SAFETY')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${moderationSubTab === 'SAFETY' ? 'text-nexus-accent border-nexus-accent' : 'text-slate-400 border-transparent hover:text-white'}`}>Safety Setup</button>
                                    <button onClick={() => setModerationSubTab('AUTOMOD')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${moderationSubTab === 'AUTOMOD' ? 'text-nexus-accent border-nexus-accent' : 'text-slate-400 border-transparent hover:text-white'}`}>AutoMod</button>
                                    <button onClick={() => setModerationSubTab('AUDIT')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${moderationSubTab === 'AUDIT' ? 'text-nexus-accent border-nexus-accent' : 'text-slate-400 border-transparent hover:text-white'}`}>Audit Log</button>
                                    <button onClick={() => setModerationSubTab('BANS')} className={`text-sm font-bold pb-1 border-b-2 transition-colors ${moderationSubTab === 'BANS' ? 'text-nexus-accent border-nexus-accent' : 'text-slate-400 border-transparent hover:text-white'}`}>Bans</button>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {moderationSubTab === 'SAFETY' && (
                                        <div className="space-y-6 max-w-3xl">
                                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                                        <ShieldCheck size={24} className="text-green-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">Verification Level</h4>
                                                        <p className="text-sm text-slate-400">Members must meet the following criteria before they can send messages.</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    {[
                                                        { val: 'NONE', label: 'None', desc: 'Unrestricted access.' },
                                                        { val: 'LOW', label: 'Low', desc: 'Must have a verified email.' },
                                                        { val: 'MEDIUM', label: 'Medium', desc: 'Must be registered for 5+ minutes.' },
                                                        { val: 'HIGH', label: 'High', desc: 'Must have a verified phone number.' }
                                                    ].map((lvl) => (
                                                        <div 
                                                            key={lvl.val} 
                                                            onClick={() => handleUpdateServer({ verificationLevel: lvl.val as any })}
                                                            className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${activeServer.verificationLevel === lvl.val ? 'bg-nexus-accent/10 border-nexus-accent' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                                                        >
                                                            <div>
                                                                <div className={`text-sm font-bold ${activeServer.verificationLevel === lvl.val ? 'text-nexus-accent' : 'text-white'}`}>{lvl.label}</div>
                                                                <div className="text-xs text-slate-500">{lvl.desc}</div>
                                                            </div>
                                                            {activeServer.verificationLevel === lvl.val && <CheckCircle size={18} className="text-nexus-accent" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                                        <EyeOff size={24} className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white">Explicit Media Content Filter</h4>
                                                        <p className="text-sm text-slate-400">Automatically scan and delete messages containing explicit media.</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <RadioCard title="Don't scan" selected={activeServer.explicitContentFilter === 'DISABLED'} onClick={() => handleUpdateServer({ explicitContentFilter: 'DISABLED' })} color="bg-slate-800" />
                                                    <RadioCard title="Scan members without roles" selected={activeServer.explicitContentFilter === 'MEMBERS_WITHOUT_ROLES'} onClick={() => handleUpdateServer({ explicitContentFilter: 'MEMBERS_WITHOUT_ROLES' })} color="bg-slate-800" />
                                                    <RadioCard title="Scan everyone" selected={activeServer.explicitContentFilter === 'ALL_MEMBERS'} onClick={() => handleUpdateServer({ explicitContentFilter: 'ALL_MEMBERS' })} color="bg-slate-800" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {moderationSubTab === 'AUTOMOD' && (
                                        <div className="space-y-6">
                                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><AlertOctagon size={16} className="text-nexus-accent" /> Keyword Filters</h4>
                                                <p className="text-sm text-slate-400 mb-4">Messages containing these words will be automatically blocked.</p>
                                                <Input 
                                                    placeholder="Enter words separated by commas (e.g. badword, spam, scam)" 
                                                    value={autoModConfig.bannedWords}
                                                    onChange={(e: any) => setAutoModConfig({...autoModConfig, bannedWords: e.target.value})}
                                                />
                                            </div>
                                            
                                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert size={16} className="text-yellow-500" /> Spam Sensitivity</h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-bold text-sm text-white">Block Suspected Spam Links</div>
                                                            <div className="text-xs text-slate-500">Filters messages containing known malicious URLs</div>
                                                        </div>
                                                        <Switch checked={autoModConfig.blockLinks} onChange={(v: boolean) => setAutoModConfig({...autoModConfig, blockLinks: v})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Filter Strictness</label>
                                                        <input type="range" min="0" max="2" step="1" className="w-full accent-yellow-500" />
                                                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                            <span>Low</span>
                                                            <span>Medium</span>
                                                            <span>High</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {moderationSubTab === 'AUDIT' && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center mb-2">
                                                 <Input placeholder="Search logs..." className="max-w-xs" />
                                                 <Button variant="secondary" className="text-xs"><Filter size={14} className="mr-2"/> Filter</Button>
                                            </div>
                                            <div className="border border-slate-700 rounded-xl overflow-hidden">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-900 border-b border-slate-700">
                                                        <tr>
                                                            <th className="p-3 font-bold text-slate-400">Action</th>
                                                            <th className="p-3 font-bold text-slate-400">User</th>
                                                            <th className="p-3 font-bold text-slate-400">Target</th>
                                                            <th className="p-3 font-bold text-slate-400 text-right">Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-800">
                                                        {auditLogs.map(log => (
                                                            <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                                                <td className="p-3">
                                                                    <span className="font-bold text-white">{log.action.replace('_', ' ')}</span>
                                                                    {log.details && <div className="text-xs text-slate-500">{log.details}</div>}
                                                                </td>
                                                                <td className="p-3 flex items-center gap-2">
                                                                     <Avatar src={MOCK_USERS.find(u => u.id === log.userId)?.avatar} size="sm" className="w-6 h-6" />
                                                                     <span className="text-slate-300">{MOCK_USERS.find(u => u.id === log.userId)?.username || 'Unknown'}</span>
                                                                </td>
                                                                <td className="p-3 text-slate-400 font-mono text-xs">{log.targetType}: {log.targetId}</td>
                                                                <td className="p-3 text-right text-slate-500 text-xs">{log.timestamp.toLocaleDateString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {moderationSubTab === 'BANS' && (
                                        <div className="space-y-4">
                                            <Input placeholder="Search bans..." />
                                            <div className="space-y-2">
                                                {bannedUsers.map(user => (
                                                    <div key={user.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex justify-between items-center group hover:border-red-500/50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-slate-500 group-hover:text-red-500 group-hover:border-red-500 transition-colors"><Ban size={18} /></div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white">{user.username}</div>
                                                                <div className="text-xs text-slate-500"><span className="text-red-400 font-bold">Reason:</span> {user.reason} • {user.date}</div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" className="text-xs text-slate-400 hover:text-green-400 hover:bg-green-500/10" onClick={() => handleUnban(user.id)}>Revoke Ban</Button>
                                                    </div>
                                                ))}
                                                {bannedUsers.length === 0 && (
                                                    <div className="text-center text-slate-500 text-sm py-8 flex flex-col items-center">
                                                        <CheckCircle size={32} className="text-green-500 mb-2" />
                                                        No banned users. Keep it up!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
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
        <form onSubmit={handleCreateServer} className="flex flex-col h-[500px]">
           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
               {/* Stepper Header */}
               <div className="flex items-center justify-between mb-8 px-4">
                  <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-colors ${createServerStep === 1 ? 'bg-nexus-accent text-white' : 'bg-green-500 text-white'}`}>1</div>
                      <span className={`text-[10px] font-bold uppercase ${createServerStep === 1 ? 'text-white' : 'text-slate-500'}`}>Basics</span>
                  </div>
                  <div className={`flex-1 h-0.5 mx-4 transition-colors ${createServerStep === 2 ? 'bg-nexus-accent' : 'bg-slate-700'}`}></div>
                  <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-colors ${createServerStep === 2 ? 'bg-nexus-accent text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>2</div>
                      <span className={`text-[10px] font-bold uppercase ${createServerStep === 2 ? 'text-white' : 'text-slate-500'}`}>Customize</span>
                  </div>
               </div>

               {/* Step 1: Basics */}
               {createServerStep === 1 && (
                <div className="space-y-6 animate-slide-up">
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
               )}

               {/* Step 2: Configuration */}
               {createServerStep === 2 && (
                  <div className="animate-slide-up">
                      <h3 className="text-lg font-bold text-white mb-2">Customize {newServerTemplate} Experience</h3>
                      <p className="text-slate-400 text-sm mb-6">Fine-tune your server's features and bots.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {TEMPLATE_CONFIGS[newServerTemplate].map((conf, index) => (
                             <div key={conf.key} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-nexus-accent/30 transition-colors">
                                {conf.type === 'switch' && (
                                    <Switch 
                                        label={conf.label} 
                                        checked={!!serverFeatureConfig[conf.key]} 
                                        onChange={(val: boolean) => handleFeatureConfigChange(conf.key, val)} 
                                    />
                                )}
                                {conf.type === 'select' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{conf.label}</label>
                                        <select 
                                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-white text-sm focus:border-nexus-accent focus:outline-none"
                                            value={serverFeatureConfig[conf.key]}
                                            onChange={(e) => handleFeatureConfigChange(conf.key, e.target.value)}
                                        >
                                            {conf.options?.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                             </div>
                          ))}
                      </div>
                  </div>
               )}
           </div>
           
          <div className="flex justify-between items-center p-6 border-t border-slate-800 bg-slate-900">
             {createServerStep === 1 ? (
                 <Button type="button" variant="ghost" onClick={() => setIsCreateServerOpen(false)}>Cancel</Button>
             ) : (
                 <Button type="button" variant="ghost" onClick={() => setCreateServerStep(1)} className="flex items-center gap-2"><ArrowLeft size={16}/> Back</Button>
             )}
             
             {createServerStep === 1 ? (
                 <Button type="button" variant="primary" onClick={() => setCreateServerStep(2)} disabled={!newServerName.trim()} className="flex items-center gap-2">Next Step <ArrowRight size={16}/></Button>
             ) : (
                 <Button type="submit" variant="primary">Create Server</Button>
             )}
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