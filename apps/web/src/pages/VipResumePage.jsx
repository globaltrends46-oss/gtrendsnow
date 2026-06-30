import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ResumeBuilder from '@/components/ResumeBuilder.jsx';
import { Crown } from 'lucide-react';

const VipResumePage = () => {
  return (
    <>
      <Helmet>
        <title>VIP Resume Generator | Premium Tools</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Premium Resume Generator</h1>
                <p className="text-muted-foreground text-sm">Powered by Gemini AI</p>
              </div>
            </div>
            
            <ResumeBuilder />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default VipResumePage;