import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const TAG_SUGGESTIONS = ['Finance', 'Investing', 'Wealth', 'Credit', 'Business', 'Entrepreneurship'];

const BlogForm = ({ initialData, onSubmit, isSubmitting }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [author, setAuthor] = useState(initialData?.author || 'GTrends Global');
  const [status, setStatus] = useState(initialData?.status || 'draft');
  const [publishedDate, setPublishedDate] = useState(initialData?.publishedDate ? initialData.publishedDate.split('T')[0] : '');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.featuredImage ? initialData.featuredImage : null);

  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Auto-generate excerpt if empty
  useEffect(() => {
    if (!excerpt && content.length > 0) {
      const generated = content.replace(/[#*\[\]()]/g, '').substring(0, 150);
      setExcerpt(generated + (content.length > 150 ? '...' : ''));
    }
  }, [content, excerpt]);

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    let valid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    } else if (title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
      valid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
      valid = false;
    } else if (content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
      valid = false;
    }

    if (excerpt.length > 300) {
      newErrors.excerpt = 'Excerpt must be less than 300 characters';
      valid = false;
    }

    setErrors(newErrors);
    setIsValid(valid);
    
    // Hide banner if form becomes valid
    if (valid) {
      setShowBanner(false);
    }
  }, [title, content, excerpt]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      setFeaturedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTag = (tag) => {
    const cleanTag = tag.trim();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e, overrideStatus) => {
    e.preventDefault();
    
    if (!isValid) {
      setShowBanner(true);
      toast.error('Please fix the validation errors before saving');
      return;
    }

    const finalStatus = overrideStatus || status;
    const finalDate = (finalStatus === 'published' && !publishedDate) 
      ? new Date().toISOString() 
      : publishedDate ? new Date(publishedDate).toISOString() : '';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    formData.append('excerpt', excerpt);
    formData.append('content', content);
    formData.append('author', author);
    formData.append('status', finalStatus);
    if (finalDate) formData.append('publishedDate', finalDate);
    formData.append('tags', JSON.stringify(tags));
    
    if (featuredImage) {
      formData.append('featuredImage', featuredImage);
    }

    onSubmit(formData);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-8 bg-card p-6 md:p-8 rounded-2xl border border-border">
      
      {showBanner && !isValid && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-destructive">Please fix the following errors:</h3>
            <ul className="mt-1 text-sm text-destructive/80 list-disc list-inside pl-4">
              {Object.values(errors).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-foreground tracking-wide">Blog Title *</label>
              <span className={`text-xs ${title.length > 100 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Ultimate Guide to Financial Freedom"
              className={`w-full bg-input border ${errors.title && showBanner ? 'border-destructive ring-1 ring-destructive' : 'border-border'} text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all`}
            />
            {errors.title && showBanner && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.title}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-foreground tracking-wide">Excerpt (Optional)</label>
              <span className={`text-xs ${excerpt.length > 300 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                {excerpt.length}/300
              </span>
            </div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary of the blog post..."
              rows={3}
              className={`w-full bg-input border ${errors.excerpt && showBanner ? 'border-destructive ring-1 ring-destructive' : 'border-border'} text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-none transition-all`}
            />
            {errors.excerpt && showBanner && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.excerpt}</p>}
          </div>

          {/* Content */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-foreground tracking-wide">Content (Markdown Supported) *</label>
              <div className="text-xs text-muted-foreground flex gap-3">
                <span>{wordCount} words</span>
                <span>~{readTime} min read</span>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your amazing post here... Use **bold**, *italic*, # Headings, - Lists, [Links](url)"
              rows={15}
              className={`w-full bg-input border ${errors.content && showBanner ? 'border-destructive ring-1 ring-destructive' : 'border-border'} text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-y transition-all font-mono text-sm`}
            />
            {errors.content && showBanner && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.content}</p>}
          </div>
        </div>

        <div className="space-y-6">
          {/* Featured Image */}
          <div>
            <label className="block text-sm font-bold text-foreground tracking-wide mb-2">Featured Image</label>
            <div className="relative border-2 border-dashed border-border rounded-xl bg-input hover:border-primary/50 transition-colors overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-background/80 text-foreground rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all backdrop-blur"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">Click to upload image</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WEBP (Max 20MB)</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-bold text-foreground tracking-wide mb-2">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-input border border-border text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Status & Date */}
          <div className="p-4 bg-background border border-border rounded-xl space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground tracking-wide mb-3">Publication Status</label>
              <div className="flex flex-col gap-2">
                {['draft', 'published', 'scheduled'].map(s => (
                  <label key={s} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${status === s ? 'border-primary' : 'border-muted-foreground group-hover:border-foreground'}`}>
                      {status === s && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm font-medium capitalize text-foreground">{s}</span>
                    <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="hidden" />
                  </label>
                ))}
              </div>
            </div>

            {(status === 'published' || status === 'scheduled') && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  {status === 'scheduled' ? 'Schedule Date' : 'Publish Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  className="w-full bg-input border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-foreground tracking-wide mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 bg-input border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <Button type="button" onClick={() => addTag(tagInput)} variant="secondary" size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TAG_SUGGESTIONS.filter(t => !tags.includes(t)).map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="text-xs font-medium bg-background border border-border px-2 py-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  +{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
        <Button type="button" variant="ghost" onClick={() => navigate('/blog')} className="text-muted-foreground hover:text-foreground">
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={isSubmitting || !isValid}
            className="border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !isValid}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {status === 'published' ? 'Publish Now' : status === 'scheduled' ? 'Schedule' : 'Save Draft'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;