import React from 'react';
import { Helmet } from 'react-helmet';
import { Shield } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - GTrends Global</title>
        <meta name="description" content="Privacy Policy and data collection practices for GTrends Global, including GDPR and CCPA compliance information." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                <p className="text-muted-foreground mt-2">Effective Date: May 6, 2026</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
              <p>
                At GTrends Global, we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our financial research tools, in compliance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws.
              </p>

              <h2>1. Information We Collect</h2>
              <p>We collect information that identifies, relates to, describes, or could reasonably be linked with you ("Personal Data"). The types of data we collect include:</p>
              <ul>
                <li><strong>Identifiers:</strong> Name, email address, phone number, and IP address when you register for an account, subscribe to our newsletter, or contact us.</li>
                <li><strong>Financial & Research Data:</strong> Information you input into our calculators and research tools (e.g., investment goals, business margins). This data is processed to provide you with accurate results.</li>
                <li><strong>Technical & Usage Data:</strong> Browser type, operating system, device information, pages visited, and interaction metrics collected automatically via cookies and tracking technologies.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We process your Personal Data based on legitimate business interests, the performance of a contract, or your explicit consent, for the following purposes:</p>
              <ul>
                <li>To provide, operate, and maintain our financial research platform and tools.</li>
                <li>To personalize your experience and deliver tailored financial insights and content.</li>
                <li>To communicate with you, including sending service updates, newsletters, and security alerts.</li>
                <li>To analyze platform usage, improve our algorithms, and enhance user experience.</li>
                <li>To comply with legal obligations and enforce our Terms of Service.</li>
              </ul>

              <h2>3. Your Privacy Rights (GDPR & CCPA)</h2>
              <p>Depending on your jurisdiction (such as the EU/EEA or California), you have specific rights regarding your Personal Data:</p>
              <ul>
                <li><strong>Right to Access:</strong> You can request a copy of the Personal Data we hold about you.</li>
                <li><strong>Right to Deletion (Right to be Forgotten):</strong> You can request that we delete your Personal Data, subject to certain legal exceptions.</li>
                <li><strong>Right to Rectification:</strong> You can request corrections to inaccurate or incomplete data.</li>
                <li><strong>Right to Data Portability:</strong> You can request your data in a structured, commonly used, and machine-readable format.</li>
                <li><strong>Right to Opt-Out:</strong> California residents have the right to opt-out of the "sale" or "sharing" of their personal information. GTrends Global does not sell your personal data to third parties.</li>
              </ul>
              <p>To exercise any of these rights, please contact us using the information provided in Section 7.</p>

              <h2>4. Data Retention</h2>
              <p>
                We retain your Personal Data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law (such as for tax, accounting, or legal compliance). When we have no ongoing legitimate business need to process your Personal Data, we will either delete or anonymize it.
              </p>

              <h2>5. Third-Party Sharing and Processors</h2>
              <p>We may share your information with trusted third parties who assist us in operating our platform, conducting our business, or serving our users. These include:</p>
              <ul>
                <li><strong>Service Providers:</strong> Cloud hosting providers, database managers, and email delivery services (e.g., builder-mailer) who process data on our behalf under strict confidentiality agreements.</li>
                <li><strong>Analytics Partners:</strong> Providers like Google Analytics to help us understand how users interact with our platform.</li>
                <li><strong>Legal Compliance:</strong> Law enforcement agencies or regulatory bodies if required by law or to protect our legal rights.</li>
              </ul>

              <h2>6. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. For detailed information about the cookies we use, please review our <a href="/cookie-policy">Cookie Policy</a>.
              </p>

              <h2>7. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at:
              </p>
              <p>
                <strong>Email:</strong> privacy@gtrendsglobal.com<br />
                <strong>Address:</strong> GTrends Global Privacy Team, [Insert Business Address]
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicyPage;