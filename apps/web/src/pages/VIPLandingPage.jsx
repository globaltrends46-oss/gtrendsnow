import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { triggerGumroad } from '@/utils/gumroadHelper.js';

const VIPLandingPage = () => {
  const navigate = useNavigate();

  const benefits = [
    'Unlimited access to all financial calculators',
    'Complete Vault of research and guides',
    'Exclusive Deals and partnerships',
    'Priority support',
    'Ad-free experience'
  ];

  return (
    <>
      <Helmet>
        <title>VIP Access | GTrends Global</title>
        <meta name="description" content="Unlock exclusive VIP benefits and unlimited tools on GTrends Global." />
      </Helmet>

      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>

          <div className="bg-[#121212] border border-[#222] rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#FFD700]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-8">
                <Shield className="w-10 h-10 text-[#FFD700]" />
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight" style={{ textWrap: 'balance' }}>
                Unlock Exclusive VIP Benefits
              </h1>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">
                Access the complete Vault, exclusive Deals, unlimited tools, and premium research.
              </p>

              <div className="space-y-5 mb-12">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center text-gray-200">
                    <CheckCircle className="w-6 h-6 text-[#FFD700] mr-4 flex-shrink-0" />
                    <span className="text-lg font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={triggerGumroad}
                className="w-full py-5 rounded-xl font-bold text-black text-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#FFD700', boxShadow: '0 4px 24px rgba(255, 215, 0, 0.25)' }}
              >
                Pay to Enter - $49/month
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VIPLandingPage;