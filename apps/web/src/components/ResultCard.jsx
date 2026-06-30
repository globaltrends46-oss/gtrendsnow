import React from 'react';
import { cn } from '@/lib/utils';

const ResultCard = ({ title, value, type = 'default', subtext }) => {
  const typeStyles = {
    success: 'text-[hsl(var(--success))] bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/20',
    danger: 'text-[hsl(var(--danger))] bg-[hsl(var(--danger))]/10 border-[hsl(var(--danger))]/20',
    warning: 'text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20',
    default: 'text-foreground bg-secondary/50 border-border',
    primary: 'text-primary bg-primary/10 border-primary/20'
  };

  const selectedStyle = typeStyles[type] || typeStyles.default;

  return (
    <div className={cn("p-5 rounded-xl border flex flex-col items-start justify-center transition-all", selectedStyle)}>
      <span className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-1">{title}</span>
      <span className="text-3xl font-black tracking-tight">{value}</span>
      {subtext && (
        <span className="text-xs font-medium opacity-70 mt-1">{subtext}</span>
      )}
    </div>
  );
};

export default ResultCard;