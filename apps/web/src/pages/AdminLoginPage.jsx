import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/blog/create';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate slight network delay for realism
    setTimeout(() => {
      const success = login(password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | GTrends Global</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center p-4 py-20">
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              <div className="p-8 text-center border-b border-border bg-secondary/20">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">
                  Admin Access
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter admin password to access blog management
                </p>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-destructive">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-foreground tracking-wide mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-input border border-border text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-bold"
                    disabled={isLoading || !password}
                  >
                    {isLoading ? 'Verifying...' : 'Login to Dashboard'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminLoginPage;