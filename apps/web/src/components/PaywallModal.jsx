import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Crown } from 'lucide-react';
import { triggerGumroad } from '@/utils/gumroadHelper.js';

export default function PaywallModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Crown className="w-6 h-6 text-primary" />
            Free Limit Reached
          </DialogTitle>
          <DialogDescription className="text-muted-foreground pt-2 text-base leading-relaxed">
            You've reached your free generation limit. Subscribe to VIP for unlimited AI generations, ATS-optimized downloads, and advanced market tools.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              triggerGumroad();
              onClose();
            }}
            className="w-full py-4 rounded-xl font-bold bg-primary text-primary-foreground hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Subscribe to VIP
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}