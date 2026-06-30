import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const CreditCardMinimumPaymentCalculator = () => {
  const [balance, setBalance] = useState(10000);
  const [apr, setApr] = useState(18);
  const [minPaymentPct, setMinPaymentPct] = useState(3);

  const results = useMemo(() => {
    let currentBalance = balance;
    let totalInterest = 0;
    let monthsCount = 0;
    let totalAmountPaid = 0;
    
    const monthlyRate = apr / 12 / 100;
    
    // Safety break to prevent infinite loops
    while (currentBalance > 0 && monthsCount < 1200) {
      const interestForMonth = currentBalance * monthlyRate;
      let minPayment = Math.max(currentBalance * (minPaymentPct / 100), interestForMonth + 1);
      
      if (minPayment >= currentBalance + interestForMonth) {
        minPayment = currentBalance + interestForMonth;
      }
      
      totalInterest += interestForMonth;
      totalAmountPaid += minPayment;
      currentBalance = currentBalance + interestForMonth - minPayment;
      monthsCount++;
    }

    const years = (monthsCount / 12).toFixed(1);

    return {
      months: monthsCount,
      years,
      totalInterest,
      totalAmountPaid,
      isDanger: monthsCount > 60 // more than 5 years
    };
  }, [balance, apr, minPaymentPct]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const summaryData = `Credit Card Balance: ${formatCurrency(balance)}
APR: ${apr}%
Minimum Payment %: ${minPaymentPct}%

Results:
Years to Pay Off: ${results.years} years (${results.months} months)
Total Interest Paid: ${formatCurrency(results.totalInterest)}
Total Amount Paid: ${formatCurrency(results.totalAmountPaid)}
Warning: If you only pay minimum, you'll pay ${formatCurrency(results.totalInterest)} in interest over ${results.years} years.`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">CC Minimum Payment Trap</h3>
        <p className="text-muted-foreground text-sm">Visualize the true cost of only making minimum payments.</p>
      </div>

      <div className="space-y-2 flex-1">
        <RangeSlider label="Credit Card Balance" min={100} max={1000000} step={100} value={balance} onChange={setBalance} unit="$" />
        <RangeSlider label="APR" min={5} max={35} step={0.5} value={apr} onChange={setApr} unit="%" />
        <RangeSlider label="Minimum Payment %" min={1} max={10} step={0.5} value={minPaymentPct} onChange={setMinPaymentPct} unit="%" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <ResultCard 
          title="Years to Pay Off" 
          value={results.years} 
          unit="years" 
          color={results.isDanger ? 'red' : 'yellow'} 
          isBold={true}
        />
        <ResultCard 
          title="Total Interest Paid" 
          value={results.totalInterest} 
          unit="$" 
          color="red" 
        />
        <div className="sm:col-span-2">
          <ResultCard 
            title="Total Amount Paid" 
            value={results.totalAmountPaid} 
            unit="$" 
            color="neutral"
            description={`If you only pay minimum, you'll pay ${formatCurrency(results.totalInterest)} in interest over ${results.years} years.`}
          />
        </div>
      </div>

      <DownloadButton data={summaryData} filename="Credit Card Minimum Payment" />
    </div>
  );
};

export default CreditCardMinimumPaymentCalculator;