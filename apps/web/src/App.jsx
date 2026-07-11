import React, { useEffect } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import FloatingVaultBadge from './components/FloatingVaultBadge.jsx';
import HomePage from './pages/HomePage.jsx';
import WealthPage from './pages/WealthPage.jsx';
import CreditPage from './pages/CreditPage.jsx';
import CreatorPage from './pages/CreatorPage.jsx';
import EcomPage from './pages/EcomPage.jsx';
import VaultPage from './pages/VaultPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import ArticleDetailPage from './pages/ArticleDetailPage.jsx';
import ResumeBuilderPage from './pages/ResumeBuilderPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';
import CookiePolicyPage from './pages/CookiePolicyPage.jsx';
import AffiliateDisclosurePage from './pages/AffiliateDisclosurePage.jsx';
import DisclaimerPage from './pages/DisclaimerPage.jsx';

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-background', 'text-foreground');
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wealth" element={<WealthPage />} />
        <Route path="/credit" element={<CreditPage />} />
        <Route path="/creator" element={<CreatorPage />} />
        <Route path="/ecom" element={<EcomPage />} />
        
        {/* Resource Vault */}
        <Route path="/vault" element={<VaultPage />} />
        
        {/* Global News Feed & Articles */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<ArticleDetailPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/resume-builder" element={<ResumeBuilderPage />} />
        
        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        <Route path="/affiliate-disclosure" element={<AffiliateDisclosurePage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        
        <Route path="*" element={
          <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 tracking-tight">Page not found</h1>
              <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist</p>
              <a href="/" className="text-primary hover:underline font-medium">Back to home</a>
            </div>
          </div>
        } />
      </Routes>
      <Toaster position="top-right" theme="dark" />
      <FloatingVaultBadge />
    </Router>
  );
}

export default App;