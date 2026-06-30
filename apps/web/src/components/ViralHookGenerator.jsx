import React, { useState } from 'react';
import { Copy, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TEMPLATES = [
  "How I [Topic] in 24 hours",
  "The secret to [Topic] nobody tells you",
  "Stop doing [Topic] like this",
  "I tried [Topic] so you don't have to",
  "10 things about [Topic] that will shock you",
  "Why your [Topic] isn't working (and how to fix it)",
  "The ultimate guide to [Topic]",
  "I spent $1000 on [Topic] and here's what happened",
  "A beginner's guide to [Topic]",
  "The truth about [Topic]",
  "What they don't want you to know about [Topic]",
  "How to master [Topic] in 2026",
  "The only [Topic] strategy you need",
  "5 mistakes you're making with [Topic]",
  "How [Topic] changed my life",
  "The lazy way to [Topic]",
  "Why I stopped [Topic]",
  "The exact framework I use for [Topic]",
  "Everything you know about [Topic] is wrong",
  "How to [Topic] when you have no time"
];

const ViralHookGenerator = () => {
  const [topic, setTopic] = useState('');
  const [generatedHooks, setGeneratedHooks] = useState([]);

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }
    const hooks = TEMPLATES.map(t => t.replace(/\[Topic\]/gi, topic.trim()));
    setGeneratedHooks(hooks);
  };

  const handleReset = () => {
    setTopic('');
    setGeneratedHooks([]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Hook copied to clipboard!');
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Viral Hook Generator</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Your Topic/Niche</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., losing weight, coding, real estate..."
              className="flex-1 bg-background border border-input text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button onClick={handleGenerate} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]">
              Generate
            </Button>
          </div>
        </div>

        {generatedHooks.length > 0 && (
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[400px]">
            {generatedHooks.map((hook, idx) => (
              <div key={idx} className="group bg-background border border-border p-4 rounded-xl flex items-start justify-between gap-4 hover:border-primary/50 transition-colors">
                <p className="text-foreground font-medium leading-snug">{hook}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(hook)}
                  className="flex-shrink-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Copy hook"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViralHookGenerator;