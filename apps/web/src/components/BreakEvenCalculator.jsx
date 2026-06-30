import React, { useState } from 'react';
import { Target, RefreshCw } from 'lucide-react';
import CurrencyInput from './CurrencyInput.jsx';
import ResultCard from './ResultCard.jsx';
import { Button } from '@/components/ui/button';

const BreakEvenCalculator = () => {
  const [fixedCosts, setFixedCosts] = useState(5000);
  const [sellingPrice, setSellingPrice] = useState(50);
  const [variableCost, setVariableCost] = useState(20);

  const reset = () => {
    setFixedCosts(5000);
    setSellingPrice(50);
    setVariableCost(20);
  };

  const contributionMargin = sellingPrice - variableCost;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * sellingPrice;

  const formatUsd = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Break-Even Analysis</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrencyInput label="Monthly Fixed Costs" value={fixedCosts} onChange={setFixedCosts} />
          <CurrencyInput label="Price Per Unit" value={sellingPrice} onChange={setSellingPrice} />
          <CurrencyInput label="Var. Cost Per Unit" value={variableCost} onChange={setVariableCost} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
          <ResultCard 
            title="Units to Break Even" 
            value={contributionMargin > 0 ? breakEvenUnits.toLocaleString() : 'N/A'} 
            subtext="Items to sell per month"
            type={contributionMargin > 0 ? 'primary' : 'danger'}
          />
          <ResultCard 
            title="Break-Even Revenue" 
            value={contributionMargin > 0 ? formatUsd(breakEvenRevenue) : 'N/A'} 
            subtext="Monthly target revenue"
            type="default"
          />
        </div>

        <div className="bg-background rounded-xl p-5 border border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contribution Margin</h3>
            <p className="text-xs text-muted-foreground mt-1">Profit per unit before fixed costs</p>
          </div>
          <span className={`text-2xl font-black ${contributionMargin > 0 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--danger))]'}`}>
            {formatUsd(contributionMargin)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenCalculator;