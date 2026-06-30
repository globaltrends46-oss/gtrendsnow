import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const DebtToIncomeCalculator = () => {
  const [income, setIncome] = useState(50000);
  const [debt, setDebt] = useState(10000);

  const results = useMemo(() => {
    const ratio = income > 0 ? (debt / income) * 100 : 0;
    
    let status = 'Healthy';
    let color = 'green';
    let recommendation = 'Your DTI ratio is in a healthy range. You are likely eligible for most loans and mortgages.';
    
    if (ratio >= 50) {
      status = 'Danger';
      color = 'red';
      recommendation = 'Your DTI is high. Focus on paying down existing debt before taking on new obligations.';
    } else if (ratio >= 37) {
      status = 'Warning';
      color = 'yellow';
      recommendation = 'Your DTI is elevated. Lenders may require additional scrutiny for new credit applications.';
    }

    return {
      ratio,
      status,
      color,
      recommendation
    };
  }, [income, debt]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const summaryData = `Gross Monthly Income: ${formatCurrency(income)}
Total Monthly Debt Payments: ${formatCurrency(debt)}

Results:
DTI Ratio: ${results.ratio.toFixed(1)}%
Status: ${results.status}
Recommendation: ${results.recommendation}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Debt-to-Income (DTI)</h3>
        <p className="text-muted-foreground text-sm">Measure your financial health and borrowing capacity.</p>
      </div>

      <div className="space-y-2 flex-1">
        <RangeSlider label="Gross Monthly Income" min={1000} max={500000} step={1000} value={income} onChange={setIncome} unit="$" />
        <RangeSlider label="Total Monthly Debt Payments" min={0} max={100000} step={500} value={debt} onChange={setDebt} unit="$" />
      </div>

      <div className="grid grid-cols-1 mt-6 pt-6 border-t border-border gap-4">
        <ResultCard 
          title="DTI Percentage" 
          value={results.ratio} 
          unit="%" 
          color={results.color} 
          isBold={true}
          description={`Status: ${results.status}`}
        />
        <div className="bg-muted/50 p-4 rounded-xl border border-border">
          <span className="text-sm font-medium text-foreground block mb-1">Recommendation</span>
          <span className="text-sm text-muted-foreground leading-relaxed">
            {results.recommendation}
          </span>
        </div>
      </div>

      <DownloadButton data={summaryData} filename="Debt to Income Ratio" />
    </div>
  );
};

export default DebtToIncomeCalculator;