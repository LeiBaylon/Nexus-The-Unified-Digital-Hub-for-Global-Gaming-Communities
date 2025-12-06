
import React, { useState } from 'react';
import { User, UserStatus } from '../types';
import { Avatar, Button, Input, Tabs, Badge, ProgressBar } from './UIComponents';
import { Edit2, Twitch, Twitter, MessageSquare, Gamepad2, Trophy, Clock, Target, Shield, Save } from 'lucide-react';

interface ProfileProps {
  user: User;
  isCurrentUser: boolean;
  onUpdate?: (updatedUser: User) => void;
  onClose?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user: initialUser, isCurrentUser, onUpdate, onClose }) => {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit State
  const [editForm, setEditForm] = useState({
    username: user.username,
    bio: user.bio || '',
    discord: user.socials?.discord || '',
    twitch: user.socials?.twitch || '',
    steam: user.socials?.steam || '',
    banner: user.banner || ''
  });

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      username: editForm.username,
      bio: editForm.bio,
      banner: editForm.banner,
      socials: {
        discord: editForm.discord,
        twitch: editForm.twitch,
        steam: editForm.steam
      }
    };
    setUser(updatedUser);
    onUpdate?.(updatedUser);
    setIsEditing(false);
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
            <div className="relative">
              <Avatar src={user.avatar} size="2xl" className="ring-4 ring-nexus-900 bg-nexus-900" status={user.status} />
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                   <Edit2 className="text-white" />
                </div>
              )}
            </div>
            <div className="mb-2">
              <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
                {user.username} 
                <span className="text-nexus-accent text-sm bg-nexus-accent/10 px-2 py-0.5 rounded border border-nexus-accent/20">LVL {user.level}</span>
              </h1>
              <div className="text-slate-400 font-mono text-sm">#{user.id.padStart(4, '0')} • Member since 2024</div>
            </div>
          </div>
          
          <div className="flex gap-2 mb-2">
             {!isCurrentUser && (
                <>
                  <Button variant="primary" className="py-2 px-4 text-sm">Add Friend</Button>
                  <Button variant="secondary" className="py-2 px-4 text-sm">Message</Button>
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
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bio</label>
                    <textarea 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-nexus-accent focus:outline-none"
                       rows={3}
                       value={editForm.bio}
                       onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    />
                 </div>
              </div>
              
              <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 pt-4">Linked Accounts</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <Twitch className="text-[#9146FF]" />
                    <Input placeholder="Twitch Username" value={editForm.twitch} onChange={(e: any) => setEditForm({...editForm, twitch: e.target.value})} />
                 </div>
                 <div className="flex items-center gap-4">
                    <Gamepad2 className="text-[#171A21]" />
                    <Input placeholder="Steam ID" value={editForm.steam} onChange={(e: any) => setEditForm({...editForm, steam: e.target.value})} />
                 </div>
                 <div className="flex items-center gap-4">
                    <MessageSquare className="text-[#5865F2]" />
                    <Input placeholder="Discord Tag" value={editForm.discord} onChange={(e: any) => setEditForm({...editForm, discord: e.target.value})} />
                 </div>
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
                          <h3 className="text-lg font-bold text-white mb-4">Connected Accounts</h3>
                          <div className="flex flex-wrap gap-4">
                             {user.socials?.twitch && (
                                <div className="flex items-center gap-2 bg-[#9146FF]/10 text-[#9146FF] px-4 py-2 rounded border border-[#9146FF]/20">
                                   <Twitch size={18} /> <span className="font-bold">{user.socials.twitch}</span>
                                </div>
                             )}
                             {user.socials?.steam && (
                                <div className="flex items-center gap-2 bg-slate-700/30 text-slate-300 px-4 py-2 rounded border border-slate-600">
                                   <Gamepad2 size={18} /> <span className="font-bold">{user.socials.steam}</span>
                                </div>
                             )}
                             {user.socials?.discord && (
                                <div className="flex items-center gap-2 bg-[#5865F2]/10 text-[#5865F2] px-4 py-2 rounded border border-[#5865F2]/20">
                                   <MessageSquare size={18} /> <span className="font-bold">{user.socials.discord}</span>
                                </div>
                             )}
                             {!user.socials?.twitch && !user.socials?.steam && !user.socials?.discord && (
                                <span className="text-slate-500 italic">No accounts linked.</span>
                             )}
                          </div>
                       </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {user.stats && user.stats.length > 0 ? (
                        user.stats.map((stat, idx) => (
                           <div key={idx} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-nexus-accent transition-colors">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <h4 className="font-bold text-xl text-white">{stat.game}</h4>
                                    <div className="text-nexus-glow font-bold text-sm">{stat.role}</div>
                                 </div>
                                 <Badge color="bg-slate-800">{stat.rank}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                                 <div className="p-3 bg-slate-800 rounded">
                                    <div className="text-xs text-slate-400 uppercase">Win Rate</div>
                                    <div className="text-lg font-bold text-green-400">{stat.winRate}</div>
                                 </div>
                                 <div className="p-3 bg-slate-800 rounded">
                                    <div className="text-xs text-slate-400 uppercase">Matches</div>
                                    <div className="text-lg font-bold text-white">{stat.matches}</div>
                                 </div>
                                 <div className="p-3 bg-slate-800 rounded">
                                    <div className="text-xs text-slate-400 uppercase">Skill</div>
                                    <div className="text-lg font-bold text-yellow-400">S+</div>
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="col-span-2 text-center py-20 text-slate-500">
                           <Gamepad2 size={48} className="mx-auto mb-4 opacity-50" />
                           <p>No game stats recorded yet.</p>
                        </div>
                     )}
                  </div>
               )}
               
               {activeTab === 'Badges' && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                     {user.badges.map((b, i) => (
                        <div key={i} className="aspect-square bg-slate-900/50 rounded-xl flex items-center justify-center text-4xl border border-slate-700 hover:border-nexus-glow hover:bg-slate-800 transition-all cursor-help" title="Rare Badge">
                           {b}
                        </div>
                     ))}
                     {/* Empty Slots */}
                     {[1,2,3,4].map(i => (
                        <div key={`e-${i}`} className="aspect-square bg-slate-900/20 rounded-xl flex items-center justify-center border border-slate-800 border-dashed text-slate-700">
                           <Shield size={24} />
                        </div>
                     ))}
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
