import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, CreditCard, Video, ShoppingBag, Lock, TrendingUp, Shield, Zap, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const HomePage = () => {
  const sections = [
    {
      path: '/creator',
      title: 'Creator Economy',
      description: 'Revenue calculators, audience growth tools, and monetization strategies',
      icon: Video,
      color: 'from-primary to-accent'
    },
    {
      path: '/ecom',
      title: 'E-commerce',
      description: 'Profit calculators, pricing tools, and business growth analytics',
      icon: ShoppingBag,
      color: 'from-accent to-primary'
    },
    {
      path: '/wealth',
      title: 'Wealth Building',
      description: 'Investment calculators, retirement planning, and wealth growth strategies',
      icon: Wallet,
      color: 'from-primary to-primary/70'
    },
    {
      path: '/credit',
      title: 'Credit Optimization',
      description: 'Credit score tools, debt management, and financial health tracking',
      icon: CreditCard,
      color: 'from-accent to-accent/70'
    },
    {
      path: '/vault',
      title: 'Resource Vault',
      description: 'Templates, guides, and educational resources for financial success',
      icon: Lock,
      color: 'from-primary to-accent'
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Data-driven insights',
      description: 'Make informed decisions with accurate calculations and real-time analytics'
    },
    {
      icon: Shield,
      title: 'Privacy focused',
      description: 'Your financial data stays private - no tracking, no selling, no compromises'
    },
    {
      icon: Zap,
      title: 'Instant results',
      description: 'Get immediate answers to complex financial questions in seconds'
    }
  ];

  return (
    <>
      <Helmet>
        <title>GTrends Global - AI-Driven Wealth Automation Platform</title>
        <meta name="description" content="GTrends Global is a leading AI-driven wealth automation platform designed for global investors across the USA, UK, and Europe. Build and grow wealth systematically." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Header />

        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1647279271777-959fe19eae14"
              alt="Financial growth and success"
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-foreground" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                Financial intelligence for{' '}
                <span className="text-primary">
                  global investors
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Powerful calculators and tools to optimize your wealth, credit, and entrepreneurial ventures worldwide
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-primary/20"
                >
                  <Link to="/wealth">
                    Explore Tools
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground" style={{ textWrap: 'balance' }}>
                Tools for every financial journey
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From wealth building to credit optimization, we have the calculators you need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section, index) => (
                <motion.div
                  key={section.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={section.path} className="block group h-full">
                    <div className="bg-background rounded-2xl border border-border p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 h-full flex flex-col">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-md`}>
                          <section.icon className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
                            {section.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                        {section.description}
                      </p>
                      <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all duration-200 mt-auto">
                        Explore tools
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-24 bg-card border-t border-border relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/5 blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              
              {/* Left Column: Opening */}
              <div className="lg:col-span-5">
                <div className="sticky top-24">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground leading-tight" style={{ textWrap: 'balance', letterSpacing: '-0.02em' }}>
                    Pioneering the future of <span className="text-primary">wealth automation</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    GTrends Global is a leading <strong className="text-foreground font-medium">AI-driven</strong> wealth automation platform designed for <strong className="text-foreground font-medium">global investors</strong> across the USA, UK, and Europe. We combine cutting-edge artificial intelligence with proven financial strategies to help you build and grow wealth systematically, without the complexity.
                  </p>
                </div>
              </div>

              {/* Right Column: Credentials & Mission */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Founder Credentials */}
                <div className="bg-background rounded-2xl p-8 md:p-10 border border-border shadow-lg hover:border-primary/30 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">Founder Credentials & Expertise</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Founded by a financial expert with an <strong className="text-foreground font-medium">MBA in Finance and 9 years of dedicated research experience</strong> in wealth building and financial automation, GTrends Global brings institutional-grade insights to individual investors. Our founder's deep expertise in financial markets and wealth optimization forms the foundation of every tool and strategy we offer.
                  </p>
                </div>

                {/* Mission & Value Proposition */}
                <div className="bg-background rounded-2xl p-8 md:p-10 border border-border shadow-lg hover:border-primary/30 transition-colors duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground">Mission & Value Proposition</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    We believe wealth building should be accessible, automated, and intelligent. Our mission is to empower global audiences with <strong className="text-foreground font-medium">AI-driven financial tools</strong> that remove guesswork, save time, and deliver measurable results. Whether you're just starting your wealth journey or optimizing an existing portfolio, GTrends Global provides the technology and expertise to help you succeed.
                  </p>
                </div>

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