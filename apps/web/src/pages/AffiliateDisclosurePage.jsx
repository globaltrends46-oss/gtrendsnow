import React from 'react';
import { Helmet } from 'react-helmet';
import { HeartHandshake } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AffiliateDisclosurePage = () => {
  return (
    <>
      <Helmet>
        <title>Affiliate Disclosure - GTrends Global</title>
        <meta name="description" content="Transparent disclosure of affiliate partnerships and compensation for GTrends Global." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">Affiliate Disclosure</h1>
                <p className="text-muted-foreground mt-2">Transparency in how we fund our research platform</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
              <div className="bg-muted/30 border border-border rounded-xl p-6 mb-8">
                <p className="m-0 text-foreground font-medium">
                  <strong>FTC Compliance Statement:</strong> We are a participant in affiliate programs and may earn commissions from qualifying purchases made through links on our website, at no extra cost to you.
                </p>
              </div>

              <h2>1. What Are Affiliate Links?</h2>
              <p>
                GTrends Global is a free-to-use financial research platform. To maintain our servers, develop new AI-driven calculators, and fund our ongoing research, we utilize affiliate marketing. An affiliate link is a specific URL that contains a tracking code. When you click on an affiliate link on our site and make a purchase or sign up for a service, we may receive a referral commission from the partner company.
              </p>
              <p>
                <strong>Crucially, this comes at absolutely no additional cost to you.</strong> In many cases, our affiliate links provide you with exclusive discounts or extended trials that you would not receive by going directly to the provider.
              </p>

              <h2>2. Our Key Partners</h2>
              <p>
                We only partner with companies and tools that we have thoroughly researched and believe provide genuine value to global investors, creators, and entrepreneurs. Some of our specific partnerships include:
              </p>
              <ul>
                <li>
                  <strong>Shopify:</strong> We recommend Shopify as a premier e-commerce platform for entrepreneurs looking to build scalable online businesses. We may earn a commission if you start a store through our referral links.
                </li>
                <li>
                  <strong>Hostinger:</strong> We partner with Hostinger to recommend reliable, high-performance web hosting solutions for digital creators and business owners.
                </li>
                <li>
                  <strong>InVideo:</strong> We recommend InVideo's AI-driven video creation tools for the creator economy, helping users scale their content production. We may earn a commission on premium subscriptions.
                </li>
              </ul>

              <h2>3. How We Earn and Our Transparency Commitment</h2>
              <p>
                Our commission structure varies by partner—some pay a flat bounty per signup, while others pay a percentage of the sale. Regardless of the compensation structure, our commitment is to our users first. 
              </p>
              <p>
                We maintain strict editorial independence. Our financial calculators, research insights, and tool recommendations are driven by data and objective analysis, not by affiliate payouts. We will never recommend a subpar product simply to earn a commission. If a tool does not meet our institutional-grade standards, it will not be featured on GTrends Global.
              </p>

              <h2>4. Platform Disclaimer</h2>
              <p>
                Please remember that GTrends Global is a financial research platform. While we recommend various tools and services to assist in your wealth-building journey, we are not financial advisors. You should always conduct your own due diligence before purchasing any software, starting a business, or making financial investments.
              </p>

              <h2>5. Contact Us</h2>
              <p>
                If you have any questions regarding our affiliate partnerships or how we fund our platform, please feel free to reach out to us at:
              </p>
              <p>
                <strong>Email:</strong> contact@gtrendsglobal.com
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AffiliateDisclosurePage;