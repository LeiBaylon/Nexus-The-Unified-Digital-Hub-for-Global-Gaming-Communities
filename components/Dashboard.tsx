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
  Signal, Video, VideoOff, MicOff, VolumeX, Headphones
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

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [servers, setServers] = useState<Server[]>(MOCK_SERVERS);
  const [activeServerId, setActiveServerId] = useState<string>('nexus-home');
  const [activeChannelId, setActiveChannelId] = useState<string>('gen');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  
  // UI States
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [userSettingsTab, setUserSettingsTab] = useState('MY_ACCOUNT');

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

  // Server Settings State
  const [serverSettingsTab, setServerSettingsTab] = useState('OVERVIEW');
  // Roles State
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleTab, setRoleTab] = useState<'DISPLAY' | 'PERMISSIONS' | 'MEMBERS'>('DISPLAY');
  // Emoji State
  const [emojiTab, setEmojiTab] = useState<'EMOJI' | 'STICKERS'>('EMOJI');
  // Audit Log State
  const [auditFilterUser, setAuditFilterUser] = useState<string>('');
  const [auditFilterAction, setAuditFilterAction] = useState<string>('');
  
  // Refs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
                    <div className="text-6xl mb-4">👋</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Home, {currentUser.username}</h2>
                    <p>Select a server or start a conversation.</p>
                 </div>
             </div>
          );
      }

      if (!activeChannel || !activeServer) return null;

      return (
          <ChatInterface 
              channel={activeChannel}
              messages={messages} // In a real app, filter by channelId
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onUpdateMessage={handleUpdateMessage}
              onClearMessages={handleClearMessages}
              onDeleteMessage={handleDeleteMessage}
              onAddReaction={handleAddReaction}
              users={MOCK_USERS} // In a real app, use server.members
              onPlaySound={handlePlaySound}
              onUserClick={() => setShowUserProfile(true)}
              density="comfortable"
          />
      );
  };

  const PERMISSION_GROUPS = [
    {
      name: "General Server Permissions",
      perms: [
        { id: "VIEW_CHANNELS", label: "View Channels", desc: "Allows members to view channels by default." },
        { id: "MANAGE_CHANNELS", label: "Manage Channels", desc: "Allows members to create, edit, or delete channels." },
        { id: "MANAGE_ROLES", label: "Manage Roles", desc: "Allows members to create new roles and edit roles lower than their own." },
        { id: "MANAGE_EMOJIS", label: "Manage Emojis", desc: "Allows members to upload and delete custom emojis." },
      ]
    },
    {
      name: "Membership Permissions",
      perms: [
        { id: "CREATE_INVITE", label: "Create Invite", desc: "Allows members to invite new people to this server." },
        { id: "KICK_MEMBERS", label: "Kick Members", desc: "Allows members to remove other members from this server." },
        { id: "BAN_MEMBERS", label: "Ban Members", desc: "Allows members to permanently ban other members from this server." },
      ]
    },
    {
      name: "Text Channel Permissions",
      perms: [
        { id: "SEND_MESSAGES", label: "Send Messages", desc: "Allows members to send messages in text channels." },
        { id: "EMBED_LINKS", label: "Embed Links", desc: "Links sent by users with this permission will have a preview." },
        { id: "ATTACH_FILES", label: "Attach Files", desc: "Allows members to upload files or media." },
        { id: "ADD_REACTIONS", label: "Add Reactions", desc: "Allows members to add new reactions to a message." },
      ]
    },
    {
       name: "Voice Channel Permissions",
       perms: [
         { id: "CONNECT", label: "Connect", desc: "Allows members to join voice channels." },
         { id: "SPEAK", label: "Speak", desc: "Allows members to talk in voice channels." },
         { id: "MUTE_MEMBERS", label: "Mute Members", desc: "Allows members to mute other members in voice channels." },
         { id: "DEAFEN_MEMBERS", label: "Deafen Members", desc: "Allows members to deafen other members in voice channels." },
       ]
    }
  ];

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