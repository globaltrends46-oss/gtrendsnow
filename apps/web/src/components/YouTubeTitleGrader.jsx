import React, { useState, useEffect } from 'react';
import { Youtube, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const POWER_WORDS = [
  'Secret', 'Proven', 'Mistake', 'Shocking', 'Easy', 'Revealed', 
  'Exposed', 'Hack', 'Trick', 'Genius', 'Insane', 'Unbelievable', 
  'Incredible', 'Amazing', 'Powerful', 'Ultimate', 'Best', 'Worst', 
  'Never', 'Always'
];

const YouTubeTitleGrader = () => {
  const [title, setTitle] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [detectedWords, setDetectedWords] = useState([]);

  const analyzeTitle = (text) => {
    if (!text.trim()) {
      setScore(0);
      setFeedback('');
      setDetectedWords([]);
      return;
    }

    let currentScore = 0;
    const length = text.length;
    
    // Length check
    if (length > 0 && length < 50) currentScore += 60;
    else if (length >= 50 && length <= 70) currentScore += 100;
    else if (length > 70 && length <= 100) currentScore += 80;
    else if (length > 100) currentScore += 40;

    // Power words check
    const lowerText = text.toLowerCase();
    const found = POWER_WORDS.filter(word => lowerText.includes(word.toLowerCase()));
    
    currentScore += Math.min(found.length * 5, 20); // max 20 pts from power words
    
    // Cap score at 100
    const finalScore = Math.min(currentScore, 100);
    
    setScore(finalScore);
    setDetectedWords(found);

    if (finalScore >= 90) setFeedback('Excellent! Highly optimized for click-through rate.');
    else if (finalScore >= 70) setFeedback('Good. Try adding a power word or tweaking length.');
    else if (finalScore >= 40) setFeedback('Average. The length might be cutting off on mobile devices.');
    else setFeedback('Poor. Needs a complete rewrite for better performance.');
  };

  useEffect(() => {
    analyzeTitle(title);
  }, [title]);

  const handleReset = () => {
    setTitle('');
  };

  const getScoreColor = () => {
    if (score >= 70) return 'text-[hsl(var(--success))]';
    if (score >= 40) return 'text-[hsl(var(--warning))]';
    return 'text-[hsl(var(--danger))]';
  };

  const getProgressBarColor = () => {
    if (score >= 70) return 'bg-[hsl(var(--success))]';
    if (score >= 40) return 'bg-[hsl(var(--warning))]';
    return 'bg-[hsl(var(--danger))]';
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Title Grader</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paste your YouTube title here..."
            className="w-full bg-background border border-input text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
          <div className="text-right mt-1">
            <span className={`text-xs font-medium ${title.length > 100 ? 'text-[hsl(var(--danger))]' : 'text-muted-foreground'}`}>
              {title.length} chars
            </span>
          </div>
        </div>

        {title.trim() && (
          <div className="bg-background rounded-xl p-6 border border-border flex-1 flex flex-col items-center justify-center text-center transition-all animate-in fade-in duration-300">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Score</span>
            <div className={`text-6xl font-black mb-4 ${getScoreColor()}`}>
              {score}
            </div>
            
            <div className="w-full max-w-xs h-2 bg-secondary rounded-full overflow-hidden mb-4">
              <div 
                className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="text-foreground font-medium mb-4">{feedback}</p>

            {detectedWords.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {detectedWords.map(word => (
                  <span key={word} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold uppercase tracking-wider">
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>No power words detected</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeTitleGrader;