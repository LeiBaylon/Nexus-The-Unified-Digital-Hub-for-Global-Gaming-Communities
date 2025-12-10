
import React, { useState } from 'react';
import { Tournament, Clip } from '../types';
import { TOURNAMENTS, CLIPS } from '../constants';
import { Button, Badge, Tabs, Modal, Input, Avatar } from './UIComponents';
import { Trophy, Calendar, Users, Play, Heart, Share2, Filter, X, CheckCircle, Video, Gamepad2, Search, Crosshair, Crown } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
  onRegister: (t: Tournament) => void;
  onWatch: (t: Tournament) => void;
  isRegistered: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onRegister, onWatch, isRegistered }) => (
  <div className="group bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-nexus-accent hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)] transition-all duration-300 flex flex-col h-full animate-scale-in transform hover:-translate-y-2">
    <div className="h-40 bg-slate-900 relative overflow-hidden cursor-pointer" onClick={() => tournament.status === 'LIVE' ? onWatch(tournament) : onRegister(tournament)}>
      <img src={tournament.image} alt={tournament.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent"></div>
      <div className="absolute top-3 right-3">
        <Badge color={tournament.status === 'LIVE' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-green-600'}>
          {tournament.status}
        </Badge>
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent p-4">
         <div className="text-xs font-bold text-nexus-glow uppercase tracking-wider flex items-center gap-1">
           <Gamepad2 size={12} /> {tournament.game}
         </div>
      </div>
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-nexus-accent transition-colors">{tournament.title}</h3>
      <div className="space-y-3 mb-6 flex-1">
        <div className="flex items-center text-slate-400 text-sm gap-2">
          <Trophy size={16} className="text-yellow-400" /> 
          <span>Prize Pool: <span className="text-white font-bold">{tournament.prizePool}</span></span>
        </div>
        <div className="flex items-center text-slate-400 text-sm gap-2">
          <Calendar size={16} /> 
          <span>{tournament.startDate}</span>
        </div>
        <div className="flex items-center text-slate-400 text-sm gap-2">
          <Users size={16} /> 
          <span>{tournament.participants}/{tournament.maxParticipants} Players</span>
        </div>
      </div>
      
      {tournament.status === 'LIVE' ? (
         <Button variant="glow" className="w-full flex items-center justify-center gap-2 group-hover:bg-nexus-glow/10" onClick={() => onWatch(tournament)}>
            <Video size={16} /> Watch Stream
         </Button>
      ) : (
         <Button 
            variant={isRegistered ? "success" : "primary"} 
            className="w-full flex items-center justify-center gap-2" 
            onClick={() => !isRegistered && onRegister(tournament)}
            disabled={isRegistered}
         >
            {isRegistered ? <><CheckCircle size={16} /> Registered</> : "Register Now"}
         </Button>
      )}
    </div>
  </div>
);

interface ClipCardProps {
  clip: Clip;
  onPlay: (c: Clip) => void;
}

const ClipCard: React.FC<ClipCardProps> = ({ clip, onPlay }) => (
  <div onClick={() => onPlay(clip)} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-nexus-glow hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 group cursor-pointer relative aspect-[9/16] md:aspect-auto animate-scale-in transform hover:-translate-y-1">
    <img src={clip.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100 shadow-xl border border-white/30">
          <Play size={24} className="text-white ml-1" fill="white" />
       </div>
       <div className="text-xs font-bold text-nexus-accent mb-1">{clip.game}</div>
       <h3 className="font-bold text-white leading-tight mb-2 line-clamp-2">{clip.title}</h3>
       <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1 hover:text-white transition-colors"><Play size={12} /> {clip.views}</span>
             <span className="flex items-center gap-1 hover:text-red-400 transition-colors"><Heart size={12} /> {clip.likes}</span>
          </div>
          <span>{clip.timestamp}</span>
       </div>
    </div>
  </div>
);

const LeaderboardRow = ({ rank, name, rating, winRate, main, avatar, change }: any) => (
   <div className="grid grid-cols-12 gap-4 p-4 items-center bg-slate-800/50 hover:bg-slate-700 hover:shadow-lg hover:border-l-4 hover:border-l-nexus-accent border-b border-slate-700/50 transition-all duration-200 group cursor-pointer">
      <div className="col-span-1 font-display font-bold text-xl text-slate-400 flex items-center gap-2 group-hover:text-white">
         #{rank}
         {rank === 1 && <Crown size={16} className="text-yellow-400 fill-current animate-bounce" />}
      </div>
      <div className="col-span-4 flex items-center gap-3">
         <Avatar src={avatar} size="sm" className="group-hover:scale-110 transition-transform" />
         <span className="font-bold text-white group-hover:text-nexus-accent transition-colors">{name}</span>
      </div>
      <div className="col-span-2 text-nexus-glow font-mono font-bold group-hover:scale-105 transition-transform">{rating}</div>
      <div className="col-span-2 text-slate-300">{winRate}</div>
      <div className="col-span-3 flex items-center gap-2 text-slate-400 text-sm">
         <Crosshair size={14} /> {main}
         {change === 'up' && <span className="text-green-500 ml-auto text-xs animate-pulse">▲ 12</span>}
         {change === 'down' && <span className="text-red-500 ml-auto text-xs">▼ 5</span>}
         {change === 'flat' && <span className="text-slate-600 ml-auto text-xs">-</span>}
      </div>
   </div>
);

export const GamingHub = () => {
  const [activeTab, setActiveTab] = useState('Tournaments');
  
  // Modals & State
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showStream, setShowStream] = useState<Tournament | null>(null);
  const [showRegistration, setShowRegistration] = useState<Tournament | null>(null);
  const [showClipPlayer, setShowClipPlayer] = useState<Clip | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Data State
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [filterGame, setFilterGame] = useState('All');

  const handleRegisterConfirm = () => {
     if (showRegistration) {
        setRegisteredIds(prev => [...prev, showRegistration.id]);
        setShowRegistration(null);
     }
  };

  const filteredTournaments = TOURNAMENTS.filter(t => {
     if (filterGame === 'All') return true;
     return t.game.toLowerCase().includes(filterGame.toLowerCase());
  });

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto custom-scrollbar p-6 md:p-8 relative">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-slide-up">
          <div>
             <h1 className="text-4xl font-display font-bold text-white mb-2">Gaming Hub</h1>
             <p className="text-slate-400">Discover events, clips, and community highlights.</p>
          </div>
          <div className="flex flex-wrap gap-2">
             <Button variant={showFilters ? "primary" : "secondary"} onClick={() => setShowFilters(!showFilters)}>
                <Filter size={18} className="mr-2" /> {showFilters ? 'Hide Filters' : 'Filter'}
             </Button>
             <Button variant="primary" onClick={() => setShowCreateEvent(true)}>
                <Trophy size={18} className="mr-2" /> Create Event
             </Button>
          </div>
       </div>

       {/* Filter Bar */}
       {showFilters && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6 animate-scale-in flex flex-wrap gap-4 items-center shadow-lg">
             <div className="flex items-center gap-2 text-sm text-slate-400 border-r border-slate-700 pr-4">
                <Gamepad2 size={16} /> Filter by Game:
             </div>
             {['All', 'Apex Legends', 'Valorant', 'Rocket League', 'LoL'].map(game => (
                <button 
                  key={game}
                  onClick={() => setFilterGame(game)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${filterGame === game ? 'bg-nexus-accent text-white shadow-[0_0_10px_rgba(139,92,246,0.5)] scale-105' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'}`}
                >
                   {game}
                </button>
             ))}
          </div>
       )}

       <Tabs tabs={['Tournaments', 'Clips', 'Leaderboards']} activeTab={activeTab} onChange={setActiveTab} />

       {/* TOURNAMENTS TAB */}
       {activeTab === 'Tournaments' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up pb-8">
            {filteredTournaments.map(t => (
               <TournamentCard 
                  key={t.id} 
                  tournament={t} 
                  onRegister={setShowRegistration}
                  onWatch={setShowStream}
                  isRegistered={registeredIds.includes(t.id)}
               />
            ))}
            {/* Create Promo Card */}
            <div 
               onClick={() => setShowCreateEvent(true)}
               className="border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 text-slate-500 hover:border-nexus-accent hover:text-nexus-accent transition-all duration-300 cursor-pointer min-h-[400px] group bg-slate-800/20 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-nexus-accent/10"
            >
               <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-nexus-accent group-hover:text-white flex items-center justify-center transition-all duration-300 mb-4 group-hover:scale-110 group-hover:rotate-12">
                  <Trophy size={32} />
               </div>
               <h3 className="text-xl font-bold mb-1">Host a Tournament</h3>
               <p className="text-center text-sm mt-2 max-w-xs opacity-70 group-hover:opacity-100 transition-opacity">Create your own bracket, manage teams, and distribute prizes automatically.</p>
            </div>
         </div>
       )}

       {/* CLIPS TAB */}
       {activeTab === 'Clips' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-slide-up pb-8">
             {CLIPS.map(c => <ClipCard key={c.id} clip={c} onPlay={setShowClipPlayer} />)}
          </div>
       )}

       {/* LEADERBOARDS TAB */}
       {activeTab === 'Leaderboards' && (
          <div className="animate-slide-up pb-8">
             <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                   <h3 className="font-bold text-lg text-white">Global Rankings (Season 4)</h3>
                   <div className="flex gap-2">
                      <select className="bg-slate-800 text-sm text-slate-300 border border-slate-700 rounded px-2 py-1 outline-none hover:border-nexus-accent transition-colors">
                         <option>Global</option>
                         <option>NA East</option>
                         <option>EU West</option>
                      </select>
                   </div>
                </div>
                
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 bg-slate-800/80">
                   <div className="col-span-1">Rank</div>
                   <div className="col-span-4">Player</div>
                   <div className="col-span-2">Rating</div>
                   <div className="col-span-2">Win Rate</div>
                   <div className="col-span-3">Main</div>
                </div>

                {/* Rows */}
                <LeaderboardRow rank={1} name="FakerLike" rating="2890" winRate="68.5%" main="Mid / Ahri" avatar="https://picsum.photos/id/64/50/50" change="flat" />
                <LeaderboardRow rank={2} name="Nexus_God" rating="2845" winRate="65.2%" main="Jungle / Lee Sin" avatar="https://picsum.photos/id/65/50/50" change="up" />
                <LeaderboardRow rank={3} name="JinxViper" rating="2780" winRate="62.1%" main="ADC / Jinx" avatar="https://picsum.photos/id/66/50/50" change="up" />
                <LeaderboardRow rank={4} name="NoobMaster69" rating="2650" winRate="59.8%" main="Top / Teemo" avatar="https://picsum.photos/id/67/50/50" change="down" />
                <LeaderboardRow rank={5} name="SupportDiff" rating="2610" winRate="58.2%" main="Supp / Thresh" avatar="https://picsum.photos/id/68/50/50" change="flat" />
                <LeaderboardRow rank={6} name="Kaelthas" rating="2590" winRate="57.9%" main="Supp / Nami" avatar="https://picsum.photos/id/69/50/50" change="down" />
                <LeaderboardRow rank={7} name="ShadowStep" rating="2544" winRate="55.4%" main="Mid / Zed" avatar="https://picsum.photos/id/70/50/50" change="up" />
             </div>
          </div>
       )}

       {/* MODALS */}
       
       {/* Create Event Modal */}
       <Modal isOpen={showCreateEvent} onClose={() => setShowCreateEvent(false)} title="Create Tournament">
          <div className="p-6 space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                   <Input label="Tournament Name" placeholder="e.g. Friday Night Fragfest" autoFocus />
                </div>
                <Input label="Game Title" placeholder="Select Game..." />
                <Input label="Prize Pool" placeholder="$1000" />
                <Input label="Start Date" type="date" />
                <Input label="Max Players" type="number" placeholder="64" />
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                   <textarea className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:border-nexus-accent focus:outline-none h-24 transition-colors" placeholder="Rules, map rotation, etc..."></textarea>
                </div>
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <Button variant="ghost" onClick={() => setShowCreateEvent(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => setShowCreateEvent(false)}>Publish Event</Button>
             </div>
          </div>
       </Modal>

       {/* Stream Modal */}
       <Modal isOpen={!!showStream} onClose={() => setShowStream(null)} size="xl">
          {showStream && (
             <div className="bg-black aspect-video relative group overflow-hidden rounded-b-2xl">
                {/* Mock Stream UI */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-center animate-pulse">
                      <div className="text-nexus-glow font-bold text-2xl mb-2">CONNECTING TO STREAM...</div>
                      <div className="text-slate-500">Waiting for {showStream.title} feed</div>
                   </div>
                </div>
                {/* Overlay Controls */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="flex items-center gap-4">
                      <button className="text-white hover:text-nexus-accent hover:scale-110 transition-transform"><Play size={24} fill="white" /></button>
                      <div className="text-white text-sm font-bold">LIVE • 00:00:00</div>
                   </div>
                   <div className="flex items-center gap-2">
                      <Badge color="bg-red-500">LIVE</Badge>
                      <span className="text-slate-300 text-sm">{showStream.participants} viewers</span>
                   </div>
                </div>
             </div>
          )}
       </Modal>

       {/* Registration Modal */}
       <Modal isOpen={!!showRegistration} onClose={() => setShowRegistration(null)} title="Confirm Registration">
          {showRegistration && (
             <div className="p-6">
                <div className="flex items-start gap-4 mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-nexus-accent transition-colors">
                   <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img src={showRegistration.image} className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h3 className="font-bold text-xl text-white">{showRegistration.title}</h3>
                      <div className="text-nexus-glow text-sm font-bold">{showRegistration.game}</div>
                      <div className="text-slate-400 text-xs mt-1">{showRegistration.startDate}</div>
                   </div>
                </div>
                
                <p className="text-slate-300 mb-6">
                   You are about to register for this tournament. Please ensure you have read the rules and are available at the start time.
                </p>

                <div className="flex justify-end gap-3">
                   <Button variant="ghost" onClick={() => setShowRegistration(null)}>Cancel</Button>
                   <Button variant="success" onClick={handleRegisterConfirm}>Confirm Registration</Button>
                </div>
             </div>
          )}
       </Modal>

       {/* Clip Player Modal */}
       <Modal isOpen={!!showClipPlayer} onClose={() => setShowClipPlayer(null)} size="lg">
          {showClipPlayer && (
             <div className="flex flex-col h-full bg-slate-900">
                <div className="bg-black aspect-video relative flex items-center justify-center group overflow-hidden">
                   <img src={showClipPlayer.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm group-hover:scale-105 transition-transform duration-1000" />
                   <Play size={64} className="relative z-10 text-white opacity-80 group-hover:scale-110 transition-transform duration-300" fill="white" />
                   <div className="absolute bottom-4 left-4 z-10">
                      <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-1 shadow-lg">YouTube</div>
                   </div>
                </div>
                <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="text-xl font-bold text-white mb-1">{showClipPlayer.title}</h3>
                         <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="text-nexus-accent font-bold">{showClipPlayer.game}</span>
                            <span>•</span>
                            <span>{showClipPlayer.timestamp}</span>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="secondary" className="px-3 py-1 text-sm"><Heart size={16} className="mr-2" /> {showClipPlayer.likes}</Button>
                         <Button variant="secondary" className="px-3 py-1 text-sm"><Share2 size={16} className="mr-2" /> Share</Button>
                      </div>
                   </div>
                   
                   {/* Comments Section Mockup */}
                   <div className="border-t border-slate-800 pt-4 mt-4">
                      <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Comments</h4>
                      <div className="space-y-4">
                         <div className="flex gap-3">
                            <Avatar src="https://picsum.photos/id/70/40/40" size="sm" />
                            <div>
                               <div className="text-sm font-bold text-white">RandomUser123</div>
                               <div className="text-sm text-slate-400">This clip is actually insane. How did you hit that?</div>
                            </div>
                         </div>
                         <div className="flex gap-3">
                            <Avatar src="https://picsum.photos/id/71/40/40" size="sm" />
                            <div>
                               <div className="text-sm font-bold text-white">PogChamp</div>
                               <div className="text-sm text-slate-400">SHEEESH 🔥</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}
       </Modal>
    </div>
  );
};
