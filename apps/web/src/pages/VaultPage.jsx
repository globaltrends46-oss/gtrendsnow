import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Lock } from 'lucide-react';

const VAULT_ITEMS = [
  // PREMIUM PRODUCTS
  {
    title: 'The Universal AI Prompt Library: 56 Core Blueprints',
    description: 'Master AI interactions with 56 proven prompt blueprints designed for maximum output quality and efficiency.',
    type: 'PROMPT LIBRARY',
    color: '#06b6d4',
    url: 'https://gtrendsglobal.gumroad.com/l/cqfan',
    isPremium: true
  },
  {
    title: 'The Solopreneur Master Operational Engine',
    description: 'A complete operational framework to streamline your solo business, automate tasks, and scale without burnout.',
    type: 'ENGINE',
    color: '#8b5cf6',
    url: 'https://gtrendsglobal.gumroad.com/l/ywenql',
    isPremium: true
  },
  {
    title: 'The 14-Day Digital Product Launch Blueprint',
    description: 'Step-by-step guide to ideating, creating, and launching your profitable digital product in just two weeks.',
    type: 'LAUNCH BLUEPRINT',
    color: '#10b981',
    url: 'https://gtrendsglobal.gumroad.com/l/aamuv',
    isPremium: true
  },
  {
    title: 'The 7-Day Screen Detox Playbook',
    description: 'Actionable strategies for parents to help children build healthier relationships with technology and screens.',
    type: 'PARENTING',
    color: '#f97316',
    url: 'https://gtrendsglobal.gumroad.com/l/kyfusv',
    isPremium: true
  },
  {
    title: 'The Corporate Boundary Manual',
    description: 'Essential scripts and systems for establishing professional boundaries, preventing burnout, and protecting your time.',
    type: 'CAREER SYSTEM',
    color: '#f43f5e',
    url: 'https://gtrendsglobal.gumroad.com/l/xdswyc',
    isPremium: true
  },
  {
    title: 'The Faceless Digital Empire',
    description: 'Build a highly profitable digital business and personal brand without ever showing your face on camera.',
    type: 'REVENUE',
    color: '#34d399',
    url: 'https://gtrendsglobal.gumroad.com/l/ulihz',
    isPremium: true
  },
  {
    title: 'The Zero-Doubt Emergency Fund',
    description: 'A bulletproof financial system to build, manage, and optimize your emergency savings for total peace of mind.',
    type: 'FINANCE VAULT',
    color: '#eab308',
    url: 'https://gtrendsglobal.gumroad.com/l/osubd',
    isPremium: true
  },
  {
    title: 'InVideo AI Video Generator',
    description: 'Automated video generation powered by AI. Create professional videos from text, images, and audio in minutes without technical skills or expensive software.',
    type: 'AI Video Tool',
    color: 'bg-success',
    url: 'https://invideo.sjv.io/c/7232222/883681/12258',
    isInVideo: true,
    isPremium: true
  },

  // FREE RESOURCES
  {
    title: 'Financial Master Forecast',
    description: 'Advanced Excel models for comprehensive financial forecasting, cash flow projections, and scenario planning.',
    type: 'Excel',
    color: 'bg-success',
    url: 'https://docs.google.com/spreadsheets/d/1DF6kGHBy__F7pTaGnwVEvER1ZWe_-K_0/export?format=xlsx'
  },
  {
    title: 'Service Agreement Pro',
    description: 'Professional service agreement template with scope of work, payment terms, and liability clauses for service providers.',
    type: 'Word',
    color: 'bg-info',
    url: 'https://docs.google.com/document/d/140KPD54ve_NHAvKJv-4WkNGM0EsQTY7r/export?format=docx'
  },
  {
    title: 'Asset Allocation Tracker',
    description: 'Portfolio management tool to track asset allocation, rebalancing, and investment performance across multiple accounts.',
    type: 'Excel',
    color: 'bg-success',
    url: 'https://docs.google.com/spreadsheets/d/1kmTK-q9Zf-c_B2-ZmchzA2-m6YNoseeH/export?format=xlsx'
  },
  {
    title: 'SEO Master Audit (100 Pts)',
    description: 'Complete 100-point SEO audit checklist covering technical, on-page, off-page, and UX optimization factors.',
    type: 'Excel',
    color: 'bg-success',
    url: 'https://docs.google.com/spreadsheets/d/1wU0U1t8SGY74mZRMfNIyHYmZN3IH559L/export?format=xlsx'
  },
  {
    title: 'E-commerce Profit Margin Calc',
    description: 'Calculate product profitability, COGS, markup percentages, and break-even points for e-commerce businesses.',
    type: 'Excel',
    color: 'bg-success',
    url: 'https://docs.google.com/spreadsheets/d/1PnXRzuQaOa0Co9D0z9vCEF6HOZtoUBYN/export?format=xlsx'
  },
  {
    title: 'Viral Hook Database',
    description: 'Curated collection of proven viral hooks and attention-grabbing opening lines for social media content.',
    type: 'PDF',
    color: 'bg-destructive',
    url: 'https://drive.google.com/uc?export=download&id=1Ej6TQ2sXVKQHeYGCLXvamyQVZpE321Tr'
  },
  {
    title: 'NDA & Confidentiality Template',
    description: 'Comprehensive non-disclosure agreement template protecting confidential information and trade secrets.',
    type: 'Word',
    color: 'bg-info',
    url: 'https://docs.google.com/document/d/1c2UP39olMZzhywnsl6Gp5Mu-hiT5clD3/export?format=docx'
  },
  {
    title: 'Export / Import Costing Sheet',
    description: 'International trade costing calculator for import/export businesses including tariffs, shipping, and duties.',
    type: 'Excel',
    color: 'bg-success',
    url: 'https://docs.google.com/spreadsheets/d/1xnQ7Z-W5AePaZD9Su5aWy7M0Hv7QF89o/export?format=xlsx'
  },
  {
    title: 'YouTube Growth Checklist',
    description: 'Comprehensive checklist for optimizing YouTube channel growth, SEO, and audience engagement strategies.',
    type: 'PDF',
    color: 'bg-destructive',
    url: 'https://drive.google.com/uc?export=download&id=1a6WtKD8yzdq-ty6srX_YN2jAg9guvJSo'
  },
  {
    title: 'Content Repurposing Flow',
    description: 'Strategic framework for repurposing single pieces of content across multiple platforms and formats.',
    type: 'PDF',
    color: 'bg-destructive',
    url: 'https://drive.google.com/uc?export=download&id=1PEDuYNyJcB8uta_cL8NFbhEAa_FUkvVc'
  }
];

const VaultPage = () => {
  return (
    <>
      <Helmet>
        <title>GTrends Premium Vault | Forecasting & Deployment Assets</title>
        <meta name="description" content="Instant direct access to our professional forecasting toolkits, calculators, and deployment assets." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Professional Header Section */}
            <div className="max-w-3xl mb-16 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-bold tracking-wider uppercase mb-6 border border-accent/20">
                <Lock className="w-4 h-4" />
                Open Access
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance mb-6">
                GTrends Premium Vault
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
                Instant direct access to our professional forecasting toolkits, calculators, and deployment assets. Download directly to your local drive.
              </p>
            </div>

            {/* Resources Grid */}
            <div className="vault-grid">
              {VAULT_ITEMS.map((item, index) => {
                if (item.isInVideo) {
                  return (
                    <div 
                      key={index}
                      className="group relative"
                      style={{
                        border: '1px solid #6366f1',
                        background: 'linear-gradient(135deg, #1e293b 0%, #111827 100%)',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
                        borderRadius: '0.75rem',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {item.isPremium && (
                        <div className="premium-crown-badge">👑</div>
                      )}
                      <div className="flex items-start justify-between mb-4">
                        <span 
                          style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'white',
                            backgroundColor: '#6366f1',
                            padding: '0.375rem 0.625rem',
                            borderRadius: '0.375rem',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                      
                      <h3 
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          marginBottom: '0.75rem',
                          color: '#a5b4fc',
                          lineHeight: '1.5'
                        }}
                        className="group-hover:text-white transition-colors"
                      >
                        {item.title}
                      </h3>
                      
                      <p 
                        style={{
                          fontSize: '0.875rem',
                          color: '#94a3b8',
                          marginBottom: '2rem',
                          flex: 1,
                          lineHeight: '1.625'
                        }}
                      >
                        {item.description}
                      </p>
                      
                      <div style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #334155'}}>
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#4f46e5';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#6366f1';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'scale(0.98)';
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                        >
                          🚀 Access AI Engine Free
                        </a>
                      </div>
                    </div>
                  );
                }

                const isHexColor = item.color.startsWith('#');

                return (
                  <div key={index} className="vault-card group relative">
                    {item.isPremium && (
                      <div className="premium-crown-badge">👑</div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <span 
                        className={`text-[11px] font-bold tracking-wider uppercase text-white px-2.5 py-1 rounded-md shadow-sm ${!isHexColor ? item.color : ''}`}
                        style={isHexColor ? { backgroundColor: item.color } : {}}
                      >
                        {item.type}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-foreground leading-snug group-hover:text-accent transition-colors pr-8">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-8 flex-1 leading-relaxed">
                      {item.description}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-border">
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground hover:bg-accent hover:text-white rounded-lg text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-sm"
                      >
                        <span>📥 Download Asset</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VaultPage;