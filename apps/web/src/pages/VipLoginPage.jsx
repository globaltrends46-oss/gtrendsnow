import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Loader2, AlertCircle, Bug } from 'lucide-react';
import { triggerGumroad } from '@/utils/gumroadHelper.js';
import apiServerClient from '@/lib/apiServerClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const VipLoginPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Debug Panel States
  const [apiStatus, setApiStatus] = useState('idle');
  const [lastAction, setLastAction] = useState('Waiting for input...');
  const [localStorageState, setLocalStorageState] = useState({
    isVip: localStorage.getItem('is_vip'),
    vipEmail: localStorage.getItem('vip_email')
  });

  // Force re-render of local storage state in debug panel periodically or on state change
  const updateDebugLocalStorage = () => {
    setLocalStorageState({
      isVip: localStorage.getItem('is_vip'),
      vipEmail: localStorage.getItem('vip_email')
    });
  };

  useEffect(() => {
    // Redirect immediately if already logged in
    const isVip = localStorage.getItem('is_vip');
    if (isVip === 'true') {
      console.log('[VIP LOGIN] User already VIP in localStorage, redirecting immediately.');
      navigate('/vip-dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;

    const prefix = '[VIP LOGIN]';
    console.log(`${prefix} 1. Login button clicked. Email value:`, email);
    setLastAction(`Clicked login with email: ${email}`);

    setLoading(true);
    setError(null);
    setApiStatus('pending');

    try {
      console.log(`${prefix} 2. Starting API call to /vip-login`);
      setLastAction(`Starting API call for ${email}...`);
      
      const response = await apiServerClient.fetch('/vip-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      console.log(`${prefix} 3. API Response received. Status:`, response.status, 'OK:', response.ok);
      setLastAction(`Received API response. Status: ${response.status}`);
      
      const data = await response.json();
      console.log(`${prefix} 3a. API Response Body:`, data);

      if (data.success) {
        setApiStatus('success');
        console.log(`${prefix} 4. Login successful. Setting localStorage.`);
        setLastAction('Success! Setting localStorage...');
        
        localStorage.setItem('is_vip', 'true');
        localStorage.setItem('vip_email', data.email || email);
        
        updateDebugLocalStorage();
        
        console.log(`${prefix} 5. localStorage set. is_vip: ${localStorage.getItem('is_vip')}, vip_email: ${localStorage.getItem('vip_email')}`);
        console.log(`${prefix} 6. Redirecting to /vip-dashboard...`);
        setLastAction('Redirecting to dashboard...');
        
        navigate('/vip-dashboard');
      } else {
        setApiStatus('error');
        console.error(`${prefix} 4. Login failed. Error from server:`, data.error);
        setLastAction(`API returned error: ${data.error}`);
        setError(data.error || 'Login failed. Please verify your VIP status.');
      }
    } catch (err) {
      setApiStatus('error');
      console.error(`${prefix} ERROR. Exception caught during login flow:`, err);
      setLastAction(`Exception caught: ${err.message}`);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
      updateDebugLocalStorage();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border p-8 rounded-2xl shadow-lg text-center relative z-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">VIP Access</h1>
            <p className="text-muted-foreground mb-8 text-sm">Enter your purchase email to access premium tools.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="text-left space-y-2">
                <label htmlFor="vip-email" className="text-sm font-medium text-foreground ml-1">
                  Email Address
                </label>
                <input
                  id="vip-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null); // Clear error on type
                  }}
                  placeholder="vip@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-left flex items-start gap-3 animate-in fade-in zoom-in duration-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1">{error}</p>
                    <button
                      type="button"
                      onClick={triggerGumroad}
                      className="text-primary hover:underline font-medium text-xs"
                    >
                      Get VIP Access Here &rarr;
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter VIP Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Visual Debug Panel */}
      <div className="fixed bottom-4 right-4 max-w-sm w-full bg-slate-950 text-slate-50 p-4 rounded-xl shadow-2xl text-xs font-mono z-50 border border-slate-800 pointer-events-none opacity-90">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
          <h3 className="font-bold flex items-center gap-2 text-emerald-400">
            <Bug className="w-4 h-4" /> VIP Login Debug
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Email Input:</span>
            <span className="truncate ml-2 text-amber-200">{email || '(empty)'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">API Status:</span>
            <span className={`font-bold ${apiStatus === 'error' ? 'text-rose-400' : apiStatus === 'success' ? 'text-emerald-400' : apiStatus === 'pending' ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
              {apiStatus.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 mb-1">Local Storage:</span>
            <div className="bg-slate-900 rounded p-2 space-y-1">
              <div className="flex justify-between">
                <span>is_vip:</span>
                <span className={localStorageState.isVip ? 'text-emerald-400' : 'text-slate-500'}>
                  {localStorageState.isVip || 'null'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>vip_email:</span>
                <span className={localStorageState.vipEmail ? 'text-emerald-400' : 'text-slate-500'}>
                  {localStorageState.vipEmail || 'null'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-2 pt-2 border-t border-slate-800">
            <span className="text-slate-400 mb-1">Last Action:</span>
            <span className="text-cyan-300 break-words leading-relaxed">{lastAction}</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VipLoginPage;