import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Briefcase, DollarSign, LayoutGrid, Filter, SearchX, Sparkles, Lock, Crown } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ToolEngine from '@/components/ToolEngine.jsx';
import JobCard from '@/components/JobCard.jsx';
import GlobalJobFeed from '@/components/GlobalJobFeed.jsx';
import ResumeBuilder from '@/components/ResumeBuilder.jsx';
import CoverLetterBuilder from '@/components/CoverLetterBuilder.jsx';
import PaywallModal from '@/components/PaywallModal.jsx';
import { Button } from '@/components/ui/button';
import { getToolsByCategory } from '@/utils/ToolConfigLoader.js';
import { useVipAuth } from '@/contexts/VipAuthContext.jsx';
import staticJobsData from '@/data/staticJobs.json';

const GigsPage = () => {
  const tools = getToolsByCategory('gigs');
  const [activeCategory, setActiveCategory] = useState('All');
  const { isVipUser } = useVipAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  const jobs = useMemo(() => {
    return staticJobsData.filter(item => !item._comment);
  }, []);

  const categories = ['All', 'Content Writing', 'Finance'];

  const filteredJobs = useMemo(() => {
    if (activeCategory === 'All') return jobs;
    return jobs.filter(job => job.category === activeCategory);
  }, [jobs, activeCategory]);

  const renderLockedSection = (children) => {
    if (isVipUser) return children;
    return (
      <div className="relative group rounded-2xl overflow-hidden border border-border bg-card mt-8">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[4px] z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-foreground">VIP Access Required</h3>
          <p className="text-muted-foreground mb-6 max-w-md">Upgrade to VIP to unlock freelance tools, AI builders, and premium gigs.</p>
          <Button onClick={() => setShowPaywall(true)} className="bg-primary text-primary-foreground font-bold text-lg px-8 py-6 rounded-xl hover:scale-105 transition-transform shadow-xl shadow-primary/20">
            <Crown className="w-5 h-5 mr-2" /> Upgrade to VIP
          </Button>
        </div>
        <div className="opacity-40 pointer-events-none select-none grayscale-[50%]">
          {children}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Gig Economy & Remote Jobs | Hydra Network Global</title>
        <meta name="description" content="Optimize your freelance business with rate calculators, build AI-powered resumes, and find curated high-paying remote jobs." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1">
          <section className="py-20 bg-gradient-to-br from-background via-card/50 to-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                  <Briefcase className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Gig Economy
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2 font-medium">
                    Freelance tools, document builders, and remote opportunities
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 mb-12 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-start gap-4">
                  <DollarSign className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold mb-2">Command Your True Value</h2>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                      The modern global workforce is shifting remote. Whether you're setting your freelance rates, optimizing your resume for applicant tracking systems, or hunting for the next big full-time role, our suite ensures you're positioned for success.
                    </p>
                  </div>
                </div>
                {!isVipUser && (
                  <Button onClick={() => setShowPaywall(true)} className="bg-primary text-primary-foreground hover:brightness-110 flex-shrink-0 font-bold px-6 py-6 text-lg transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
                    <Crown className="w-5 h-5 mr-2" />
                    Unlock VIP Access
                  </Button>
                )}
              </div>

              {renderLockedSection(
                tools.length > 0 ? (
                  <ToolEngine tools={tools} />
                ) : (
                  <div className="bg-card/50 rounded-2xl border border-dashed border-border p-12 text-center mb-20 hidden"></div>
                )
              )}
            </div>
          </section>

          {/* AI Document Builders Section */}
          <section className="py-24 bg-card border-t border-border relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/5 blur-[120px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">AI-Powered Document Builders</h2>
                  </div>
                  <p className="text-muted-foreground text-lg max-w-2xl">Craft ATS-optimized resumes and persuasive cover letters in seconds. Stand out to global employers with professional formatting.</p>
                </div>
              </div>

              {renderLockedSection(
                <div className="grid grid-cols-1 gap-16">
                  <ResumeBuilder />
                  <CoverLetterBuilder />
                </div>
              )}
            </div>
          </section>

          <section className="py-24 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="mb-24">
                <GlobalJobFeed />
              </div>

              {renderLockedSection(
                <>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <LayoutGrid className="w-6 h-6 text-primary" />
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Standard Remote Gigs</h2>
                      </div>
                      <p className="text-muted-foreground text-lg">Curated, high-paying remote roles from verified companies.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-xl border border-border">
                      <Filter className="w-4 h-4 text-muted-foreground ml-2" />
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setActiveCategory(category)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                            activeCategory === category
                              ? 'bg-card text-foreground shadow-sm border border-border/50'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8 flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Showing <span className="text-foreground font-bold">{filteredJobs.length}</span> opportunities
                    </p>
                    <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      Live Feed Updated Weekly
                    </div>
                  </div>

                  {filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-2xl border border-dashed border-border p-16 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <SearchX className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">No jobs found</h3>
                      <p className="text-muted-foreground">There are currently no open positions in the "{activeCategory}" category.</p>
                      <button 
                        onClick={() => setActiveCategory('All')}
                        className="mt-6 text-primary font-semibold hover:underline"
                      >
                        View all jobs
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        <Footer />
        <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    </>
  );
};

export default GigsPage;