import React from 'react';
import { Sparkles, Terminal, FileText, Zap, ShieldCheck, TrendingUp, Cpu } from 'lucide-react';

const TICKER_ITEMS = [
  { icon: Sparkles, text: "AI OmniRoute Gateway: Active & Live on 180+ Endpoints", badge: "Live", color: "text-emerald-400" },
  { icon: Terminal, text: "Top MCP: PostgreSQL & SQLite Servers streaming 1-click downloads", badge: "Popular", color: "text-indigo-400" },
  { icon: FileText, text: "140+ Resumes ATS-optimized with instant Word & PDF export", badge: "Engine", color: "text-cyan-400" },
  { icon: Cpu, text: "Model Context Protocol Hub updated daily with GitHub star rankings", badge: "Daily", color: "text-amber-400" },
  { icon: TrendingUp, text: "Institutional wealth & e-commerce algorithms running 24/7", badge: "Automated", color: "text-purple-400" },
  { icon: ShieldCheck, text: "Zero-retention client side security & private processing", badge: "Secure", color: "text-emerald-400" },
  { icon: Zap, text: "CrewAI, Ollama & LangChain agent templates available", badge: "New", color: "text-cyan-400" },
];

const LiveTicker = () => {
  return (
    <div className="relative w-full border-y border-white/5 bg-[#0a0f1d]/90 backdrop-blur-md overflow-hidden py-2.5 z-20">
      {/* Subtle edge fades for smooth blending */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#070b14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#070b14] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex items-center gap-8 text-xs select-none">
        {/* Render twice for seamless continuous loop */}
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2.5 shrink-0 px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              <span className="text-slate-300 font-medium">
                {item.text}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400">
                {item.badge}
              </span>
              <span className="text-white/20 ml-3">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveTicker;
