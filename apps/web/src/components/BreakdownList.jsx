import React from 'react';
import { cn } from '@/lib/utils';

const BreakdownList = ({ items }) => {
  return (
    <div className="bg-background rounded-xl border border-border overflow-hidden">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className={cn(
            "flex justify-between items-center p-3 text-sm transition-colors",
            idx !== items.length - 1 ? "border-b border-border" : "",
            item.isTotal ? "bg-secondary/50 font-bold text-foreground" : "text-muted-foreground hover:bg-secondary/20"
          )}
        >
          <span>{item.label}</span>
          <span className={cn(
            item.isTotal ? "text-lg" : "font-medium text-foreground",
            item.color === 'success' && 'text-[hsl(var(--success))]',
            item.color === 'danger' && 'text-[hsl(var(--danger))]'
          )}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BreakdownList;