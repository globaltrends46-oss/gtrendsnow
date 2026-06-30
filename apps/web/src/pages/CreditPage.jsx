import React from 'react';
import { Helmet } from 'react-helmet';
import { CreditCard, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SmartLoanEmiCalculator from '@/components/SmartLoanEmiCalculator.jsx';
import LoanPrepaymentCalculator from '@/components/LoanPrepaymentCalculator.jsx';
import BalanceTransferCalculator from '@/components/BalanceTransferCalculator.jsx';
import CreditCardMinimumPaymentCalculator from '@/components/CreditCardMinimumPaymentCalculator.jsx';
import DebtToIncomeCalculator from '@/components/DebtToIncomeCalculator.jsx';

const CreditPage = () => {
  return (
    <>
      <Helmet>
        <title>Credit & Loan Optimization Tools | GTrends Global</title>
        <meta name="description" content="Optimize your debt, calculate EMI, simulate prepayments, and analyze balance transfers with our free financial calculators." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1">
          <section className="py-20 bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <CreditCard className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                      Credit Optimization
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2 font-medium">
                      Master your debt and accelerate your financial freedom.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 mb-12 shadow-sm">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-7 h-7 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">Stop Leaving Money on the Table</h2>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                      Debt isn't inherently bad, but unoptimized debt can drain your wealth. Use our suite of free tools to calculate optimal repayment strategies, uncover hidden costs of minimum payments, and find out if a balance transfer makes mathematical sense for your specific situation. No sign-up required.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SmartLoanEmiCalculator />
                <LoanPrepaymentCalculator />
                <BalanceTransferCalculator />
                <CreditCardMinimumPaymentCalculator />
                <DebtToIncomeCalculator />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CreditPage;