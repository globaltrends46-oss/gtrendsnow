import React, { useState } from 'react';

const CurrencyInput = ({ label, value, onChange, min = 0, step = 1, prefix = '$' }) => {
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused 
    ? value 
    : Number(value).toLocaleString('en-US', {
        minimumFractionDigits: value % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: 2
      });

  const handleChange = (e) => {
    let rawValue = e.target.value.replace(/,/g, '');
    let numericValue = parseFloat(rawValue);
    
    if (isNaN(numericValue)) numericValue = 0;
    onChange(numericValue);
  };

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-sm font-semibold text-foreground tracking-wide">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <span className="text-muted-foreground font-medium">{prefix}</span>
        </div>
        <input
          type={isFocused ? "number" : "text"}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          min={min}
          step={step}
          className="bg-background border border-input text-foreground font-semibold rounded-xl pl-8 pr-4 py-3 w-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all group-hover:border-primary/50"
        />
      </div>
    </div>
  );
};

export default CurrencyInput;