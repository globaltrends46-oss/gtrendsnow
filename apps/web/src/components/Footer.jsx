import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ShieldAlert } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/resume-builder', label: 'CV Builder' },
    { path: '/wealth', label: 'Wealth Tools' },
    { path: '/credit', label: 'Credit Optimizer' },
    { path: '/creator', label: 'Creator Tools' },
    { path: '/ecom', label: 'E-commerce' },
    { path: '/blog', label: 'Blog & Insights' },
    { path: '/vault', label: 'The Vault' }
  ];

  const legalLinks = [
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms-of-service', label: 'Terms of Service' },
    { path: '/cookie-policy', label: 'Cookie Policy' },
    { path: '/affiliate-disclosure', label: 'Affiliate Disclosure' }
  ];

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="bg-card/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Not Financial Advice</p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                GTrends Global is a financial research platform. Our content, calculators, and tools are for educational purposes only and do not constitute professional financial, legal, or tax advice. Please consult with a qualified, licensed financial advisor before making any investment or business decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-md shadow-primary/20">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-extrabold text-foreground tracking-tight">
                GTrends Global
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-md">
              Empowering the modern global economy with free tools for wealth, credit, and entrepreneurial success.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@gtrendsglobal.com">contact@gtrendsglobal.com</a>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold tracking-wider uppercase mb-4 text-foreground">Featured Links</p>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold tracking-wider uppercase mb-4 text-foreground">Legal & Compliance</p>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GTrends Global. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;