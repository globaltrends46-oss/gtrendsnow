import React, { useState } from 'react';
import { PackageOpen, RefreshCw } from 'lucide-react';
import CurrencyInput from './CurrencyInput.jsx';
import ResultCard from './ResultCard.jsx';
import { Button } from '@/components/ui/button';

const InventoryDaysOfSupplyCalculator = () => {
  const [stockLevel, setStockLevel] = useState(1000);
  const [dailySold, setDailySold] = useState(10);
  const [leadTime, setLeadTime] = useState(14);

  const reset = () => {
    setStockLevel(1000);
    setDailySold(10);
    setLeadTime(14);
  };

  const daysRemaining = dailySold > 0 ? Math.floor(stockLevel / dailySold) : 0;
  const safetyStock = dailySold * leadTime;
  
  const today = new Date();
  const restockDate = new Date(today);
  restockDate.setDate(today.getDate() + daysRemaining - leadTime);
  
  const outOfStockDate = new Date(today);
  outOfStockDate.setDate(today.getDate() + daysRemaining);

  const timeDiff = restockDate.getTime() - today.getTime();
  const daysUntilRestock = Math.ceil(timeDiff / (1000 * 3600 * 24));

  let status = { text: 'Healthy Stock', type: 'success' };
  if (daysUntilRestock < 0) status = { text: 'URGENT: Restock Now', type: 'danger' };
  else if (daysUntilRestock <= 7) status = { text: 'Low Stock', type: 'warning' };
  else if (daysUntilRestock <= 14) status = { text: 'Monitor Slowly', type: 'primary' };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <PackageOpen className="w-5 h-5 text-teal-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Inventory Supply</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CurrencyInput label="Current Stock Level" value={stockLevel} onChange={setStockLevel} prefix="" />
          <CurrencyInput label="Avg. Daily Sales" value={dailySold} onChange={setDailySold} prefix="" />
          <CurrencyInput label="Supplier Lead Time" value={leadTime} onChange={setLeadTime} prefix="Days " />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ResultCard 
            title="Days Remaining" 
            value={dailySold > 0 ? daysRemaining : '∞'} 
            type={daysRemaining <= leadTime ? 'danger' : 'default'}
            subtext={`Depletes on ${outOfStockDate.toLocaleDateString()}`}
          />
          <ResultCard 
            title="Safety Stock" 
            value={safetyStock.toLocaleString()} 
            type="primary"
            subtext="Recommended min buffer"
          />
        </div>

        <div className={`mt-auto p-6 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
          status.type === 'success' ? 'bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20 text-[hsl(var(--success))]' :
          status.type === 'danger' ? 'bg-[hsl(var(--danger))]/10 border-[hsl(var(--danger))]/20 text-[hsl(var(--danger))]' :
          status.type === 'warning' ? 'bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20 text-[hsl(var(--warning))]' :
          'bg-primary/10 border-primary/20 text-primary'
        }`}>
          <span className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">Order Deadline</span>
          <span className="text-3xl font-black mb-2">{restockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="px-3 py-1 bg-background/50 rounded-md text-sm font-bold border border-current/20">
            {status.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InventoryDaysOfSupplyCalculator;