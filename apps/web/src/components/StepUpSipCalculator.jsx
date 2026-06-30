import React, { useState, useMemo } from 'react';
import RangeSlider from './RangeSlider.jsx';
import ResultCard from './ResultCard.jsx';
import DownloadButton from './DownloadButton.jsx';

const StepUpSipCalculator = () => {
  const [monthlySip, setMonthlySip] = useState(1000);
  const [stepUp, setStepUp] = useState(10);
  const [duration, setDuration] = useState(20);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const results = useMemo(() => {
    let totalInvested = 0;
    let totalWealth = 0;
    let currentSip = monthlySip;
    const monthlyRate = expectedReturn / 12 / 100;

    for (let year = 1; year <= duration; year++) {
      for (let month = 1; month <= 12; month++) {
        totalInvested += currentSip;
        totalWealth = (totalWealth + currentSip) * (1 + monthlyRate);
      }
      currentSip = currentSip * (1 + stepUp / 100);
    }

    return {
      totalInvested,
      totalWealth,
      wealthGained: totalWealth - totalInvested
    };
  }, [monthlySip, stepUp, duration, expectedReturn]);

  const summaryData = `Step-Up SIP Optimizer
Initial Monthly SIP: ${formatCurrency(monthlySip)}
Annual Step-Up: ${stepUp}%
Duration: ${duration} years
Expected Return: ${expectedReturn}%

Results:
Total Invested: ${formatCurrency(results.totalInvested)}
Total Wealth: ${formatCurrency(results.totalWealth)}
Wealth Gained: ${formatCurrency(results.wealthGained)}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Step-Up SIP Optimizer</h3>
        <p className="text-muted-foreground text-sm">See how increasing your SIP annually accelerates wealth creation.</p>
      </div>

      <div className="space-y-1 flex-1">
        <RangeSlider label="Initial Monthly SIP" min={100} max={20000} step={100} value={monthlySip} onChange={setMonthlySip} formatValue={formatCurrency} />
        <RangeSlider label="Annual Step-Up (%)" min={0} max={30} step={1} value={stepUp} onChange={setStepUp} formatValue={(v) => `${v}%`} />
        <RangeSlider label="Duration (Years)" min={1} max={40} step={1} value={duration} onChange={setDuration} />
        <RangeSlider label="Expected Annual Return (%)" min={5} max={20} step={0.5} value={expectedReturn} onChange={setExpectedReturn} formatValue={(v) => `${v}%`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
        <ResultCard label="Total Invested" value={formatCurrency(results.totalInvested)} />
        <ResultCard label="Total Wealth" value={formatCurrency(results.totalWealth)} variant="primary" />
        <div className="sm:col-span-2">
          <ResultCard label="Wealth Gained" value={formatCurrency(results.wealthGained)} variant="success" />
        </div>
      </div>

      <DownloadButton data={summaryData} filename="StepUp_SIP_Calculation" />
    </div>
  );
};

export default StepUpSipCalculator;