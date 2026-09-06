import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Wallet, 
  CreditCard, 
  Video, 
  ShoppingBag, 
  Lock, 
  TrendingUp, 
  Shield, 
  Zap, 
  Award, 
  Target, 
  Cpu, 
  FileCheck2, 
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LiveTicker from '@/components/LiveTicker.jsx';

const HomePage = () => {
  const sections = [
    {
      path: '/mcp',
      title: 'MCP & AI Repositories Hub',
      description: 'Directory of Model Context Protocol servers and top AI repositories with in-depth on-site use cases & 1-click ZIP downloads.',
      icon: Cpu,
      badge: 'Hot',
      color: 'from-cyan-500 to-indigo-600',
      tag: 'New Flagship'
    },
    {
      path: '/resume-builder',
      title: 'AI Resume & CV Builder',
      description: 'ATS-tailored single-column resume generator and custom directive modifier with instant Word (.doc) and PDF export.',
      icon: FileCheck2,
      badge: 'Updated',
      color: 'from-indigo-600 to-purple-600',
      tag: 'ATS 95+'
    },
    {
      path: '/wealth',
      title: 'Wealth Building Tools',
      description: 'Compound interest calculators, FIRE models, portfolio distribution algorithms, and systematic growth strategies.',
      icon: Wallet,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Calculators'
    },
    {
      path: '/ecom',
      title: 'E-commerce Optimization',
      description: 'Profit calculators, unit economics matrices, break-even analytics, and pricing elasticity tools for digital brands.',
      icon: ShoppingBag,
      color: 'from-purple-600 to-pink-600',
      tag: 'E-Commerce'
    },
    {
      path: '/creator',
      title: 'Creator Economy Engine',
      description: 'Multi-platform revenue estimators, sponsorship pricing formulas, and audience monetization tools.',
      icon: Video,
      color: 'from-pink-500 to-rose-600',
      tag: 'Creators'
    },
    {
      path: '/credit',
      title: 'Credit & Debt Strategy',
      description: 'Credit score audit simulators, debt snowball/avalanche calculators, and financial health health metrics.',
      icon: CreditCard,
      color: 'from-amber-500 to-orange-600',
      tag: 'Optimization'
    },
    {
      path: '/vault',
      title: 'Premium Resource Vault',
      description: 'Curated institutional blueprints, actionable spreadsheets, and proprietary toolkits to scale your operations.',
      icon: Lock,
      color: 'from-blue-600 to-indigo-700',
      tag: 'VIP Blueprints'
    }
  ];

  const telemetry = [
    { value: '25+', label: 'MCP Servers & Repos', sub: 'Instant 1-Click ZIPs', icon: Cpu, color: 'text-cyan-400' },
    { value: '95+', label: 'Average ATS Score', sub: 'Industry Compliant', icon: FileCheck2, color: 'text-indigo-400' },
    { value: '24/7', label: 'Automated Pipeline', sub: 'Daily GitHub Star Sync', icon: Zap, color: 'text-emerald-400' },
    { value: '100%', label: 'Zero-Retention Privacy', sub: 'Client Edge Processing', icon: Shield, color: 'text-purple-400' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Data-Driven & Quantified',
      description: 'Every tool and calculator is built on verified mathematical models and real-time GitHub/financial APIs.'
    },
    {
      icon: Shield,
      title: 'Zero-Redirect Architecture',
      description: 'Read complete use cases, view configs, and download tool archives directly on-site with zero external hops.'
    },
    {
      icon: Zap,
      title: 'Ultra-Fast Performance',
      description: 'Engineered with GPU-composited CSS and edge deployment for near-instant rendering across all devices.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>GTrends Global - AI Hub, MCP Directory & Wealth Automation</title>
        <meta name="description" content="Next-gen AI intelligence platform featuring Model Context Protocol (MCP) directory, ATS resume builder, and wealth automation tools for global builders and investors." />
      </Helmet>

      <div className="min-h-screen bg-[#070b14] text-foreground selection:bg-indigo-500/30 selection:text-white">
        <Header />

        {/* HERO SECTION WITH DYNAMIC CYBER-AURORA */}
        <section className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-12 pb-20">
          {/* Cyber Grid Background with Radial Mask */}
          <div className="absolute inset-0 cyber-grid opacity-75 pointer-events-none" />

          {/* Drifting GPU Aurora Glow Orbs */}
          <div className="mesh-glow-orb mesh-glow-1 opacity-50" />
          <div className="mesh-glow-orb mesh-glow-2 opacity-40" />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-radial from-transparent via-[#070b14]/50 to-[#070b14] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            {/* Pulsing Floating Pill */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-cyan-300 mb-8 backdrop-blur-md shadow-lg shadow-cyan-500/10 animate-float-slow"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Next-Gen Platform • MCP Servers, AI Resume & Financial Intelligence</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </motion.div>

            {/* Main Shimmering Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-[1.08] tracking-tight text-white">
                Intelligence for{' '}
                <span className="shimmer-text block sm:inline">
                  Global Innovators
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300/90 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
                Discover the world's best <span className="text-cyan-400 font-medium">Model Context Protocol (MCP) servers</span>, craft <span className="text-indigo-400 font-medium">ATS-compliant resumes</span>, and deploy institutional-grade <span className="text-emerald-400 font-medium">wealth automation tools</span>—all in one high-performance platform.
              </p>
            </motion.div>

            {/* Action CTAs with Shimmer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-4 mb-16"
            >
              <Button
                asChild
                className="shimmer-btn bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-bold text-base px-8 py-6 rounded-xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
              >
                <Link to="/mcp" className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-300" />
                  <span>Explore MCP & Repos</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-white/80" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/30 text-base font-semibold px-7 py-6 rounded-xl backdrop-blur-md transition-all hover:scale-[1.02]"
              >
                <Link to="/resume-builder" className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-400" />
                  <span>AI Resume Builder</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-white/5 text-base font-medium px-5 py-6 rounded-xl transition-all"
              >
                <Link to="/wealth" className="flex items-center gap-1.5">
                  <span>Financial Calculators</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Floating Live Telemetry Cards */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 max-w-4xl mx-auto"
            >
              {telemetry.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={i} 
                    className="p-4 rounded-xl bg-white/[0.025] border border-white/10 backdrop-blur-md text-left hover:border-white/20 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</span>
                      <Icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                    </div>
                    <div className="text-xs font-bold text-slate-200">{stat.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* LIVE TICKER COMPONENT */}
        <LiveTicker />

        {/* PLATFORM TOOLS & DIRECTORIES SHOWCASE */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070b14] via-[#0b1021] to-[#070b14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
                Core Suite
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4" style={{ textWrap: 'balance' }}>
                Engineered for High-Performance Growth
              </h2>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
                Select a tool to automate your workflow, analyze financial vectors, or integrate cutting-edge agent tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.path}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <Link to={section.path} className="block group h-full">
                      <div className="neon-border-card p-6 sm:p-7 flex flex-col h-full relative overflow-hidden">
                        {/* Top tag & badge */}
                        <div className="flex items-center justify-between mb-5">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.color} p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                            <div className="w-full h-full bg-[#070b14]/80 rounded-[10px] flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white group-hover:text-cyan-300 transition-colors" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {section.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm">
                                {section.badge}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-400">
                              {section.tag}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                          <span>{section.title}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                          {section.description}
                        </p>

                        {/* Footer link */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-cyan-300 transition-colors">
                          <span>Launch Tool</span>
                          <span className="text-white/30 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHY GTRENDS GLOBAL - KEY ADVANTAGES */}
        <section className="py-20 relative bg-[#070b14] border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center hover:border-indigo-500/30 transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/10">
                      <Icon className="w-7 h-7 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FOUNDER CREDENTIALS & MISSION SECTION */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070b14] to-[#0a0f1e] border-t border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-indigo-500/10 blur-[130px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              
              {/* Left Column: Vision */}
              <div className="lg:col-span-5">
                <div className="sticky top-24">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">
                    Institutional Rigor
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-6 text-white leading-tight tracking-tight" style={{ textWrap: 'balance' }}>
                    Pioneering the Future of <span className="shimmer-text">Intelligent Automation</span>
                  </h2>
                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">
                    GTrends Global is an AI-first intelligence platform engineered for <strong className="text-white font-semibold">global creators, developers, and investors</strong> across the USA, UK, and Europe.
                  </p>
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                    We synthesize automated data modeling, Model Context Protocol servers, and ATS resume engineering to remove guesswork, eliminate latency, and maximize output.
                  </p>
                </div>
              </div>

              {/* Right Column: Credentials & Mission */}
              <div className="lg:col-span-7 space-y-6">
                {/* Founder Credentials Card */}
                <div className="p-8 rounded-2xl bg-white/[0.025] border border-white/10 hover:border-indigo-500/40 transition-all shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Founder Credentials & Expertise</h3>
                      <p className="text-xs text-indigo-400 font-semibold">MBA in Finance • 9+ Years Research</p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    Founded by an investment and software veteran with an <strong className="text-white font-medium">MBA in Finance and 9 years of dedicated research</strong> in quantitative wealth systems and algorithmic automation, GTrends Global translates institutional capabilities into accessible, 1-click tools for the modern web.
                  </p>
                </div>

                {/* Mission Card */}
                <div className="p-8 rounded-2xl bg-white/[0.025] border border-white/10 hover:border-cyan-500/40 transition-all shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <Target className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Mission & Value Proposition</h3>
                      <p className="text-xs text-cyan-400 font-semibold">Empowering Modern Builders Worldwide</p>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                    We believe intelligent tooling should be instant, private, and frictionless. Whether you're connecting Claude to enterprise databases via MCP, optimizing your executive CV for global ATS filters, or calculating unit economics for an e-commerce brand, GTrends Global delivers direct, quantified answers.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <section className="py-20 relative overflow-hidden bg-[#070b14] border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-[#0f172a]/80 to-cyan-900/30 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="mesh-glow-orb mesh-glow-1 opacity-30" />
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready to Accelerate Your Workflow?
              </h2>
              <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base mb-8">
                Explore the free MCP & AI Repositories Hub or generate an ATS-tailored resume in under 60 seconds.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  asChild
                  className="shimmer-btn bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-base px-8 py-6 rounded-xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
                >
                  <Link to="/mcp">Explore MCP Hub</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-base font-semibold px-8 py-6 rounded-xl"
                >
                  <Link to="/resume-builder">Build ATS Resume</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;