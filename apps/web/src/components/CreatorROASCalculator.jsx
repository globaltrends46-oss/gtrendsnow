import React, { useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreatorROASCalculator = () => {
  const [adSpend, setAdSpend] = useState('');
  const [revenue, setRevenue] = useState('');
  const [costs, setCosts] = useState('');

  const reset = () => {
    setAdSpend('');
    setRevenue('');
    setCosts('');
  };

  const adSpendNum = parseFloat(adSpend) || 0;
  const revenueNum = parseFloat(revenue) || 0;
  const costsNum = parseFloat(costs) || 0;

  const roas = adSpendNum > 0 ? revenueNum / adSpendNum : 0;
  const netProfit = revenueNum - costsNum - adSpendNum;
  const roi = adSpendNum > 0 ? (netProfit / adSpendNum) * 100 : 0;

  let recommendation = { text: 'Enter values', type: 'default' };
  if (adSpendNum > 0 || revenueNum > 0) {
    if (roas > 3) recommendation = { text: 'Highly Profitable', type: 'success' };
    else if (roas > 1.5) recommendation = { text: 'Profitable', type: 'success' };
    else if (roas >= 1) recommendation = { text: 'Break-even', type: 'warning' };
    else recommendation = { text: 'Losing money', type: 'danger' };
  }

  const formatUsd = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Creator ROAS</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Ad Spend ($)</label>
            <input type="number" value={adSpend} onChange={(e) => setAdSpend(e.target.value)} className="w-full bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Total Revenue ($)</label>
            <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} className="w-full bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Other Costs ($)</label>
            <input type="number" value={costs} onChange={(e) => setCosts(e.target.value)} className="w-full bg-background border border-input text-foreground rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-xl p-4 border border-border">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">ROAS Ratio</span>
            <span className="text-2xl font-black text-foreground">{roas > 0 ? `${roas.toFixed(2)}:1` : '0:1'}</span>
          </div>
          <div className="bg-background rounded-xl p-4 border border-border">
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Net ROI</span>
            <span className={`text-2xl font-black ${roi > 0 ? 'text-[hsl(var(--success))]' : roi < 0 ? 'text-[hsl(var(--danger))]' : 'text-foreground'}`}>
              {roi.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-background rounded-xl p-5 border border-border text-center flex-1 flex flex-col justify-center">
          <span className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Net Profit</span>
          <span className={`text-4xl font-black mb-3 ${netProfit > 0 ? 'text-[hsl(var(--success))]' : netProfit < 0 ? 'text-[hsl(var(--danger))]' : 'text-foreground'}`}>
            {formatUsd(netProfit)}
          </span>
          {recommendation.type !== 'default' && (
            <span className={`inline-block mx-auto px-3 py-1 rounded-md text-sm font-bold border ${
              recommendation.type === 'success' ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20' :
              recommendation.type === 'warning' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' :
              'bg-[hsl(var(--danger))]/10 text-[hsl(var(--danger))] border-[hsl(var(--danger))]/20'
            }`}>
              {recommendation.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorROASCalculator;