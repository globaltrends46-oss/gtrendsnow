import React, { useState } from 'react';
import { Type, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LIMITS = {
  twitter: { name: 'X (Twitter)', limit: 280, tip: 'Keep it punchy. Threads work best for long ideas.' },
  instagram: { name: 'Instagram', limit: 2200, tip: 'Use emojis and line breaks to improve readability.' },
  linkedin: { name: 'LinkedIn', limit: 3000, tip: 'Hook readers in the first 3 lines before the "see more" button.' }
};

const SocialMediaCharacterCounter = () => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('twitter');

  const count = content.length;
  const limit = LIMITS[platform].limit;
  const remaining = limit - count;
  const isOver = count > limit;

  const handleReset = () => {
    setContent('');
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Type className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Character Counter</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Platform</label>
          <div className="flex gap-2">
            {Object.keys(LIMITS).map((key) => (
              <button
                key={key}
                onClick={() => setPlatform(key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  platform === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {LIMITS[key].name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Draft your post here..."
            className={`flex-1 min-h-[150px] w-full bg-background border ${isOver ? 'border-[hsl(var(--danger))] ring-1 ring-[hsl(var(--danger))]' : 'border-input focus:border-primary focus:ring-2 focus:ring-primary'} text-foreground rounded-lg px-4 py-3 outline-none resize-none transition-all`}
          />
          <div className="flex justify-between items-center mt-3">
            <span className={`font-bold text-lg ${isOver ? 'text-[hsl(var(--danger))]' : 'text-foreground'}`}>
              {count} / {limit}
            </span>
            <span className={`text-sm font-medium ${isOver ? 'text-[hsl(var(--danger))]' : 'text-muted-foreground'}`}>
              {remaining} characters remaining
            </span>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <p className="text-sm text-primary font-medium">
            <strong className="font-bold">Tip:</strong> {LIMITS[platform].tip}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaCharacterCounter;