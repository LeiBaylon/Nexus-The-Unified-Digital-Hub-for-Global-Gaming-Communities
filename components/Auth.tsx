import React, { useState } from 'react';
import { Button, Input } from './UIComponents';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

interface AuthProps {
  mode: 'LOGIN' | 'REGISTER';
  onSuccess: () => void;
  onSwitch: () => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onSuccess, onSwitch, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-nexus-900 flex items-center justify-center p-4 relative">
       {/* Background */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-nexus-accent/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-t from-nexus-glow/5 to-transparent"></div>
       </div>

      <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl relative z-10">
        <button onClick={onBack} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-slate-900 rounded-full mb-4 shadow-inner ring-1 ring-white/10">
            <Gamepad2 className="w-8 h-8 text-nexus-glow" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Join the Nexus'}
          </h2>
          <p className="text-slate-400 mt-2">
            {mode === 'LOGIN' ? 'Enter the system' : 'Create your gamer identity'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <Input placeholder="xX_Gamer_Xx" required />
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
            <Input type="email" placeholder="player@nexus.gg" required />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <Input type="password" placeholder="••••••••" required />
          </div>

          <Button type="submit" variant="primary" className="w-full py-3 mt-6" disabled={loading}>
            {loading ? 'Processing...' : (mode === 'LOGIN' ? 'Log In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={onSwitch} className="text-nexus-glow hover:underline font-bold">
            {mode === 'LOGIN' ? 'Register' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
