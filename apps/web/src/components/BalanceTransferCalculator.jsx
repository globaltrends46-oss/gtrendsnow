import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const BalanceTransferCalculator = () => {
  const [balance, setBalance] = useState(500000);
  const [currentRate, setCurrentRate] = useState(10);
  const [newRate, setNewRate] = useState(6);
  const [fee, setFee] = useState(5000);
  const [tenure, setTenure] = useState(20);

  const results = useMemo(() => {
    // Following the simplified formula from prompt instructions:
    // Current Bank Total Interest = (Loan Balance * Current Rate * Remaining Years) / 100
    const currentInterest = (balance * currentRate * tenure) / 100;
    const newInterest = (balance * newRate * tenure) / 100;
    
    const grossSavings = currentInterest - newInterest;
    const netSavings = grossSavings - fee;
    
    return {
      currentInterest,
      newInterest,
      grossSavings,
      netSavings,
      isWorth: netSavings > 0
    };
  }, [balance, currentRate, newRate, fee, tenure]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const summaryData = `Current Loan Balance: ${formatCurrency(balance)}
Current Interest Rate: ${currentRate}%
New Bank Interest Rate: ${newRate}%
Processing Fee: ${formatCurrency(fee)}
Remaining Tenure: ${tenure} years

Results:
Current Bank Interest: ${formatCurrency(results.currentInterest)}
New Bank Interest: ${formatCurrency(results.newInterest)}
Processing Fee: ${formatCurrency(fee)}
Net Savings: ${formatCurrency(results.netSavings)}
Recommendation: ${results.isWorth ? 'Worth switching' : 'Not worth switching'}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Balance Transfer Calculator</h3>
        <p className="text-muted-foreground text-sm">Calculate net savings when moving your loan to a lower rate.</p>
      </div>

      <div className="space-y-2 flex-1">
        <RangeSlider label="Current Balance" min={10000} max={10000000} step={10000} value={balance} onChange={setBalance} unit="$" />
        <RangeSlider label="Current Interest Rate" min={2} max={15} step={0.1} value={currentRate} onChange={setCurrentRate} unit="%" />
        <RangeSlider label="New Bank Rate" min={2} max={15} step={0.1} value={newRate} onChange={setNewRate} unit="%" />
        <RangeSlider label="Processing Fee" min={0} max={50000} step={100} value={fee} onChange={setFee} unit="$" />
        <RangeSlider label="Remaining Tenure" min={1} max={30} step={1} value={tenure} onChange={setTenure} unit="years" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="sm:col-span-2">
          <ResultCard 
            title="Net Savings" 
            value={results.netSavings} 
            unit="$" 
            color={results.isWorth ? 'green' : 'red'} 
            isBold={true}
            description={results.isWorth ? 'Worth switching' : 'Not worth switching'}
          />
        </div>
        <ResultCard title="Processing Fee" value={fee} unit="$" color="neutral" />
        <ResultCard 
          title="Interest Comparison" 
          value={`Diff: ${formatCurrency(results.grossSavings)}`} 
          unit="" 
          color="neutral"
          description={`Current costs ${formatCurrency(results.currentInterest)}, New costs ${formatCurrency(results.newInterest)}`}
        />
      </div>

      <DownloadButton data={summaryData} filename="Balance Transfer Calculator" />
    </div>
  );
};

export default BalanceTransferCalculator;