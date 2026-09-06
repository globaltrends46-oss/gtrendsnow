import React, { useState } from 'react';
import { Heart, X, ExternalLink, ShieldCheck, Sparkles, Coffee } from 'lucide-react';
import { DONATION_CONFIG } from '@/config/donationConfig.js';
import { Button } from '@/components/ui/button';

const DonationModal = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const currentAmount = useCustom ? (parseFloat(customAmount) || 0) : selectedAmount;

  const handleDonate = () => {
    const amountToDonate = currentAmount > 0 ? currentAmount : 15;
    const url = DONATION_CONFIG.getDonationUrl(amountToDonate);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePayPalMe = () => {
    const amountToDonate = currentAmount > 0 ? currentAmount : 15;
    const url = DONATION_CONFIG.getPayPalMeUrl(amountToDonate);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-[#0a0f1d] border border-white/15 p-6 sm:p-8 shadow-2xl shadow-indigo-500/20 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[10px] flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Support GTrends Global
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Help us keep tools, MCP repositories, and calculators free & open for everyone
            </p>
          </div>
        </div>

        {/* Preset Amount Chips */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Select Donation Amount (USD)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {DONATION_CONFIG.presetAmounts.map((tier) => {
              const isSelected = !useCustom && selectedAmount === tier.value;
              return (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(tier.value);
                    setUseCustom(false);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-600 to-cyan-600 border-cyan-400 text-white shadow-lg shadow-indigo-500/30 scale-[1.03]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-sm font-black">{tier.label}</span>
                  <span className="text-[10px] text-slate-300/80 mt-0.5">{tier.icon}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Or Enter Custom Amount
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 font-bold">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setUseCustom(true);
              }}
              onFocus={() => setUseCustom(true)}
              placeholder="e.g. 20"
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/[0.04] border text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
                useCustom ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-white/10'
              }`}
            />
          </div>
        </div>

        {/* Direct PayPal Checkout Button */}
        <Button
          onClick={handleDonate}
          className="w-full py-6 rounded-xl font-bold text-base bg-gradient-to-r from-[#0070ba] to-[#003087] hover:from-[#005ea6] hover:to-[#002770] text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
        >
          <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
          <span>Donate ${currentAmount > 0 ? currentAmount : 15} via PayPal</span>
          <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
        </Button>

        {/* Direct PayPal.Me alternative */}
        <div className="text-center mb-4">
          <button
            type="button"
            onClick={handlePayPalMe}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors underline decoration-slate-600"
          >
            Or send directly via PayPal.me/ram25108
          </button>
        </div>

        {/* Security & Guarantee Note */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-3 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secured by PayPal official checkout • Supports Cards & PayPal balances</span>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
