import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Heart } from 'lucide-react';
import DonationModal from './DonationModal.jsx';

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'MCP & Repos', path: '/mcp' },
  { name: 'CV Builder', path: '/resume-builder' },
  { name: 'Articles', path: '/articles' },
  { name: 'Blog', path: '/blog' },
  { name: 'Vault', path: '/vault' },
  { name: 'Creator', path: '/creator' },
  { name: 'Credit', path: '/credit' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070b14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group transition-all">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight gradient-text">GTrends<span className="text-cyan-400 font-bold text-xs uppercase tracking-widest ml-1">Global</span></span>
            </Link>
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>AI System Live</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-xs font-bold transition-all px-3.5 py-1.5 rounded-full ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all hover:scale-105 cursor-pointer ml-1"
              title="Support GTrends Global with PayPal"
            >
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Donate</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsDonationModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300"
            >
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Donate</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground p-2 -mr-2 transition-colors hover:text-primary"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#070b14]/95 backdrop-blur-xl shadow-2xl">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-base font-semibold transition-colors ${
                    isActive 
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDonationModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-rose-500/20"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Support Platform via PayPal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive PayPal Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </header>
  );
};

export default Header;