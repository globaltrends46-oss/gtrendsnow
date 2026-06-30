import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const NewsletterSignup = ({ compact = false, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await pb.collection('newsletter_signups').create({
        email: email
      }, { $autoCancel: false });

      setIsSuccess(true);
      setEmail('');
      toast.success('Thanks for subscribing!');
      
      setTimeout(() => {
        setIsSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Newsletter signup error:', error);
      if (error.message.includes('email')) {
        toast.error('This email is already subscribed');
      } else {
        toast.error('Subscription failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || isSuccess}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />
        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className="w-full bg-primary text-primary-foreground hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Subscribed
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className="bg-popover rounded-2xl p-8 border border-border">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-foreground tracking-tight">Stay ahead of the curve</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Get exclusive financial insights, tool updates, and strategies delivered to your inbox
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isSuccess}
            className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={isLoading || isSuccess}
            className="bg-primary text-primary-foreground hover:brightness-110 transition-all duration-200 active:scale-[0.98]"
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Subscribed
              </>
            ) : (
              <>
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSignup;