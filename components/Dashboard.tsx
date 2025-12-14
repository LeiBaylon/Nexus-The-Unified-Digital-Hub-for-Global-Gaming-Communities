import React, { useState, useRef, useEffect } from 'react';
import { User, Server, Channel, Message, SoundEffect, Role } from '../types';
import { MOCK_SERVERS, INITIAL_MESSAGES, MOCK_USERS, MOCK_AUDIT_LOGS, SOUND_EFFECTS } from '../constants';
import { ServerSidebar, ChannelSidebar } from './Sidebars';
import { ChatInterface } from './ChatInterface';
import { GamingHub } from './GamingHub';
import Profile from './Profile';
import { Modal, Button, Input, Switch, Tabs, Avatar, ConfirmModal, Select, RadioCard, ProgressBar, Keycap } from './UIComponents';
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
      
      let defaultChannels: Channel[] = [
          { id: `gen-${Date.now()}`, name: 'general', type: 'TEXT' }
      ];

      // Template Logic
      if (createData.template === 'GAMING') {
          defaultChannels.push(
              { id: `clips-${Date.now()}`, name: 'clips', type: 'TEXT' },
              { id: `strat-${Date.now()}`, name: 'strategies', type: 'TEXT' },
              { id: `lobby-${Date.now()}`, name: 'Lobby', type: 'VOICE' },
              { id: `ranked-${Date.now()}`, name: 'Ranked', type: 'VOICE' }
          );
      } else if (createData.template === 'SOCIAL') {
          defaultChannels.push(
              { id: `memes-${Date.now()}`, name: 'memes', type: 'TEXT' },
              { id: `music-${Date.now()}`, name: 'music', type: 'TEXT' },
              { id: `lounge-${Date.now()}`, name: 'Lounge', type: 'VOICE' }
          );
      } else if (createData.template === 'CLAN') {
          defaultChannels.push(
              { id: `announcements-${Date.now()}`, name: 'announcements', type: 'TEXT' },
              { id: `war-room-${Date.now()}`, name: 'War Room', type: 'VOICE' }
          );
      }

      const newServer: Server = {
          id: `server-${Date.now()}`,
          name: createData.name,
          icon: createData.icon || `https://picsum.photos/seed/${createData.name}/100/100`,
          channels: defaultChannels,
          region: createData.region,
          roles: [],
          emojis: []
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

        {/* User Settings Modal */}
        <Modal isOpen={showUserSettings} onClose={() => setShowUserSettings(false)} title="User Settings" size="lg">
             <div className="flex h-[500px]">
                 <div className="w-48 border-r border-slate-700 p-2 space-y-1">
                     <button onClick={() => setUserSettingsTab('MY_ACCOUNT')} className={`w-full text-left px-3 py-2 rounded font-bold text-sm ${userSettingsTab === 'MY_ACCOUNT' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>My Account</button>
                     <button onClick={() => setUserSettingsTab('PRIVACY')} className={`w-full text-left px-3 py-2 rounded text-sm ${userSettingsTab === 'PRIVACY' ? 'bg-nexus-accent text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Privacy & Safety</button>
                     <button onClick={() => setUserSettingsTab('APPS')} className={`w-full text-left px-3 py-2 rounded text-sm ${userSettingsTab === 'APPS' ? 'bg-nexus-accent text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Authorized Apps</button>
                     <div className="h-px bg-slate-700 my-2"></div>
                     <button onClick={() => setUserSettingsTab('VOICE')} className={`w-full text-left px-3 py-2 rounded text-sm ${userSettingsTab === 'VOICE' ? 'bg-nexus-accent text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Voice & Video</button>
                     <button onClick={() => setUserSettingsTab('NOTIFICATIONS')} className={`w-full text-left px-3 py-2 rounded text-sm ${userSettingsTab === 'NOTIFICATIONS' ? 'bg-nexus-accent text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Notifications</button>
                     <button onClick={() => setUserSettingsTab('KEYBINDS')} className={`w-full text-left px-3 py-2 rounded text-sm ${userSettingsTab === 'KEYBINDS' ? 'bg-nexus-accent text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>Keybinds</button>
                     <div className="h-px bg-slate-700 my-2"></div>
                     <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded hover:bg-red-500/10 text-red-400 text-sm flex items-center gap-2">
                         <LogOut size={14} /> Log Out
                     </button>
                 </div>
                 <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                     {userSettingsTab === 'MY_ACCOUNT' && (
                         <div className="animate-fade-in">
                             <h3 className="text-lg font-bold text-white mb-6">My Account</h3>
                             <Profile user={currentUser} isCurrentUser={true} />
                         </div>
                     )}
                     
                     {userSettingsTab === 'PRIVACY' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Privacy & Safety</h3>
                            
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase">Safe Direct Messaging</h4>
                                <RadioCard title="Keep me safe" description="Scan direct messages from everyone." selected={true} onClick={()=>{}} color="bg-green-500" icon={<Shield size={20}/>} />
                                <RadioCard title="My friends are nice" description="Scan direct messages from everyone unless they are a friend." selected={false} onClick={()=>{}} color="bg-yellow-500" icon={<Users size={20}/>} />
                                <RadioCard title="I live on the edge" description="Do not scan direct messages. (Not recommended)" selected={false} onClick={()=>{}} color="bg-red-500" icon={<Activity size={20}/>} />
                            </div>

                            <div className="h-px bg-slate-800" />

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-400 uppercase">Server Privacy Defaults</h4>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-200">Allow direct messages from server members</div>
                                    <Switch checked={true} onChange={()=>{}} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-200">Allow joining game activity</div>
                                    <Switch checked={true} onChange={()=>{}} />
                                </div>
                            </div>
                        </div>
                     )}

                     {userSettingsTab === 'APPS' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Authorized Apps</h3>
                            <div className="space-y-2">
                                {[{name: 'Spotify', date: 'Oct 24, 2024'}, {name: 'Steam', date: 'Sep 12, 2024'}, {name: 'Twitch', date: 'Aug 05, 2024'}].map(app => (
                                    <div key={app.name} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                                        <div>
                                            <div className="font-bold text-white">{app.name}</div>
                                            <div className="text-xs text-slate-500">Authorized on {app.date}</div>
                                        </div>
                                        <Button variant="danger" className="py-1 px-3 text-xs">Deauthorize</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}

                     {userSettingsTab === 'VOICE' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Voice & Video</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Input Device" options={[{label: 'Default - Microphone (Yeti Stereo)', value: 'default'}]} />
                                <Select label="Output Device" options={[{label: 'Default - Headphones (HyperX Cloud)', value: 'default'}]} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Input Volume</label>
                                <ProgressBar value={75} max={100} className="h-2 bg-slate-800" />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Output Volume</label>
                                <ProgressBar value={40} max={100} className="h-2 bg-slate-800" />
                            </div>

                            <div className="h-px bg-slate-800" />

                            <h4 className="text-sm font-bold text-slate-400 uppercase">Video Settings</h4>
                            <Select label="Camera" options={[{label: 'OBS Virtual Camera', value: 'obs'}, {label: 'Logitech Brio', value: 'brio'}]} />
                            
                            <div className="bg-black aspect-video rounded-lg flex items-center justify-center border border-slate-700">
                                <div className="text-slate-500 text-sm flex items-center gap-2"><Camera size={16}/> Preview Hidden</div>
                            </div>
                        </div>
                     )}

                     {userSettingsTab === 'NOTIFICATIONS' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Notifications</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">Enable Desktop Notifications</div>
                                        <div className="text-xs text-slate-500">Get a push notification when you're not looking.</div>
                                    </div>
                                    <Switch checked={true} onChange={()=>{}} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">Enable Unread Message Badge</div>
                                        <div className="text-xs text-slate-500">Show a red badge on the app icon.</div>
                                    </div>
                                    <Switch checked={true} onChange={()=>{}} />
                                </div>
                                 <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-slate-200">Text-to-Speech Notifications</div>
                                        <div className="text-xs text-slate-500">Have a robot read your messages to you.</div>
                                    </div>
                                    <Switch checked={false} onChange={()=>{}} />
                                </div>
                            </div>
                        </div>
                     )}

                     {userSettingsTab === 'KEYBINDS' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Keybinds</h3>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <span className="font-bold text-slate-300">Push to Talk</span>
                                    <div className="flex gap-1"><Keycap>MOUSE4</Keycap></div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <span className="font-bold text-slate-300">Toggle Mute</span>
                                    <div className="flex gap-1"><Keycap>CTRL</Keycap> <Keycap>SHIFT</Keycap> <Keycap>M</Keycap></div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <span className="font-bold text-slate-300">Toggle Deafen</span>
                                    <div className="flex gap-1"><Keycap>CTRL</Keycap> <Keycap>SHIFT</Keycap> <Keycap>D</Keycap></div>
                                </div>
                                <Button variant="secondary" className="w-full text-xs dashed border-slate-600"><Plus size={14}/> Add Keybind</Button>
                            </div>
                        </div>
                     )}
                 </div>
             </div>
        </Modal>

        {/* Server Settings Modal */}
        {activeServer && (
            <Modal isOpen={showServerSettings} onClose={() => setShowServerSettings(false)} size="xl">
                <div className="flex h-[600px] bg-slate-900 text-slate-200 rounded-xl overflow-hidden">
                    <div className="w-60 bg-slate-950 p-4 flex flex-col border-r border-slate-800">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 px-2">{activeServer.name}</div>
                        <div className="space-y-1 flex-1">
                            <button onClick={() => setServerSettingsTab('OVERVIEW')} className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${serverSettingsTab === 'OVERVIEW' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>Overview</button>
                            <button onClick={() => setServerSettingsTab('ROLES')} className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${serverSettingsTab === 'ROLES' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>Roles</button>
                            <button onClick={() => setServerSettingsTab('EMOJIS')} className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${serverSettingsTab === 'EMOJIS' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>Emoji</button>
                            <button onClick={() => setServerSettingsTab('AUDIT_LOG')} className={`w-full text-left px-3 py-2 rounded text-sm font-medium ${serverSettingsTab === 'AUDIT_LOG' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>Audit Log</button>
                            <div className="h-px bg-slate-800 my-2"></div>
                            <button className="w-full text-left px-3 py-2 rounded text-sm font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                <Trash2 size={14} /> Delete Server
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 p-0 overflow-hidden flex flex-col">
                        <div className="p-8 pb-0">
                            <h2 className="text-2xl font-bold text-white mb-6">
                                {serverSettingsTab === 'OVERVIEW' && 'Server Overview'}
                                {serverSettingsTab === 'ROLES' && 'Roles'}
                                {serverSettingsTab === 'EMOJIS' && 'Emoji'}
                                {serverSettingsTab === 'AUDIT_LOG' && 'Audit Log'}
                            </h2>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8">
                            {serverSettingsTab === 'OVERVIEW' && (
                                <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                                    {/* Banner Section */}
                                    <div className="relative mb-10">
                                        <div className="group rounded-xl overflow-hidden h-32 bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer hover:border-nexus-accent transition-colors relative" onClick={() => bannerInputRef.current?.click()}>
                                            {activeServer.banner ? (
                                                <img src={activeServer.banner} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-500 group-hover:text-nexus-accent">
                                                    <ImageIcon size={32} className="mb-2" />
                                                    <span className="text-xs font-bold uppercase">Upload Banner</span>
                                                </div>
                                            )}
                                            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleServerBannerUpload} />
                                        </div>
                                        
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
                                            <Select 
                                                label="Region"
                                                value={activeServer.region} 
                                                onChange={(e: any) => handleUpdateServer({ region: e.target.value })}
                                                options={[
                                                    { label: 'US East', value: 'US East' },
                                                    { label: 'US West', value: 'US West' },
                                                    { label: 'EU West', value: 'EU West' },
                                                    { label: 'Asia', value: 'Asia' },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                                            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                <span>Operational</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-4">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2"><Settings size={14}/> Widget Settings</h4>
                                        
                                        <div>
                                            <Select 
                                                label="System Messages Channel"
                                                value={activeServer.systemChannelId || ''} 
                                                onChange={(e: any) => handleUpdateServer({ systemChannelId: e.target.value })}
                                                options={[
                                                    { label: 'No System Messages', value: '' },
                                                    ...activeServer.channels.filter(c => c.type === 'TEXT').map(c => ({ label: `#${c.name}`, value: c.id }))
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <Select 
                                                label="AFK Voice Channel"
                                                value={activeServer.afkChannelId || ''} 
                                                onChange={(e: any) => handleUpdateServer({ afkChannelId: e.target.value })}
                                                options={[
                                                    { label: 'No AFK Channel', value: '' },
                                                    ...activeServer.channels.filter(c => c.type === 'VOICE').map(c => ({ label: `🔊 ${c.name}`, value: c.id }))
                                                ]}
                                            />
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
                                <div className="flex h-full gap-4 animate-fade-in pb-4">
                                    {/* Roles List Sidebar */}
                                    <div className="w-48 bg-slate-950/50 rounded-lg border border-slate-700/50 flex flex-col overflow-hidden">
                                        <div className="p-3 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Roles</span>
                                            <button className="text-nexus-accent hover:text-white" title="Create Role"><Plus size={14}/></button>
                                        </div>
                                        <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                                            {activeServer.roles?.map(role => (
                                                <div 
                                                    key={role.id}
                                                    onClick={() => setSelectedRoleId(role.id)}
                                                    className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm font-medium group transition-colors ${selectedRoleId === role.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: role.color }}></div>
                                                        <span className="truncate">{role.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Role Details */}
                                    <div className="flex-1 flex flex-col">
                                        {selectedRoleId && activeServer.roles ? (
                                            <>
                                                <div className="mb-6 flex gap-1 bg-slate-800 p-1 rounded-lg w-fit">
                                                    <button onClick={() => setRoleTab('DISPLAY')} className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${roleTab === 'DISPLAY' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>Display</button>
                                                    <button onClick={() => setRoleTab('PERMISSIONS')} className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${roleTab === 'PERMISSIONS' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>Permissions</button>
                                                    <button onClick={() => setRoleTab('MEMBERS')} className={`px-4 py-1.5 rounded text-xs font-bold transition-colors ${roleTab === 'MEMBERS' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>Manage Members</button>
                                                </div>

                                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                                    {roleTab === 'DISPLAY' && (
                                                        <div className="space-y-6 animate-fade-in">
                                                            <div className="max-w-md space-y-4">
                                                                <Input label="Role Name" value={activeServer.roles.find(r => r.id === selectedRoleId)?.name} />
                                                                
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role Color</label>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-16 h-10 rounded border border-slate-700" style={{ backgroundColor: activeServer.roles.find(r => r.id === selectedRoleId)?.color }}></div>
                                                                        <div className="flex-1 grid grid-cols-6 gap-2">
                                                                            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b'].map(color => (
                                                                                <button key={color} className="w-6 h-6 rounded-full hover:scale-110 transition-transform ring-1 ring-white/10" style={{ backgroundColor: color }} />
                                                                            ))}
                                                                            <button className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white"><Settings size={12}/></button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="h-px bg-slate-700 my-4" />

                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="text-sm font-bold text-white">Display role members separately</div>
                                                                        <div className="text-xs text-slate-500">Members will be grouped by this role in the member list.</div>
                                                                    </div>
                                                                    <Switch checked={activeServer.roles.find(r => r.id === selectedRoleId)?.isHoisted} />
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="text-sm font-bold text-white">Allow anyone to @mention this role</div>
                                                                        <div className="text-xs text-slate-500">Members can use @{activeServer.roles.find(r => r.id === selectedRoleId)?.name} to notify all members.</div>
                                                                    </div>
                                                                    <Switch checked={false} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {roleTab === 'PERMISSIONS' && (
                                                        <div className="space-y-8 animate-fade-in">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                                                <input className="w-full bg-slate-950 border border-slate-800 rounded px-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-nexus-accent" placeholder="Search permissions..." />
                                                            </div>
                                                            
                                                            {PERMISSION_GROUPS.map((group, idx) => (
                                                                <div key={idx} className="space-y-4">
                                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">{group.name}</h3>
                                                                    {group.perms.map(perm => {
                                                                       const role = activeServer.roles?.find(r => r.id === selectedRoleId);
                                                                       const hasPerm = role?.permissions?.includes(perm.id) || role?.permissions?.includes('ADMINISTRATOR');
                                                                       return (
                                                                         <div key={perm.id} className="flex items-center justify-between py-1">
                                                                             <div className="pr-4">
                                                                                 <div className="text-sm font-bold text-slate-200">{perm.label}</div>
                                                                                 <div className="text-xs text-slate-500">{perm.desc}</div>
                                                                             </div>
                                                                             <Switch checked={!!hasPerm} />
                                                                         </div>
                                                                       );
                                                                    })}
                                                                </div>
                                                            ))}
                                                            
                                                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-between mt-8">
                                                                <div>
                                                                    <div className="text-sm font-bold text-red-400 flex items-center gap-2"><Shield size={14} /> Administrator</div>
                                                                    <div className="text-xs text-red-300/70">Members with this permission have every permission and can bypass channel specific permissions.</div>
                                                                </div>
                                                                <Switch checked={activeServer.roles?.find(r => r.id === selectedRoleId)?.permissions?.includes('ADMINISTRATOR')} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {roleTab === 'MEMBERS' && (
                                                        <div className="animate-fade-in">
                                                            <div className="flex items-center justify-between mb-4 bg-slate-800 p-3 rounded-lg">
                                                                <div className="text-sm text-slate-300">
                                                                    Members with this role: <span className="font-bold text-white">0</span>
                                                                </div>
                                                                <Button variant="secondary" className="text-xs h-8">Add Members</Button>
                                                            </div>
                                                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                                                <Users size={48} className="mb-4 opacity-20" />
                                                                <p className="text-sm">No members assigned to this role yet.</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-500">Select a role to edit</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {serverSettingsTab === 'EMOJIS' && (
                                <div className="space-y-6 animate-fade-in h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setEmojiTab('EMOJI')}
                                                className={`pb-2 text-sm font-bold transition-colors border-b-2 ${emojiTab === 'EMOJI' ? 'border-nexus-accent text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                                            >
                                                Emoji
                                            </button>
                                            <button 
                                                onClick={() => setEmojiTab('STICKERS')}
                                                className={`pb-2 text-sm font-bold transition-colors border-b-2 ${emojiTab === 'STICKERS' ? 'border-nexus-accent text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                                            >
                                                Stickers
                                            </button>
                                        </div>
                                        <div className="text-xs font-mono text-slate-500">
                                            Slots Used: <span className="text-white font-bold">{activeServer.emojis?.length || 0}</span> / 50
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-nexus-accent hover:bg-slate-800 transition-all group">
                                        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                            <Upload size={24} className="text-slate-400 group-hover:text-nexus-accent transition-colors" />
                                        </div>
                                        <h3 className="text-sm font-bold text-white">Upload {emojiTab === 'EMOJI' ? 'Emoji' : 'Sticker'}</h3>
                                        <p className="text-xs text-slate-400 mt-1">256KB max size. JPG, PNG, GIF</p>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {emojiTab === 'EMOJI' ? (
                                            <>
                                                {(!activeServer.emojis || activeServer.emojis.length === 0) ? (
                                                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                                                        <Smile size={32} className="mb-2 opacity-20" />
                                                        <p className="text-sm">No custom emojis yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        {activeServer.emojis.map(emoji => (
                                                            <div key={emoji.id} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-600 transition-all group">
                                                                <img src={emoji.url} alt={emoji.name} className="w-8 h-8 object-contain" />
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-xs font-bold text-white truncate">:{emoji.name}:</div>
                                                                    <div className="text-[10px] text-slate-500 truncate">by {MOCK_USERS.find(u => u.id === emoji.creatorId)?.username || 'User'}</div>
                                                                </div>
                                                                <button className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                                                <div className="w-16 h-16 bg-slate-800/50 rounded-lg flex items-center justify-center mb-3">
                                                    <ImageIcon size={32} className="opacity-20" />
                                                </div>
                                                <p className="text-sm mb-2">No stickers uploaded.</p>
                                                <Button variant="secondary" className="text-xs">Browse Shop</Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {serverSettingsTab === 'AUDIT_LOG' && (
                                <div className="space-y-4 animate-fade-in h-full flex flex-col">
                                    <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                                        <div className="relative flex-1 min-w-[200px]">
                                            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                                            <input 
                                                className="w-full bg-slate-950 border border-slate-700 rounded pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-nexus-accent" 
                                                placeholder="Search logs..." 
                                            />
                                        </div>
                                        <div className="relative w-40">
                                            <select 
                                                className="w-full bg-slate-950 border border-slate-700 rounded pl-2 pr-8 py-2 text-xs text-slate-300 focus:outline-none focus:border-nexus-accent appearance-none"
                                                value={auditFilterUser}
                                                onChange={(e) => setAuditFilterUser(e.target.value)}
                                            >
                                                <option value="">All Users</option>
                                                <option value="1">Kaelthas</option>
                                                <option value="Nexus AI">Nexus AI</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" />
                                        </div>
                                        <div className="relative w-40">
                                             <select 
                                                className="w-full bg-slate-950 border border-slate-700 rounded pl-2 pr-8 py-2 text-xs text-slate-300 focus:outline-none focus:border-nexus-accent appearance-none"
                                                value={auditFilterAction}
                                                onChange={(e) => setAuditFilterAction(e.target.value)}
                                            >
                                                <option value="">All Actions</option>
                                                <option value="CREATE">Creation</option>
                                                <option value="UPDATE">Updates</option>
                                                <option value="DELETE">Deletions</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-4">
                                        {MOCK_AUDIT_LOGS.map(log => {
                                            const isCreate = log.action.includes('CREATE') || log.action.includes('ADD');
                                            const isDelete = log.action.includes('DELETE') || log.action.includes('REMOVE') || log.action.includes('BAN') || log.action.includes('KICK');
                                            const colorClass = isCreate ? 'text-green-400 bg-green-500/10' : isDelete ? 'text-red-400 bg-red-500/10' : 'text-blue-400 bg-blue-500/10';
                                            const Icon = isCreate ? Plus : isDelete ? Trash2 : FileText;

                                            return (
                                                <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                                                     <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${colorClass}`}>
                                                         <Icon size={14} />
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                         <div className="flex items-center gap-2 mb-1">
                                                             <span className="font-bold text-nexus-accent text-sm hover:underline cursor-pointer">
                                                                {MOCK_USERS.find(u => u.id === log.userId)?.username || log.userId}
                                                             </span>
                                                             <span className="text-xs text-slate-400">
                                                                {log.action.replace(/_/g, ' ').toLowerCase()}
                                                             </span>
                                                             <span className="font-bold text-white text-sm">
                                                                {log.targetType?.toLowerCase()}
                                                             </span>
                                                         </div>
                                                         {log.details && (
                                                             <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800 font-mono">
                                                                 {log.details}
                                                             </div>
                                                         )}
                                                     </div>
                                                     <div className="flex flex-col items-end gap-1">
                                                         <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                                             <Clock size={10} />
                                                             {log.timestamp.toLocaleDateString()}
                                                         </div>
                                                         <div className="text-[10px] text-slate-600">ID: {log.id}</div>
                                                     </div>
                                                </div>
                                            );
                                        })}
                                        <div className="text-center pt-4">
                                            <Button variant="ghost" className="text-xs text-slate-500"><Download size={14} className="mr-2"/> Export Logs</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default Dashboard;