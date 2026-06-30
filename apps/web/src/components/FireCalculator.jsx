import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const FireCalculator = () => {
  const [age, setAge] = useState(30);
  const [monthlyExpenses, setMonthlyExpenses] = useState(5000);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [inflation, setInflation] = useState(6);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const results = useMemo(() => {
    let currentCorpus = currentSavings;
    let targetCorpus = monthlyExpenses * 12 * 25;
    let years = 0;
    
    // Prevent infinite loops if return <= inflation
    if (expectedReturn <= inflation && currentSavings < targetCorpus) {
      return { retirementAge: 'Never', yearsToRetire: 'N/A', finalCorpus: targetCorpus, gap: targetCorpus - currentSavings };
    }

    while (currentCorpus < targetCorpus && years < 70) {
      currentCorpus = currentCorpus * (1 + expectedReturn / 100);
      targetCorpus = targetCorpus * (1 + inflation / 100);
      years++;
    }

    return {
      retirementAge: age + years,
      yearsToRetire: years,
      finalCorpus: targetCorpus,
      gap: Math.max(0, targetCorpus - currentSavings)
    };
  }, [age, monthlyExpenses, currentSavings, expectedReturn, inflation]);

  const summaryData = `FIRE Age Calculator
Current Age: ${age}
Monthly Expenses: ${formatCurrency(monthlyExpenses)}
Current Savings: ${formatCurrency(currentSavings)}
Expected Return: ${expectedReturn}%
Inflation Rate: ${inflation}%

Results:
Retirement Age: ${results.retirementAge}
Years until Retirement: ${results.yearsToRetire}
Final Corpus Needed: ${formatCurrency(results.finalCorpus)}
Current Savings Gap: ${formatCurrency(results.gap)}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">FIRE Age Calculator</h3>
        <p className="text-muted-foreground text-sm">Find out when you can achieve Financial Independence and Retire Early.</p>
      </div>

      <div className="space-y-1 flex-1">
        <RangeSlider label="Current Age" min={20} max={70} step={1} value={age} onChange={setAge} />
        <RangeSlider label="Monthly Expenses" min={1000} max={50000} step={500} value={monthlyExpenses} onChange={setMonthlyExpenses} formatValue={formatCurrency} />
        <RangeSlider label="Current Savings" min={0} max={5000000} step={10000} value={currentSavings} onChange={setCurrentSavings} formatValue={formatCurrency} />
        <RangeSlider label="Expected Annual Return (%)" min={5} max={15} step={0.5} value={expectedReturn} onChange={setExpectedReturn} formatValue={(v) => `${v}%`} />
        <RangeSlider label="Inflation Rate (%)" min={2} max={10} step={0.5} value={inflation} onChange={setInflation} formatValue={(v) => `${v}%`} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <ResultCard label="Retirement Age" value={results.retirementAge} variant="primary" />
        <ResultCard label="Years to Retire" value={results.yearsToRetire} />
        <ResultCard label="Final Corpus Needed" value={formatCurrency(results.finalCorpus)} />
        <ResultCard label="Current Gap" value={formatCurrency(results.gap)} variant="destructive" />
      </div>

      <DownloadButton data={summaryData} filename="FIRE_Calculation" />
    </div>
  );
};

export default FireCalculator;