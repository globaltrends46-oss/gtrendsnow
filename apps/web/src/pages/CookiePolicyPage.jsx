import React from 'react';
import { Helmet } from 'react-helmet';
import { Cookie } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const CookiePolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - GTrends Global</title>
        <meta name="description" content="Cookie Policy explaining how GTrends Global uses cookies and tracking technologies." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
                <p className="text-muted-foreground mt-2">Effective Date: May 6, 2026</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
              <h2>1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They are widely used to make websites work more efficiently, enhance user experience, and provide analytical information to the website owners. At GTrends Global, we use cookies to understand how you interact with our financial research tools and to ensure our platform functions securely and effectively.
              </p>

              <h2>2. Types of Cookies We Use</h2>
              <p>We utilize the following categories of cookies on our platform:</p>
              <ul>
                <li>
                  <strong>Strictly Necessary Cookies:</strong> These are essential for the website to function properly. They enable core features such as security, network management, and account accessibility. You cannot opt out of these cookies, as the platform cannot function without them.
                </li>
                <li>
                  <strong>Performance & Analytics Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. For example, we use Google Analytics to understand which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous.
                </li>
                <li>
                  <strong>Functional Cookies:</strong> These enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages (e.g., saving your calculator preferences).
                </li>
                <li>
                  <strong>Targeting & Marketing Cookies:</strong> These cookies may be set through our site by our advertising and affiliate partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They do not store directly personal information but are based on uniquely identifying your browser and internet device.
                </li>
              </ul>

              <h2>3. Cookie Duration</h2>
              <p>The length of time a cookie stays on your device depends on its type:</p>
              <ul>
                <li><strong>Session Cookies:</strong> These are temporary cookies that expire and are automatically erased whenever you close your browser window.</li>
                <li><strong>Persistent Cookies:</strong> These remain on your device for a set period of time or until you manually delete them. They help us recognize you as an existing user, making it easier to return to GTrends Global without re-entering your preferences.</li>
              </ul>

              <h2>4. Third-Party Cookies</h2>
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and track affiliate referrals. Our primary third-party partners include:
              </p>
              <ul>
                <li><strong>Google Analytics:</strong> Used for tracking website performance and user behavior.</li>
                <li><strong>Affiliate Networks:</strong> Used to track referrals to partners such as Hostinger, Shopify, and InVideo to ensure proper commission attribution.</li>
              </ul>

              <h2>5. Your Cookie Choices and Consent</h2>
              <p>
                When you first visit GTrends Global, you are presented with a cookie consent banner allowing you to accept or decline non-essential cookies. You have the right to decide whether to accept or reject cookies at any time.
              </p>
              <p>
                You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted. To learn how to manage cookies on popular browsers, please visit the help pages of your specific browser (e.g., Chrome, Safari, Firefox, Edge).
              </p>

              <h2>6. Contact Us</h2>
              <p>
                If you have any questions about our use of cookies or other technologies, please email us at:
              </p>
              <p>
                <strong>Email:</strong> privacy@gtrendsglobal.com
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CookiePolicyPage;