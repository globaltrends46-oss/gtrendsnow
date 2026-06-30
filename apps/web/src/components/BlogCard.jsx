import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, User, ArrowRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';

const BlogCard = ({ blog }) => {
  const readTime = Math.max(1, Math.ceil((blog.content?.split(' ').length || 0) / 200));
  
  const formattedDate = new Date(blog.publishedDate || blog.created).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const excerpt = blog.excerpt 
    ? (blog.excerpt.length > 150 ? blog.excerpt.substring(0, 150) + '...' : blog.excerpt)
    : (blog.content?.substring(0, 150) + '...' || 'No preview available.');

  const imageUrl = blog.featuredImage 
    ? pb.files.getUrl(blog, blog.featuredImage)
    : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop';

  return (
    <article className="group bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <Link to={`/blog/${blog.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-muted/10">
        <img 
          src={imageUrl} 
          alt={blog.title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {blog.tags?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="bg-background/90 backdrop-blur text-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </Link>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{readTime} min read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{blog.author || 'Unknown'}</span>
          </div>
        </div>
        
        <Link to={`/blog/${blog.slug}`} className="block mb-3">
          <h2 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {blog.title}
          </h2>
        </Link>
        
        <p className="text-muted-foreground leading-relaxed flex-1">
          {excerpt}
        </p>
        
        <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
          <Link 
            to={`/blog/${blog.slug}`}
            className="text-primary font-bold text-sm tracking-wide flex items-center gap-2 group/link"
          >
            Read More
            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
          </Link>
          
          <Link 
            to={`/blog/edit/${blog.id}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;