import React from 'react';
import { ArrowRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ToolCard = ({ tool, onLaunch }) => {
  return (
    <div className="bg-[hsl(0_0%_10%)] rounded-2xl border border-[hsl(0_0%_15%)] p-6 hover:border-[hsl(45_93%_58%)]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(45_93%_58%)]/10 group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(45_93%_58%)]/20 to-[hsl(180_84%_45%)]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
          <Calculator className="w-6 h-6 text-[hsl(45_93%_58%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 text-[hsl(0_0%_95%)] group-hover:text-[hsl(45_93%_58%)] transition-colors duration-200">
            {tool.title}
          </h3>
          <p className="text-sm text-[hsl(0_0%_70%)] leading-relaxed mb-4">
            {tool.description}
          </p>
          <Button
            onClick={() => onLaunch(tool)}
            className="bg-[hsl(45_93%_58%)] text-[hsl(0_0%_8%)] hover:bg-[hsl(45_93%_65%)] transition-all duration-200 active:scale-[0.98] group/btn"
          >
            Launch Tool
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;