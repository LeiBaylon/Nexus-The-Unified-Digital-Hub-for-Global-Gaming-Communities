
import React, { useState, useEffect } from 'react';
import { ServerSidebar, ChannelSidebar } from './Sidebars';
import { ChatInterface } from './ChatInterface';
import { GamingHub } from './GamingHub';
import Profile from './Profile';
import { Modal, Button, Badge, Input, Switch, Keycap, RadioCard } from './UIComponents';
import { MOCK_SERVERS, MOCK_USERS, INITIAL_MESSAGES, LOOT_ITEMS } from '../constants';
import { User, Message, SoundEffect, InventoryItem, Server } from '../types';
import { Gift, Shield, User as UserIcon, Keyboard, Palette, LogOut, Check, Plus, UploadCloud, Monitor, RefreshCw, X } from 'lucide-react';

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
  devMode: false
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
  const [settingsTab, setSettingsTab] = useState<'PROFILE' | 'APPEARANCE' | 'KEYBINDS'>('PROFILE');
  
  const [isLootModalOpen, setIsLootModalOpen] = useState(false);
  const [isCreateServerOpen, setIsCreateServerOpen] = useState(false);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<User | null>(null);
  
  // App Preferences State
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [keybinds, setKeybinds] = useState(DEFAULT_KEYBINDS);
  const [rebindId, setRebindId] = useState<string | null>(null);

  // Create Server Form State
  const [newServerName, setNewServerName] = useState('');
  
  // Loot State
  const [openingLoot, setOpeningLoot] = useState(false);
  const [lootResult, setLootResult] = useState<InventoryItem | null>(null);

  const activeServer = servers.find(s => s.id === activeServerId);
  const activeChannel = activeServer?.channels.find(c => c.id === activeChannelId) || {
    id: activeChannelId,
    name: activeServerId === 'home' ? 'Direct Message' : 'unknown',
    type: 'TEXT'
  };

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
        audio.volume = 0.5;
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

    const newServer: Server = {
      id: `server-${Date.now()}`,
      name: newServerName,
      icon: `https://picsum.photos/seed/${Date.now()}/100/100`, // Random generic icon
      channels: [
        { id: `c-${Date.now()}-1`, name: 'general', type: 'TEXT' },
        { id: `c-${Date.now()}-2`, name: 'clips', type: 'TEXT' },
        { id: `c-${Date.now()}-3`, name: 'Lounge', type: 'VOICE' }
      ]
    };

    setServers([...servers, newServer]);
    setNewServerName('');
    setIsCreateServerOpen(false);
    handleSelectServer(newServer.id);
  };

  const openProfile = (userId: string) => {
     const user = MOCK_USERS.find(u => u.id === userId) || (userId === currentUser.id ? currentUser : null);
     if (user) setViewingProfile(user);
  };
  
  const handleMessageUser = (userId: string) => {
    // Navigate to home/DM view
    setViewingProfile(null);
    setActiveServerId('home');
    setActiveView('CHAT');
    setActiveChannelId('dm-nexus');
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
               onOpenServerSettings={() => setIsServerSettingsOpen(true)}
               users={MOCK_USERS}
            />

            <ChatInterface 
               channel={activeChannel}
               messages={messages}
               currentUser={currentUser}
               onSendMessage={handleSendMessage}
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
         className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center animate-bounce hover:scale-110 transition-transform z-30 group"
      >
         <Gift className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Loot Modal */}
      <Modal isOpen={isLootModalOpen} onClose={() => setIsLootModalOpen(false)} title="Daily Loot Drop">
         <div className="flex flex-col items-center justify-center py-10 min-h-[300px]">
            {!lootResult && !openingLoot && (
               <>
                  <Gift size={100} className="text-nexus-accent mb-8 animate-pulse" />
                  <p className="text-xl text-center mb-8">You have a Legendary Lootbox waiting!</p>
                  <Button onClick={handleOpenLoot} className="text-xl px-12 py-4">OPEN NOW</Button>
               </>
            )}
            
            {openingLoot && (
               <div className="animate-spin-slow">
                  <div className="w-32 h-32 bg-nexus-glow blur-xl rounded-full absolute"></div>
                  <Gift size={100} className="text-white relative z-10 animate-bounce" />
               </div>
            )}

            {lootResult && (
               <div className="text-center animate-slide-up">
                  <div className={`inline-flex p-6 rounded-full bg-slate-800 mb-6 ring-4 ${lootResult.rarity === 'LEGENDARY' ? 'ring-yellow-500 shadow-yellow-500/50' : 'ring-nexus-accent'}`}>
                     <lootResult.icon size={64} className={lootResult.rarity === 'LEGENDARY' ? 'text-yellow-400' : 'text-nexus-accent'} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{lootResult.name}</h3>
                  <Badge color={lootResult.rarity === 'LEGENDARY' ? 'bg-yellow-500' : 'bg-nexus-accent'}>{lootResult.rarity}</Badge>
                  <p className="mt-4 text-slate-400">Item added to your inventory.</p>
               </div>
            )}
         </div>
      </Modal>

      {/* Create Server Modal */}
      <Modal isOpen={isCreateServerOpen} onClose={() => setIsCreateServerOpen(false)} title="Create Your Server" size="sm">
        <form onSubmit={handleCreateServer} className="p-6 space-y-6">
          <div className="text-center mb-6">
             <p className="text-slate-400 mb-4">Give your new server a personality with a name and an icon. You can always change it later.</p>
             <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center border-2 border-dashed border-slate-600 hover:border-nexus-accent cursor-pointer group transition-colors relative overflow-hidden">
                <UploadCloud size={32} className="text-slate-500 group-hover:text-nexus-accent" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">
                   UPLOAD
                </div>
             </div>
          </div>
          
          <Input 
            label="Server Name" 
            placeholder="My Awesome Guild" 
            value={newServerName}
            onChange={(e: any) => setNewServerName(e.target.value)}
            autoFocus
          />

          <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="ghost" onClick={() => setIsCreateServerOpen(false)}>Cancel</Button>
             <Button type="submit" variant="primary" disabled={!newServerName.trim()}>Create Server</Button>
          </div>
        </form>
      </Modal>

      {/* Server Settings Modal */}
      <Modal isOpen={isServerSettingsOpen} onClose={() => setIsServerSettingsOpen(false)} title="Server Settings" size="sm">
        <div className="p-6 space-y-6">
           {activeServer ? (
             <>
               <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-slate-700 relative group cursor-pointer">
                      <img src={activeServer.icon} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">CHANGE</div>
                  </div>
                  <div className="text-center">
                     <h3 className="text-xl font-bold text-white">{activeServer.name}</h3>
                     <p className="text-xs text-slate-500">ID: {activeServer.id}</p>
                  </div>
               </div>
               
               <Input label="Server Name" defaultValue={activeServer.name} />
               
               <div className="pt-4 border-t border-slate-700">
                  <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Danger Zone</h4>
                  <Button variant="danger" className="w-full">Delete Server</Button>
               </div>
             </>
           ) : (
             <p className="text-slate-400">No server selected.</p>
           )}
           <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-4">
              <Button variant="ghost" onClick={() => setIsServerSettingsOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setIsServerSettingsOpen(false)}>Save Changes</Button>
           </div>
        </div>
      </Modal>

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
            <div className="w-48 flex flex-col gap-2 border-r border-slate-700 pr-4 py-2">
               <button 
                  onClick={() => setSettingsTab('PROFILE')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${settingsTab === 'PROFILE' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
               >
                  <UserIcon size={16} /> My Profile
               </button>
               <button 
                  onClick={() => setSettingsTab('APPEARANCE')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${settingsTab === 'APPEARANCE' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
               >
                  <Palette size={16} /> Appearance
               </button>
               <button 
                  onClick={() => setSettingsTab('KEYBINDS')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${settingsTab === 'KEYBINDS' ? 'bg-nexus-accent text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
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
                     <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Profile Settings</h3>
                     <p className="text-slate-400 text-sm">To edit your public profile, banner, or bio, please visit your Profile page directly.</p>
                     <Button onClick={() => { setIsSettingsOpen(false); openProfile(currentUser.id); }}>Go to My Profile</Button>
                     
                     <h3 className="text-lg font-bold text-white mt-8 mb-4 border-b border-slate-700 pb-2">Account Status</h3>
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

               {settingsTab === 'KEYBINDS' && (
                  <div className="space-y-6 animate-fade-in">
                     <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                        <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
                        <Button variant="ghost" className="text-xs py-1">Reset Defaults</Button>
                     </div>

                     <div className="space-y-1">
                        {keybinds.map((kb) => (
                           <div key={kb.id} className="flex items-center justify-between p-3 hover:bg-slate-700/30 rounded-lg transition-colors group">
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
