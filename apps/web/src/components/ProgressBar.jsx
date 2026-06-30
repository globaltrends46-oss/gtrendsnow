import React from 'react';

const ProgressBar = ({ label, percentage, color = 'primary' }) => {
  const colorMap = {
    success: 'bg-[hsl(var(--success))]',
    danger: 'bg-[hsl(var(--danger))]',
    warning: 'bg-[hsl(var(--warning))]',
    primary: 'bg-primary'
  };

  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-end mb-2">
        {label && <span className="text-sm font-semibold text-foreground">{label}</span>}
        <span className="text-sm font-bold text-foreground">{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-background border border-border h-3 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorMap[color] || colorMap.primary}`} 
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;