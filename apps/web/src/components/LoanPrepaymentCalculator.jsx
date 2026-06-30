import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const LoanPrepaymentCalculator = () => {
  const [balance, setBalance] = useState(500000);
  const [currentPayment, setCurrentPayment] = useState(5000);
  const [extraPayment, setExtraPayment] = useState(1000);
  const [rate, setRate] = useState(8);
  const [tenure, setTenure] = useState(20);

  const results = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const originalMonths = tenure * 12;
    
    // Original Interest Calculation (based on remaining tenure)
    const originalTotalPaid = currentPayment * originalMonths;
    const originalInterest = Math.max(0, originalTotalPaid - balance);

    // New Prepayment Calculation using formula for number of periods
    const newPayment = currentPayment + extraPayment;
    let newMonths = 0;
    
    if (monthlyRate === 0) {
      newMonths = balance / newPayment;
    } else {
      // Check if payment covers interest
      if (newPayment <= balance * monthlyRate) {
        newMonths = Infinity;
      } else {
        newMonths = -Math.log(1 - (balance * monthlyRate) / newPayment) / Math.log(1 + monthlyRate);
      }
    }
    
    newMonths = Math.ceil(newMonths);
    
    let interestSaved = 0;
    let timeSavedMonths = 0;
    let newTotalInterest = 0;

    if (newMonths !== Infinity && newMonths < originalMonths) {
      // Simulate precise new total interest to handle final partial payment
      let tempBalance = balance;
      let monthsCount = 0;
      let totalPaid = 0;
      
      while (tempBalance > 0 && monthsCount < 1200) {
        const interestForMonth = tempBalance * monthlyRate;
        newTotalInterest += interestForMonth;
        let paymentThisMonth = newPayment;
        
        if (tempBalance + interestForMonth < newPayment) {
          paymentThisMonth = tempBalance + interestForMonth;
        }
        
        totalPaid += paymentThisMonth;
        tempBalance = tempBalance + interestForMonth - paymentThisMonth;
        monthsCount++;
      }
      
      newMonths = monthsCount;
      interestSaved = originalInterest - newTotalInterest;
      timeSavedMonths = originalMonths - newMonths;
    }

    return {
      originalMonths,
      newMonths,
      interestSaved,
      timeSavedMonths,
      timeSavedYears: Math.floor(timeSavedMonths / 12),
      timeSavedRemainderMonths: timeSavedMonths % 12
    };
  }, [balance, currentPayment, extraPayment, rate, tenure]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const summaryData = `Current Balance: ${formatCurrency(balance)}
Current Payment: ${formatCurrency(currentPayment)}
Extra Monthly Payment: ${formatCurrency(extraPayment)}
Interest Rate: ${rate}%
Remaining Tenure: ${tenure} years

Results:
Interest Saved: ${formatCurrency(results.interestSaved)}
Time Saved: ${results.timeSavedYears} years and ${results.timeSavedRemainderMonths} months
Original payoff: ${results.originalMonths} months
New payoff: ${results.newMonths} months`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Loan Prepayment Calculator</h3>
        <p className="text-muted-foreground text-sm">See how much time and interest extra payments can save you.</p>
      </div>

      <div className="space-y-2 flex-1">
        <RangeSlider label="Current Balance" min={10000} max={10000000} step={10000} value={balance} onChange={setBalance} unit="$" />
        <RangeSlider label="Current Monthly Payment" min={100} max={50000} step={100} value={currentPayment} onChange={setCurrentPayment} unit="$" />
        <RangeSlider label="Extra Monthly Amount" min={0} max={50000} step={100} value={extraPayment} onChange={setExtraPayment} unit="$" />
        <RangeSlider label="Interest Rate" min={2} max={15} step={0.1} value={rate} onChange={setRate} unit="%" />
        <RangeSlider label="Remaining Tenure" min={1} max={30} step={1} value={tenure} onChange={setTenure} unit="years" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <ResultCard 
          title="Interest Saved" 
          value={results.interestSaved} 
          unit="$" 
          color="green" 
          isBold={true}
        />
        <ResultCard 
          title="Time Saved" 
          value={`${results.timeSavedYears}y ${results.timeSavedRemainderMonths}m`} 
          unit="" 
          color="green" 
          isBold={true}
        />
        <div className="sm:col-span-2">
          <ResultCard 
            title="Payoff Timeline" 
            value={`Original: ${results.originalMonths} months`} 
            unit="" 
            color="neutral"
            description={`New payoff: ${results.newMonths} months with extra payments`}
          />
        </div>
      </div>

      <DownloadButton data={summaryData} filename="Loan Prepayment Calculator" />
    </div>
  );
};

export default LoanPrepaymentCalculator;