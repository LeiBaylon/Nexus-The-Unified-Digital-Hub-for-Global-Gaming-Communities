
import React, { useEffect, useState } from 'react';
import { Button } from './UIComponents';
import { 
  Gamepad2, Zap, Cpu, Users, Shield, Globe, 
  Mic, MessageSquare, ChevronRight, Play, Star,
  Headphones, Server, Command, Rocket, LogIn, Plus, Send, Hash
} from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-nexus-900/90 backdrop-blur-md py-4 shadow-lg border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-nexus-accent blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <Gamepad2 className="w-8 h-8 text-nexus-accent relative z-10" />
            </div>
            <span className="text-2xl font-display font-bold tracking-wider text-white">NEXUS</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" onClick={onLogin} className="hidden sm:flex items-center gap-2">
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
          <span className="inline-block py-1 px-3 rounded-full bg-nexus-glow/10 border border-nexus-glow/30 text-nexus-glow text-sm font-semibold mb-6 animate-pulse">
            v2.0 NOW LIVE • POWERED BY GEMINI 2.5
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight mb-6">
            WHERE GAMERS <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-nexus-glow via-white to-nexus-accent">
              CONVERGE
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience ultra-low latency voice, AI-driven strategy assistance, and a community platform built from the ground up for esports and casual play.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Button onClick={onGetStarted} variant="primary" className="py-4 px-8 text-lg flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" /> Start Playing Free
            </Button>
            <Button onClick={onLogin} variant="glow" className="py-4 px-8 text-lg flex items-center justify-center gap-2">
              <Play className="w-5 h-5" /> Watch Demo
            </Button>
          </div>
        </div>

        {/* 3D Mockup */}
        <div className="relative mx-auto max-w-5xl mt-10 animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-nexus-900 via-transparent to-transparent z-20"></div>
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl rotate-x-12 transform transition-transform hover:scale-[0.92] hover:rotate-x-6 duration-700">
            {/* Mock Header */}
            <div className="h-12 bg-slate-800 flex items-center px-4 gap-2 border-b border-slate-700">
               <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
               </div>
               <div className="mx-auto bg-slate-900 px-4 py-1 rounded text-xs text-slate-500 font-mono">nexus-client-v2.exe</div>
            </div>
            {/* Mock Content */}
            <div className="flex h-[600px]">
               {/* Sidebar */}
               <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative group cursor-pointer hover:border-nexus-accent transition-colors">
                     <img src="https://picsum.photos/id/100/100/100" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden relative group cursor-pointer hover:border-nexus-accent transition-colors">
                     <img src="https://picsum.photos/id/101/100/100" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 hover:text-nexus-accent hover:border-nexus-accent transition-all cursor-pointer">
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
                  <div className="h-14 mt-4 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-center px-4 justify-between">
                     <div className="text-slate-500 text-sm">Message #general...</div>
                     <div className="p-2 bg-nexus-accent rounded-lg text-white shadow-lg shadow-nexus-accent/20">
                        <Send size={16} />
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
            <StatItem value="<15ms" label="Global Latency" />
            <StatItem value="99.99%" label="Server Uptime" />
            <StatItem value="4K" label="Voice Quality" />
            <StatItem value="1M+" label="Active Gamers" />
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
           <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/60 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500">
                 <Command className="w-64 h-64 text-nexus-accent" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                 <div className="bg-nexus-accent/20 w-fit p-3 rounded-xl mb-4">
                    <Cpu className="w-8 h-8 text-nexus-accent" />
                 </div>
                 <h3 className="text-3xl font-display font-bold mb-2">Nexus AI Integration</h3>
                 <p className="text-slate-400 max-w-md">Powered by Google Gemini models. Ask for real-time strategies, lore explanations, or hardware specs without leaving your lobby. It's like having a pro coach in your pocket.</p>
              </div>
           </div>

           {/* Top Right */}
           <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/60 transition-colors group flex flex-col justify-between">
              <div className="bg-green-500/20 w-fit p-3 rounded-xl mb-4">
                  <Shield className="w-8 h-8 text-green-400" />
              </div>
              <div>
                 <h3 className="text-2xl font-display font-bold mb-2">DDoS Protected</h3>
                 <p className="text-slate-400 text-sm">Enterprise-grade IP masking and protection keeps your connection safe during tournaments.</p>
              </div>
           </div>

           {/* Bottom Center */}
           <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/60 transition-colors group flex flex-col justify-between">
               <div className="bg-yellow-500/20 w-fit p-3 rounded-xl mb-4">
                  <Globe className="w-8 h-8 text-yellow-400" />
               </div>
               <div>
                  <h3 className="text-2xl font-display font-bold mb-2">Cross-Platform</h3>
                  <p className="text-slate-400 text-sm">Seamlessly sync chats between PC, Mobile, and Console web browsers.</p>
               </div>
           </div>

           {/* Bottom Right */}
           <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800/60 transition-colors group relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Headphones className="w-64 h-64 text-nexus-glow" />
               </div>
               <div className="relative z-10">
                  <div className="bg-nexus-glow/20 w-fit p-3 rounded-xl mb-4">
                      <Mic className="w-8 h-8 text-nexus-glow" />
                  </div>
                  <h3 className="text-3xl font-display font-bold mb-2">Spatial Audio Voice</h3>
                  <p className="text-slate-400">Hear your teammates exactly where they are. Noise suppression isolates your voice from keyboard clatter.</p>
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
                  <div className="text-nexus-accent font-bold tracking-widest text-sm uppercase">Community First</div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold">Build Your Digital <br/>HQ</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                     Create servers for your guild, clan, or esports team. Organize channels by text, voice, or media. Assign granular roles and permissions to keep order in the chaos.
                  </p>
                  <ul className="space-y-4 mt-6">
                     <ListItem>Customizable Roles & Colors</ListItem>
                     <ListItem>Unlimited File Sharing</ListItem>
                     <ListItem>Dedicated Raid Planning Channels</ListItem>
                  </ul>
                  <Button variant="secondary" className="mt-8 flex items-center gap-2">
                     <Users size={16} /> Explore Communities
                  </Button>
               </div>
               <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-nexus-accent/20 blur-3xl rounded-full"></div>
                  <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                           <Server className="w-8 h-8 text-white" />
                        </div>
                        <div>
                           <div className="font-bold text-xl">Raid Team Alpha</div>
                           <div className="text-green-500 text-sm">● 24 Members Online</div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 rounded bg-slate-800/50 border border-slate-700/50">
                           <Hash size={16} className="text-slate-400" />
                           <span className="text-slate-300 text-sm font-medium">general-chat</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded bg-slate-800/50 border border-slate-700/50">
                           <Hash size={16} className="text-slate-400" />
                           <span className="text-slate-300 text-sm font-medium">strategies</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded bg-slate-800/50 border border-slate-700/50">
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
                  <div className="text-nexus-glow font-bold tracking-widest text-sm uppercase">Strategic Advantage</div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold">Analysis Paralysis? <br/>Solved.</h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                     Don't alt-tab to look up guides. Nexus AI analyzes your questions in real-time. Paste a screenshot of your inventory or describe a boss mechanic, and get instant, pro-level advice.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="text-nexus-glow font-bold text-2xl mb-1">2.5s</div>
                        <div className="text-xs text-slate-500 uppercase">Avg Response Time</div>
                     </div>
                     <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="text-nexus-glow font-bold text-2xl mb-1">100+</div>
                        <div className="text-xs text-slate-500 uppercase">Games Supported</div>
                     </div>
                  </div>
               </div>
               <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-nexus-glow/20 blur-3xl rounded-full"></div>
                  <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500">
                     <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded bg-nexus-glow flex items-center justify-center">
                           <Zap className="w-5 h-5 text-black" />
                        </div>
                        <div className="font-bold text-nexus-glow self-center">Nexus AI Response</div>
                     </div>
                     <div className="text-sm text-slate-300 leading-relaxed font-mono">
                        "Based on the current meta, rushing <span className="text-yellow-400">Infinity Edge</span> will give you a 12% higher DPS output than Bloodthirster against this team comp."
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
               {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />)}
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
               quote="The latency is basically non-existent. We switched our entire esports org to Nexus."
               author="ProGamer_X"
               role="Team Captain, Cloud99"
               img="https://picsum.photos/id/64/100/100"
            />
            <TestimonialCard 
               quote="Nexus AI saved my raid last night. Instant boss mechanics explanation without pausing."
               author="HealPlz"
               role="Guild Master"
               img="https://picsum.photos/id/65/100/100"
            />
            <TestimonialCard 
               quote="Finally, a chat app that doesn't eat 30% of my RAM while I'm trying to stream."
               author="StreamQueen"
               role="Content Creator"
               img="https://picsum.photos/id/66/100/100"
            />
         </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden text-center z-10">
         <div className="absolute inset-0 bg-gradient-to-b from-nexus-900 via-nexus-accent/10 to-nexus-900"></div>
         <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8">READY TO DOMINATE?</h2>
            <p className="text-xl text-slate-400 mb-10">Join thousands of gamers who have already upgraded their communication stack.</p>
            <Button onClick={onGetStarted} variant="primary" className="py-6 px-12 text-2xl shadow-xl shadow-nexus-accent/20 hover:scale-105 mx-auto flex items-center justify-center gap-3">
               <Rocket size={24} /> Launch Nexus
            </Button>
            <p className="mt-6 text-sm text-slate-500">No credit card required • Free forever for individuals</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 pt-20 pb-10 z-10 relative">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
               <div className="flex items-center gap-2 mb-6">
                  <Gamepad2 className="w-6 h-6 text-nexus-accent" />
                  <span className="text-xl font-display font-bold tracking-wider">NEXUS</span>
               </div>
               <p className="text-slate-500 text-sm leading-relaxed">
                  The ultimate communication platform tailored for the modern gamer. Built with love and caffeine.
               </p>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Product</h4>
               <ul className="space-y-4 text-slate-500 text-sm">
                  <li className="hover:text-nexus-accent cursor-pointer">Download</li>
                  <li className="hover:text-nexus-accent cursor-pointer">Nitro Boost</li>
                  <li className="hover:text-nexus-accent cursor-pointer">Status</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Resources</h4>
               <ul className="space-y-4 text-slate-500 text-sm">
                  <li className="hover:text-nexus-accent cursor-pointer">Support</li>
                  <li className="hover:text-nexus-accent cursor-pointer">Developers</li>
                  <li className="hover:text-nexus-accent cursor-pointer">Community Guidelines</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-white mb-6">Company</h4>
               <ul className="space-y-4 text-slate-500 text-sm">
                  <li className="hover:text-nexus-accent cursor-pointer">About</li>
                  <li className="hover:text-nexus-accent cursor-pointer">Careers</li>
                  <li className="hover:text-nexus-accent cursor-pointer">Privacy</li>
               </ul>
            </div>
         </div>
         <div className="text-center text-slate-600 text-sm border-t border-slate-900 pt-8">
            &copy; 2025 Nexus Systems Inc. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

// Helper Components
const StatItem = ({ value, label }: any) => (
   <div className="p-4 group">
      <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2 group-hover:text-nexus-accent transition-colors">{value}</div>
      <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">{label}</div>
   </div>
);

const ListItem = ({ children }: any) => (
   <li className="flex items-center gap-3 text-slate-300">
      <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent"></div>
      {children}
   </li>
);

const MockMessage = ({ user, text, color, align = 'left', isBot }: any) => (
   <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'}`}>
      <div className={`text-[10px] font-bold mb-1 ${color} flex items-center gap-1`}>
         {user} {isBot && <span className="bg-nexus-accent text-white px-1 rounded-[2px]">BOT</span>}
      </div>
      <div className={`max-w-[80%] p-2 rounded-lg text-xs ${align === 'right' ? 'bg-nexus-accent text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
         {text}
      </div>
   </div>
);

const TestimonialCard = ({ quote, author, role, img }: any) => (
   <div className="bg-slate-800/30 border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/50 transition-colors">
      <div className="mb-6">
         {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-nexus-accent inline-block mr-1 fill-current" />)}
      </div>
      <p className="text-slate-300 mb-6 italic leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-4">
         <img src={img} alt={author} className="w-12 h-12 rounded-full border-2 border-slate-700" />
         <div className="text-left">
            <div className="font-bold text-white">{author}</div>
            <div className="text-xs text-slate-500">{role}</div>
         </div>
      </div>
   </div>
);

export default Landing;
