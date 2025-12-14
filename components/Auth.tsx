
import React, { useState } from 'react';
import { ArrowLeft, Gamepad2, Mail, Lock, User, Calendar, Globe, Check, Eye, EyeOff } from 'lucide-react';
import { Modal, Button } from './UIComponents';

interface AuthProps {
  mode: 'LOGIN' | 'REGISTER';
  onSuccess: () => void;
  onSwitch: () => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onSuccess, onSwitch, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [activePolicy, setActivePolicy] = useState<'TERMS' | 'PRIVACY' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    region: 'US-East',
    dob: '',
    agreed: false
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-nexus-accent/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-nexus-glow/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 animate-scale-in">
            <button 
                onClick={onBack} 
                className="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
            >
                <ArrowLeft size={20} />
            </button>

            <div className="flex flex-col items-center mb-8 pt-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(139,92,246,0.15)] group">
                    <Gamepad2 size={32} className="text-nexus-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white tracking-wide">
                    {mode === 'LOGIN' ? 'Welcome Back' : 'Join the Nexus'}
                </h2>
                <p className="text-slate-400 mt-2 text-center text-sm">
                    {mode === 'LOGIN' ? 'Enter the system' : 'Create your gamer identity'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'REGISTER' && (
                    <>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                             <div className="relative group">
                                <User className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-nexus-accent transition-colors" size={18} />
                                <input 
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent transition-all placeholder-slate-600 hover:border-slate-600"
                                    placeholder="xX_Gamer_Xx"
                                    value={formData.username}
                                    onChange={e => handleChange('username', e.target.value)}
                                    required
                                />
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Region</label>
                                <div className="relative group">
                                    <Globe className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-nexus-accent transition-colors" size={18} />
                                    <select 
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-2 text-slate-200 focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent transition-all appearance-none cursor-pointer hover:border-slate-600 text-sm"
                                        value={formData.region}
                                        onChange={e => handleChange('region', e.target.value)}
                                    >
                                        <option value="US-East">US East</option>
                                        <option value="US-West">US West</option>
                                        <option value="EU-West">EU West</option>
                                        <option value="Asia">Asia</option>
                                        <option value="OCE">Oceania</option>
                                    </select>
                                </div>
                             </div>
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Birth Date</label>
                                <div className="relative group">
                                    <input 
                                        type="date"
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 px-3 text-slate-200 focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent transition-all placeholder-slate-600 [color-scheme:dark] hover:border-slate-600 text-sm"
                                        value={formData.dob}
                                        onChange={e => handleChange('dob', e.target.value)}
                                        required
                                    />
                                </div>
                             </div>
                        </div>
                    </>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-nexus-accent transition-colors" size={18} />
                        <input 
                            type="email"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent transition-all placeholder-slate-600 hover:border-slate-600"
                            placeholder="player@nexus.gg"
                            value={formData.email}
                            onChange={e => handleChange('email', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-nexus-accent transition-colors" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-10 text-slate-200 focus:outline-none focus:border-nexus-accent focus:ring-1 focus:ring-nexus-accent transition-all placeholder-slate-600 hover:border-slate-600"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => handleChange('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {mode === 'REGISTER' && (
                    <div className="flex items-start gap-3 pt-2 group">
                        <div className="relative flex items-center mt-0.5">
                            <input 
                                type="checkbox" 
                                id="terms"
                                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-600 bg-slate-900 transition-all checked:border-nexus-accent checked:bg-nexus-accent hover:border-nexus-accent"
                                checked={formData.agreed}
                                onChange={e => handleChange('agreed', e.target.checked)}
                                required
                            />
                            <Check size={10} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                        </div>
                        <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer select-none leading-relaxed group-hover:text-slate-300 transition-colors">
                            I agree to the <span className="text-nexus-accent hover:underline font-bold" onClick={(e) => { e.preventDefault(); setActivePolicy('TERMS'); }}>Terms of Service</span> and <span className="text-nexus-accent hover:underline font-bold" onClick={(e) => { e.preventDefault(); setActivePolicy('PRIVACY'); }}>Privacy Policy</span>.
                        </label>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-nexus-accent hover:bg-violet-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(139,92,246,0.39)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.23)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 relative overflow-hidden group"
                >
                    <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer" />
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Processing...
                        </span>
                    ) : (
                        mode === 'LOGIN' ? 'Log In' : 'Create Account'
                    )}
                </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-800 pt-6">
                <p className="text-slate-400 text-sm">
                    {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={onSwitch} className="text-nexus-glow font-bold ml-2 hover:underline transition-colors">
                        {mode === 'LOGIN' ? 'Register' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>

        {/* Policy Modals */}
        <Modal isOpen={!!activePolicy} onClose={() => setActivePolicy(null)} title={activePolicy === 'TERMS' ? 'Terms of Service' : 'Privacy Policy'}>
            <div className="p-6 text-slate-300 space-y-4 text-sm leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activePolicy === 'TERMS' ? (
                    <>
                        <p><strong>Effective Date:</strong> October 24, 2025</p>
                        <p>Welcome to Nexus! These Terms of Service ("Terms") govern your use of the Nexus platform. By creating an account, you agree to these rules.</p>
                        
                        <h4 className="font-bold text-white mt-4">1. Code of Conduct</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>No Toxicity:</strong> Harassment, hate speech, and bullying are strictly prohibited.</li>
                            <li><strong>Fair Play:</strong> Cheating, using exploits, or promoting hacks will result in an immediate permanent ban.</li>
                            <li><strong>Safety:</strong> Do not share personal information (doxxing) or distribute harmful content.</li>
                        </ul>

                        <h4 className="font-bold text-white mt-4">2. User Accounts</h4>
                        <p>You are responsible for maintaining the security of your account credentials. Nexus is not liable for unauthorized access resulting from your failure to secure your account.</p>

                        <h4 className="font-bold text-white mt-4">3. Content Rights</h4>
                        <p>You retain ownership of messages and content you post. However, you grant Nexus a license to host, display, and distribute this content within the platform.</p>
                        
                        <h4 className="font-bold text-white mt-4">4. Termination</h4>
                        <p>We reserve the right to suspend or terminate access to Nexus at any time for violations of these Terms or for any other reason deemed necessary to protect the community.</p>
                    </>
                ) : (
                    <>
                        <p><strong>Last Updated:</strong> October 24, 2025</p>
                        <p>Your privacy is critical to us. This Privacy Policy explains what data we collect and how it is used.</p>

                        <h4 className="font-bold text-white mt-4">1. Data We Collect</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Account Info:</strong> Username, email address, and date of birth.</li>
                            <li><strong>Usage Data:</strong> Chat logs (stored securely), server memberships, and activity status.</li>
                            <li><strong>Technical Data:</strong> IP address, device type, and crash reports for debugging.</li>
                        </ul>

                        <h4 className="font-bold text-white mt-4">2. How We Use Data</h4>
                        <p>We use your data to facilitate real-time communication, personalize your experience (e.g., game recommendations), and ensure platform safety through automated moderation tools.</p>

                        <h4 className="font-bold text-white mt-4">3. Data Sharing</h4>
                        <p><strong>We do not sell your data.</strong> We only share data with essential infrastructure providers (e.g., cloud hosting) or when required by law.</p>

                        <h4 className="font-bold text-white mt-4">4. Your Rights</h4>
                        <p>You can request a copy of your data or deletion of your account at any time via the User Settings menu.</p>
                    </>
                )}
            </div>
            <div className="p-6 pt-0">
                <Button variant="primary" className="w-full" onClick={() => setActivePolicy(null)}>Close</Button>
            </div>
        </Modal>
    </div>
  );
};

export default Auth;
