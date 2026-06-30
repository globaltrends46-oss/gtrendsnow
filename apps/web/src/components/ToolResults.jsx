import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { canGenerateDocument, markGenerationUsed } from '@/utils/vipTracker.js';
import PaywallModal from '@/components/PaywallModal.jsx';

export default function ToolResults({ results, title, onDownload }) {
  const [showPaywall, setShowPaywall] = useState(false);

  const handleAction = (actionFn) => {
    if (!canGenerateDocument()) {
      setShowPaywall(true);
      return;
    }
    markGenerationUsed();
    if (actionFn) actionFn();
  };

  if (!results) return null;

  return (
    <div className="mt-8 bg-card border border-border rounded-2xl p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-foreground mb-6">{title || 'Analysis Results'}</h3>
      
      <div className="space-y-4 mb-8">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center py-3 border-b border-border/30">
            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="font-bold text-foreground">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          className="flex-1 py-3 px-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]"
          onClick={() => handleAction(onDownload)}
        >
          <Download className="w-5 h-5" />
          Download Results
        </button>
        <button 
          className="flex-1 py-3 px-4 bg-secondary text-secondary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]"
          onClick={() => handleAction(() => console.log('Full details view'))}
        >
          <FileText className="w-5 h-5" />
          Full Details
        </button>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}