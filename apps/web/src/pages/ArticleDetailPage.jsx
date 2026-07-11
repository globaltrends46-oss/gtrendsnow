import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Tag } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { fallbackArticles, fallbackBlogPosts } from '@/lib/fallbackData.js';

// Markdown parser to support titles, lists, headers, bold, and line breaks
const parseMarkdown = (text) => {
  if (!text) return { __html: '' };
  
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-white">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-white border-b border-border/40 pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-10 mb-5 text-white">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/\[([^\[]+)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc mb-2 text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-5 leading-relaxed text-muted-foreground">')
    .replace(/\n/g, '<br />');
    
  return { __html: `<p class="mb-5 leading-relaxed text-muted-foreground">${html}</p>` };
};

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        if (id && id.startsWith('fb-')) {
          const fbArt = fallbackArticles.find(a => a.id === id);
          if (fbArt) {
            setArticle(fbArt);
            return;
          }
        }
        if (id && id.startsWith('bg-')) {
          const allBlogPosts = Object.values(fallbackBlogPosts).flat();
          const fbBlog = allBlogPosts.find(a => a.id === id);
          if (fbBlog) {
            setArticle(fbBlog);
            return;
          }
        }
        // Fetch article by ID from pocketbase blog_posts collection
        const record = await pb.collection('blog_posts').getOne(id, { $autoCancel: false });
        setArticle(record);
      } catch (error) {
        console.error('Error fetching local article details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-20">
          <Skeleton className="w-24 h-6 mb-8 bg-muted/20 rounded-full" />
          <Skeleton className="w-3/4 h-12 mb-6 bg-muted/20" />
          <Skeleton className="w-full h-80 mb-8 bg-muted/20 rounded-2xl" />
          <Skeleton className="w-full h-4 mb-2 bg-muted/20" />
          <Skeleton className="w-full h-4 mb-2 bg-muted/20" />
          <Skeleton className="w-2/3 h-4 bg-muted/20" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">The article you are trying to view does not exist or has been removed.</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil((article.content?.split(' ').length || 0) / 200));
  const formattedDate = new Date(article.published_date || article.created).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const displayCategory = article.category === 'trendjacking' ? 'Trending Insight' : article.category;

  return (
    <>
      <Helmet>
        <title>{article.title} | GTrends Global</title>
        <meta name="description" content={article.content ? article.content.substring(0, 160).replace(/[#*]/g, '') : ''} />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Feed
            </button>

            {/* Category Tag */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                {displayCategory}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              {article.title}
            </h1>

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-8 border-b border-border/40 mb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>{article.author || 'GTrends Analyst'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{readTime} min read</span>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-xl border border-border/30">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop'; }}
                />
              </div>
            )}

            {/* Article Content */}
            <div 
              className="article-content text-gray-300 text-lg leading-relaxed space-y-6"
              dangerouslySetInnerHTML={parseMarkdown(article.content)}
            />

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArticleDetailPage;
