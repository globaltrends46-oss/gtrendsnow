import React, { useState } from 'react';
import { 
  Heart, X, ExternalLink, ShieldCheck, Sparkles, 
  GraduationCap, Briefcase, Users2, CheckCircle2 
} from 'lucide-react';
import { DONATION_CONFIG } from '@/config/donationConfig.js';
import { Button } from '@/components/ui/button';

const DonationModal = ({ isOpen, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const currentAmount = useCustom ? (parseFloat(customAmount) || 0) : selectedAmount;
  const activeAmount = currentAmount > 0 ? currentAmount : 15;

  const socialAmount = (activeAmount * 0.8).toFixed(2);
  const platformAmount = (activeAmount * 0.2).toFixed(2);

  const selectedTier = DONATION_CONFIG.presetAmounts.find(t => t.value === selectedAmount);
  const activeImpactText = useCustom
    ? `Your $${activeAmount} contribution channels $${socialAmount} directly to human welfare & education.`
    : (selectedTier?.impact || 'Empowering underserved students and job seekers worldwide.');

  const handleDonate = () => {
    const url = DONATION_CONFIG.getDonationUrl(activeAmount);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePayPalMe = () => {
    const url = DONATION_CONFIG.getPayPalMeUrl(activeAmount);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-[#0a0f1e] border border-white/15 p-6 sm:p-8 shadow-2xl shadow-indigo-500/20 text-white overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-28 -right-28 w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-56 h-56 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/25 shrink-0">
            <div className="w-full h-full bg-[#0a0f1e] rounded-[10px] flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Verified 80/20 Social Impact Pledge</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Turn Technology Into Human Impact
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Every donation creates a measurable difference: <strong className="text-emerald-400 font-semibold">80% goes directly to social causes</strong> and <strong className="text-indigo-400 font-semibold">20% keeps our platform 100% free</strong> for millions.
            </p>
          </div>
        </div>

        {/* VISUAL 80/20 SPLIT BAR */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-5">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              80% Social Causes (${socialAmount})
            </span>
            <span className="text-indigo-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              20% Free Tools (${platformAmount})
            </span>
          </div>
          
          {/* Progress split bar */}
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
            <div className="w-[80%] h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-300" />
            <div className="w-[20%] h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" />
          </div>

          {/* Social Cause Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Underprivileged Education</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Free Job Seeker Tools</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Grassroots Welfare Aid</span>
            </div>
          </div>
        </div>

        {/* PRESET DONATION CHIPS */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Choose Your Contribution Level (USD)
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
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/25 scale-[1.03]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="text-base font-black">{tier.label}</span>
                  <span className="text-[10px] text-slate-300/90 font-medium leading-tight mt-0.5">{tier.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TANGIBLE IMPACT BANNER */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{activeImpactText}</span>
        </div>

        {/* CUSTOM AMOUNT INPUT */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>Or Enter a Custom Amount</span>
            {useCustom && <span className="text-cyan-400">80% will go to social causes</span>}
          </div>
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
              placeholder="e.g. 35"
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/[0.04] border text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors ${
                useCustom ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-white/10'
              }`}
            />
          </div>
        </div>

        {/* PRIMARY PAYPAL DONATE BUTTON */}
        <Button
          onClick={handleDonate}
          className="w-full py-6 rounded-xl font-bold text-base bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all flex items-center justify-center gap-2 mb-3 cursor-pointer"
        >
          <Heart className="w-5 h-5 text-white fill-white" />
          <span>Donate ${activeAmount} via Verified PayPal</span>
          <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
        </Button>

        {/* DIRECT PAYPAL.ME ALTERNATIVE */}
        <div className="text-center mb-3">
          <button
            type="button"
            onClick={handlePayPalMe}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors underline decoration-slate-600 cursor-pointer"
          >
            Or send directly via PayPal.me/ram25108
          </button>
        </div>

        {/* TRUST SEAL */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-3 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>100% Transparent • Protected by PayPal Official Checkout • Cards Accepted</span>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
