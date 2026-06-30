import React, { useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';
import CurrencyInput from './CurrencyInput.jsx';
import ResultCard from './ResultCard.jsx';
import ProgressBar from './ProgressBar.jsx';
import BreakdownList from './BreakdownList.jsx';
import { Button } from '@/components/ui/button';

const ProductProfitCalculator = () => {
  const [sellingPrice, setSellingPrice] = useState(50);
  const [productCost, setProductCost] = useState(20);
  const [shippingCost, setShippingCost] = useState(5);
  const [platformFee, setPlatformFee] = useState(3);

  const reset = () => {
    setSellingPrice(50);
    setProductCost(20);
    setShippingCost(5);
    setPlatformFee(3);
  };

  // Calculations
  const platformFeeAmount = sellingPrice * (platformFee / 100);
  const totalCost = productCost + shippingCost;
  const netProfit = sellingPrice - totalCost - platformFeeAmount;
  
  const profitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  const markup = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  const formatUsd = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Profit Calculator</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-2">
          <CurrencyInput label="Selling Price" value={sellingPrice} onChange={setSellingPrice} />
          <CurrencyInput label="Product Cost" value={productCost} onChange={setProductCost} />
          <CurrencyInput label="Shipping Cost" value={shippingCost} onChange={setShippingCost} />
          <CurrencyInput label="Platform Fee (%)" value={platformFee} onChange={setPlatformFee} prefix="%" />
        </div>

        <div className="flex-1 space-y-6 flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <ResultCard 
              title="Net Profit" 
              value={formatUsd(netProfit)} 
              type={netProfit > 0 ? 'success' : netProfit < 0 ? 'danger' : 'default'} 
            />
            <ResultCard 
              title="Markup" 
              value={`${markup.toFixed(1)}%`} 
              type="primary" 
            />
          </div>

          <div className="p-5 bg-background rounded-xl border border-border">
            <ProgressBar 
              label="Profit Margin" 
              percentage={profitMargin} 
              color={profitMargin > 20 ? 'success' : profitMargin > 0 ? 'warning' : 'danger'} 
            />
          </div>

          <div className="mt-auto">
            <h3 className="text-sm font-semibold mb-3">Cost Breakdown</h3>
            <BreakdownList items={[
              { label: 'Selling Price', value: formatUsd(sellingPrice) },
              { label: 'Product & Shipping', value: `-${formatUsd(totalCost)}` },
              { label: 'Platform Fees', value: `-${formatUsd(platformFeeAmount)}` },
              { label: 'Net Profit', value: formatUsd(netProfit), isTotal: true, color: netProfit > 0 ? 'success' : 'danger' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductProfitCalculator;