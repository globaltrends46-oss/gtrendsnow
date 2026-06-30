import React from 'react';

const RangeSlider = ({ label, value, onChange, min = 0, max = 100, step = 1, suffix = '%' }) => {
  const handleChange = (e) => {
    const val = parseFloat(e.target.value);
    onChange(isNaN(val) ? 0 : val);
  };

  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-foreground tracking-wide">
          {label}
        </label>
        <div className="relative">
          <input
            type="number"
            value={value}
            onChange={handleChange}
            className="bg-background border border-input text-foreground font-bold rounded-lg px-3 py-1 w-24 text-right focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      </div>
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground font-medium">
        <span>{min}{suffix}</span>
        <span>{max}{suffix}</span>
      </div>
    </div>
  );
};

export default RangeSlider;