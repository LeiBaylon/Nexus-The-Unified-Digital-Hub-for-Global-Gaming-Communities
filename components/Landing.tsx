
import React, { useEffect, useState, useRef } from 'react';
import { Button, Input, Modal } from './UIComponents';
import { 
  Gamepad2, Zap, Cpu, Users, Shield, Globe, 
  Mic, MessageSquare, ChevronRight, Play, Star,
  Headphones, Server, Command, Rocket, LogIn, Plus, Send, Hash, X, Bot, Check, CheckCircle
} from 'lucide-react';
import { sendMessageToAI } from '../services/gemini';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  
  // Footer Modal State
  const [activeFooterModal, setActiveFooterModal] = useState<string | null>(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<{id: string, text: string, isBot: boolean}[]>([
    { id: '1', text: "Hello! I'm Nexus Bot. How can I help you explore the platform today?", isBot: true }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now().toString(), text: chatInput, isBot: false };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsBotTyping(true);

    try {
       const response = await sendMessageToAI(`(Context: Landing Page Sales/Support) User asked: ${chatInput}`);
       const botMsg = { id: (Date.now() + 1).toString(), text: response, isBot: true };
       setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
       const errorMsg = { id: (Date.now() + 1).toString(), text: "I'm having trouble connecting to the mainframe. Try again later.", isBot: true };
       setChatMessages(prev => [...prev, errorMsg]);
    } finally {
       setIsBotTyping(false);
    }
  };

  const renderFooterModalContent = () => {
    switch(activeFooterModal) {
        case 'Download':
            return (
                <div className="space-y-6 text-center">
                    <p className="text-slate-300">Get Nexus for your desktop and mobile devices.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-6 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl flex flex-col items-center gap-3 transition-colors group">
                            <div className="text-4xl group-hover:scale-110 transition-transform">🪟</div>
                            <div className="font-bold text-white">Windows</div>
                            <span className="text-xs text-slate-500">Win 10/11 (x64)</span>
                        </button>
                        <button className="p-6 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl flex flex-col items-center gap-3 transition-colors group">
                            <div className="text-4xl group-hover:scale-110 transition-transform">🍎</div>
                            <div className="font-bold text-white">macOS</div>
                            <span className="text-xs text-slate-500">Apple Silicon / Intel</span>
                        </button>
                        <button className="p-6 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl flex flex-col items-center gap-3 transition-colors group">
                            <div className="text-4xl group-hover:scale-110 transition-transform">🐧</div>
                            <div className="font-bold text-white">Linux</div>
                            <span className="text-xs text-slate-500">deb / rpm / AppImage</span>
                        </button>
                    </div>
                </div>
            );
        case 'Nitro Boost':
            return (
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-nexus-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                        <Rocket className="w-10 h-10 text-nexus-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Supercharge Your Experience</h3>
                    <ul className="text-left max-w-sm mx-auto space-y-3 text-slate-300">
                        <li className="flex gap-3 items-center"><Check className="text-green-500 w-5 h-5" /> <span>High quality 4K video streaming</span></li>
                        <li className="flex gap-3 items-center"><Check className="text-green-500 w-5 h-5" /> <span>Larger file uploads (500MB)</span></li>
                        <li className="flex gap-3 items-center"><Check className="text-green-500 w-5 h-5" /> <span>Custom profile themes & banners</span></li>
                        <li className="flex gap-3 items-center"><Check className="text-green-500 w-5 h-5" /> <span>Exclusive profile badge</span></li>
                    </ul>
                    <Button variant="primary" className="w-full" onClick={() => { onGetStarted(); setActiveFooterModal(null); }}>Subscribe - $9.99/mo</Button>
                </div>
            );
        case 'Status':
            return (
                 <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center justify-between">
                        <span className="font-bold text-green-500 flex items-center gap-2"><CheckCircle size={20} /> All Systems Operational</span>
                        <span className="text-xs text-slate-400">Refreshed 1m ago</span>
                    </div>
                    <div className="space-y-2">
                         {['API Gateway', 'Voice Servers (US-East)', 'Voice Servers (EU-West)', 'Media Proxy', 'Push Notifications'].map(service => (
                             <div key={service} className="flex justify-between items-center p-3 bg-slate-800 rounded border border-slate-700">
                                 <span className="text-slate-300">{service}</span>
                                 <span className="text-green-500 text-sm font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Operational
                                 </span>
                             </div>
                         ))}
                    </div>
                 </div>
            );
        case 'Support':
             return (
                 <div className="space-y-4">
                     <p className="text-slate-300">Need help? Our support team is here for you.</p>
                     <Input label="Email" placeholder="your@email.com" />
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Issue Type</label>
                         <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-nexus-accent focus:outline-none">
                            <option>Account Access</option>
                            <option>Billing</option>
                            <option>Technical Issue</option>
                            <option>Report User</option>
                         </select>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                         <textarea className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-nexus-accent focus:outline-none" rows={4} placeholder="Describe your problem..."></textarea>
                     </div>
                     <Button variant="primary" onClick={() => setActiveFooterModal(null)}>Submit Ticket</Button>
                 </div>
             );
        case 'Developers':
             return (
                 <div className="text-center space-y-6">
                     <div className="text-6xl animate-bounce">🤖</div>
                     <h3 className="text-xl font-bold text-white">Build on Nexus</h3>
                     <p className="text-slate-300">Create bots, integrate games, and extend the platform with our robust API.</p>
                     <div className="flex gap-4 justify-center">
                         <Button variant="secondary" onClick={() => setActiveFooterModal(null)}>Read Docs</Button>
                         <Button variant="primary" onClick={() => setActiveFooterModal(null)}>Get API Key</Button>
                     </div>
                 </div>
             );
        case 'Community Guidelines':
             return (
                 <div className="space-y-4 text-slate-300 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                     <p className="p-3 bg-slate-800 rounded border border-slate-700">1. <strong>Be Respectful</strong>: Harassment, hate speech, and bullying are not tolerated.</p>
                     <p className="p-3 bg-slate-800 rounded border border-slate-700">2. <strong>No Cheating</strong>: Promoting hacks, cheats, or exploits results in an immediate ban.</p>
                     <p className="p-3 bg-slate-800 rounded border border-slate-700">3. <strong>Safe Content</strong>: No NSFW content in public channels. Keep it friendly.</p>
                     <p className="p-3 bg-slate-800 rounded border border-slate-700">4. <strong>No Spam</strong>: Don't spam channels or DM users unsolicited.</p>
                     <p className="p-3 bg-slate-800 rounded border border-slate-700">5. <strong>Privacy</strong>: Do not doxx or share others' private information.</p>
                     <p className="text-xs text-slate-500 pt-4">Last updated: Oct 2024</p>
                 </div>
             );
        case 'About':
             return (
                 <div className="space-y-4">
                     <p className="text-slate-300 leading-relaxed">
                         Nexus was founded in 2024 by a group of former pro-gamers and software engineers who were tired of bloated, resource-heavy chat applications.
                     </p>
                     <p className="text-slate-300 leading-relaxed">
                         Our mission is to provide the fastest, most reliable communication platform for gamers, without sacrificing privacy or performance.
                     </p>
                     <div className="grid grid-cols-3 gap-4 mt-6">
                         <div className="text-center p-4 bg-slate-800 rounded-lg">
                             <div className="font-bold text-2xl text-white">10M+</div>
                             <div className="text-xs text-slate-500 font-bold uppercase">Users</div>
                         </div>
                         <div className="text-center p-4 bg-slate-800 rounded-lg">
                             <div className="font-bold text-2xl text-white">99.9%</div>
                             <div className="text-xs text-slate-500 font-bold uppercase">Uptime</div>
                         </div>
                         <div className="text-center p-4 bg-slate-800 rounded-lg">
                             <div className="font-bold text-2xl text-white">Global</div>
                             <div className="text-xs text-slate-500 font-bold uppercase">Coverage</div>
                         </div>
                     </div>
                 </div>
             );
        case 'Careers':
             return (
                 <div className="space-y-4">
                     <p className="text-slate-300 mb-4">Join our mission to connect gamers worldwide.</p>
                     <div className="space-y-2">
                         {['Senior Frontend Engineer', 'Backend Go Developer', 'DevOps Specialist', 'Product Designer'].map(job => (
                             <div key={job} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer group">
                                 <div>
                                     <div className="font-bold text-white group-hover:text-nexus-accent transition-colors">{job}</div>
                                     <div className="text-xs text-slate-500">Remote • Full-time</div>
                                 </div>
                                 <Button variant="ghost" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Apply</Button>
                             </div>
                         ))}
                     </div>
                 </div>
             );
        case 'Privacy':
             return (
                 <div className="space-y-4 text-slate-300 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                     <p><strong>Data Collection</strong>: We only collect what is necessary to provide the service (username, email, usage data).</p>
                     <p><strong>No Selling Data</strong>: We do not sell your personal data to third parties. Ever.</p>
                     <p><strong>Encryption</strong>: All voice and video calls are end-to-end encrypted.</p>
                     <p><strong>Deletion</strong>: You can request full data deletion at any time via Settings.</p>
                     <p><strong>Cookies</strong>: We use cookies to keep you logged in and remember your preferences.</p>
                 </div>
             );
        default: return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-nexus-900 text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-nexus-accent/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-nexus-glow/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-nexus-900/90 backdrop-blur-md py-4 shadow-lg border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="relative">
              <div className="absolute inset-0 bg-nexus-accent blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Gamepad2 className="w-8 h-8 text-nexus-accent relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-2xl font-display font-bold tracking-wider text-white group-hover:text-nexus-glow transition-colors">NEXUS</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={onLogin} className="hidden sm:flex items-center gap-2 hover:bg-white/5">
              <LogIn className="w-4 h-4" /> Log In
            </Button>
            <Button variant="primary" onClick={onGetStarted} className="px-8 shadow-nexus-accent/50 hover:shadow-nexus-accent/80 flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Join Beta
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto text-center perspective-1000">
        <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
          <span className="inline-block py-1 px-3 rounded-full bg-nexus-glow/10 border border-nexus-glow/30 text-nexus-glow text-sm font-semibold mb-6 animate-pulse hover:bg-nexus-glow/20 transition-colors cursor-default select-none">
             v2.5 NOW LIVE • POWERED BY GEMINI 2.5
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight mb-6 tracking-tight drop-shadow-2xl">
            WHERE GAMERS <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-nexus-glow via-white to-nexus-accent animate-pulse-slow">
              CONVERGE
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed opacity-90">
            Experience ultra-low latency voice, AI-driven strategy assistance, and a community platform built from the ground up for esports and casual play.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Button onClick={onGetStarted} variant="primary" className="py-4 px-8 text-lg flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 fill-current" /> Start Playing Free
            </Button>
            <Button onClick={onLogin} variant="glow" className="py-4 px-8 text-lg flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" /> Watch Demo
            </Button>
          </div>
        </div>

        {/* 3D Mockup */}
        <div className="relative mx-auto max-w-5xl mt-10 animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent z-20"></div>
          {/* Main Container Mockup */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-x-12 transform transition-transform hover:scale-[0.98] hover:rotate-x-6 duration-700 ease-out group">
             {/* Glow behind mockup */}
             <div className="absolute -inset-1 bg-gradient-to-r from-nexus-accent to-nexus-glow opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
             
             <div className="relative bg-slate-900 h-full">
                {/* Mock Header */}
                <div className="h-12 bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-700">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                   </div>
                   <div className="mx-auto bg-slate-950/50 px-4 py-1 rounded text-xs text-slate-500 font-mono flex items-center gap-2">
                      <Gamepad2 size={10} /> nexus-client-v2.exe
                   </div>
                </div>
                {/* Mock Content */}
                <div className="flex h-[500px] md:h-[600px]">
                   {/* Sidebar */}
                   <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative group/icon cursor-pointer hover:border-nexus-accent transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                         <img src="https://picsum.photos/id/100/100/100" className="w-full h-full object-cover opacity-80 group-hover/icon:opacity-100 transition-opacity" />
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative group/icon cursor-pointer hover:border-nexus-accent transition-all hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                         <img src="https://picsum.photos/id/101/100/100" className="w-full h-full object-cover opacity-80 group-hover/icon:opacity-100 transition-opacity" />
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 hover:text-nexus-accent hover:border-nexus-accent transition-all cursor-pointer hover:scale-110">
                         <Plus size={24} />
                      </div>
                   </div>
                   {/* Chat Area */}
                   <div className="flex-1 bg-slate-800/50 p-6 flex flex-col">
                      <div className="flex-1 space-y-4">
                         <MockMessage user="Kaelthas" text="Anyone up for a ranked match? I need a pocket healer." color="text-nexus-glow" />
                         <MockMessage user="JinxViper" text="I'm down. Give me 5 mins to grab a drink." color="text-nexus-accent" align="right" />
                         <MockMessage user="Nexus AI" text="Tip: Current win rates for duo-queue support/carry are up 15% on this patch. Suggest picking heavy CC supports." color="text-green-400" isBot />
                      </div>
                      <div className="h-14 mt-4 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center px-4 justify-between ring-1 ring-white/5 focus-within:ring-nexus-accent/50 transition-all">
                         <div className="text-slate-500 text-sm">Message #general...</div>
                         <div className="p-2 bg-nexus-accent rounded-lg text-white shadow-lg shadow-nexus-accent/20 cursor-pointer hover:bg-nexus-accent/80 transition-colors">
                            <Send size={16} />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="border-y border-white/5 bg-nexus-800/30 backdrop-blur relative z-10">
         <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value="<15ms" label="Global Latency" delay={0} />
            <StatItem value="99.99%" label="Server Uptime" delay={100} />
            <StatItem value="4K" label="Voice Quality" delay={200} />
            <StatItem value="1M+" label="Active Gamers" delay={300} />
         </div>
      </section>

      {/* Features Grid (Bento Box) */}
      <section className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
           <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">ENGINEERED FOR <span className="text-nexus-accent">VICTORY</span></h2>
           <p className="text-slate-400 max-w-2xl mx-auto">Every pixel and packet is optimized for the gaming experience. No bloat, just performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
           {/* Large Left Item */}
           <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/80 hover:border-nexus-accent/30 hover:shadow-2xl hover:shadow-nexus-accent/10 transition-all duration-500 group relative overflow-hidden transform hover:-translate-y-2">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-700 group-hover:rotate-12">
                 <Command className="w-64 h-64 text-nexus-accent" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                 <div className="bg-nexus-accent/20 w-fit p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Cpu className="w-8 h-8 text-nexus-accent" />
                 </div>
                 <h3 className="text-3xl font-display font-bold mb-2 text-white">Nexus AI Integration</h3>
                 <p className="text-slate-400 max-w-md group-hover:text-slate-300 transition-colors">Powered by Google Gemini models. Ask for real-time strategies, lore explanations, or hardware specs without leaving your lobby. It's like having a pro coach in your pocket.</p>
              </div>
           </div>

           {/* Top Right */}
           <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/80 hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 group flex flex-col justify-between transform hover:-translate-y-2">
              <div className="bg-green-500/20 w-fit p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-green-400" />
              </div>
              <div>
                 <h3 className="text-2xl font-display font-bold mb-2 text-white">DDoS Protected</h3>
                 <p className="text-slate-400 text-sm group-hover:text-slate-300">Enterprise-grade IP masking and protection keeps your connection safe during tournaments.</p>
              </div>
           </div>

           {/* Bottom Center */}
           <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/80 hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 group flex flex-col justify-between transform hover:-translate-y-2">
               <div className="bg-yellow-500/20 w-fit p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-yellow-400" />
               </div>
               <div>
                  <h3 className="text-2xl font-display font-bold mb-2 text-white">Cross-Platform</h3>
                  <p className="text-slate-400 text-sm group-hover:text-slate-300">Seamlessly sync chats between PC, Mobile, and Console web browsers.</p>
               </div>
           </div>

           {/* Bottom Right */}
           <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/80 hover:border-nexus-glow/30 hover:shadow-2xl hover:shadow-nexus-glow/10 transition-all duration-500 group relative overflow-hidden transform hover:-translate-y-2">
               <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                  <Headphones className="w-64 h-64 text-nexus-glow" />
               </div>
               <div className="relative z-10">
                  <div className="bg-nexus-glow/20 w-fit p-3 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                      <Mic className="w-8 h-8 text-nexus-glow" />
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-2 text-white">Spatial Audio Voice</h3>
                  <p className="text-slate-400 group-hover:text-slate-300">Hear your teammates exactly where they are. Noise suppression isolates your voice from keyboard clatter.</p>
               </div>
           </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-20 bg-black/20 relative z-10">
         <div className="max-w-7xl mx-auto px-6 space-y-32">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row items-center gap-16">
               <div className="flex-1 space-y-6">
                  <div className="text-nexus-accent font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                     <span className="w-8 h-[2px] bg-nexus-accent"></span> Community First
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold">Build Your Digital <br/>HQ</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                     Create servers for your guild, clan, or esports team. Organize channels by text, voice, or media. Assign granular roles and permissions to keep order in the chaos.
                  </p>
                  <ul className="space-y-4 mt-6">
                     <ListItem>Customizable Roles & Colors</ListItem>
                     <ListItem>Unlimited File Sharing</ListItem>
                     <ListItem>Dedicated Raid Planning Channels</ListItem>
                  </ul>
                  <Button variant="secondary" className="mt-8 flex items-center gap-2 hover:bg-slate-700">
                     <Users size={16} /> Explore Communities
                  </Button>
               </div>
               <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-nexus-accent/20 blur-3xl rounded-full animate-pulse-slow"></div>
                  <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                           <Server className="w-8 h-8 text-white" />
                        </div>
                        <div>
                           <div className="font-bold text-xl text-white">Raid Team Alpha</div>
                           <div className="text-green-500 text-sm flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 24 Members Online
                           </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-nexus-accent/50 transition-colors">
                           <Hash size={16} className="text-slate-400" />
                           <span className="text-slate-300 text-sm font-medium">general-chat</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-nexus-accent/50 transition-colors">
                           <Hash size={16} className="text-slate-400" />
                           <span className="text-slate-300 text-sm font-medium">strategies</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-nexus-accent/50 transition-colors">
                           <Mic size={16} className="text-slate-400" />
                           <span className="text-slate-300 text-sm font-medium">Voice Lounge</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

             {/* Row 2 */}
             <div className="flex flex-col md:flex-row-reverse items-center gap-16">
               <div className="flex-1 space-y-6">
                  <div className="text-nexus-glow font-bold tracking-widest text-sm uppercase flex items-center gap-2">
                     <span className="w-8 h-[2px] bg-nexus-glow"></span> Strategic Advantage
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold">Analysis Paralysis? <br/>Solved.</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                     Don't alt-tab to look up guides. Nexus AI analyzes your questions in real-time. Paste a screenshot of your inventory or describe a boss mechanic, and get instant, pro-level advice.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-nexus-glow transition-colors group cursor-default">
                        <div className="text-nexus-glow font-bold text-3xl mb-1 group-hover:scale-110 transition-transform origin-left">2.5s</div>
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">Avg Response Time</div>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-nexus-glow transition-colors group cursor-default">
                        <div className="text-nexus-glow font-bold text-3xl mb-1 group-hover:scale-110 transition-transform origin-left">100+</div>
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">Games Supported</div>
                     </div>
                  </div>
               </div>
               <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-nexus-glow/20 blur-3xl rounded-full animate-pulse-slow"></div>
                  <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500 hover:shadow-nexus-glow/20">
                     <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded bg-nexus-glow flex items-center justify-center shadow-lg shadow-nexus-glow/30">
                           <Zap className="w-5 h-5 text-black fill-black" />
                        </div>
                        <div className="font-bold text-nexus-glow self-center">Nexus AI Response</div>
                     </div>
                     <div className="text-sm text-slate-300 leading-relaxed font-mono p-4 bg-black/30 rounded-lg border-l-2 border-nexus-glow">
                        "Based on the current meta, rushing <span className="text-yellow-400 font-bold">Infinity Edge</span> will give you a 12% higher DPS output than Bloodthirster against this team comp."
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-6 z-10">
         <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">TRUSTED BY LEGENDS</h2>
            <div className="flex justify-center gap-1">
               {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-500 fill-current animate-scale-in" style={{ animationDelay: `${i * 100}ms` }} />)}
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
               quote="The latency is basically non-existent. We switched our entire esports org to Nexus."
               author="ProGamer_X"
               role="Team Captain, Cloud99"
               img="https://picsum.photos/id/64/100/100"
               delay={0}
            />
            <TestimonialCard 
               quote="Nexus AI saved my raid last night. Instant boss mechanics explanation without pausing."
               author="HealPlz"
               role="Guild Master"
               img="https://picsum.photos/id/65/100/100"
               delay={200}
            />
            <TestimonialCard 
               quote="Finally, a chat app that doesn't eat 30% of my RAM while I'm trying to stream."
               author="StreamQueen"
               role="Content Creator"
               img="https://picsum.photos/id/66/100/100"
               delay={400}
            />
         </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden text-center z-10">
         <div className="absolute inset-0 bg-gradient-to-b from-nexus-900 via-nexus-accent/10 to-nexus-900"></div>
         <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight">READY TO DOMINATE?</h2>
            <p className="text-xl text-slate-400 mb-10">Join thousands of gamers who have already upgraded their communication stack.</p>
            <Button onClick={onGetStarted} variant="primary" className="mx-auto py-6 px-12 text-2xl shadow-xl shadow-nexus-accent/20 hover:scale-105 flex items-center justify-center gap-3">
               <Rocket size={24} className="animate-bounce" /> Launch Nexus
            </Button>
            <p className="mt-6 text-sm text-slate-500">No credit card required • Free forever for individuals</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-20 pb-10 z-10 relative">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
               <div className="flex items-center gap-2 mb-6 hover:scale-105 transition-transform origin-left cursor-default">
                  <Gamepad2 className="w-6 h-6 text-nexus-accent" />
                  <span className="text-xl font-display font-bold tracking-wider text-white">NEXUS</span>
               </div>
               <p className="text-slate-500 text-sm leading-relaxed">
                  The ultimate communication platform tailored for the modern gamer. Built with love and caffeine.
               </p>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Product</h4>
               <ul className="space-y-4 text-slate-500 text-sm">
                  <li onClick={() => setActiveFooterModal('Download')} className="hover:text-nexus-accent cursor-pointer transition-colors">Download</li>
                  <li onClick={() => setActiveFooterModal('Nitro Boost')} className="hover:text-nexus-accent cursor-pointer transition-colors">Nitro Boost</li>
                  <li onClick={() => setActiveFooterModal('Status')} className="hover:text-nexus-accent cursor-pointer transition-colors">Status</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Resources</h4>
               <ul className="space-y-4 text-slate-500 text-sm">
                  <li onClick={() => setActiveFooterModal('Support')} className="hover:text-nexus-accent cursor-pointer transition-colors">Support</li>
                  <li onClick={() => setActiveFooterModal('Developers')} className="hover:text-nexus-accent cursor-pointer transition-colors">Developers</li>
                  <li onClick={() => setActiveFooterModal('Community Guidelines')} className="hover:text-nexus-accent cursor-pointer transition-colors">Community Guidelines</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Company</h4>
               <ul className="space-y-4 text-slate-500 text-sm">
                  <li onClick={() => setActiveFooterModal('About')} className="hover:text-nexus-accent cursor-pointer transition-colors">About</li>
                  <li onClick={() => setActiveFooterModal('Careers')} className="hover:text-nexus-accent cursor-pointer transition-colors">Careers</li>
                  <li onClick={() => setActiveFooterModal('Privacy')} className="hover:text-nexus-accent cursor-pointer transition-colors">Privacy</li>
               </ul>
            </div>
         </div>
         <div className="text-center text-slate-600 text-sm border-t border-slate-900 pt-8">
            &copy; 2025 Nexus Systems Inc. All rights reserved.
         </div>
      </footer>

      {/* Floating Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 rounded-full bg-nexus-accent text-white shadow-2xl hover:scale-110 hover:rotate-12 transition-all flex items-center justify-center animate-fade-in hover:shadow-nexus-accent/50"
          >
            <Bot size={32} />
          </button>
        )}
        
        {isChatOpen && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden animate-scale-in origin-bottom-right absolute bottom-0 right-0">
             {/* Header */}
             <div className="p-4 bg-nexus-accent flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <Bot size={20} className="text-white" />
                   <h3 className="font-bold text-white">Nexus Support AI</h3>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white hover:rotate-90 transition-transform">
                   <X size={20} />
                </button>
             </div>
             
             {/* Messages */}
             <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-900/90 custom-scrollbar">
                {chatMessages.map(msg => (
                   <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-sm animate-slide-up ${msg.isBot ? 'bg-slate-700 text-white rounded-tl-none' : 'bg-nexus-accent text-white rounded-tr-none'}`}>
                         {msg.text}
                      </div>
                   </div>
                ))}
                {isBotTyping && (
                  <div className="flex justify-start">
                     <div className="bg-slate-700 p-3 rounded-xl rounded-tl-none flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                     </div>
                  </div>
                )}
                <div ref={chatEndRef}></div>
             </div>
             
             {/* Input */}
             <form onSubmit={handleChatSubmit} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
                <input 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-accent transition-colors"
                  placeholder="Ask a question..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <Button type="submit" variant="primary" className="px-3">
                   <Send size={16} />
                </Button>
             </form>
          </div>
        )}
      </div>

      {/* Footer Info Modal */}
      <Modal isOpen={!!activeFooterModal} onClose={() => setActiveFooterModal(null)} title={activeFooterModal || ''}>
          <div className="p-6">
              {renderFooterModalContent()}
          </div>
      </Modal>
    </div>
  );
};

// Helper Components with animation
const StatItem = ({ value, label, delay }: any) => (
   <div className="p-4 group animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2 group-hover:text-nexus-accent group-hover:scale-110 transition-all duration-300">{value}</div>
      <div className="text-slate-500 uppercase tracking-widest text-xs font-bold group-hover:text-slate-300 transition-colors">{label}</div>
   </div>
);

const ListItem = ({ children }: any) => (
   <li className="flex items-center gap-3 text-slate-300 group hover:text-white transition-colors">
      <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent group-hover:scale-150 transition-transform"></div>
      {children}
   </li>
);

const MockMessage = ({ user, text, color, align = 'left', isBot }: any) => (
   <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} transform transition-all hover:scale-[1.02]`}>
      <div className={`text-[10px] font-bold mb-1 ${color} flex items-center gap-1`}>
         {user} {isBot && <span className="bg-nexus-accent text-white px-1 rounded-[2px] animate-pulse">BOT</span>}
      </div>
      <div className={`max-w-[80%] p-2 rounded-lg text-xs shadow-md ${align === 'right' ? 'bg-nexus-accent text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
         {text}
      </div>
   </div>
);

const TestimonialCard = ({ quote, author, role, img, delay }: any) => (
   <div className="bg-slate-800/30 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/80 hover:border-nexus-accent/30 hover:shadow-xl hover:shadow-nexus-accent/10 transition-all duration-300 transform hover:-translate-y-1 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-6">
         {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-nexus-accent inline-block mr-1 fill-current" />)}
      </div>
      <p className="text-slate-300 mb-6 italic leading-relaxed group-hover:text-white transition-colors">"{quote}"</p>
      <div className="flex items-center gap-4">
         <img src={img} alt={author} className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-nexus-accent transition-colors" />
         <div className="text-left">
            <div className="font-bold text-white">{author}</div>
            <div className="text-xs text-slate-500">{role}</div>
         </div>
      </div>
   </div>
);

export default Landing;
