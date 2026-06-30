import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const SmartLoanEmiCalculator = () => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(8);
  const [tenure, setTenure] = useState(20);

  const results = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    
    let emi = 0;
    if (rate === 0) {
      emi = amount / months;
    } else {
      emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPaid = emi * months;
    const totalInterest = totalPaid - amount;

    return {
      emi,
      totalInterest,
      totalPaid,
      months
    };
  }, [amount, rate, tenure]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const summaryData = `Loan Amount: ${formatCurrency(amount)}
Interest Rate: ${rate}%
Tenure: ${tenure} years

Results:
Monthly Payment (EMI): ${formatCurrency(results.emi)}
Total Interest Paid: ${formatCurrency(results.totalInterest)}
Total Cost of Loan: ${formatCurrency(results.totalPaid)}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Smart Loan EMI Calculator</h3>
        <p className="text-muted-foreground text-sm">Calculate your exact monthly payments and total interest costs.</p>
      </div>

      <div className="space-y-2 flex-1">
        <RangeSlider label="Loan Amount" min={10000} max={10000000} step={10000} value={amount} onChange={setAmount} unit="$" />
        <RangeSlider label="Interest Rate" min={2} max={15} step={0.1} value={rate} onChange={setRate} unit="%" />
        <RangeSlider label="Tenure" min={1} max={30} step={1} value={tenure} onChange={setTenure} unit="years" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <div className="sm:col-span-2">
          <ResultCard 
            title="Monthly Payment" 
            value={results.emi} 
            unit="$" 
            color="neutral" 
            isBold={true}
            description={`Pay ${formatCurrency(results.emi)}/month for ${results.months} months`}
          />
        </div>
        <ResultCard title="Total Interest Paid" value={results.totalInterest} unit="$" color="red" />
        <ResultCard title="Total Cost" value={results.totalPaid} unit="$" color="neutral" />
      </div>

      <DownloadButton data={summaryData} filename="Smart Loan EMI Calculator" />
    </div>
  );
};

export default SmartLoanEmiCalculator;