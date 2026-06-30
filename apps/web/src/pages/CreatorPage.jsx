import React from 'react';
import { Helmet } from 'react-helmet';
import { Video, Users } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

import ViralHookGenerator from '@/components/ViralHookGenerator.jsx';
import YouTubeTitleGrader from '@/components/YouTubeTitleGrader.jsx';
import VideoScriptTimer from '@/components/VideoScriptTimer.jsx';
import CreatorROASCalculator from '@/components/CreatorROASCalculator.jsx';
import SocialMediaCharacterCounter from '@/components/SocialMediaCharacterCounter.jsx';

const CreatorPage = () => {
  return (
    <>
      <Helmet>
        <title>Creator Economy & Viral Tools | GTrends Global</title>
        <meta name="description" content="Generate viral hooks and optimize your content strategy for TikTok, YouTube Shorts, and LinkedIn with our free creator tools." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1">
          <section className="py-20 bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Video className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                    Creator Economy
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2 font-medium">
                    Content tools to capture attention and scale
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 mb-12 shadow-sm">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-foreground">Win the Algorithm</h2>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                      In today's fast-paced feed, the first 3 seconds define your success. Use our suite of free tools to craft compelling titles, estimate video lengths, optimize social posts, and calculate your ad spend returns. No sign-up required.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <div className="h-full min-h-[450px]">
                  <ViralHookGenerator />
                </div>
                <div className="h-full min-h-[450px]">
                  <YouTubeTitleGrader />
                </div>
                <div className="h-full min-h-[450px]">
                  <CreatorROASCalculator />
                </div>
                <div className="h-full min-h-[450px]">
                  <VideoScriptTimer />
                </div>
                <div className="h-full min-h-[450px] lg:col-span-2 max-w-3xl mx-auto w-full">
                  <SocialMediaCharacterCounter />
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

export default CreatorPage;