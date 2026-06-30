import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, FileText, Mail, Briefcase, Bot, LogOut } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useVipAuth } from '@/contexts/VipAuthContext.jsx';

const VipDashboardPage = () => {
  const navigate = useNavigate();
  const { isVipUser, vipEmail, logoutVip, loading } = useVipAuth();

  useEffect(() => {
    // Check VIP status on mount, wait for context to load first
    if (!loading && !isVipUser) {
      navigate('/vip-login', { replace: true });
    }
  }, [isVipUser, loading, navigate]);

  const handleLogout = () => {
    logoutVip();
    navigate('/vip-login');
  };

  const tools = [
    {
      title: 'AI Resume Generator',
      description: 'Build ATS-optimized resumes that beat the algorithms directly via Gemini.',
      icon: <FileText className="w-6 h-6 text-primary" />,
      link: '/vip-resume'
    },
    {
      title: 'AI Cover Letter Generator',
      description: 'Craft personalized, persuasive cover letters instantly.',
      icon: <Mail className="w-6 h-6 text-primary" />,
      link: '/vip-cover-letter'
    },
    {
      title: 'Premium Gigs Hub',
      description: 'Access the curated high-paying remote jobs database with direct apply.',
      icon: <Briefcase className="w-6 h-6 text-primary" />,
      link: '/gigs'
    },
    {
      title: 'AI Career Assistant',
      description: 'Chat with Gemini AI for real-time market insights.',
      icon: <Bot className="w-6 h-6 text-primary" />,
      link: '/creator'
    }
  ];

  // Prevent rendering dashboard content briefly before redirecting
  if (loading || !isVipUser) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-8 h-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">VIP Dashboard</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Welcome back, <span className="text-foreground font-medium">{vipEmail || 'VIP Member'}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                <span className="text-sm font-bold text-primary uppercase tracking-wider">Active</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-2 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-colors group"
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-active:scale-95 transition-transform" />
                <span className="text-sm font-medium hidden sm:inline pr-2">Logout</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Unlocked Premium Tools</h2>
            <p className="text-muted-foreground">Select a tool below to access your VIP benefits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">{tool.description}</p>
                <Link
                  to={tool.link}
                  className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-xl text-center hover:bg-primary hover:text-primary-foreground transition-colors active:scale-[0.98]"
                >
                  Access Tool
                </Link>
              </div>
            ))}
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VipDashboardPage;