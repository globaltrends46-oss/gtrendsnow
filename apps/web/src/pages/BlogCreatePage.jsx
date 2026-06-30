import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import BlogForm from '@/components/BlogForm.jsx';
import { toast } from 'sonner';

const BlogCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    // Load draft from local storage
    const savedDraft = localStorage.getItem('blog_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setInitialData(parsed);
        toast('Loaded unsaved draft');
      } catch (e) {
        console.error('Failed to parse draft');
      }
    }
  }, []);

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      await pb.collection('blogs').create(formData, { $autoCancel: false });
      
      const status = formData.get('status');
      const slug = formData.get('slug');
      
      if (status === 'draft') {
        toast.success('Draft saved successfully!');
      } else {
        toast.success('Blog published successfully!');
      }
      
      localStorage.removeItem('blog_draft'); // clear draft on success
      navigate(`/blog/${slug}`);
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create New Blog | GTrends Global</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        <main className="flex-1 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Create New Article</h1>
              <p className="text-muted-foreground mt-2">Publish new content to your audience.</p>
            </div>

            <BlogForm 
              initialData={initialData || {}} 
              onSubmit={handleCreate} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogCreatePage;