import React, { useState } from 'react';
import { Megaphone, RefreshCw } from 'lucide-react';
import CurrencyInput from './CurrencyInput.jsx';
import ResultCard from './ResultCard.jsx';
import { Button } from '@/components/ui/button';

const AdSpendROASCalculator = () => {
  const [adSpend, setAdSpend] = useState(1000);
  const [revenue, setRevenue] = useState(5000);
  const [operatingCosts, setOperatingCosts] = useState(2000);

  const reset = () => {
    setAdSpend(1000);
    setRevenue(5000);
    setOperatingCosts(2000);
  };

  const roas = adSpend > 0 ? revenue / adSpend : 0;
  const netProfit = revenue - operatingCosts - adSpend;
  const roi = adSpend > 0 ? (netProfit / adSpend) * 100 : 0;
  const costPerDollar = revenue > 0 ? (adSpend + operatingCosts) / revenue : 0;

  let recommendation = { text: 'Losing money', type: 'danger' };
  if (roas > 3) recommendation = { text: 'Highly Profitable', type: 'success' };
  else if (roas > 1.5) recommendation = { text: 'Profitable', type: 'success' };
  else if (roas >= 1) recommendation = { text: 'Break-even', type: 'warning' };

  const formatUsd = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Ad Spend & ROAS</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrencyInput label="Total Ad Spend" value={adSpend} onChange={setAdSpend} />
          <CurrencyInput label="Total Revenue" value={revenue} onChange={setRevenue} />
          <CurrencyInput label="Product/Op Costs" value={operatingCosts} onChange={setOperatingCosts} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ResultCard 
            title="ROAS Ratio" 
            value={`${roas.toFixed(2)}:1`} 
            type={roas >= 2 ? 'primary' : roas >= 1 ? 'warning' : 'danger'}
          />
          <ResultCard 
            title="Net Profit" 
            value={formatUsd(netProfit)} 
            type={netProfit > 0 ? 'success' : 'danger'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-background rounded-xl p-5 border border-border">
            <span className="block text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">Net ROI</span>
            <span className={`text-2xl font-black ${roi > 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]'}`}>
              {roi.toFixed(1)}%
            </span>
          </div>
          <div className="bg-background rounded-xl p-5 border border-border">
            <span className="block text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">Cost per $1 Rev</span>
            <span className="text-2xl font-black text-foreground">
              {formatUsd(costPerDollar)}
            </span>
          </div>
        </div>

        <div className={`mt-2 p-4 rounded-xl border text-center font-bold tracking-wide ${
          recommendation.type === 'success' ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20' :
          recommendation.type === 'warning' ? 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20' :
          'bg-[hsl(var(--danger))]/10 text-[hsl(var(--danger))] border-[hsl(var(--danger))]/20'
        }`}>
          Status: {recommendation.text}
        </div>
      </div>
    </div>
  );
};

export default AdSpendROASCalculator;