
import React, { useState, useRef, useEffect } from 'react';
import { User, Server, Channel, Message, SoundEffect, Role } from '../types';
import { MOCK_SERVERS, INITIAL_MESSAGES, MOCK_USERS, MOCK_AUDIT_LOGS, SOUND_EFFECTS } from '../constants';
import { ServerSidebar, ChannelSidebar } from './Sidebars';
import { ChatInterface } from './ChatInterface';
import { GamingHub } from './GamingHub';
import Profile from './Profile';
import { Modal, Button, Input, Switch, Tabs, Avatar, ConfirmModal, Select, RadioCard, ProgressBar, Keycap, Badge } from './UIComponents';
import { 
  Settings, LogOut, Plus, Trash2, X, Image as ImageIcon, Camera, Globe, Copy, 
  Shield, Smile, Activity, Search, Save, Bell, Gamepad2, Users, GraduationCap, ChevronLeft,
  Mic, Volume2, Keyboard, Monitor, Laptop, MousePointer,
  Check, Lock, Unlock, Eye, MessageSquare, AtSign, MousePointer2, Speaker, Move, FileText,
  Filter, ChevronDown, Clock, AlertCircle, Download, Upload,
  Signal, Video, VideoOff, MicOff, VolumeX, Headphones, Palette, EyeOff, Hash, Command, Trophy
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

const TEMPLATE_PRESETS: Record<string, any> = {
    GAMING: {
        label: "Gaming Community",
        description: "A fortress for your clan. Includes tactical channels and ranked lobbies.",
        channels: [
            { name: "general", type: "TEXT" },
            { name: "announcements", type: "TEXT" },
            { name: "clips-highlights", type: "TEXT" },
            { name: "lfg-ranked", type: "TEXT" },
            { name: "strategies", type: "TEXT" },
            { name: "Lobby", type: "VOICE" },
            { name: "Duo Queue", type: "VOICE" },
            { name: "Squad Stream", type: "VOICE" }
        ],
        roles: [
            { name: "Server Admin", color: "#ef4444", permissions: ["ADMINISTRATOR"], isHoisted: true },
            { name: "Moderator", color: "#f59e0b", permissions: ["KICK_MEMBERS", "MANAGE_MESSAGES"], isHoisted: true },
            { name: "Esports Pro", color: "#8b5cf6", permissions: ["CONNECT", "SPEAK", "Attach Files"], isHoisted: true },
            { name: "Member", color: "#94a3b8", permissions: ["CONNECT", "SPEAK"], isHoisted: false }
        ],
        settings: {
            verificationLevel: 'HIGH',
            explicitContentFilter: 'ALL_MEMBERS',
            region: 'US-East'
        }
    },
    SCHOOL: {
        label: "School Club",
        description: "Collaborate on projects and hang out after class.",
        channels: [
            { name: "announcements", type: "TEXT" },
            { name: "general", type: "TEXT" },
            { name: "homework-help", type: "TEXT" },
            { name: "events", type: "TEXT" },
            { name: "off-topic", type: "TEXT" },
            { name: "Study Room A", type: "VOICE" },
            { name: "Study Room B", type: "VOICE" },
            { name: "Lounge", type: "VOICE" }
        ],
        roles: [
            { name: "President", color: "#3b82f6", permissions: ["ADMINISTRATOR"], isHoisted: true },
            { name: "Officer", color: "#22c55e", permissions: ["MANAGE_CHANNELS", "KICK_MEMBERS"], isHoisted: true },
            { name: "Student", color: "#94a3b8", permissions: ["CONNECT", "SPEAK"], isHoisted: false }
        ],
        settings: {
            verificationLevel: 'MEDIUM',
            region: 'US-East'
        }
    },
    SOCIAL: {
        label: "Friends & Chill",
        description: "A cozy space for you and your besties.",
        channels: [
            { name: "general", type: "TEXT" },
            { name: "memes", type: "TEXT" },
            { name: "music-requests", type: "TEXT" },
            { name: "party-planning", type: "TEXT" },
            { name: "The Hangout", type: "VOICE" },
            { name: "Cinema", type: "VOICE" }
        ],
        roles: [
            { name: "Host", color: "#ec4899", permissions: ["ADMINISTRATOR"], isHoisted: true },
            { name: "Bestie", color: "#a855f7", permissions: ["MANAGE_MESSAGES", "MOVE_MEMBERS"], isHoisted: true },
            { name: "Friend", color: "#f472b6", permissions: ["CONNECT", "SPEAK"], isHoisted: false }
        ],
        settings: {
            verificationLevel: 'LOW',
            region: 'US-East'
        }
    },
    CUSTOM: {
        label: "Custom Server",
        description: "Start from scratch. Build it your way.",
        channels: [
            { name: "general", type: "TEXT" },
            { name: "General", type: "VOICE" }
        ],
        roles: [
            { name: "Admin", color: "#94a3b8", permissions: ["ADMINISTRATOR"], isHoisted: true }
        ],
        settings: {
            verificationLevel: 'NONE',
            region: 'US-East'
        }
    }
};

const THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk', color: '#8b5cf6', bg: 'bg-[#0f172a]' },
  { id: 'midnight', name: 'Midnight', color: '#3b82f6', bg: 'bg-black' },
  { id: 'emerald', name: 'Emerald', color: '#10b981', bg: 'bg-[#064e3b]' },
  { id: 'crimson', name: 'Crimson', color: '#ef4444', bg: 'bg-[#450a0a]' },
];

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [servers, setServers] = useState<Server[]>(MOCK_SERVERS);
  const [activeServerId, setActiveServerId] = useState<string>('nexus-home');
  const [activeChannelId, setActiveChannelId] = useState<string>('gen');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [messageDensity, setMessageDensity] = useState<'comfortable' | 'compact'>('comfortable');
  
  // UI States
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  
  // Settings Tabs State
  const [userSettingsTab, setUserSettingsTab] = useState('MY_ACCOUNT');
  const [serverSettingsTab, setServerSettingsTab] = useState('OVERVIEW');

  // Voice Join State
  const [pendingVoiceChannel, setPendingVoiceChannel] = useState<Channel | null>(null);
  const [voiceConfig, setVoiceConfig] = useState({
      muted: false,
      deafened: false,
      video: false,
      noiseSuppression: true,
      inputDevice: 'default',
      outputDevice: 'default',
      volume: 75
  });

  // Server Creation State
  const [createStep, setCreateStep] = useState(1);
  const [createData, setCreateData] = useState({
      name: '',
      icon: '',
      template: '',
      region: 'US-East',
      privacy: 'PRIVATE',
      communityGuidelines: true
  });

  // Roles State
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // Audit Log State
  const [auditFilterUser, setAuditFilterUser] = useState<string>('');
  
  // Refs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const serverIconInputRef = useRef<HTMLInputElement>(null);
  const createIconInputRef = useRef<HTMLInputElement>(null);

  const activeServer = servers.find(s => s.id === activeServerId);
  const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId);

  // Initialize selected role when server settings open
  useEffect(() => {
    if (showServerSettings && activeServer && activeServer.roles && activeServer.roles.length > 0 && !selectedRoleId) {
        setSelectedRoleId(activeServer.roles[0].id);
    }
  }, [showServerSettings, activeServer]);

  // Handlers
  const handleSendMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleUpdateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
            const reactions = m.reactions || [];
            const existing = reactions.find(r => r.emoji === emoji);
            if (existing) {
                return { ...m, reactions: reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r) };
            } else {
                return { ...m, reactions: [...reactions, { emoji, count: 1 }] };
            }
        }
        return m;
    }));
  };

  const handlePlaySound = (sound: SoundEffect) => {
      const audio = new Audio(sound.src);
      audio.volume = 0.5;
      audio.play().catch(e => console.error("Audio play error", e));
  };

  const handleJoinVoiceRequest = (channel: Channel) => {
      // Don't open modal if already in the channel
      if (activeChannelId === channel.id) return;
      setPendingVoiceChannel(channel);
  };

  const confirmVoiceJoin = () => {
      if (!pendingVoiceChannel) return;
      setActiveChannelId(pendingVoiceChannel.id);
      
      // Feedback sound for joining voice
      const sound = SOUND_EFFECTS.find(s => s.label === 'Level Up');
      if (sound) handlePlaySound(sound);
      
      setPendingVoiceChannel(null);
  };

  const resetCreateServer = () => {
      setShowCreateServer(false);
      setCreateStep(1);
      setCreateData({
          name: '',
          icon: '',
          template: '',
          region: 'US-East',
          privacy: 'PRIVATE',
          communityGuidelines: true
      });
  };

  const handleTemplateSelect = (template: string) => {
      setCreateData(prev => ({ 
          ...prev, 
          template,
          name: `${currentUser.username}'s ${template === 'GAMING' ? 'Server' : template === 'SOCIAL' ? 'Hangout' : template === 'CLAN' ? 'Clan' : 'Space'}`
      }));
      setCreateStep(2);
  };

  const handleCreateServer = () => {
      if (!createData.name) return;
      
      const preset = TEMPLATE_PRESETS[createData.template] || TEMPLATE_PRESETS['CUSTOM'];
      
      // Generate channels from preset
      const generatedChannels: Channel[] = preset.channels.map((c: any, index: number) => ({
          id: `${c.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
          name: c.name,
          type: c.type
      }));

      // Generate roles from preset
      const generatedRoles: Role[] = preset.roles.map((r: any, index: number) => ({
          id: `role-${Date.now()}-${index}`,
          name: r.name,
          color: r.color,
          permissions: r.permissions,
          isHoisted: r.isHoisted
      }));

      const newServer: Server = {
          id: `server-${Date.now()}`,
          name: createData.name,
          icon: createData.icon || `https://picsum.photos/seed/${createData.name}/100/100`,
          channels: generatedChannels,
          region: createData.region,
          roles: generatedRoles,
          emojis: [],
          verificationLevel: preset.settings.verificationLevel,
          explicitContentFilter: preset.settings.explicitContentFilter,
          template: createData.template as any
      };
      
      setServers([...servers, newServer]);
      setActiveServerId(newServer.id);
      setActiveChannelId(newServer.channels[0].id);
      resetCreateServer();
  };

  const handleUpdateServer = (updates: Partial<Server>) => {
      if (!activeServer) return;
      setServers(prev => prev.map(s => s.id === activeServerId ? { ...s, ...updates } : s));
  };

  const handleServerBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          handleUpdateServer({ banner: url });
      }
  };

  const handleServerIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          handleUpdateServer({ icon: url });
      }
  };

  const handleCreateIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const url = URL.createObjectURL(e.target.files[0]);
        setCreateData(prev => ({ ...prev, icon: url }));
    }
  };

  const handleThemeChange = (color: string) => {
    document.documentElement.style.setProperty('--nexus-accent', color);
  };

  // Render Content Logic
  const renderContent = () => {
      if (activeServerId === 'hub') {
          return <GamingHub />;
      }
      
      if (activeServerId === 'home') {
          // Home / DM View (Mock)
          return (
             <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-500">
                 <div className="text-center">
                    <div className="text-6xl mb-4 animate-float">👋</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Home, {currentUser.username}</h2>
                    <p className="mb-6">Select a server or start a conversation.</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="secondary" onClick={() => setActiveServerId('hub')}>
                            <Trophy size={18} className="mr-2" /> Go to Hub
                        </Button>
                        <Button variant="primary" onClick={() => setShowUserSettings(true)}>
                            <Settings size={18} className="mr-2" /> Customize
                        </Button>
                    </div>
                 </div>
             </div>
          );
      }

      if (!activeChannel || !activeServer) return null;

      return (
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
              onUserClick={() => setShowUserProfile(true)}
              density={messageDensity}
          />
      );
  };

  const renderUserSettings = () => {
    const tabs = [
        { id: 'MY_ACCOUNT', label: 'My Account', icon: <Users size={18} /> },
        { id: 'APPEARANCE', label: 'Appearance', icon: <Palette size={18} /> },
        { id: 'VOICE_VIDEO', label: 'Voice & Video', icon: <Mic size={18} /> },
        { id: 'KEYBINDS', label: 'Keybinds', icon: <Keyboard size={18} /> },
        { id: 'STREAMER', label: 'Streamer Mode', icon: <Monitor size={18} /> },
    ];

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col">
                <div className="space-y-1 flex-1">
                    <h3 className="px-3 text-xs font-bold text-slate-500 uppercase mb-2">User Settings</h3>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setUserSettingsTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${userSettingsTab === tab.id ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                    <div className="my-4 border-t border-slate-800" />
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-500"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-800 p-8 overflow-y-auto custom-scrollbar">
                {userSettingsTab === 'MY_ACCOUNT' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-6">My Account</h2>
                        
                        {/* Profile Card */}
                        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                            <div className="h-32 bg-slate-700 relative">
                                <img src={currentUser.banner || 'https://picsum.photos/800/300'} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur">
                                    BETA TESTER
                                </div>
                            </div>
                            <div className="px-6 pb-6">
                                <div className="flex justify-between items-end -mt-10 mb-4">
                                    <Avatar src={currentUser.avatar} size="xl" className="border-4 border-slate-900" />
                                    <Button onClick={() => setShowUserProfile(true)} variant="primary" className="mb-2">Edit Profile</Button>
                                </div>
                                <div className="text-xl font-bold text-white flex items-center gap-2">
                                    {currentUser.username}
                                    <span className="text-nexus-accent text-sm font-normal">#{currentUser.id.padStart(4, '0')}</span>
                                </div>
                                <div className="text-slate-400 text-sm mt-1">{currentUser.email || 'email@hidden.com'}</div>
                            </div>
                        </div>

                        {/* Password & Security */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Password & Authentication</h3>
                            <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-white text-sm">Change Password</div>
                                        <div className="text-xs text-slate-500">Last changed 3 months ago</div>
                                    </div>
                                    <Button variant="secondary" className="text-xs">Change</Button>
                                </div>
                                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-white text-sm">Two-Factor Authentication</div>
                                        <div className="text-xs text-green-500">Enabled</div>
                                    </div>
                                    <Button variant="ghost" className="text-xs text-nexus-accent border border-nexus-accent/20">Manage</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {userSettingsTab === 'APPEARANCE' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
                        
                        {/* Theme Selection */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Theme</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {THEMES.map(theme => (
                                    <button 
                                        key={theme.id}
                                        onClick={() => handleThemeChange(theme.color)}
                                        className="group relative h-24 rounded-xl border-2 border-slate-700 hover:border-white transition-all overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 ${theme.bg}`}></div>
                                        <div className="absolute inset-x-0 bottom-0 h-8 bg-slate-900/80 flex items-center justify-center font-bold text-xs text-white">
                                            {theme.name}
                                        </div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{ backgroundColor: theme.color }}></div>
                                        {/* Checkmark if active? Hard to track active CSS var without reading DOM, skipping visual check for now */}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Display */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Message Display</h3>
                            <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-4">
                                <RadioCard 
                                    title="Comfortable" 
                                    description="Modern look with avatars and spacing." 
                                    selected={messageDensity === 'comfortable'}
                                    onClick={() => setMessageDensity('comfortable')}
                                    color="bg-slate-800"
                                    icon={<MessageSquare size={20} />}
                                />
                                <RadioCard 
                                    title="Compact" 
                                    description="Fit more messages on screen. No avatars." 
                                    selected={messageDensity === 'compact'}
                                    onClick={() => setMessageDensity('compact')}
                                    color="bg-slate-800"
                                    icon={<Hash size={20} />}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {userSettingsTab === 'VOICE_VIDEO' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-6">Voice & Video</h2>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <Select label="Input Device" options={[{ label: 'Default - Microphone', value: 'default' }]} />
                            <Select label="Output Device" options={[{ label: 'Default - Headphones', value: 'default' }]} />
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Input Volume</h3>
                            <div className="flex items-center gap-4">
                                <Volume2 size={20} className="text-slate-400" />
                                <ProgressBar value={voiceConfig.volume} max={100} className="flex-1 h-2 bg-slate-700" />
                                <span className="text-sm font-mono text-white">{voiceConfig.volume}%</span>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                             <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Mic Test</h3>
                             <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500 w-[60%] animate-pulse"></div>
                             </div>
                             <p className="text-xs text-slate-500 mt-2">Speak into your microphone to test.</p>
                        </div>

                        <div>
                             <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Video Settings</h3>
                             <div className="bg-black aspect-video rounded-xl border border-slate-700 flex items-center justify-center relative overflow-hidden">
                                 <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center text-slate-500">
                                     <Camera size={48} className="mb-2" />
                                     <Button variant="secondary" className="text-xs">Preview Camera</Button>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {userSettingsTab === 'KEYBINDS' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-6">Keybinds</h2>
                        <div className="space-y-2">
                             {[
                                { action: 'Push to Talk', keys: ['V'] },
                                { action: 'Toggle Mute', keys: ['Ctrl', 'Shift', 'M'] },
                                { action: 'Toggle Deafen', keys: ['Ctrl', 'Shift', 'D'] },
                                { action: 'Answer Call', keys: ['Ctrl', 'Enter'] },
                                { action: 'Decline Call', keys: ['Esc'] },
                             ].map((bind, i) => (
                                 <div key={i} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-700 hover:border-nexus-accent transition-colors">
                                     <span className="font-bold text-slate-300">{bind.action}</span>
                                     <div className="flex gap-1">
                                         {bind.keys.map(k => <Keycap key={k}>{k}</Keycap>)}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}
                
                {userSettingsTab === 'STREAMER' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-6">Streamer Mode</h2>
                        <div className="bg-nexus-accent/10 border border-nexus-accent/30 p-4 rounded-xl flex items-start gap-4 mb-6">
                            <Monitor className="text-nexus-accent mt-1" />
                            <div>
                                <h3 className="font-bold text-white">Streamer Mode is {true ? 'Enabled' : 'Disabled'}</h3>
                                <p className="text-sm text-slate-400">We automatically hide sensitive details when we detect OBS or XSplit.</p>
                            </div>
                            <Switch checked={true} onChange={() => {}} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-white font-medium">Hide Personal Information</div>
                                    <div className="text-xs text-slate-500">Emails, connected accounts, and notes.</div>
                                </div>
                                <Switch checked={true} onChange={() => {}} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-white font-medium">Hide Invite Links</div>
                                    <div className="text-xs text-slate-500">Prevents randoms from joining your servers.</div>
                                </div>
                                <Switch checked={true} onChange={() => {}} />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-white font-medium">Disable Sounds</div>
                                    <div className="text-xs text-slate-500">Mutes all notification sounds.</div>
                                </div>
                                <Switch checked={false} onChange={() => {}} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderServerSettings = () => {
      if (!activeServer) return null;

      const tabs = [
          { id: 'OVERVIEW', label: 'Overview', icon: <Hash size={18} /> },
          { id: 'ROLES', label: 'Roles', icon: <Shield size={18} /> },
          { id: 'EMOJI', label: 'Emoji', icon: <Smile size={18} /> },
          { id: 'AUDIT', label: 'Audit Log', icon: <FileText size={18} /> },
          { id: 'BANS', label: 'Bans', icon: <X size={18} /> },
      ];

      const selectedRole = activeServer.roles?.find(r => r.id === selectedRoleId);

      return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col">
                <div className="mb-4 px-2">
                    <h2 className="font-bold text-white truncate text-sm uppercase text-slate-500">{activeServer.name}</h2>
                </div>
                <div className="space-y-1 flex-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setServerSettingsTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${serverSettingsTab === tab.id ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                    <div className="my-4 border-t border-slate-800" />
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-500">
                        <Trash2 size={18} />
                        Delete Server
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-slate-800 p-8 overflow-y-auto custom-scrollbar">
                {serverSettingsTab === 'OVERVIEW' && (
                    <div className="space-y-8 animate-fade-in max-w-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">Server Overview</h2>
                        
                        <div className="flex gap-6 items-start">
                            <div className="w-24 h-24 relative group cursor-pointer" onClick={() => serverIconInputRef.current?.click()}>
                                <img src={activeServer.icon} className="w-full h-full rounded-full object-cover border-4 border-slate-900 shadow-lg" />
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                                <input type="file" ref={serverIconInputRef} className="hidden" accept="image/*" onChange={handleServerIconUpload} />
                                <div className="text-[10px] text-center mt-2 text-slate-500">Min 128x128</div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <Input label="Server Name" value={activeServer.name} onChange={(e: any) => handleUpdateServer({ name: e.target.value })} />
                                <Select 
                                    label="Server Region"
                                    value={activeServer.region}
                                    onChange={(e: any) => handleUpdateServer({ region: e.target.value })}
                                    options={[
                                        { label: 'US East', value: 'US-East' },
                                        { label: 'Europe', value: 'EU-West' },
                                        { label: 'Asia', value: 'Asia' },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-700 pt-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Server Banner Background</label>
                            <div 
                                className="h-32 bg-slate-900 rounded-xl border-2 border-dashed border-slate-700 hover:border-nexus-accent flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden group"
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                {activeServer.banner ? (
                                    <img src={activeServer.banner} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-500">
                                        <Upload size={24} className="mb-2" />
                                        <span className="text-xs font-bold">Upload Banner</span>
                                        <span className="text-[10px]">PNG, JPG (Min 960x540)</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                     <span className="font-bold text-white">Change Banner</span>
                                </div>
                            </div>
                            <input type="file" ref={bannerInputRef} className="hidden" onChange={handleServerBannerUpload} />
                        </div>
                    </div>
                )}

                {serverSettingsTab === 'ROLES' && (
                    <div className="flex h-full gap-6 animate-fade-in">
                        {/* Roles List */}
                        <div className="w-48 flex flex-col gap-2">
                             <Button variant="secondary" className="mb-2 text-xs justify-center"><Plus size={14} className="mr-1"/> Create Role</Button>
                             {activeServer.roles?.map(role => (
                                 <button
                                    key={role.id}
                                    onClick={() => setSelectedRoleId(role.id)}
                                    className={`flex items-center justify-between p-2 rounded text-sm transition-colors ${selectedRoleId === role.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                                 >
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                                        <span>{role.name}</span>
                                    </div>
                                    <ChevronLeft size={14} className="rotate-180 opacity-50" />
                                 </button>
                             ))}
                        </div>
                        
                        {/* Role Details */}
                        {selectedRole && (
                             <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-700 p-6 overflow-y-auto custom-scrollbar">
                                 <h3 className="text-xl font-bold text-white mb-6">Edit Role - {selectedRole.name}</h3>
                                 <div className="grid grid-cols-2 gap-6 mb-6">
                                     <Input label="Role Name" value={selectedRole.name} />
                                     <div>
                                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Color</label>
                                         <div className="flex gap-2">
                                             <div className="w-10 h-10 rounded-lg border border-slate-600" style={{ backgroundColor: selectedRole.color }}></div>
                                             <Input type="color" value={selectedRole.color} className="flex-1 p-1 h-10" />
                                         </div>
                                     </div>
                                 </div>
                                 
                                 <div className="border-t border-slate-700 pt-4">
                                     <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Permissions</h4>
                                     <div className="space-y-4">
                                         {[
                                             { label: 'Administrator', desc: 'Grants all permissions. Dangerous!', active: selectedRole.permissions?.includes('ADMINISTRATOR') },
                                             { label: 'View Channels', desc: 'Can view channels by default.', active: true },
                                             { label: 'Send Messages', desc: 'Can send messages in text channels.', active: selectedRole.permissions?.includes('SEND_MESSAGES') },
                                             { label: 'Kick Members', desc: 'Can remove members from the server.', active: selectedRole.permissions?.includes('KICK_MEMBERS') },
                                         ].map((perm, i) => (
                                             <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                                                 <div>
                                                     <div className="text-white font-medium">{perm.label}</div>
                                                     <div className="text-xs text-slate-500">{perm.desc}</div>
                                                 </div>
                                                 <Switch checked={perm.active} onChange={() => {}} />
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                        )}
                    </div>
                )}

                {serverSettingsTab === 'EMOJI' && (
                     <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                             <h2 className="text-2xl font-bold text-white">Server Emojis</h2>
                             <Button variant="primary" className="text-sm"><Upload size={16} className="mr-2"/> Upload Emoji</Button>
                        </div>
                        
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                             {activeServer.emojis?.map(emoji => (
                                 <div key={emoji.id} className="bg-slate-900 rounded-lg p-4 flex flex-col items-center gap-2 border border-slate-700 hover:border-nexus-accent transition-colors group relative">
                                     <img src={emoji.url} className="w-8 h-8 group-hover:scale-125 transition-transform" />
                                     <div className="text-xs text-slate-400 font-mono truncate w-full text-center">:{emoji.name}:</div>
                                     <button className="absolute top-1 right-1 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Trash2 size={12} />
                                     </button>
                                 </div>
                             ))}
                             {/* Mock Emojis if empty */}
                             {(!activeServer.emojis || activeServer.emojis.length === 0) && [1,2,3,4,5].map(i => (
                                 <div key={i} className="bg-slate-900 rounded-lg p-4 flex flex-col items-center gap-2 border border-slate-700 opacity-50">
                                     <div className="w-8 h-8 bg-slate-800 rounded-full"></div>
                                     <div className="w-12 h-2 bg-slate-800 rounded"></div>
                                 </div>
                             ))}
                        </div>
                     </div>
                )}

                {serverSettingsTab === 'AUDIT' && (
                     <div className="space-y-4 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-4">Audit Log</h2>
                        <div className="flex gap-4 mb-4">
                             <Input 
                                placeholder="Filter by User ID" 
                                className="text-sm"
                                value={auditFilterUser}
                                onChange={(e: any) => setAuditFilterUser(e.target.value)}
                             />
                             <Select options={[{ label: 'All Actions', value: 'ALL' }, { label: 'Member Kick', value: 'MEMBER_KICK' }]} className="text-sm" />
                        </div>
                        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                             {MOCK_AUDIT_LOGS.filter(log => !auditFilterUser || log.userId.includes(auditFilterUser)).map(log => (
                                 <div key={log.id} className="flex items-center gap-4 p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors">
                                     <div className="p-2 bg-slate-800 rounded-full text-slate-400">
                                         <Shield size={16} />
                                     </div>
                                     <div className="flex-1">
                                         <div className="flex items-center gap-2">
                                             <span className="font-bold text-white">User {log.userId}</span>
                                             <span className="text-slate-500 text-xs">performed</span>
                                             <span className="text-nexus-accent font-mono text-xs font-bold">{log.action}</span>
                                         </div>
                                         <div className="text-xs text-slate-500">{log.details}</div>
                                     </div>
                                     <div className="text-xs text-slate-600 font-mono">
                                         {log.timestamp.toLocaleDateString()}
                                     </div>
                                 </div>
                             ))}
                        </div>
                     </div>
                )}
            </div>
        </div>
      );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-200 font-sans">
        <ServerSidebar 
            servers={servers} 
            activeServerId={activeServerId} 
            onSelectServer={(id) => { setActiveServerId(id); if(id !== 'hub' && id !== 'home') setActiveChannelId(servers.find(s => s.id === id)?.channels[0].id || ''); }}
            onAddServer={() => setShowCreateServer(true)}
        />
        
        {activeServerId !== 'hub' && activeServerId !== 'home' && (
            <ChannelSidebar 
                server={activeServer}
                activeChannelId={activeChannelId}
                onSelectChannel={setActiveChannelId}
                currentUser={currentUser}
                onOpenSettings={() => setShowUserSettings(true)}
                onOpenProfile={() => setShowUserProfile(true)}
                onOpenServerSettings={() => setShowServerSettings(true)}
                users={MOCK_USERS}
                onJoinVoice={handleJoinVoiceRequest}
            />
        )}

        {renderContent()}

        {/* Create Server Modal (Multi-step) */}
        <Modal isOpen={showCreateServer} onClose={resetCreateServer} title={createStep === 1 ? "Create a Server" : "Customize Your Server"} size={createStep === 1 ? "lg" : "md"}>
            <div className="p-6">
                {createStep === 1 ? (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                             <h3 className="text-xl font-bold text-white mb-2">Choose a template</h3>
                             <p className="text-slate-400">Start fresh or use a template to get set up instantly.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RadioCard 
                                title="Create My Own" 
                                description="Start from scratch for you and your friends."
                                icon={<Plus size={24} />}
                                onClick={() => handleTemplateSelect('CUSTOM')}
                            />
                            <RadioCard 
                                title="Gaming" 
                                description="Dedicated channels for clips, strats, and ranked play."
                                icon={<Gamepad2 size={24} />}
                                onClick={() => handleTemplateSelect('GAMING')}
                            />
                            <RadioCard 
                                title="School Club" 
                                description="Study groups, homework help, and chill zones."
                                icon={<GraduationCap size={24} />}
                                onClick={() => handleTemplateSelect('SCHOOL')}
                            />
                            <RadioCard 
                                title="Friends" 
                                description="A cozy place for memes, music, and hanging out."
                                icon={<Users size={24} />}
                                onClick={() => handleTemplateSelect('SOCIAL')}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-slide-up">
                        {/* Template Summary Preview */}
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6 flex items-start gap-4">
                            <div className="p-3 bg-slate-700 rounded-lg">
                                {createData.template === 'GAMING' && <Gamepad2 className="text-nexus-accent" />}
                                {createData.template === 'SCHOOL' && <GraduationCap className="text-blue-400" />}
                                {createData.template === 'SOCIAL' && <Users className="text-pink-400" />}
                                {createData.template === 'CUSTOM' && <Plus className="text-slate-400" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{TEMPLATE_PRESETS[createData.template]?.label || 'Custom Server'}</h4>
                                <p className="text-xs text-slate-400 mt-1">{TEMPLATE_PRESETS[createData.template]?.description || 'Custom configuration'}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge className="bg-slate-700 text-xs">{TEMPLATE_PRESETS[createData.template]?.channels.length || 0} Channels</Badge>
                                    <Badge className="bg-slate-700 text-xs">{TEMPLATE_PRESETS[createData.template]?.roles.length || 0} Roles</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div 
                                className="w-24 h-24 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:border-nexus-accent hover:text-nexus-accent transition-colors relative overflow-hidden group bg-slate-800"
                                onClick={() => createIconInputRef.current?.click()}
                            >
                                {createData.icon ? (
                                    <img src={createData.icon} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Camera size={24} className="mb-1" />
                                        <span className="text-[10px] uppercase font-bold">Upload</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                                <input type="file" ref={createIconInputRef} className="hidden" accept="image/*" onChange={handleCreateIconUpload} />
                            </div>
                        </div>

                        <Input 
                            label="Server Name" 
                            placeholder="My Awesome Server" 
                            value={createData.name} 
                            onChange={(e: any) => setCreateData({...createData, name: e.target.value})} 
                        />

                        <Select 
                            label="Server Region"
                            value={createData.region}
                            onChange={(e: any) => setCreateData({...createData, region: e.target.value})}
                            options={[
                                { label: 'US East (Virginia)', value: 'US-East' },
                                { label: 'US West (California)', value: 'US-West' },
                                { label: 'Europe (Frankfurt)', value: 'EU-West' },
                                { label: 'Asia (Singapore)', value: 'Asia' },
                            ]}
                        />

                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">Private Server</div>
                                    <div className="text-xs text-slate-500">Only people with an invite link can join.</div>
                                </div>
                                <Switch checked={createData.privacy === 'PRIVATE'} onChange={(checked: boolean) => setCreateData({...createData, privacy: checked ? 'PRIVATE' : 'PUBLIC'})} />
                            </div>
                            <div className="h-px bg-slate-700"></div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">Community Guidelines</div>
                                    <div className="text-xs text-slate-500">Enable default rules to keep things safe.</div>
                                </div>
                                <Switch checked={createData.communityGuidelines} onChange={(checked: boolean) => setCreateData({...createData, communityGuidelines: checked})} />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4 items-center">
                            <button onClick={() => setCreateStep(1)} className="text-slate-500 hover:text-white text-sm flex items-center gap-1 transition-colors">
                                <ChevronLeft size={16} /> Back
                            </button>
                            <Button variant="primary" onClick={handleCreateServer}>Create Server</Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>

        {/* User Profile Modal */}
        <Modal isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} size="lg">
            <Profile user={currentUser} isCurrentUser={true} onClose={() => setShowUserProfile(false)} />
        </Modal>

        {/* User Settings Modal */}
        <Modal isOpen={showUserSettings} onClose={() => setShowUserSettings(false)} size="xl">
            {renderUserSettings()}
        </Modal>

        {/* Server Settings Modal */}
        <Modal isOpen={showServerSettings} onClose={() => setShowServerSettings(false)} size="xl">
            {renderServerSettings()}
        </Modal>

        {/* Voice Join Confirmation Modal */}
        {pendingVoiceChannel && (
            <Modal isOpen={!!pendingVoiceChannel} onClose={() => setPendingVoiceChannel(null)} title="Connect to Voice" size="lg">
                <div className="p-0 flex h-[480px]">
                    {/* Left Panel: Preview */}
                    <div className="w-2/3 bg-black/50 p-6 flex flex-col items-center justify-center relative border-r border-slate-800">
                        {/* Camera Preview */}
                        <div className="w-full aspect-video bg-slate-900 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border border-slate-700 shadow-2xl">
                            {voiceConfig.video ? (
                                <div className="absolute inset-0 bg-slate-800">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                         <div className="animate-pulse flex flex-col items-center gap-2">
                                             <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center"><Camera size={32} className="text-slate-500"/></div>
                                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Camera Preview</span>
                                         </div>
                                    </div>
                                    {/* Mock Camera Feed UI */}
                                    <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> REC
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-slate-600 gap-2">
                                    <VideoOff size={48} />
                                    <span className="font-bold">Camera is Off</span>
                                </div>
                            )}
                            
                            {/* User Avatar Overlay if no video */}
                            {!voiceConfig.video && (
                                <div className="absolute bottom-4 left-4">
                                     <Avatar src={currentUser.avatar} size="md" className="border-2 border-slate-900" />
                                </div>
                            )}
                        </div>

                        {/* Quick Controls */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setVoiceConfig(p => ({ ...p, muted: !p.muted }))}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${voiceConfig.muted ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            >
                                {voiceConfig.muted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button 
                                onClick={() => setVoiceConfig(p => ({ ...p, deafened: !p.deafened }))}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${voiceConfig.deafened ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            >
                                {voiceConfig.deafened ? <VolumeX size={24} /> : <Headphones size={24} />}
                            </button>
                            <button 
                                onClick={() => setVoiceConfig(p => ({ ...p, video: !p.video }))}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${voiceConfig.video ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                            >
                                {voiceConfig.video ? <Video size={24} /> : <VideoOff size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Settings & Info */}
                    <div className="w-1/3 bg-slate-900 p-6 flex flex-col">
                        <div className="mb-6">
                            <h3 className="font-bold text-white text-lg mb-1 truncate">{pendingVoiceChannel.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-nexus-glow font-bold">
                                <Signal size={12} className="animate-pulse" />
                                12ms • US-East
                            </div>
                        </div>

                        <div className="mb-6 flex-1 overflow-y-auto custom-scrollbar">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                <Users size={12} /> Who's Here
                            </h4>
                            <div className="space-y-2">
                                {MOCK_USERS.slice(0, 3).map(u => (
                                    <div key={u.id} className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                                        <Avatar src={u.avatar} size="sm" className="w-6 h-6" />
                                        <span className="text-sm font-bold text-slate-300 truncate">{u.username}</span>
                                    </div>
                                ))}
                                <div className="text-xs text-slate-500 text-center italic mt-2">+ 4 others</div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Input Device</label>
                                <Select 
                                    className="text-xs py-1.5"
                                    value={voiceConfig.inputDevice}
                                    onChange={(e: any) => setVoiceConfig(p => ({ ...p, inputDevice: e.target.value }))}
                                    options={[{ label: 'Default - Microphone', value: 'default' }, { label: 'Yeti Stereo Microphone', value: 'yeti' }]}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Output Device</label>
                                <Select 
                                    className="text-xs py-1.5"
                                    value={voiceConfig.outputDevice}
                                    onChange={(e: any) => setVoiceConfig(p => ({ ...p, outputDevice: e.target.value }))}
                                    options={[{ label: 'Default - Headphones', value: 'default' }, { label: 'External Speakers', value: 'speakers' }]}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-300">Noise Suppression</div>
                                <Switch checked={voiceConfig.noiseSuppression} onChange={(c: boolean) => setVoiceConfig(p => ({ ...p, noiseSuppression: c }))} />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <Button variant="ghost" className="flex-1" onClick={() => setPendingVoiceChannel(null)}>Cancel</Button>
                            <Button variant="success" className="flex-1" onClick={confirmVoiceJoin}>Join Voice</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default Dashboard;
