import React from 'react';
import { Helmet } from 'react-helmet';
import { ShoppingBag, BarChart3 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

import ProductProfitCalculator from '@/components/ProductProfitCalculator.jsx';
import BreakEvenCalculator from '@/components/BreakEvenCalculator.jsx';
import AdSpendROASCalculator from '@/components/AdSpendROASCalculator.jsx';
import SaleDiscountOptimizer from '@/components/SaleDiscountOptimizer.jsx';
import InventoryDaysOfSupplyCalculator from '@/components/InventoryDaysOfSupplyCalculator.jsx';

const EcomPage = () => {
  return (
    <>
      <Helmet>
        <title>Dropshipping Margin & E-commerce Tools | GTrends Global</title>
        <meta name="description" content="Calculate true dropshipping margins, analyze ad spend ROAS, plan inventory restocks, and optimize pricing discounts for your Shopify store." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1">
          <section className="py-20 bg-gradient-to-br from-background via-card/50 to-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <ShoppingBag className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    Dropshipping & E-com
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2 font-medium">
                    Architect your profit margins before you spend a dime
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 shadow-md">
                <div className="flex items-start gap-4">
                  <BarChart3 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">Protect Your Bottom Line</h2>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                      Many E-commerce founders fail by miscalculating ad costs against product margins. Our calculators help you find your exact break-even units, price products for optimal discounts, manage supply chains, and secure your profitability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <div className="h-full">
                  <ProductProfitCalculator />
                </div>
                <div className="h-full">
                  <BreakEvenCalculator />
                </div>
                <div className="h-full">
                  <AdSpendROASCalculator />
                </div>
                <div className="h-full">
                  <InventoryDaysOfSupplyCalculator />
                </div>
                <div className="lg:col-span-2 max-w-4xl mx-auto w-full">
                  <SaleDiscountOptimizer />
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EcomPage;