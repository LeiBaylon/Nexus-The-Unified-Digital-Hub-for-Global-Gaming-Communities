import React, { useState, useRef, useEffect } from 'react';
import { Message, User, Channel, SoundEffect } from '../types';
import { Avatar, Button, Badge, EmojiPicker, ContextMenu, Modal, ConfirmModal } from './UIComponents';
import { Send, Hash, Bell, Users, Search, PlusCircle, Smile, Gift, Command, MoreVertical, Music, Zap, Image as ImageIcon, BarChart2, FileText, Check, Trophy, Filter, X, ChevronDown, Trash2, Pin, CornerUpLeft, ExternalLink, Brain, Globe, Copy, Flag, Share, CheckCircle, AlertTriangle, CheckCheck } from 'lucide-react';
import { sendMessageToAI, generateAIImage, getAIStrategy, getAINews } from '../services/gemini';
import { SOUND_EFFECTS } from '../constants';

interface ChatInterfaceProps {
  channel: Channel;
  messages: Message[];
  currentUser: User;
  onSendMessage: (msg: Message) => void;
  onUpdateMessage: (id: string, updates: Partial<Message>) => void;
  onClearMessages: () => void;
  onDeleteMessage: (id: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  users: User[];
  onPlaySound: (sound: SoundEffect) => void;
  onUserClick: (userId: string) => void;
  density: 'comfortable' | 'compact';
}

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diff / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ channel, messages, currentUser, onSendMessage, onUpdateMessage, onClearMessages, onDeleteMessage, onAddReaction, users, onPlaySound, onUserClick, density }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [inputPlaceholder, setInputPlaceholder] = useState('');
  
  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterUserId, setFilterUserId] = useState<string | null>(null);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Pin State
  const [pinnedMessageIds, setPinnedMessageIds] = useState<string[]>([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);

  // Message Deletion State
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  // Message Menu State
  const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);

  // Reply State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Input Action States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  
  // Message Interaction State
  const [reactionTargetId, setReactionTargetId] = useState<string | null>(null);
  
  // New Interactive States
  const [claimedGift, setClaimedGift] = useState<{title: string, icon: string} | null>(null);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [messageToReport, setMessageToReport] = useState<string | null>(null);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic Placeholder Logic
  useEffect(() => {
     const suggestions = [
        `Message #${channel.name}`,
        `Type /image to generate cool art`,
        `Type /strat to get gaming advice`,
        `Try /news to see latest updates`,
        `Ask @Nexus for help`,
        `Share a clip or highlight`,
        `Type /roll for RNG`
     ];
     let index = 0;
     setInputPlaceholder(suggestions[0]);
     
     const interval = setInterval(() => {
        index = (index + 1) % suggestions.length;
        setInputPlaceholder(suggestions[index]);
     }, 4000);

     return () => clearInterval(interval);
  }, [channel.name]);

  // Simulate Read Receipts
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.senderId === currentUser.id && !lastMsg.isRead) {
        const timer = setTimeout(() => {
           onUpdateMessage(lastMsg.id, { isRead: true });
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [messages, currentUser.id, onUpdateMessage]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
        setActiveMessageMenuId(null);
        setReactionTargetId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Enhanced Filter messages logic
  const filteredMessages = messages.filter(msg => {
     // User Filter
     if (filterUserId && msg.senderId !== filterUserId) return false;
     
     // Keyword Filter
     if (filterKeyword && !msg.content.toLowerCase().includes(filterKeyword.toLowerCase())) return false;
     
     // Type Filter
     if (filterType !== 'ALL') {
         if (filterType === 'SYSTEM' && !msg.isSystem) return false;
         if (filterType === 'IMAGE' && msg.type !== 'IMAGE') return false;
         if (filterType === 'GIFT' && msg.type !== 'GIFT') return false;
         if (filterType === 'POLL' && msg.type !== 'POLL') return false;
         if (filterType === 'TEXT' && (msg.type !== 'TEXT' || msg.isSystem)) return false;
     }

     return true;
  });

  const pinnedMessagesList = messages.filter(msg => pinnedMessageIds.includes(msg.id));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAITyping, filterUserId, filterType, filterKeyword]);

  const handleCommand = async (cmd: string, args: string) => {
    // 1. Send User Command Message
    onSendMessage({
       id: Date.now().toString(),
       content: `/${cmd} ${args}`,
       senderId: currentUser.id,
       timestamp: new Date(),
       type: 'TEXT',
       isRead: false
    });
    setInputValue('');

    // 2. Process AI Command
    setIsAITyping(true);
    let aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      senderId: '4', // Nexus AI
      timestamp: new Date(),
      isAI: true,
      type: 'TEXT',
      isRead: true // Bot messages are instant read usually
    };

    try {
      if (cmd === 'image') {
         const imageUrl = await generateAIImage(args);
         if (imageUrl) {
            aiMsg.type = 'IMAGE';
            aiMsg.imageUrl = imageUrl;
            aiMsg.content = `Generated image for: ${args}`;
         } else {
            aiMsg.content = "Failed to generate image. Please try again.";
         }
      } else if (cmd === 'strat') {
         const strategy = await getAIStrategy(args);
         aiMsg.content = strategy;
         aiMsg.content = "🧠 **STRATEGY ANALYSIS**\n\n" + aiMsg.content;
      } else if (cmd === 'news') {
         const newsData = await getAINews(args);
         aiMsg.content = newsData.text;
         aiMsg.groundingUrls = newsData.sources;
      } else {
         // Default logic for other commands
         let systemMsg = '';
         if (cmd === 'roll') systemMsg = `🎲 rolled a ${Math.floor(Math.random() * 100) + 1}`;
         else if (cmd === 'flip') systemMsg = `🪙 flipped ${Math.random() > 0.5 ? 'Heads' : 'Tails'}`;
         
         if (systemMsg) {
             onSendMessage({
                id: (Date.now() + 1).toString(),
                content: systemMsg,
                senderId: '4',
                timestamp: new Date(),
                isSystem: true
             });
             setIsAITyping(false);
             return;
         }
      }
    } catch (e) {
       aiMsg.content = "System Error: Command execution failed.";
    }

    setIsAITyping(false);
    if (aiMsg.content || aiMsg.imageUrl) {
       onSendMessage(aiMsg);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // Command Parsing
    if (inputValue.startsWith('/')) {
      const parts = inputValue.substring(1).split(' ');
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1).join(' ');
      
      if (['image', 'strat', 'news', 'roll', 'flip'].includes(cmd)) {
        handleCommand(cmd, args);
        return;
      } else if (cmd === 'clear') {
         setShowClearConfirm(true);
         setInputValue('');
         return;
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      senderId: currentUser.id,
      timestamp: new Date(),
      type: 'TEXT',
      replyToId: replyingTo?.id,
      isRead: false
    };

    onSendMessage(newMessage);
    setInputValue('');
    setReplyingTo(null);

    // AI Check for Mentions
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

  // Interactive Handlers
  const handleAcceptGift = (gift: {title: string, icon: string}) => {
     setClaimedGift(gift);
     const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); // Reuse Level Up sound
     audio.volume = 0.5;
     audio.play().catch(() => {});
  };

  const handleForwardMessage = (msg: Message) => {
     setMessageToForward(msg);
     setActiveMessageMenuId(null);
  };

  const executeForward = (target: string) => {
     if (messageToForward) {
        onSendMessage({
           id: Date.now().toString(),
           content: `Forwarded: ${messageToForward.content}`,
           senderId: currentUser.id,
           timestamp: new Date(),
           type: 'TEXT'
        });
        setMessageToForward(null);
     }
  };

  const handleReportMessage = (msgId: string) => {
     setMessageToReport(msgId);
     setActiveMessageMenuId(null);
  };

  const executeReport = () => {
     // Here we could simulate an API call
     // Then close the report modal and show confirmation
     setMessageToReport(null);
     setShowReportConfirm(true);
     setTimeout(() => {
        setShowReportConfirm(false);
     }, 2000);
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

  const resetFilters = () => {
    setFilterUserId(null);
    setFilterKeyword('');
    setFilterType('ALL');
  };

  const togglePinMessage = (messageId: string) => {
     setPinnedMessageIds(prev => 
        prev.includes(messageId) 
           ? prev.filter(id => id !== messageId) 
           : [...prev, messageId]
     );
  };

  const handleReply = (msg: Message) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setActiveMessageMenuId(null);
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

      {/* Pinned Messages Panel (Overlay) */}
      {showPinnedMessages && (
         <div className="absolute top-14 right-4 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 flex flex-col max-h-[500px] animate-slide-up">
            <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
               <h3 className="font-bold text-white flex items-center gap-2">
                  <Pin size={16} className="text-nexus-accent" /> Pinned Messages
               </h3>
               <button onClick={() => setShowPinnedMessages(false)} className="text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-1">
               {pinnedMessagesList.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 text-sm flex flex-col items-center gap-2">
                     <Pin size={32} className="opacity-20" />
                     No pinned messages yet.
                     <span className="text-xs">Pin important messages to keep them handy for everyone.</span>
                  </div>
               ) : (
                  pinnedMessagesList.map(msg => {
                     const user = users.find(u => u.id === msg.senderId) || { username: 'Unknown', avatar: '' } as User;
                     return (
                        <div key={msg.id} className="p-3 rounded-lg bg-slate-700/30 border border-slate-700/50 hover:border-nexus-accent/50 transition-colors group relative">
                           <div className="flex items-center gap-2 mb-1">
                              <Avatar src={user.avatar} size="sm" className="w-5 h-5" />
                              <span className="font-bold text-xs text-white truncate">{user.username}</span>
                              <span className="text-[10px] text-slate-500">{formatRelativeTime(msg.timestamp)}</span>
                           </div>
                           <p className="text-xs text-slate-300 line-clamp-3">{msg.content}</p>
                           <button 
                              onClick={() => togglePinMessage(msg.id)}
                              className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 rounded shadow-sm"
                              title="Unpin"
                           >
                              <X size={12} />
                           </button>
                        </div>
                     );
                  })
               )}
            </div>
         </div>
      )}

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-slate-700 flex items-center justify-between px-4 shadow-sm bg-slate-800/80">
          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
            <Hash className="text-slate-400 w-5 h-5 flex-shrink-0" />
            <h3 className="font-bold text-white truncate">{channel.name}</h3>
            {channel.id === 'gen' && <span className="text-xs text-slate-400 hidden lg:block border-l border-slate-600 pl-2 ml-2">General discussion for all gamers</span>}
          </div>
          <div className="flex items-center gap-3 text-slate-400">
             <Button 
                variant={showFilters ? "primary" : "ghost"} 
                className="px-3 h-8 text-xs gap-1"
                onClick={() => setShowFilters(!showFilters)}
             >
                <Filter size={14} /> Filters
                {(filterUserId || filterKeyword || filterType !== 'ALL') && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
             </Button>

             <button 
                onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                className={`p-1.5 rounded transition-colors ${showPinnedMessages ? 'text-white bg-slate-700' : 'text-slate-400 hover:text-white'}`}
                title="Pinned Messages"
             >
                <Pin size={20} className={pinnedMessageIds.length > 0 ? "fill-current" : ""} />
             </button>

             <div className="h-6 w-px bg-slate-700 mx-1 hidden md:block"></div>
             <Bell className="w-5 h-5 cursor-pointer hover:text-white hidden md:block" />
             <Users className="w-5 h-5 cursor-pointer hover:text-white md:hidden" />
          </div>
        </div>

        {/* Filter Toolbar */}
        {showFilters && (
          <div className="bg-slate-800 border-b border-slate-700 p-3 flex flex-wrap items-center gap-3 animate-slide-up shadow-lg relative z-20">
             <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input 
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent" 
                   placeholder="Search keyword..." 
                   value={filterKeyword}
                   onChange={(e) => setFilterKeyword(e.target.value)}
                />
             </div>
             
             {/* Type Selector */}
             <div className="relative">
                 <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:border-nexus-accent appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
                 >
                     <option value="ALL">All Messages</option>
                     <option value="TEXT">Text Only</option>
                     <option value="IMAGE">Images</option>
                     <option value="GIFT">Gifts</option>
                     <option value="POLL">Polls</option>
                     <option value="SYSTEM">System</option>
                 </select>
                 <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
             </div>

             {/* User Selector */}
             <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className={`flex items-center gap-2 bg-slate-900 border ${filterUserId ? 'border-nexus-accent text-nexus-accent' : 'border-slate-700 text-slate-300'} rounded-lg px-3 py-2 text-sm hover:bg-slate-700 transition-colors`}
                >
                   <Users size={14} />
                   <span className="max-w-[100px] truncate">{filterUserId ? users.find(u => u.id === filterUserId)?.username : 'Sender'}</span>
                   <ChevronDown size={14} />
                </button>
                
                {showUserDropdown && (
                   <>
                     <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)} />
                     <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 animate-slide-up">
                        <div className="p-2 border-b border-slate-700 bg-slate-800/50">
                           <div className="text-[10px] font-bold text-slate-500 uppercase">Filter by Sender</div>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                           <button 
                              onClick={() => { setFilterUserId(null); setShowUserDropdown(false); }}
                              className="w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-700 text-slate-400 font-medium mb-1"
                           >
                              All Users
                           </button>
                           {users.map(u => (
                              <button 
                                 key={u.id}
                                 onClick={() => { setFilterUserId(u.id); setShowUserDropdown(false); }}
                                 className={`w-full text-left px-3 py-2 text-xs rounded hover:bg-slate-700 flex items-center gap-2 mb-1 ${filterUserId === u.id ? 'bg-slate-700 text-white' : 'text-slate-300'}`}
                              >
                                 <Avatar src={u.avatar} size="sm" className="w-6 h-6 scale-75 -ml-1" />
                                 {u.username}
                              </button>
                           ))}
                        </div>
                     </div>
                   </>
                )}
             </div>

             {(filterUserId || filterKeyword || filterType !== 'ALL') && (
                <button onClick={resetFilters} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors" title="Clear Filters">
                   <X size={18} />
                </button>
             )}
          </div>
        )}

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto px-4 ${density === 'compact' ? 'py-2 space-y-1' : 'py-4 space-y-6'} custom-scrollbar`}>
          {filteredMessages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Search size={48} className="mb-4 opacity-20" />
                <p>No messages found matching criteria.</p>
                <Button 
                    variant="ghost" 
                    className="mt-4 text-xs"
                    onClick={resetFilters}
                >
                    Clear Filters
                </Button>
             </div>
          ) : (
             filteredMessages.map((msg, index) => {
               const isSequential = density === 'compact' ? false : (index > 0 && filteredMessages[index - 1].senderId === msg.senderId && (msg.timestamp.getTime() - filteredMessages[index-1].timestamp.getTime() < 60000));
               const user = users.find(u => u.id === msg.senderId) || { id: 'unknown', username: 'Unknown', avatar: '', status: 'OFFLINE', badges: [] } as User;
               
               // Resolve Reply
               const replyParent = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
               const replyUser = replyParent ? users.find(u => u.id === replyParent.senderId) : null;

               return (
                 <div key={msg.id} className={`group flex flex-col ${isSequential ? 'mt-1' : 'mt-4'} ${msg.isAI ? 'bg-nexus-accent/5 -mx-4 px-4 py-2 border-l-2 border-nexus-accent' : ''} hover:bg-white/5 -mx-4 px-4 py-1 transition-colors relative`}>
                   
                   {/* Reply Preview */}
                   {replyParent && !isSequential && (
                      <div className="flex items-center gap-2 mb-1 ml-12 text-xs text-slate-500 opacity-80 hover:opacity-100 cursor-pointer">
                         <div className="w-8 border-t-2 border-l-2 border-slate-600 rounded-tl-lg h-3"></div>
                         <div className="flex items-center gap-1">
                            <Avatar src={replyUser?.avatar} size="sm" className="w-4 h-4" />
                            <span className="font-bold text-slate-400">@{replyUser?.username}</span>
                            <span className="truncate max-w-[200px] italic">{replyParent.content}</span>
                         </div>
                      </div>
                   )}

                   <div className="flex relative">
                      {/* Message Actions */}
                      <div className="absolute right-4 top-[-10px] bg-slate-800 border border-slate-700 rounded flex items-center p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                          <div className="relative">
                            <button 
                                className={`p-1 hover:bg-slate-700 rounded transition-colors ${reactionTargetId === msg.id ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`} 
                                title="Add Reaction"
                                onClick={(e) => { e.stopPropagation(); setReactionTargetId(reactionTargetId === msg.id ? null : msg.id); }}
                            >
                                <Smile size={14} />
                            </button>
                            {reactionTargetId === msg.id && (
                                <EmojiPicker 
                                  onSelect={(emoji: string) => { onAddReaction(msg.id, emoji); setReactionTargetId(null); }}
                                  onClose={() => setReactionTargetId(null)}
                                  className="top-8 right-0"
                                />
                            )}
                          </div>
                          <button 
                            className={`p-1 hover:bg-slate-700 rounded transition-colors ${pinnedMessageIds.includes(msg.id) ? 'text-nexus-accent' : 'text-slate-400 hover:text-white'}`} 
                            title={pinnedMessageIds.includes(msg.id) ? "Unpin" : "Pin"}
                            onClick={() => togglePinMessage(msg.id)}
                          >
                            <Pin size={14} fill={pinnedMessageIds.includes(msg.id) ? "currentColor" : "none"} />
                          </button>
                          
                          <button 
                              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white" 
                              title="Reply"
                              onClick={() => handleReply(msg)}
                          >
                             <CornerUpLeft size={14} />
                          </button>

                          {/* Context Menu Trigger */}
                          <div className="relative">
                            <button 
                              className={`p-1 hover:bg-slate-700 rounded transition-colors ${activeMessageMenuId === msg.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`} 
                              title="More"
                              onClick={(e) => {
                                e.stopPropagation(); 
                                setActiveMessageMenuId(activeMessageMenuId === msg.id ? null : msg.id);
                              }}
                            >
                              <MoreVertical size={14} />
                            </button>
                            {activeMessageMenuId === msg.id && (
                              <div className="absolute right-0 top-8 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-slide-up">
                                <button onClick={() => handleCopyText(msg.content)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                                  <Copy size={12} /> Copy Text
                                </button>
                                <button onClick={() => handleForwardMessage(msg)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                                  <Share size={12} /> Forward
                                </button>
                                <div className="h-px bg-slate-700 my-1" />
                                <button onClick={() => handleReportMessage(msg.id)} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                  <Flag size={12} /> Report
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Delete Action (Only for current user) */}
                          {msg.senderId === currentUser.id && (
                            <button 
                                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400" 
                                title="Delete"
                                onClick={() => setMessageToDelete(msg.id)}
                            >
                                <Trash2 size={14} />
                            </button>
                          )}
                      </div>

                      {!isSequential ? (
                        <div className="mr-4 flex-shrink-0 mt-0.5">
                          <Avatar src={user.avatar} size="md" className="w-10 h-10 hover:opacity-80 transition-opacity" onClick={() => onUserClick(user.id)} />
                        </div>
                      ) : (
                          <div 
                            className="w-14 flex-shrink-0 text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 text-right pr-4 select-none cursor-help"
                            title={msg.timestamp.toLocaleString()}
                          >
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
                            <span className="text-xs text-slate-500 ml-1" title={msg.timestamp.toLocaleString()}>
                              {formatRelativeTime(msg.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        {/* CONTENT RENDERING BASED ON TYPE */}
                        {msg.type === 'IMAGE' && msg.imageUrl ? (
                            <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 max-w-sm group/image relative">
                              <img src={msg.imageUrl} alt="Uploaded content" className="w-full h-auto" />
                              <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                <a href={msg.imageUrl} download="nexus_image.png" className="bg-black/50 p-2 rounded text-white hover:bg-nexus-accent"><ImageIcon size={16}/></a>
                              </div>
                            </div>
                        ) : msg.type === 'GIFT' && msg.giftData ? (
                            <div className="mt-2 bg-gradient-to-r from-nexus-accent/20 to-nexus-glow/20 border border-nexus-accent/50 rounded-lg p-4 max-w-sm flex items-center gap-4">
                              <div className="text-4xl">{msg.giftData.icon}</div>
                              <div>
                                  <div className="font-bold text-white uppercase tracking-wider text-xs mb-1">Gift Dropped</div>
                                  <div className="font-bold text-lg text-nexus-glow">{msg.giftData.title}</div>
                                  <Button onClick={() => msg.giftData && handleAcceptGift(msg.giftData)} variant="primary" className="mt-2 py-1 px-3 text-xs">Accept Gift</Button>
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
                            <div className="flex items-end gap-2 group/text">
                                <p className={`text-slate-300 whitespace-pre-wrap leading-relaxed ${msg.isAI ? 'font-medium' : ''} ${msg.isSystem ? 'italic text-nexus-glow' : ''}`}>
                                  {msg.content}
                                </p>
                                {/* Read Receipt */}
                                {msg.senderId === currentUser.id && (
                                    <CheckCheck 
                                        size={14} 
                                        className={`${msg.isRead ? 'text-nexus-glow' : 'text-slate-600'} transition-colors ml-1 mb-0.5`} 
                                        title={msg.isRead ? "Read" : "Sent"}
                                    />
                                )}
                            </div>
                        )}
                        
                        {/* Grounding Sources (Search Results) */}
                        {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.groundingUrls.map((source, idx) => (
                              <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 hover:border-nexus-glow rounded-full px-3 py-1 text-slate-400 hover:text-nexus-glow transition-all"
                              >
                                <Globe size={10} />
                                <span className="truncate max-w-[150px]">{source.title}</span>
                                <ExternalLink size={10} />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Reactions */}
                        {msg.reactions && (
                            <div className="flex gap-1 mt-1">
                              {msg.reactions.map((r, i) => (
                                  <div key={i} className="bg-slate-800/80 border border-slate-700 rounded px-1.5 py-0.5 text-xs flex items-center gap-1 cursor-pointer hover:border-nexus-accent transition-colors" onClick={() => onAddReaction(msg.id, r.emoji)}>
                                    <span>{r.emoji}</span>
                                    <span className="text-slate-500 font-bold">{r.count}</span>
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                   </div>
                 </div>
               );
            })
          )}
          
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
           {/* Replying Banner */}
           {replyingTo && (
              <div className="flex items-center justify-between bg-slate-800 border-x border-t border-slate-700 rounded-t-lg px-4 py-2 text-sm animate-slide-up">
                 <div className="flex items-center gap-2 text-slate-300">
                    <CornerUpLeft size={14} className="text-nexus-accent" />
                    <span>Replying to <span className="font-bold text-white">@{users.find(u => u.id === replyingTo.senderId)?.username}</span></span>
                 </div>
                 <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                 </button>
              </div>
           )}

           <div className={`bg-slate-800/80 ${replyingTo ? 'rounded-b-lg border-t-0' : 'rounded-lg'} p-2.5 flex items-start gap-3 shadow-lg ring-1 ring-slate-700 focus-within:ring-nexus-accent transition-all relative z-20`}>
              
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
                          { label: 'Generate Image', icon: <ImageIcon size={16} />, onClick: () => { setInputValue('/image '); inputRef.current?.focus(); } },
                          { label: 'Gaming News', icon: <Globe size={16} />, onClick: () => { setInputValue('/news '); inputRef.current?.focus(); } },
                       ]}
                    />
                 )}
              </div>
              
              <div className="flex-1">
                  <form onSubmit={handleSend}>
                    <input 
                      ref={inputRef}
                      className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none h-auto min-h-[24px] resize-none transition-all duration-300"
                      placeholder={inputPlaceholder}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="hidden"/>
                  </form>
              </div>

              <div className="flex items-center gap-2 pr-2 relative">
                 <button 
                    onClick={() => { setInputValue('/strat '); inputRef.current?.focus(); }}
                    className="p-1 rounded text-slate-400 hover:text-nexus-accent transition-colors" 
                    title="AI Strategy Analysis"
                 >
                    <Brain size={20} />
                 </button>

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

      {/* Claimed Gift Modal */}
      <Modal isOpen={!!claimedGift} onClose={() => setClaimedGift(null)} title="Gift Claimed!" size="sm">
         {claimedGift && (
             <div className="p-8 flex flex-col items-center text-center animate-scale-in">
                 <div className="w-24 h-24 bg-nexus-accent/20 rounded-full flex items-center justify-center mb-6 ring-4 ring-nexus-accent/40 animate-pulse">
                     <span className="text-6xl filter drop-shadow-lg">{claimedGift.icon}</span>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">{claimedGift.title}</h3>
                 <p className="text-slate-400 mb-6">has been added to your inventory.</p>
                 <Button onClick={() => setClaimedGift(null)} variant="primary" className="w-full">
                     Awesome!
                 </Button>
             </div>
         )}
      </Modal>

      {/* Forward Message Modal */}
      <Modal isOpen={!!messageToForward} onClose={() => setMessageToForward(null)} title="Forward Message" size="sm">
        <div className="p-4">
           <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 mb-4 text-sm text-slate-300 italic border-l-4 border-l-slate-500">
               "{messageToForward?.content}"
           </div>
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Select Recipient</h4>
           <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
              {users.map(u => (
                  <button 
                     key={u.id} 
                     onClick={() => executeForward(u.username)}
                     className="w-full flex items-center gap-3 p-2 hover:bg-slate-700 rounded-lg transition-colors text-left"
                  >
                      <Avatar src={u.avatar} size="sm" className="w-8 h-8" />
                      <span className="font-medium text-slate-200">{u.username}</span>
                      <Send size={14} className="ml-auto text-slate-500" />
                  </button>
              ))}
           </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal isOpen={!!messageToReport} onClose={() => setMessageToReport(null)} title="Report Message" size="sm">
          <div className="p-6">
              <p className="text-slate-300 mb-4">Please select a reason for reporting this message:</p>
              <div className="space-y-2 mb-6">
                  {['Spam or Unwanted Commercial Content', 'Harassment or Bullying', 'Hate Speech', 'NSFW Content', 'Other'].map((reason) => (
                      <label key={reason} className="flex items-center gap-3 p-3 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                          <input type="radio" name="reportReason" className="text-nexus-accent focus:ring-nexus-accent bg-slate-800 border-slate-600" />
                          <span className="text-sm text-white">{reason}</span>
                      </label>
                  ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setMessageToReport(null)}>Cancel</Button>
                <Button variant="danger" onClick={executeReport}>Submit Report</Button>
              </div>
          </div>
      </Modal>

      {/* Report Success Modal */}
      <Modal isOpen={showReportConfirm} onClose={() => {}} size="sm">
          <div className="p-10 flex flex-col items-center text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                  <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Report Received</h3>
              <p className="text-slate-400">Thank you for helping keep Nexus safe. Our team will review this shortly.</p>
          </div>
      </Modal>

      {/* Clear Confirm Modal */}
      <ConfirmModal 
        isOpen={showClearConfirm} 
        onClose={() => setShowClearConfirm(false)} 
        onConfirm={onClearMessages}
        title="Clear Chat History"
        message="Are you sure you want to clear your view of the chat history? This action cannot be undone."
      />

      {/* Delete Message Confirm Modal */}
      <ConfirmModal 
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={() => messageToDelete && onDeleteMessage(messageToDelete)}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
      />
    </div>
  );
};