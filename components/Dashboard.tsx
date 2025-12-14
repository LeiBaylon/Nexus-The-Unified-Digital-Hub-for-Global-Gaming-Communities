
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
  Mic, Volume2, Keyboard, Monitor, Laptop, MousePointer
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
  
  // Refs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createIconInputRef = useRef<HTMLInputElement>(null);

  const activeServer = servers.find(s => s.id === activeServerId);
  const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId);

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

  const handleJoinVoice = (channel: Channel) => {
      setActiveChannelId(channel.id);
      // Feedback sound for joining voice
      const sound = SOUND_EFFECTS.find(s => s.label === 'Level Up');
      if (sound) handlePlaySound(sound);
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
                onJoinVoice={handleJoinVoice}
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
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {serverSettingsTab === 'OVERVIEW' && 'Server Overview'}
                            {serverSettingsTab === 'ROLES' && 'Roles'}
                            {serverSettingsTab === 'EMOJIS' && 'Emoji'}
                            {serverSettingsTab === 'AUDIT_LOG' && 'Audit Log'}
                        </h2>

                        {/* --- CONTENT FROM SNIPPET --- */}
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
                             <div className="space-y-4 animate-fade-in">
                                 <div className="flex justify-between items-center mb-4">
                                     <p className="text-slate-400 text-sm">Use roles to group server members and assign permissions.</p>
                                     <Button variant="primary" className="text-xs flex items-center gap-2"><Plus size={14} /> Create Role</Button>
                                 </div>
                                 <div className="space-y-2">
                                     {activeServer.roles?.map(role => (
                                         <div key={role.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors group cursor-pointer">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role.color }}></div>
                                                 <span className="font-bold text-white">{role.name}</span>
                                             </div>
                                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button className="p-2 hover:bg-slate-700 rounded text-slate-400"><Settings size={14}/></button>
                                                 <button className="p-2 hover:bg-red-500/10 rounded text-red-400"><Trash2 size={14}/></button>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                        )}

                        {serverSettingsTab === 'EMOJIS' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-slate-800/50 border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-nexus-accent hover:bg-slate-800 transition-all">
                                    <Smile size={48} className="text-slate-500 mb-4" />
                                    <h3 className="text-lg font-bold text-white">Upload Emoji</h3>
                                    <p className="text-sm text-slate-400">Drag & drop or click to upload</p>
                                    <div className="text-xs text-slate-500 mt-2">Recommended: 256x256, PNG or GIF</div>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-wider text-slate-500">Server Emojis ({activeServer.emojis?.length || 0})</h3>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                        {activeServer.emojis?.map(emoji => (
                                            <div key={emoji.id} className="aspect-square bg-slate-800 rounded-lg flex items-center justify-center relative group">
                                                <img src={emoji.url} alt={emoji.name} className="w-10 h-10 object-contain" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity gap-2">
                                                    <button className="text-white hover:text-red-400"><Trash2 size={16}/></button>
                                                </div>
                                                <div className="absolute bottom-1 text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100">:{emoji.name}:</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {serverSettingsTab === 'AUDIT_LOG' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex gap-4 mb-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                                        <input className="w-full bg-slate-800 border border-slate-700 rounded pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-nexus-accent" placeholder="Search user, action..." />
                                    </div>
                                    <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white hover:bg-slate-700">Filter</button>
                                </div>
                                <div className="space-y-2">
                                    {MOCK_AUDIT_LOGS.map(log => (
                                        <div key={log.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded border-l-4 border-nexus-accent hover:bg-slate-800 transition-colors">
                                             <div className="p-2 bg-slate-700 rounded-full text-slate-300">
                                                 <Activity size={16} />
                                             </div>
                                             <div className="flex-1">
                                                 <div className="text-sm text-white">
                                                     <span className="font-bold text-nexus-accent">{log.userId === '1' ? 'Kaelthas' : log.userId}</span> {log.action.replace('_', ' ').toLowerCase()} <span className="font-bold">{log.targetType?.toLowerCase()}</span>
                                                 </div>
                                                 <div className="text-xs text-slate-500">{log.details}</div>
                                             </div>
                                             <div className="text-xs text-slate-500 font-mono">
                                                 {log.timestamp.toLocaleDateString()}
                                             </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};

export default Dashboard;
