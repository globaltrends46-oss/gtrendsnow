import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BlogForm from '@/components/BlogForm.jsx';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const BlogEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const record = await pb.collection('blogs').getOne(id, { $autoCancel: false });
        if (record.featuredImage) {
          record.featuredImage = pb.files.getUrl(record, record.featuredImage);
        }
        setBlog(record);
      } catch (error) {
        toast.error('Failed to load blog');
        navigate('/blog');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlog();
  }, [id, navigate]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      await pb.collection('blogs').update(id, formData, { $autoCancel: false });
      
      const status = formData.get('status');
      const slug = formData.get('slug');
      
      if (status === 'draft') {
        toast.success('Draft updated successfully!');
      } else {
        toast.success('Blog updated successfully!');
      }
      
      navigate(`/blog/${slug}`);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      try {
        await pb.collection('blogs').delete(id, { $autoCancel: false });
        toast.success('Blog deleted successfully');
        navigate('/blog');
      } catch (error) {
        toast.error('Failed to delete blog');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Edit Blog | GTrends Global</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Edit Article</h1>
                <p className="text-muted-foreground mt-2">Update existing content</p>
              </div>
              {!isLoading && (
                <Button variant="outline" onClick={handleDelete} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="bg-card p-8 rounded-2xl border border-border space-y-8">
                <Skeleton className="w-full h-12 bg-muted/20" />
                <Skeleton className="w-full h-64 bg-muted/20" />
              </div>
            ) : (
              <BlogForm 
                initialData={blog} 
                onSubmit={handleUpdate} 
                isSubmitting={isSubmitting} 
              />
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogEditPage;