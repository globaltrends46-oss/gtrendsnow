import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ResumeBuilder from '@/components/ResumeBuilder.jsx';
import { Sparkles } from 'lucide-react';

const ResumeBuilderPage = () => {
  return (
    <>
      <Helmet>
        <title>Free AI CV & Resume Builder | ATS Optimization</title>
        <meta name="description" content="Optimize your resume for ATS systems using advanced Gemini AI. Choose layouts, colors, and download your professional resume as a PDF for free." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI CV Builder & ATS Optimizer</h1>
                <p className="text-muted-foreground text-sm">Select layouts, color themes, and export print-ready PDFs</p>
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

export default ResumeBuilderPage;
