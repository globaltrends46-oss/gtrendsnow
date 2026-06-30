import React from 'react';
import { Link } from 'react-router-dom';

// Simple relative time formatter
const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const NewsCard = ({ article }) => {
  const { title, description, urlToImage, source, publishedAt, link } = article;
  
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop';
  const displayImage = urlToImage || FALLBACK_IMAGE;

  const CardImage = () => (
    <div className="relative aspect-[16/9] overflow-hidden bg-muted/10">
      <img 
        src={displayImage} 
        alt={title || 'News article image'}
        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        loading="lazy"
      />
      {source?.name && (
        <div className="absolute top-4 left-4">
          <span className="bg-background/90 backdrop-blur text-muted-foreground text-xs font-bold px-3 py-1 rounded-md tracking-wider shadow-sm">
            {source.name}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <article className="group bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
      {link ? (
        <Link to={link}>
          <CardImage />
        </Link>
      ) : (
        <CardImage />
      )}
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-foreground leading-snug mb-3 line-clamp-3 transition-colors group-hover:text-primary">
          {link ? (
            <Link to={link}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3 mb-4">
          {description}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground">
            {getRelativeTime(publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;