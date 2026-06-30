import React, { useEffect, useState, useRef } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const BlogGenerationTrigger = ({ onGenerated }) => {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const generateBlog = async () => {
      setStatus('generating');
      try {
        const response = await apiServerClient.fetch('/generate-blog', { method: 'POST' });
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to generate blog post');
        }
        
        const data = await response.json();
        setResult(data);
        setStatus('success');
        
        console.log('AI Blog Generation Success:', {
          title: data.title,
          postId: data.postId,
          featuredImageUrl: data.featuredImageUrl,
          contentLength: data.contentLength
        });

        if (onGenerated) {
          onGenerated();
        }
      } catch (err) {
        console.error('Blog generation error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    generateBlog();
  }, [onGenerated]);

  if (status === 'idle') return null;

  if (status === 'generating') {
    return (
      <div className="mb-12 p-6 bg-muted/30 rounded-2xl border border-border flex items-center gap-4">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <div>
          <h3 className="font-bold text-foreground">Initializing AI Researcher</h3>
          <p className="text-sm text-muted-foreground">Drafting a comprehensive new article. This may take a moment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mb-12 p-6 bg-destructive/10 rounded-2xl border border-destructive/20 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-destructive">Generation Failed</h3>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (status === 'success' && result) {
    return (
      <div className="mb-12 p-6 bg-primary/10 rounded-2xl border border-primary/20 flex items-start gap-4">
        <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div className="w-full">
          <h3 className="font-bold text-foreground mb-2">AI Blog Post Generated</h3>
          <div className="space-y-1">
            <p className="text-sm text-foreground">
              <span className="font-medium text-muted-foreground mr-2">Title:</span> 
              {result.title}
            </p>
            {result.featuredImageUrl && (
              <p className="text-sm text-foreground break-all">
                <span className="font-medium text-muted-foreground mr-2">Featured Image:</span> 
                <a href={result.featuredImageUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {result.featuredImageUrl}
                </a>
              </p>
            )}
            <p className="text-sm text-foreground">
              <span className="font-medium text-muted-foreground mr-2">Content Length:</span> 
              {result.contentLength || 'N/A'} chars
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};