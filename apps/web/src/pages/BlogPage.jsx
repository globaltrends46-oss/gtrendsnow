import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { RefreshCw, Globe, Zap, Cpu, Trophy } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import NewsCard from '@/components/NewsCard.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { fallbackBlogPosts } from '@/lib/fallbackData.js';

const TABS = [
  { id: 'geopolitics', label: 'Geopolitics', icon: Globe },
  { id: 'energy', label: 'Energy & Markets', icon: Zap },
  { id: 'tech', label: 'Tech & AI', icon: Cpu },
  { id: 'sports', label: 'Sports & Culture', icon: Trophy }
];

const BlogPage = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArticlesByCategory = async (category) => {
    setLoading(true);
    setArticles([]);
    
    try {
      const records = await pb.collection('blog_posts').getList(1, 20, {
        filter: `category = "${category}"`,
        sort: '-published_date',
        $autoCancel: false
      });

      if (records.items.length > 0) {
        const mapped = records.items.map(record => ({
          id: record.id,
          title: record.title,
          description: record.content ? record.content.substring(0, 180).replace(/[#*]/g, '') + '...' : '',
          urlToImage: record.featured_image,
          source: { name: record.author || 'GTrends AI' },
          publishedAt: record.published_date || record.created,
          link: `/blog/${record.id}`
        }));
        setArticles(mapped);
      } else {
        setArticles(fallbackBlogPosts[category] || []);
      }
    } catch (err) {
      console.error("Error fetching local articles, using fallback:", err);
      setArticles(fallbackBlogPosts[category] || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticlesByCategory(activeTab);
  }, [activeTab]);

  const handleRefresh = () => {
    fetchArticlesByCategory(activeTab);
  };

  return (
    <>
      <Helmet>
        <title>Global News & Market Intelligence | GTrends Network</title>
        <meta name="description" content="Stay informed with curated global news across geopolitics, energy, technology, and culture." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Hero Section */}
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                LIVE FEED
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance mb-6">
                Global News & Market Intelligence
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                Real-time insights from GTrends Network. Stay informed with curated global news across geopolitics, energy, technology, and culture.
              </p>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 pb-6 border-b border-border">
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105' 
                          : 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4">
                {!loading && articles.length > 0 && (
                  <span className="text-sm text-muted-foreground italic hidden sm:inline-block">
                    Showing latest updates
                  </span>
                )}
                <Button 
                  onClick={handleRefresh} 
                  disabled={loading}
                  variant="outline"
                  className="flex-shrink-0 border-border text-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Feed
                </Button>
              </div>
            </div>

            {/* Content Section */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden h-[420px] flex flex-col">
                    <Skeleton className="w-full aspect-[16/9] bg-muted/20" />
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <Skeleton className="w-3/4 h-6 bg-muted/20" />
                      <Skeleton className="w-full h-4 bg-muted/20" />
                      <Skeleton className="w-full h-4 bg-muted/20" />
                      <div className="mt-auto pt-4 flex justify-between">
                        <Skeleton className="w-20 h-4 bg-muted/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article, idx) => (
                  <NewsCard key={`${article.title || 'fallback'}-${idx}`} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card rounded-2xl border border-border">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-foreground mb-2">No news items to display</h3>
                <p className="text-muted-foreground">Check back later for updates on {TABS.find(t => t.id === activeTab)?.label}.</p>
              </div>
            )}

            {/* CTA Banner */}
            <div className="cta-banner">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-balance">
                Analyze Macro Trends with Our Web Tools
              </h2>
              <a href="https://gtrendsnow.com" className="cta-button">
                Analyze Macro Trends with Our Web Tools →
              </a>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;