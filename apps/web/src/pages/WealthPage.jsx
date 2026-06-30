import React from 'react';
import { Helmet } from 'react-helmet';
import { Wallet, TrendingUp } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FireCalculator from '@/components/FireCalculator.jsx';
import StepUpSipCalculator from '@/components/StepUpSipCalculator.jsx';
import InflationCalculator from '@/components/InflationCalculator.jsx';
import EquityVsFdCalculator from '@/components/EquityVsFdCalculator.jsx';

const WealthPage = () => {
  return (
    <>
      <Helmet>
        <title>Wealth Building & Financial Tools | GTrends Global</title>
        <meta name="description" content="Plan your financial path to $1 Million. Use our compound interest and investment calculators designed for the global market." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1">
          <section className="py-20 bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Wallet className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                      Wealth Building
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2 font-medium">
                      Map your journey to your first $1 Million
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 mb-12 shadow-sm">
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">The Power of Compounding</h2>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                      In the global market, disciplined investing can dramatically accelerate your wealth journey. Use our calculators to find exactly how much you need to save monthly, or what returns you must target to hit your milestones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FireCalculator />
                <StepUpSipCalculator />
                <InflationCalculator />
                <EquityVsFdCalculator />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WealthPage;