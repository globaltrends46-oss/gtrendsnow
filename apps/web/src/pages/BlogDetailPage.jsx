import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BlogCard from '@/components/BlogCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';

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
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const record = await pb.collection('blogs').getFirstListItem(`slug="${slug}"`, { $autoCancel: false });
        
        // Increment views
        await pb.collection('blogs').update(record.id, { views: (record.views || 0) + 1 }, { $autoCancel: false });
        
        setBlog(record);

        // Fetch related blogs based on first tag
        if (record.tags && record.tags.length > 0) {
          const firstTag = record.tags[0];
          const relatedRecords = await pb.collection('blogs').getList(1, 3, {
            filter: `tags ~ "${firstTag}" && id != "${record.id}"`,
            sort: '-created',
            $autoCancel: false
          });
          setRelated(relatedRecords.items);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
    window.scrollTo(0, 0);
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
  const formattedDate = new Date(blog.publishedDate || blog.created).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
  
  const imageUrl = blog.featuredImage 
    ? pb.files.getUrl(blog, blog.featuredImage)
    : null;

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
                  {blog.tags?.map((tag, idx) => (
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