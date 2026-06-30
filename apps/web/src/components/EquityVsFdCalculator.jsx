import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const EquityVsFdCalculator = () => {
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(20);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const results = useMemo(() => {
    const equityReturn = 12;
    const fdReturn = 6;

    const equityValue = amount * Math.pow(1 + equityReturn / 100, years);
    const fdValue = amount * Math.pow(1 + fdReturn / 100, years);
    const wealthGap = equityValue - fdValue;
    const percentageDiff = ((equityValue - fdValue) / fdValue) * 100;

    return { equityValue, fdValue, wealthGap, percentageDiff };
  }, [amount, years]);

  const summaryData = `Equity vs. FD Wealth Gap
Investment Amount: ${formatCurrency(amount)}
Time Period: ${years} years
Assumed Equity Return: 12%
Assumed FD Return: 6%

Results:
Equity Value: ${formatCurrency(results.equityValue)}
FD Value: ${formatCurrency(results.fdValue)}
Wealth Gap: ${formatCurrency(results.wealthGap)} (${results.percentageDiff.toFixed(1)}% difference)`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Equity vs. FD Wealth Gap</h3>
        <p className="text-muted-foreground text-sm">Compare long-term wealth creation between Equity (12%) and Fixed Deposits (6%).</p>
      </div>

      <div className="space-y-1 flex-1">
        <RangeSlider label="Investment Amount" min={10000} max={10000000} step={10000} value={amount} onChange={setAmount} formatValue={formatCurrency} />
        <RangeSlider label="Time Period (Years)" min={1} max={30} step={1} value={years} onChange={setYears} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <ResultCard label="Equity Value (12%)" value={formatCurrency(results.equityValue)} variant="success" />
        <ResultCard label="FD Value (6%)" value={formatCurrency(results.fdValue)} />
        <div className="col-span-2">
          <ResultCard label="Wealth Gap" value={`${formatCurrency(results.wealthGap)} (+${results.percentageDiff.toFixed(0)}%)`} variant="primary" />
        </div>
      </div>

      <DownloadButton data={summaryData} filename="Equity_vs_FD_Calculation" />
    </div>
  );
};

export default EquityVsFdCalculator;