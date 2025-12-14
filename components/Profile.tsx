

import React, { useState } from 'react';
import { User, UserStatus } from '../types';
import { Avatar, Button, Input, Tabs, Badge, ProgressBar, Switch } from './UIComponents';
import { Edit2, Twitch, Twitter, MessageSquare, Gamepad2, Trophy, Clock, Target, Shield, Save, Monitor, Cpu, HardDrive, CheckCircle, UserPlus, Send, History, Lock, Link as LinkIcon, AlertCircle, Sparkles, Loader2, X, Smartphone, Mail, Key, Eye, EyeOff, Activity, Star } from 'lucide-react';
import { generateAIImage } from '../services/gemini';

interface ProfileProps {
  user: User;
  isCurrentUser: boolean;
  onUpdate?: (updatedUser: User) => void;
  onClose?: () => void;
  onMessageUser?: (userId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user: initialUser, isCurrentUser, onUpdate, onClose, onMessageUser }) => {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'NONE' | 'SENT' | 'FRIENDS'>('NONE');
  
  // AI Avatar State
  const [showAIGen, setShowAIGen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Privacy Settings State
  const [allowDMs, setAllowDMs] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  // Edit State
  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio || '',
    customStatus: user.customStatus || '',
    discord: user.socials?.discord || '',
    twitch: user.socials?.twitch || '',
    steam: user.socials?.steam || '',
    xbox: user.socials?.xbox || '',
    banner: user.banner || '',
    avatar: user.avatar,
    cpu: 'Intel i9-13900K',
    gpu: 'RTX 4090',
    ram: '64GB DDR5'
  });

  const [connectingService, setConnectingService] = useState<string | null>(null);

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      username: editForm.username,
      bio: editForm.bio,
      customStatus: editForm.customStatus,
      banner: editForm.banner,
      avatar: editForm.avatar,
      socials: {
        discord: editForm.discord,
        twitch: editForm.twitch,
        steam: editForm.steam,
        xbox: editForm.xbox
      }
    };
    setUser(updatedUser);
    onUpdate?.(updatedUser);
    setIsEditing(false);
  };

  const handleAddFriend = () => {
    if (friendStatus === 'NONE') setFriendStatus('SENT');
  };

  const handleMessageClick = () => {
    onClose?.(); // Ensure modal is closed
    onMessageUser?.(user.id);
  };
  
  const handleGenerateAvatar = async () => {
      if (!aiPrompt) return;
      setIsGenerating(true);
      const imageUrl = await generateAIImage(`A high quality square avatar of ${aiPrompt}, digital art style, vivid colors`);
      if (imageUrl) {
          setEditForm(prev => ({ ...prev, avatar: imageUrl }));
          setShowAIGen(false);
      }
      setIsGenerating(false);
  };

  const handleConnectAccount = (service: 'steam' | 'xbox' | 'twitch') => {
      setConnectingService(service);
      
      // Simulate OAuth / API Connection
      setTimeout(() => {
          let newValue = '';
          let statusUpdate = {};

          if (service === 'steam') {
              newValue = 'linked_steam_id_123';
              statusUpdate = { status: UserStatus.PLAYING, gameActivity: 'Counter-Strike 2' };
          } else if (service === 'xbox') {
              newValue = 'GamerTag_Live';
              statusUpdate = { status: UserStatus.PLAYING, gameActivity: 'Halo Infinite' };
          } else if (service === 'twitch') {
              newValue = 'TwitchStreamerTV';
          }
          
          setEditForm(prev => ({ ...prev, [service]: newValue }));
          
          if (Object.keys(statusUpdate).length > 0) {
              const updatedUser = { ...user, ...statusUpdate };
              setUser(updatedUser);
              onUpdate?.(updatedUser);
          }
          
          setConnectingService(null);
      }, 1500);
  };

  const handleDisconnectAccount = (service: 'steam' | 'xbox' | 'twitch') => {
     setEditForm(prev => ({ ...prev, [service]: '' }));
  };

  return (
    <div className="min-h-[500px]">
      {/* Header Banner */}
      <div className="h-48 w-full relative bg-slate-800 group">
        <img 
          src={editForm.banner || user.banner || 'https://picsum.photos/800/300'} 
          className="w-full h-full object-cover" 
          alt="Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent"></div>
        {isCurrentUser && (
           <button 
             onClick={() => setIsEditing(!isEditing)} 
             className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur flex items-center gap-2 text-sm font-bold transition-all"
           >
             {isEditing ? <><Save size={16} /> Editing Mode</> : <><Edit2 size={16} /> Edit Profile</>}
           </button>
        )}
      </div>

      <div className="px-8 relative">
        {/* Avatar & Basic Info */}
        <div className="flex justify-between items-end -mt-16 mb-6">
          <div className="flex items-end gap-6">
            <div className="relative group/avatar">
              <Avatar src={isEditing ? editForm.avatar : user.avatar} size="2xl" className="ring-4 ring-nexus-900 bg-nexus-900" status={user.status} />
              
              {/* AI Generation Overlay */}
              {isEditing && (
                <>
                    <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity z-10"
                        onClick={() => setShowAIGen(!showAIGen)}
                    >
                        <div className="flex flex-col items-center text-white">
                            <Sparkles size={20} className="mb-1" />
                            <span className="text-[10px] font-bold">AI GEN</span>
                        </div>
                    </div>
                    
                    {/* AI Gen Popover */}
                    {showAIGen && (
                        <div className="absolute top-full left-0 mt-4 bg-slate-800 border border-slate-700 p-3 rounded-xl w-64 shadow-2xl z-20 animate-scale-in">
                           <div className="flex justify-between items-center mb-2">
                               <div className="text-xs font-bold text-nexus-accent flex items-center gap-1"><Sparkles size={12}/> Generate Avatar</div>
                               <button onClick={() => setShowAIGen(false)}><X size={12} className="text-slate-400 hover:text-white"/></button>
                           </div>
                           <textarea 
                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white mb-2 focus:outline-none focus:border-nexus-accent" 
                              rows={2}
                              placeholder="Describe your avatar (e.g. Cyberpunk samurai cat)"
                              value={aiPrompt}
                              onChange={(e) => setAiPrompt(e.target.value)}
                           />
                           <Button variant="primary" className="w-full py-1 text-xs" onClick={handleGenerateAvatar} disabled={isGenerating || !aiPrompt}>
                               {isGenerating ? <><Loader2 size={12} className="animate-spin mr-1"/> Generating...</> : 'Generate'}
                           </Button>
                        </div>
                    )}
                </>
              )}
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
                {user.username} 
                <span className="text-nexus-accent text-sm bg-nexus-accent/10 px-2 py-0.5 rounded border border-nexus-accent/20">LVL {user.level}</span>
              </h1>
              {user.customStatus && (
                  <div className="text-nexus-glow font-medium text-sm mt-1">
                      {user.customStatus}
                  </div>
              )}
              <div className="text-slate-400 font-mono text-sm mt-1">#{user.id.padStart(4, '0')} • Member since 2024</div>
            </div>
          </div>
          
          <div className="flex gap-2 mb-2">
             {!isCurrentUser && (
                <>
                  <Button 
                    variant={friendStatus === 'NONE' ? "primary" : "secondary"} 
                    className="py-2 px-4 text-sm"
                    onClick={handleAddFriend}
                    disabled={friendStatus !== 'NONE'}
                  >
                    {friendStatus === 'NONE' && <><UserPlus size={16} /> Add Friend</>}
                    {friendStatus === 'SENT' && <><CheckCircle size={16} /> Sent</>}
                    {friendStatus === 'FRIENDS' && <><CheckCircle size={16} /> Friends</>}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="py-2 px-4 text-sm"
                    onClick={handleMessageClick}
                  >
                    <Send size={16} /> Message
                  </Button>
                </>
             )}
          </div>
        </div>

        {/* Content Tabs */}
        {isEditing ? (
           <div className="space-y-6 max-w-2xl py-4 pb-12 animate-fade-in">
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Edit Profile Details</h3>
              <div className="grid grid-cols-2 gap-6">
                 <Input label="Display Name" value={editForm.username} onChange={(e: any) => setEditForm({...editForm, username: e.target.value})} />
                 <Input label="Banner URL" value={editForm.banner} onChange={(e: any) => setEditForm({...editForm, banner: e.target.value})} placeholder="https://..." />
                 <div className="col-span-2">
                    <Input label="Custom Status" value={editForm.customStatus} onChange={(e: any) => setEditForm({...editForm, customStatus: e.target.value})} placeholder="What's on your mind?" />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bio</label>
                    <textarea 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-nexus-accent focus:outline-none"
                       rows={3}
                       value={editForm.bio}
                       onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    />
                 </div>
              </div>

              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 pt-4">Hardware Specs</h3>
              <div className="grid grid-cols-3 gap-4">
                  <Input label="CPU" value={editForm.cpu} onChange={(e: any) => setEditForm({...editForm, cpu: e.target.value})} />
                  <Input label="GPU" value={editForm.gpu} onChange={(e: any) => setEditForm({...editForm, gpu: e.target.value})} />
                  <Input label="RAM" value={editForm.ram} onChange={(e: any) => setEditForm({...editForm, ram: e.target.value})} />
              </div>
              
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 pt-4">Linked Accounts</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                       <Twitch className="text-[#9146FF]" />
                       <div>
                          <div className="font-bold text-white">Twitch</div>
                          <div className="text-xs text-slate-400">{editForm.twitch ? `Connected as ${editForm.twitch}` : 'Not connected'}</div>
                       </div>
                    </div>
                    {editForm.twitch ? (
                       <Button variant="danger" className="text-xs py-1 px-3" onClick={() => handleDisconnectAccount('twitch')}>Disconnect</Button>
                    ) : (
                       <Button variant="secondary" className="text-xs py-1 px-3" onClick={() => handleConnectAccount('twitch')} disabled={!!connectingService}>
                          {connectingService === 'twitch' ? 'Connecting...' : 'Connect'}
                       </Button>
                    )}
                 </div>
                 {/* ... Other accounts similarly ... */}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                 <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                 <Button variant="success" onClick={handleSave}>Save Changes</Button>
              </div>
           </div>
        ) : (
          <>
            <Tabs tabs={['Overview', 'Stats', 'Badges']} activeTab={activeTab} onChange={setActiveTab} />
            
            <div className="pb-12 min-h-[300px]">
               {activeTab === 'Overview' && (
                 <div className="grid grid-cols-3 gap-8">
                    {/* Left Col */}
                    <div className="col-span-2 space-y-8">
                       <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                          <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
                          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                             {user.bio || "This user prefers to keep an air of mystery..."}
                          </p>
                       </div>
                       
                       <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                          <h3 className="text-lg font-bold text-white mb-4">Specs</h3>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-800 rounded-lg flex flex-col items-center text-center hover:bg-slate-750 transition-colors group">
                                <Cpu size={24} className="text-nexus-glow mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold text-slate-400 uppercase">CPU</div>
                                <div className="font-bold">{editForm.cpu}</div>
                            </div>
                            <div className="p-3 bg-slate-800 rounded-lg flex flex-col items-center text-center hover:bg-slate-750 transition-colors group">
                                <Monitor size={24} className="text-nexus-glow mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold text-slate-400 uppercase">GPU</div>
                                <div className="font-bold">{editForm.gpu}</div>
                            </div>
                            <div className="p-3 bg-slate-800 rounded-lg flex flex-col items-center text-center hover:bg-slate-750 transition-colors group">
                                <HardDrive size={24} className="text-nexus-glow mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold text-slate-400 uppercase">RAM</div>
                                <div className="font-bold">{editForm.ram}</div>
                            </div>
                          </div>
                       </div>

                       {isCurrentUser && (
                           <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 animate-fade-in">
                               <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Lock size={18} className="text-green-500" /> Account Security</h3>
                               <div className="space-y-4">
                                   <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                                       <div className="flex items-center gap-3">
                                           <Mail className="text-slate-400" size={20} />
                                           <div>
                                               <div className="text-sm font-bold text-slate-200">Email Address</div>
                                               <div className="text-xs text-slate-500">p******@nexus.gg</div>
                                           </div>
                                       </div>
                                       <Button variant="ghost" className="text-xs">Reveal</Button>
                                   </div>
                                   <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                                       <div className="flex items-center gap-3">
                                           <Smartphone className="text-slate-400" size={20} />
                                           <div>
                                               <div className="text-sm font-bold text-slate-200">Two-Factor Auth</div>
                                               <div className="text-xs text-green-500">Enabled (Authenticator App)</div>
                                           </div>
                                       </div>
                                       <Switch checked={twoFactor} onChange={setTwoFactor} />
                                   </div>
                                   <div className="flex items-center justify-between pt-2">
                                       <div className="text-sm text-slate-400">Allow direct messages from server members?</div>
                                       <Switch checked={allowDMs} onChange={setAllowDMs} />
                                   </div>
                               </div>
                           </div>
                       )}
                    </div>

                    {/* Right Col */}
                    <div className="space-y-6">
                       <div className="bg-gradient-to-br from-nexus-accent/20 to-nexus-900 p-6 rounded-xl border border-nexus-accent/30">
                          <h3 className="text-nexus-glow font-bold uppercase tracking-wider text-xs mb-2">Current Level</h3>
                          <div className="text-4xl font-display font-bold text-white mb-4">{user.level}</div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                             <span>{user.xp} XP</span>
                             <span>Next: {user.level * 100} XP</span>
                          </div>
                          <ProgressBar value={user.xp} max={user.level * 100} className="h-2 bg-slate-800" />
                       </div>

                       <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                          <h3 className="text-lg font-bold text-white mb-4">Roles</h3>
                          <div className="flex flex-wrap gap-2">
                             {user.id === '1' && <Badge color="bg-red-500/20 text-red-400 border border-red-500/30">Admin</Badge>}
                             <Badge color="bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/30">Founder</Badge>
                             <Badge>Gamer</Badge>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === 'Stats' && (
                  <div className="space-y-6 animate-fade-in">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Skill Chart Placeholder - CSS Shapes */}
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                            <h4 className="absolute top-4 left-4 font-bold text-white flex items-center gap-2"><Activity size={16} className="text-nexus-accent"/> Skill Matrix</h4>
                            <div className="w-48 h-48 relative mt-6">
                                {/* Hexagon Background */}
                                <div className="absolute inset-0 bg-slate-800 clip-path-hexagon opacity-50"></div>
                                {/* Skill Data Shape */}
                                <div className="absolute inset-4 bg-nexus-accent/30 clip-path-polygon animate-pulse-slow"></div>
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 text-[10px] font-bold text-slate-400">AIM</div>
                                <div className="absolute top-1/4 right-0 -mr-8 text-[10px] font-bold text-slate-400">STRAT</div>
                                <div className="absolute bottom-1/4 right-0 -mr-8 text-[10px] font-bold text-slate-400">TEAM</div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-6 text-[10px] font-bold text-slate-400">MECH</div>
                                <div className="absolute bottom-1/4 left-0 -ml-8 text-[10px] font-bold text-slate-400">VIS</div>
                                <div className="absolute top-1/4 left-0 -ml-8 text-[10px] font-bold text-slate-400">KDA</div>
                            </div>
                        </div>

                        {/* Top Agents/Champs */}
                        <div className="col-span-2 bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Star size={16} className="text-yellow-400"/> Most Played</h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'Jett', game: 'Valorant', hours: '142h', wr: '62%' },
                                    { name: 'Ahri', game: 'League of Legends', hours: '98h', wr: '55%' },
                                    { name: 'Wraith', game: 'Apex Legends', hours: '65h', wr: '48%' }
                                ].map((agent, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-700 rounded-full overflow-hidden">
                                                <img src={`https://picsum.photos/seed/${agent.name}/50/50`} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{agent.name}</div>
                                                <div className="text-xs text-slate-400">{agent.game}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-nexus-accent">{agent.wr} WR</div>
                                            <div className="text-xs text-slate-500">{agent.hours} Played</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>

                     {/* Recent Matches */}
                     <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <History className="text-nexus-accent" />
                            <h3 className="text-lg font-bold text-white">Recent Match History</h3>
                        </div>
                        <div className="space-y-2">
                           <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors border-l-4 border-green-500 group">
                              <div className="flex items-center gap-4">
                                 <div className="font-bold text-green-500 uppercase text-sm w-16 bg-green-500/10 py-1 text-center rounded">Victory</div>
                                 <div>
                                    <div className="font-bold text-white group-hover:text-nexus-accent transition-colors">League of Legends</div>
                                    <div className="text-xs text-slate-400">Ranked Solo/Duo • Summoner's Rift • <span className="text-slate-300">12/3/18 KDA</span></div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className="font-bold text-white">+18 LP</div>
                                 <div className="text-xs text-slate-400">2h ago</div>
                              </div>
                           </div>
                           {/* More matches... */}
                        </div>
                     </div>
                  </div>
               )}
               
               {activeTab === 'Badges' && (
                  <div className="space-y-8 animate-fade-in">
                     <div>
                         <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-wider text-slate-500">Equipped Badges</h3>
                         <div className="flex gap-4">
                            {user.badges.slice(0, 3).map((b, i) => (
                                <div key={i} className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-3xl border-2 border-nexus-accent shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                    {b}
                                </div>
                            ))}
                            <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 text-xs text-center p-2">
                                Slot Empty
                            </div>
                         </div>
                     </div>

                     <div>
                         <h3 className="font-bold text-white mb-4 uppercase text-xs tracking-wider text-slate-500">Collection</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {user.badges.map((b, i) => (
                               <div key={i} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-nexus-glow hover:bg-slate-800 transition-all group cursor-pointer">
                                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform filter drop-shadow-lg">{b}</div>
                                  <div className="font-bold text-white text-sm">Badge Title</div>
                               </div>
                            ))}
                            {[1,2,3,4,5].map(i => (
                               <div key={`e-${i}`} className="bg-slate-900/20 border border-slate-800 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all group">
                                  <Lock size={20} className="text-slate-500 mb-2" />
                                  <div className="font-bold text-slate-600 text-sm">Locked</div>
                               </div>
                            ))}
                         </div>
                     </div>
                  </div>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;