
import React, { Fragment } from 'react';
import { X } from 'lucide-react';

export const Button = ({ children, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-6 py-2 rounded-lg font-display font-bold tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-nexus-accent hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    glow: "bg-transparent border border-nexus-glow text-nexus-glow hover:bg-nexus-glow/10 shadow-[0_0_10px_rgba(6,182,212,0.3)]",
    ghost: "bg-transparent hover:bg-white/10 text-slate-400 hover:text-white",
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white",
    success: "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/30"
  };

  return (
    <button className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ className = '', label, ...props }: any) => (
  <div className="w-full">
    {label && <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>}
    <input 
      className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent transition-colors ${className}`}
      {...props}
    />
  </div>
);

export const Switch = ({ checked, onChange, label }: any) => (
  <div className="flex items-center justify-between py-2">
    {label && <span className="text-slate-300 font-medium">{label}</span>}
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${checked ? 'bg-nexus-accent' : 'bg-slate-700'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

export const Keycap = ({ children, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={`min-w-[32px] px-2 h-8 rounded border-b-4 text-xs font-bold font-mono flex items-center justify-center transition-all active:border-b-0 active:translate-y-1 ${
      active 
        ? 'bg-nexus-accent border-violet-800 text-white animate-pulse' 
        : 'bg-slate-800 border-slate-950 text-slate-400 hover:text-white hover:bg-slate-700'
    }`}
  >
    {children}
  </button>
);

export const RadioCard = ({ selected, onClick, title, color }: any) => (
  <button
    onClick={onClick}
    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
      selected 
        ? 'border-nexus-accent bg-nexus-accent/10 ring-1 ring-nexus-accent shadow-lg shadow-nexus-accent/20' 
        : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
    }`}
  >
    <div className={`w-8 h-8 rounded-full mb-3 ${color}`}></div>
    <div className={`font-bold ${selected ? 'text-nexus-accent' : 'text-slate-300'}`}>{title}</div>
  </button>
);

export const Avatar = ({ src, status, size = 'md', className = '', badge, onClick }: any) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-32 h-32', '2xl': 'w-40 h-40' };
  
  const statusColors = {
    ONLINE: 'bg-green-500',
    IDLE: 'bg-yellow-500',
    DND: 'bg-red-500',
    OFFLINE: 'bg-slate-500',
    PLAYING: 'bg-nexus-accent',
  };

  return (
    <div className={`relative ${className} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <img src={src} alt="Avatar" className={`${sizes[size as keyof typeof sizes]} rounded-full object-cover border-2 border-slate-800`} />
      {status && (
        <span className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-2 ring-slate-900 ${statusColors[status as keyof typeof statusColors]}`} />
      )}
      {badge && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] ring-1 ring-slate-700">
          {badge}
        </span>
      )}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: any) => {
  if (!isOpen) return null;
  
  const maxSizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-nexus-900/90 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full ${maxSizes[size as keyof typeof maxSizes]} max-h-[90vh] overflow-hidden flex flex-col animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-900/50">
          {children}
        </div>
        {!title && (
           <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white transition-colors">
              <X size={20} />
           </button>
        )}
      </div>
    </div>
  );
};

export const ProgressBar = ({ value, max, color = "bg-nexus-accent", className = "" }: any) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-2 bg-slate-700 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`h-full ${color} transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export const Badge = ({ children, color = "bg-slate-700" }: any) => (
  <span className={`${color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide`}>
    {children}
  </span>
);

export const Tabs = ({ tabs, activeTab, onChange }: { tabs: string[], activeTab: string, onChange: (t: string) => void }) => (
  <div className="flex border-b border-slate-700 mb-6">
    {tabs.map(tab => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-6 py-3 font-display font-bold tracking-wide transition-colors relative ${
          activeTab === tab ? 'text-nexus-accent' : 'text-slate-400 hover:text-white'
        }`}
      >
        {tab}
        {activeTab === tab && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexus-accent shadow-[0_-2px_10px_rgba(139,92,246,0.5)]"></div>
        )}
      </button>
    ))}
  </div>
);

export const EmojiPicker = ({ onSelect, onClose }: any) => {
  const emojis = ["👍", "❤️", "😂", "😮", "😢", "🔥", "✨", "💀", "💩", "🎉", "🎮", "👾", "🤖", "💎", "🛡️", "⚔️", "🍕", "🌮", "🍻", "🚀"];
  
  return (
    <div className="absolute bottom-12 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 w-64 animate-slide-up z-50">
      <div className="grid grid-cols-5 gap-2">
        {emojis.map(emoji => (
          <button 
            key={emoji} 
            onClick={() => onSelect(emoji)}
            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-700 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ContextMenu = ({ options, onClose, position }: any) => (
  <div 
    className="absolute bottom-12 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-48 overflow-hidden z-50 animate-slide-up"
  >
    {options.map((opt: any, i: number) => (
      <button
        key={i}
        onClick={() => { opt.onClick(); onClose(); }}
        className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-3 text-sm font-medium"
      >
        {opt.icon}
        {opt.label}
      </button>
    ))}
  </div>
);
