
import React, { useState, useRef, useEffect } from 'react';
import { Message, User, Channel, SoundEffect } from '../types';
import { Avatar, Button, Badge, EmojiPicker, ContextMenu, Modal } from './UIComponents';
import { Send, Hash, Bell, Users, Search, PlusCircle, Smile, Gift, Command, MoreVertical, Music, Zap, Image as ImageIcon, BarChart2, FileText, Check, Trophy } from 'lucide-react';
import { sendMessageToAI } from '../services/gemini';
import { SOUND_EFFECTS } from '../constants';

interface ChatInterfaceProps {
  channel: Channel;
  messages: Message[];
  currentUser: User;
  onSendMessage: (msg: Message) => void;
  users: User[];
  onPlaySound: (sound: SoundEffect) => void;
  onUserClick: (userId: string) => void;
  density: 'comfortable' | 'compact';
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ channel, messages, currentUser, onSendMessage, users, onPlaySound, onUserClick, density }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);
  
  // Input Action States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAITyping]);

  const handleCommand = (cmd: string) => {
    let systemMsg = '';
    switch(cmd.toLowerCase()) {
      case 'roll':
        const roll = Math.floor(Math.random() * 100) + 1;
        systemMsg = `🎲 rolled a ${roll}`;
        break;
      case 'flip':
        const flip = Math.random() > 0.5 ? 'Heads' : 'Tails';
        systemMsg = `🪙 flipped ${flip}`;
        break;
      case 'clear':
        // Mock clear logic
        return;
      default:
        return;
    }

    const msg: Message = {
       id: Date.now().toString(),
       content: `used /${cmd}: ${systemMsg}`,
       senderId: currentUser.id,
       timestamp: new Date(),
       isSystem: true
    };
    onSendMessage(msg);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    if (inputValue.startsWith('/')) {
      const cmd = inputValue.substring(1).split(' ')[0];
      handleCommand(cmd);
      setInputValue('');
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      senderId: currentUser.id,
      timestamp: new Date(),
      type: 'TEXT'
    };

    onSendMessage(newMessage);
    setInputValue('');

    // AI Check
    if (inputValue.toLowerCase().includes('@nexus') || channel.id === 'dm-nexus') {
      setIsAITyping(true);
      const aiResponseText = await sendMessageToAI(inputValue);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        senderId: '4', // Nexus AI ID
        timestamp: new Date(),
        isAI: true,
        type: 'TEXT'
      };
      
      setIsAITyping(false);
      onSendMessage(aiMessage);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake URL for the uploaded file
      const url = URL.createObjectURL(file);
      const msg: Message = {
        id: Date.now().toString(),
        content: '',
        senderId: currentUser.id,
        timestamp: new Date(),
        type: 'IMAGE',
        imageUrl: url
      };
      onSendMessage(msg);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowPlusMenu(false);
    }
  };

  const handleSendGift = (giftName: string, icon: string) => {
     onSendMessage({
        id: Date.now().toString(),
        content: `Sent a gift!`,
        senderId: currentUser.id,
        timestamp: new Date(),
        type: 'GIFT',
        giftData: { title: giftName, tier: 'LEGENDARY', icon }
     });
     setShowGiftModal(false);
  };

  const handleCreatePoll = () => {
    // Mock Poll Creation
    onSendMessage({
      id: Date.now().toString(),
      content: 'Poll',
      senderId: currentUser.id,
      timestamp: new Date(),
      type: 'POLL',
      pollData: {
        question: 'What game should we play tonight?',
        options: [
           { label: 'Valorant', votes: 3 },
           { label: 'Apex Legends', votes: 5 },
           { label: 'Minecraft', votes: 1 }
        ]
      }
    });
    setShowPlusMenu(false);
  };

  return (
    <div className="flex-1 flex min-w-0 bg-slate-700/20 backdrop-blur-sm flex-row h-full relative">
      {/* Soundboard Panel (Overlay) */}
      {showSoundboard && (
        <div className="absolute bottom-20 right-64 z-20 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 w-64 animate-fade-in">
           <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Music size={14} /> Soundboard
           </h4>
           <div className="grid grid-cols-2 gap-2">
              {SOUND_EFFECTS.map(sound => (
                 <button 
                    key={sound.id}
                    onClick={() => onPlaySound(sound)}
                    className="flex flex-col items-center justify-center p-3 bg-slate-700/50 hover:bg-nexus-accent/20 border border-transparent hover:border-nexus-accent rounded-lg transition-all group"
                 >
                    <sound.icon size={20} className={`${sound.color} mb-1 group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium text-slate-300">{sound.label}</span>
                 </button>
              ))}
           </div>
        </div>
      )}

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-slate-700 flex items-center justify-between px-4 shadow-sm bg-slate-800/80">
          <div className="flex items-center gap-2 overflow-hidden">
            <Hash className="text-slate-400 w-5 h-5 flex-shrink-0" />
            <h3 className="font-bold text-white truncate">{channel.name}</h3>
            {channel.id === 'gen' && <span className="text-xs text-slate-400 hidden md:block border-l border-slate-600 pl-2 ml-2">General discussion for all gamers</span>}
          </div>
          <div className="flex items-center gap-4 text-slate-400">
             <div className="relative">
                <input className="bg-slate-900 border border-slate-700 rounded pl-8 pr-2 py-1 text-xs focus:ring-1 focus:ring-nexus-accent w-32 focus:w-48 transition-all" placeholder="Search..." />
                <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
             </div>
             <Bell className="w-5 h-5 cursor-pointer hover:text-white" />
             <Users className="w-5 h-5 cursor-pointer hover:text-white md:hidden" />
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto px-4 ${density === 'compact' ? 'py-2 space-y-1' : 'py-4 space-y-6'} custom-scrollbar`}>
          {messages.map((msg, index) => {
             const isSequential = density === 'compact' ? false : (index > 0 && messages[index - 1].senderId === msg.senderId && (msg.timestamp.getTime() - messages[index-1].timestamp.getTime() < 60000));
             const user = users.find(u => u.id === msg.senderId) || { id: 'unknown', username: 'Unknown', avatar: '', status: 'OFFLINE', badges: [] } as User;
             
             return (
               <div key={msg.id} className={`group flex ${isSequential ? 'mt-1' : 'mt-4'} ${msg.isAI ? 'bg-nexus-accent/5 -mx-4 px-4 py-2 border-l-2 border-nexus-accent' : ''} hover:bg-white/5 -mx-4 px-4 py-1 transition-colors relative`}>
                 
                 {/* Message Actions */}
                 <div className="absolute right-4 top-[-10px] bg-slate-800 border border-slate-700 rounded flex items-center p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                    <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-yellow-400" title="Add Reaction"><Smile size={14} /></button>
                    <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Reply"><Command size={14} /></button>
                    <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400" title="Report"><MoreVertical size={14} /></button>
                 </div>

                 {!isSequential ? (
                   <div className="mr-4 flex-shrink-0 mt-0.5">
                     <Avatar src={user.avatar} size="md" className="w-10 h-10 hover:opacity-80 transition-opacity" onClick={() => onUserClick(user.id)} />
                   </div>
                 ) : (
                    <div className="w-14 flex-shrink-0 text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 text-right pr-4 select-none">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                    </div>
                 )}
                 
                 <div className="flex-1 min-w-0">
                   {!isSequential && (
                     <div className="flex items-center gap-2 mb-1">
                       <span 
                          onClick={() => onUserClick(user.id)}
                          className={`font-bold hover:underline cursor-pointer ${msg.isAI ? 'text-nexus-glow' : 'text-white'}`}
                       >
                         {user.username}
                       </span>
                       {user.badges?.map((b, i) => <span key={i} title="Badge">{b}</span>)}
                       {msg.isAI && <span className="bg-nexus-accent text-[10px] px-1 rounded text-white font-bold">BOT</span>}
                       <span className="text-xs text-slate-500 ml-1">
                         {msg.timestamp.toLocaleDateString()} at {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                     </div>
                   )}
                   
                   {/* CONTENT RENDERING BASED ON TYPE */}
                   {msg.type === 'IMAGE' && msg.imageUrl ? (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 max-w-sm">
                         <img src={msg.imageUrl} alt="Uploaded content" className="w-full h-auto" />
                      </div>
                   ) : msg.type === 'GIFT' && msg.giftData ? (
                      <div className="mt-2 bg-gradient-to-r from-nexus-accent/20 to-nexus-glow/20 border border-nexus-accent/50 rounded-lg p-4 max-w-sm flex items-center gap-4">
                         <div className="text-4xl">{msg.giftData.icon}</div>
                         <div>
                            <div className="font-bold text-white uppercase tracking-wider text-xs mb-1">Gift Dropped</div>
                            <div className="font-bold text-lg text-nexus-glow">{msg.giftData.title}</div>
                            <Button variant="primary" className="mt-2 py-1 px-3 text-xs">Accept Gift</Button>
                         </div>
                      </div>
                   ) : msg.type === 'POLL' && msg.pollData ? (
                      <div className="mt-2 bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-sm">
                         <div className="flex items-center gap-2 mb-3 font-bold text-white">
                            <BarChart2 size={16} className="text-nexus-glow" />
                            {msg.pollData.question}
                         </div>
                         <div className="space-y-2">
                            {msg.pollData.options.map((opt, i) => {
                               const total = msg.pollData!.options.reduce((acc, curr) => acc + curr.votes, 0);
                               const percent = Math.round((opt.votes / total) * 100);
                               return (
                                  <div key={i} className="relative h-8 bg-slate-700 rounded overflow-hidden cursor-pointer hover:bg-slate-600 transition-colors group">
                                     <div className="absolute inset-y-0 left-0 bg-nexus-accent/30" style={{ width: `${percent}%` }}></div>
                                     <div className="absolute inset-0 flex items-center justify-between px-3 text-sm font-medium z-10">
                                        <span>{opt.label}</span>
                                        <span className="text-xs opacity-70">{percent}%</span>
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      </div>
                   ) : (
                      <p className={`text-slate-300 whitespace-pre-wrap leading-relaxed ${msg.isAI ? 'font-medium' : ''} ${msg.isSystem ? 'italic text-nexus-glow' : ''}`}>
                        {msg.content}
                      </p>
                   )}

                   {/* Reactions */}
                   {msg.reactions && (
                      <div className="flex gap-1 mt-1">
                         {msg.reactions.map((r, i) => (
                            <div key={i} className="bg-slate-800/80 border border-slate-700 rounded px-1.5 py-0.5 text-xs flex items-center gap-1 cursor-pointer hover:border-nexus-accent">
                               <span>{r.emoji}</span>
                               <span className="text-slate-500 font-bold">{r.count}</span>
                            </div>
                         ))}
                      </div>
                   )}
                 </div>
               </div>
             );
          })}
          
          {isAITyping && (
             <div className="flex mt-4 items-center gap-2 ml-14">
                <span className="flex gap-1">
                   <span className="w-2 h-2 bg-nexus-glow rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-nexus-glow rounded-full animate-bounce delay-100"></span>
                   <span className="w-2 h-2 bg-nexus-glow rounded-full animate-bounce delay-200"></span>
                </span>
                <span className="text-xs text-nexus-glow font-bold animate-pulse">Nexus AI is thinking...</span>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-6 pt-2">
           <div className="bg-slate-800/80 rounded-lg p-2.5 flex items-start gap-3 shadow-lg ring-1 ring-slate-700 focus-within:ring-nexus-accent transition-all relative z-20">
              
              {/* Plus Menu */}
              <div className="relative">
                 <button 
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    className={`text-slate-400 hover:text-white p-1 rounded-full transition-transform hover:rotate-90 ${showPlusMenu ? 'text-white rotate-45' : ''}`}
                 >
                    <PlusCircle size={20} />
                 </button>
                 {showPlusMenu && (
                    <ContextMenu 
                       onClose={() => setShowPlusMenu(false)} 
                       options={[
                          { label: 'Upload a File', icon: <FileText size={16} />, onClick: () => fileInputRef.current?.click() },
                          { label: 'Create Poll', icon: <BarChart2 size={16} />, onClick: handleCreatePoll },
                       ]}
                    />
                 )}
              </div>
              
              <div className="flex-1">
                  <form onSubmit={handleSend}>
                    <input 
                      className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none h-auto min-h-[24px] resize-none"
                      placeholder={`Message #${channel.name} (Type / for commands)`}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="hidden"/>
                  </form>
              </div>

              <div className="flex items-center gap-2 pr-2 relative">
                 <button 
                    onClick={() => setShowSoundboard(!showSoundboard)}
                    className={`p-1 rounded transition-colors ${showSoundboard ? 'text-nexus-glow bg-nexus-glow/10' : 'text-slate-400 hover:text-white'}`} 
                    title="Soundboard"
                 >
                    <Zap size={20} />
                 </button>

                 <button 
                     onClick={() => setShowGiftModal(true)}
                     className="text-slate-400 hover:text-white" 
                     title="Send Gift"
                 >
                    <Gift size={20} />
                 </button>

                 <div className="relative">
                    <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`text-slate-400 hover:text-yellow-400 transition-colors ${showEmojiPicker ? 'text-yellow-400' : ''}`} 
                        title="Emoji"
                    >
                       <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                       <EmojiPicker 
                          onSelect={(emoji: string) => { setInputValue(prev => prev + emoji); setShowEmojiPicker(false); }} 
                          onClose={() => setShowEmojiPicker(false)} 
                       />
                    )}
                 </div>

                 <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-white" title="Upload Image">
                    <ImageIcon size={20} />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
           </div>
        </div>
      </div>

      {/* Members Sidebar (Hidden on mobile) */}
      <div className="w-60 bg-slate-800/30 border-l border-slate-800 hidden lg:flex flex-col p-3 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Online — {users.filter(u => u.status !== 'OFFLINE').length}</h3>
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} onClick={() => onUserClick(user.id)} className="flex items-center gap-3 group opacity-90 hover:opacity-100 cursor-pointer p-1 rounded hover:bg-slate-700/30">
              <Avatar src={user.avatar} status={user.status} size="sm" />
              <div className="overflow-hidden min-w-0">
                <div className={`font-medium truncate ${user.id === '4' ? 'text-nexus-glow' : 'text-slate-300'} group-hover:text-white flex items-center gap-1`}>
                   {user.username}
                   {user.id === '4' && <Badge color="bg-nexus-accent">BOT</Badge>}
                </div>
                {user.gameActivity && (
                  <div className="text-xs text-slate-500 truncate">
                     {user.status === 'PLAYING' ? 'Playing ' : ''}{user.gameActivity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gift Modal */}
      <Modal isOpen={showGiftModal} onClose={() => setShowGiftModal(false)} title="Send a Gift">
         <div className="p-6 grid grid-cols-2 gap-4">
            <button onClick={() => handleSendGift('Nexus Nitro', '🚀')} className="p-6 bg-slate-700/50 hover:bg-nexus-accent/20 border border-slate-600 hover:border-nexus-accent rounded-xl transition-all flex flex-col items-center gap-3 text-center group">
               <div className="text-4xl group-hover:scale-110 transition-transform">🚀</div>
               <div className="font-bold text-white">Nexus Nitro</div>
               <div className="text-xs text-slate-400">Unlock HD Video & Emojis</div>
            </button>
            <button onClick={() => handleSendGift('Game Pass', '🎮')} className="p-6 bg-slate-700/50 hover:bg-green-500/20 border border-slate-600 hover:border-green-500 rounded-xl transition-all flex flex-col items-center gap-3 text-center group">
               <div className="text-4xl group-hover:scale-110 transition-transform">🎮</div>
               <div className="font-bold text-white">Game Pass</div>
               <div className="text-xs text-slate-400">1 Month Subscription</div>
            </button>
         </div>
      </Modal>
    </div>
  );
};
