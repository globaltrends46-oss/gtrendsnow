import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const InflationCalculator = () => {
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(20);
  const [inflation, setInflation] = useState(6);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const results = useMemo(() => {
    const realValue = amount / Math.pow(1 + inflation / 100, years);
    const lostValue = amount - realValue;
    const lostPercentage = (lostValue / amount) * 100;

    const breakdown = [];
    for (let i = 5; i <= years; i += 5) {
      breakdown.push({
        year: i,
        value: amount / Math.pow(1 + inflation / 100, i)
      });
    }
    if (years % 5 !== 0) {
      breakdown.push({
        year: years,
        value: realValue
      });
    }

    return { realValue, lostValue, lostPercentage, breakdown };
  }, [amount, years, inflation]);

  const summaryData = `Inflation 'Silent Killer' Visualizer
Original Amount: ${formatCurrency(amount)}
Time Period: ${years} years
Inflation Rate: ${inflation}%

Results:
Real Value After Inflation: ${formatCurrency(results.realValue)}
Purchasing Power Lost: ${formatCurrency(results.lostValue)} (${results.lostPercentage.toFixed(1)}%)

Year-by-Year Breakdown:
${results.breakdown.map(b => `Year ${b.year}: ${formatCurrency(b.value)}`).join('\n')}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Inflation Visualizer</h3>
        <p className="text-muted-foreground text-sm">Understand how inflation silently erodes your purchasing power over time.</p>
      </div>

      <div className="space-y-1 flex-1">
        <RangeSlider label="Amount" min={10000} max={10000000} step={10000} value={amount} onChange={setAmount} formatValue={formatCurrency} />
        <RangeSlider label="Number of Years" min={1} max={50} step={1} value={years} onChange={setYears} />
        <RangeSlider label="Inflation Rate (%)" min={2} max={10} step={0.5} value={inflation} onChange={setInflation} formatValue={(v) => `${v}%`} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <ResultCard label="Original Amount" value={formatCurrency(amount)} />
        <ResultCard label="Real Value" value={formatCurrency(results.realValue)} variant="destructive" />
        <div className="col-span-2">
          <ResultCard label="Purchasing Power Lost" value={`${formatCurrency(results.lostValue)} (${results.lostPercentage.toFixed(1)}%)`} variant="destructive" />
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-bold text-foreground mb-3">Value Erosion Over Time</h4>
        <div className="bg-muted/30 rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Year</th>
                <th className="px-4 py-2 font-medium">Real Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.breakdown.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-foreground">{row.year}</td>
                  <td className="px-4 py-2 text-[hsl(var(--destructive))] font-medium">{formatCurrency(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DownloadButton data={summaryData} filename="Inflation_Calculation" />
    </div>
  );
};

export default InflationCalculator;