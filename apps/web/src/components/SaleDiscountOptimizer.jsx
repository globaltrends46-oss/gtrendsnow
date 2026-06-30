import React, { useState } from 'react';
import { Tag, RefreshCw } from 'lucide-react';
import CurrencyInput from './CurrencyInput.jsx';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import { Button } from '@/components/ui/button';

const SaleDiscountOptimizer = () => {
  const [originalPrice, setOriginalPrice] = useState(100);
  const [discount, setDiscount] = useState(20);
  const [currentVolume, setCurrentVolume] = useState(100);
  const [productCost, setProductCost] = useState(40);

  const reset = () => {
    setOriginalPrice(100);
    setDiscount(20);
    setCurrentVolume(100);
    setProductCost(40);
  };

  const newPrice = originalPrice * (1 - discount / 100);
  const origProfitPerUnit = originalPrice - productCost;
  const origTotalProfit = origProfitPerUnit * currentVolume;
  
  const newProfitPerUnit = newPrice - productCost;
  
  let reqVolume = 0;
  let volumeIncNeeded = 0;
  let volumeIncPercent = 0;
  let feasibility = 'danger';

  if (newProfitPerUnit > 0) {
    reqVolume = Math.ceil(origTotalProfit / newProfitPerUnit);
    volumeIncNeeded = reqVolume - currentVolume;
    volumeIncPercent = (volumeIncNeeded / currentVolume) * 100;
    
    if (volumeIncPercent <= 50) feasibility = 'success';
    else if (volumeIncPercent <= 100) feasibility = 'warning';
  }

  const formatUsd = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Tag className="w-5 h-5 text-pink-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Discount Optimizer</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <CurrencyInput label="Original Price" value={originalPrice} onChange={setOriginalPrice} />
          <RangeSlider label="Discount Percentage" value={discount} onChange={setDiscount} suffix="%" />
          <CurrencyInput label="Current Monthly Vol." value={currentVolume} onChange={setCurrentVolume} prefix="" />
          <CurrencyInput label="Product Cost" value={productCost} onChange={setProductCost} />
        </div>

        <div className="flex-1 space-y-4 flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <ResultCard 
              title="New Price" 
              value={formatUsd(newPrice)} 
              type="primary"
            />
            <ResultCard 
              title="New Margin" 
              value={formatUsd(newProfitPerUnit)} 
              type={newProfitPerUnit > 0 ? 'default' : 'danger'}
              subtext="Profit per unit"
            />
          </div>

          <div className={`p-5 rounded-xl border flex flex-col justify-center items-center text-center flex-1 transition-all ${
            newProfitPerUnit <= 0 ? 'bg-[hsl(var(--danger))]/10 border-[hsl(var(--danger))]/20' :
            feasibility === 'success' ? 'bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20' :
            feasibility === 'warning' ? 'bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20' :
            'bg-[hsl(var(--danger))]/10 border-[hsl(var(--danger))]/20'
          }`}>
            {newProfitPerUnit <= 0 ? (
              <p className="text-[hsl(var(--danger))] font-bold text-lg">Discount too high. Selling at a loss.</p>
            ) : (
              <>
                <span className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-2">Required Volume Increase</span>
                <span className="text-4xl font-black mb-1">+{volumeIncNeeded.toLocaleString()} units</span>
                <span className="text-lg font-bold opacity-90">({volumeIncPercent.toFixed(1)}% jump)</span>
                <p className="text-sm mt-3 font-medium opacity-80">
                  To maintain original profit of {formatUsd(origTotalProfit)}/mo
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDiscountOptimizer;