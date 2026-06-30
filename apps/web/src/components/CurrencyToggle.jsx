import React from 'react';
import { DollarSign, IndianRupee } from 'lucide-react';

const CurrencyToggle = ({ currency, setCurrency }) => {
  return (
    <div className="flex items-center bg-muted p-1 rounded-xl border border-border w-fit">
      <button
        onClick={() => setCurrency('INR')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
          currency === 'INR'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <IndianRupee className="w-4 h-4" />
        INR
      </button>
      <button
        onClick={() => setCurrency('USD')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
          currency === 'USD'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <DollarSign className="w-4 h-4" />
        USD
      </button>
    </div>
  );
};

export default CurrencyToggle;