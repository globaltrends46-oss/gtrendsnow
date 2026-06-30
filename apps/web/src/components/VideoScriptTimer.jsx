import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WPM = 140; // Average speaking rate

const VideoScriptTimer = () => {
  const [script, setScript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [duration, setDuration] = useState({ mins: 0, secs: 0 });

  useEffect(() => {
    const text = script.trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);

    const totalSeconds = Math.round((words / WPM) * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    setDuration({ mins, secs });
  }, [script]);

  const handleReset = () => {
    setScript('');
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Script Timer</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div className="flex-1 flex flex-col">
          <label className="block text-sm font-semibold text-foreground mb-2">Video Script</label>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Paste your video script here to estimate length..."
            className="flex-1 min-h-[150px] w-full bg-background border border-input text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-xl p-5 border border-border text-center">
            <span className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Est. Duration</span>
            <span className="text-2xl font-black text-foreground">
              {duration.mins}m {duration.secs}s
            </span>
          </div>
          <div className="bg-background rounded-xl p-5 border border-border text-center">
            <span className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Word Count</span>
            <span className="text-2xl font-black text-foreground">
              {wordCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Based on average speaking rate of <span className="text-foreground">{WPM} WPM</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoScriptTimer;