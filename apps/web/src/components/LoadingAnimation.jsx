import React from 'react';
import { Hexagon } from 'lucide-react';

const LoadingAnimation = ({ userName }) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/85 animate-premium-fade rounded-2xl border border-border">
      <div className="relative flex items-center justify-center mb-8">
        {/* Pulsing Outer Ring */}
        <div className="absolute inset-0 rounded-full animate-premium-pulse bg-primary/20"></div>
        
        {/* Spinning Gradient Border */}
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary border-r-primary animate-premium-spin"></div>
        
        {/* Inner Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Hexagon className="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-1">
        Analyzing market data for {userName}
        <span className="flex items-center mt-2 ml-1">
          <span className="w-1.5 h-1.5 bg-primary rounded-full mx-0.5 dot-1"></span>
          <span className="w-1.5 h-1.5 bg-primary rounded-full mx-0.5 dot-2"></span>
          <span className="w-1.5 h-1.5 bg-primary rounded-full mx-0.5 dot-3"></span>
        </span>
      </h3>
      <p className="text-sm text-muted-foreground mt-3 font-medium">
        Running proprietary algorithms and simulations
      </p>
    </div>
  );
};

export default LoadingAnimation;