
import React, { useEffect, useState } from 'react';
import { Gamepad2, Zap, Cpu } from 'lucide-react';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('INITIALIZING KERNEL...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 800); 
          return 100;
        }
        
        // Dynamic Status Updates based on progress
        if (prev === 20) setStatus('LOADING ASSETS...');
        if (prev === 40) setStatus('CONNECTING TO MAINFRAME...');
        if (prev === 60) setStatus('SYNCING PROFILES...');
        if (prev === 80) setStatus('LAUNCHING NEXUS...');
        
        return prev + 2; 
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-nexus-900 z-[100] flex flex-col items-center justify-center text-white overflow-hidden cursor-wait">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-nexus-800 via-nexus-900 to-black opacity-80"></div>
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] animate-pulse-slow"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-nexus-accent blur-3xl opacity-20 animate-pulse-slow rounded-full group-hover:opacity-40 transition-opacity duration-500"></div>
          <div className="relative z-10 p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl animate-float">
             <Gamepad2 size={80} className="text-nexus-accent drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
             <div className="absolute -top-3 -right-3 bg-slate-800 rounded-full p-2 border border-slate-700 animate-bounce">
                <Zap size={24} className="text-yellow-400 fill-yellow-400" />
             </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-6xl font-display font-bold tracking-[0.2em] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-nexus-glow to-white animate-scale-in">
          NEXUS
        </h1>
        
        <div className="h-6 mb-8">
           <p className="text-nexus-glow text-xs font-mono tracking-widest animate-fade-in flex items-center gap-2">
             <Cpu size={12} className="animate-spin-slow" />
             {status}
           </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 h-1.5 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/50">
          <div 
            className="h-full bg-gradient-to-r from-nexus-accent to-nexus-glow shadow-[0_0_15px_rgba(139,92,246,0.8)]"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          ></div>
        </div>
        
        {/* Percentage */}
        <div className="mt-2 font-mono text-[10px] text-slate-500 flex justify-between w-80">
           <span>v2.5.0</span>
           <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
