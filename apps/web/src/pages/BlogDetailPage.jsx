import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BlogCard from '@/components/BlogCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { fallbackBlogPosts, fallbackArticles } from '@/lib/fallbackData.js';

// Very basic Markdown parser for required elements
const parseMarkdown = (text) => {
  if (!text) return { __html: '' };
  
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-5 text-foreground">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-extrabold mt-12 mb-6 text-foreground">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\[([^\[]+)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc mb-2">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-5 leading-relaxed text-muted-foreground">')
    .replace(/\n/g, '<br />');
    
  return { __html: `<p class="mb-5 leading-relaxed text-muted-foreground">${html}</p>` };
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBlog = async () => {
      try {
        setLoading(true);

        // 1. Instant match in fallbackBlogPosts and fallbackArticles
        const allFallback = [
          ...(Array.isArray(fallbackBlogPosts) ? fallbackBlogPosts : Object.values(fallbackBlogPosts).flat()),
          ...fallbackArticles
        ];
        const fbFound = allFallback.find(item => 
          item.id === slug || 
          item.link === `/blog/${slug}` ||
          item.link === `/articles/${slug}` ||
          (item.id && slug && item.id.includes(slug))
        );

        if (fbFound) {
          if (isMounted) {
            setBlog(fbFound);
            setLoading(false);
          }
          return;
        }

        // 2. Check local storage blog caches
        try {
          for (const cat of ['geopolitics', 'energy', 'tech', 'sports']) {
            const cached = localStorage.getItem(`gtrends_blog_cache_v20261008_topicimg_${cat}`) || localStorage.getItem(`gtrends_blog_cache_v20261008_live_${cat}`) || localStorage.getItem(`gtrends_blog_cache_v20261008_${cat}`) || localStorage.getItem(`gtrends_blog_cache_v20260929_${cat}`) || localStorage.getItem(`gtrends_blog_cache_${cat}`);
            if (cached) {
              const list = JSON.parse(cached);
              const foundInCache = list.find(item => item.id === slug || item.link?.endsWith(slug));
              if (foundInCache) {
                if (isMounted) {
                  setBlog(foundInCache);
                  setLoading(false);
                }
                return;
              }
            }
          }
        } catch (_) {}

        // 3. Try Express API routes
        try {
          let apiRes = await fetch(`/hcgi/api/posts/${slug}`, { signal: AbortSignal.timeout(2000) }).catch(() => null);
          if (!apiRes || !apiRes.ok) {
            apiRes = await fetch(`/api/posts/${slug}`, { signal: AbortSignal.timeout(2000) }).catch(() => null);
          }
          if (apiRes && apiRes.ok) {
            const data = await apiRes.json();
            if (data && (data.item || data.id)) {
              const item = data.item || data;
              if (isMounted) {
                setBlog(item);
                setLoading(false);
              }
              return;
            }
          }
        } catch (_) {}

        // 4. Try PocketBase
        try {
          let record = await pb.collection('blog_posts').getOne(slug, { $autoCancel: false }).catch(() => null);
          if (!record) {
            record = await pb.collection('blogs').getFirstListItem(`slug="${slug}"`, { $autoCancel: false }).catch(() => null);
          }
          if (record && isMounted) {
            setBlog(record);
          }
        } catch (_) {}
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo(0, 0);
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-20">
          <Skeleton className="w-24 h-4 mb-8 bg-muted/20" />
          <Skeleton className="w-3/4 h-12 mb-6 bg-muted/20" />
          <Skeleton className="w-full h-64 mb-8 bg-muted/20 rounded-2xl" />
          <Skeleton className="w-full h-4 mb-2 bg-muted/20" />
          <Skeleton className="w-full h-4 mb-2 bg-muted/20" />
          <Skeleton className="w-2/3 h-4 bg-muted/20" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Blog not found</h1>
          <Link to="/blog" className="text-primary hover:underline">Back to articles</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const readTime = Math.max(1, Math.ceil((blog.content?.split(' ').length || 0) / 200));
  const formattedDate = new Date(blog.published_date || blog.publishedAt || blog.publishedDate || blog.created || Date.now()).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
  
  const imageUrl = blog.featured_image || blog.urlToImage || (blog.featuredImage ? (typeof blog.featuredImage === 'string' && blog.featuredImage.startsWith('http') ? blog.featuredImage : pb.files.getUrl(blog, blog.featuredImage)) : null);
  const blogTags = (blog.tags && blog.tags.length > 0) ? blog.tags : [blog.category || 'Trending'];

  return (
    <>
      <Helmet>
        <title>{`${blog.title} | GTrends Global`}</title>
        <meta name="description" content={blog.excerpt || `Read ${blog.title} on GTrends Global.`} />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 pb-24">
          <article>
            <div className="bg-card border-b border-border pt-20 pb-16">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/blog" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-8 group">
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Back to Articles
                </Link>

                <div className="flex flex-wrap gap-2 mb-6">
                  {blogTags.map((tag, idx) => (
                    <span key={idx} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground text-balance leading-tight mb-8">
                  {blog.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-foreground">{blog.author || 'GTrends Global'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
              {imageUrl && (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card mb-12 aspect-[21/9]">
                  <img src={imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div 
                className="prose prose-invert prose-lg max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={parseMarkdown(blog.content)}
              />
            </div>
          </article>

          {related.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-border">
              <h2 className="text-3xl font-bold text-foreground mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map(relBlog => (
                  <BlogCard key={relBlog.id} blog={relBlog} />
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogDetailPage;