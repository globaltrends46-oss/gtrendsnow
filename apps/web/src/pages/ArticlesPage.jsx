import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Tag, Calendar, User, Clock } from 'lucide-react';

const fallbackArticles = [
  {
    id: 'fb-1',
    title: 'Mastering Scale: How Strategic Automation Drives Global E-Commerce Efficiency',
    description: 'An analytical breakdown of supply chain frameworks and operational margins.',
    content: 'Full details of global e-commerce systems...',
    published_date: new Date().toISOString(),
    author: 'GTrends Team'
  },
  {
    id: 'fb-2',
    title: 'The Macro Shift: Transforming Enterprise Portfolios with Data Analytics',
    description: 'Tracking how financial asset metrics adjust to modern algorithmic scaling.',
    content: 'Full details of data analytics and portfolios...',
    published_date: new Date().toISOString(),
    author: 'GTrends Team'
  },
  {
    id: 'fb-3',
    title: 'Velocity Systems: Why Modern Capital Funnels Prioritize Predictive Utilities',
    description: 'Evaluating cross-border transaction dynamics and conversion workflows.',
    content: 'Full details of predictive conversion workflows...',
    published_date: new Date().toISOString(),
    author: 'GTrends Team'
  }
];

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // Query local trendjacking articles
        const records = await pb.collection('blog_posts').getList(1, 20, {
          filter: 'category = "trendjacking"',
          sort: '-published_date',
          $autoCancel: false
        });

        if (records.items.length > 0) {
          setArticles(records.items);
        } else {
          // If no local trendjacking articles exist yet, use fallback
          setArticles(fallbackArticles);
        }
      } catch (err) {
        console.error('Error fetching trendjacking articles, using fallback:', err);
        setArticles(fallbackArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <>
      <Helmet>
        <title>Trendjacking Intelligence | GTrends Global</title>
        <meta name="description" content="Latest trendjacking analysis and breaking news insights curated globally from hot keywords." />
      </Helmet>

      <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col">
        <Header />

        <main className="flex-1 py-16 md:py-24">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="mb-12 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                🔥 Live Trends
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Trendjacking Intelligence
              </h1>
              <p className="text-lg text-[#94a3b8] max-w-2xl">
                Daily breaking articles capturing the world's most queried global topics, analyzed locally in real-time.
              </p>
            </div>

            {/* State Management */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#2563eb] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#94a3b8] font-medium">Synchronizing live keyword indexes...</p>
              </div>
            ) : (
              /* Articles Grid */
              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[25px] mb-20">
                {articles.map((article) => {
                  const readTime = Math.max(1, Math.ceil((article.content?.split(' ').length || 0) / 200));
                  const formattedDate = new Date(article.published_date || article.created).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  });

                  return (
                    <article 
                      key={article.id || article.title} 
                      className="bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 group"
                    >
                      {article.featured_image && (
                        <div className="aspect-[16/9] overflow-hidden bg-muted/10">
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop'; }}
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground mb-4">
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span>{readTime} min read</span>
                        </div>

                        <Link to={article.id.startsWith('fb-') ? '#' : `/articles/${article.id}`} className="block flex-1 mb-4">
                          <h3 className="text-xl font-bold text-white leading-snug group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-[#94a3b8] text-sm leading-relaxed mt-2 line-clamp-3">
                            {article.description || (article.content ? article.content.substring(0, 150).replace(/[#*]/g, '') + '...' : 'Tracking keyword variables across macro operational layers.')}
                          </p>
                        </Link>

                        <div className="pt-4 border-t border-[#334155] flex items-center justify-between mt-auto">
                          <span className="text-xs font-semibold text-muted-foreground">
                            By {article.author || 'GTrends Staff'}
                          </span>
                          {!article.id.startsWith('fb-') && (
                            <Link 
                              to={`/articles/${article.id}`}
                              className="text-primary hover:text-primary-focus text-xs font-bold transition-colors"
                            >
                              Read Full Article →
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArticlesPage;