import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download, LogOut, Search, Settings, Share2, Pencil, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';

const AdminLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [publishingId, setPublishingId] = useState(null);
  const { logout } = useAdminAuth();

  // Quick edit state
  const [editingBlog, setEditingBlog] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchBlogs();
  }, []);

  const fetchLeads = async () => {
    try {
      const records = await pb.collection('hydra_leads').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setLeads(records);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const records = await pb.collection('blog_posts').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setBlogs(records);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const handleDownloadCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Name', 'Email', 'Phone', 'City', 'Tool ID', 'Tool Title', 'Calculation Results', 'Timestamp'];
    const csvRows = leads.map(lead => [
      `"${lead.name || ''}"`,
      `"${lead.email || ''}"`,
      `"${lead.mobile || ''}"`,
      `"${lead.city || ''}"`,
      `"${lead.toolId || ''}"`,
      `"${lead.toolTitle || ''}"`,
      `"${JSON.stringify(lead.calculationResults || {}).replace(/"/g, '""')}"`,
      `"${new Date(lead.created).toLocaleString()}"`
    ]);
    
    const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `hydra_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePublishPinterest = async (post) => {
    setPublishingId(post.id);
    try {
      const blogUrl = `https://gtrendsnow.com/blog/${post.slug || post.id}`;
      const imageUrl = post.image_url || 'https://gtrendsnow.com/default-og.jpg';
      
      const response = await apiServerClient.fetch('/pinterest/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogTitle: post.title,
          blogUrl: blogUrl,
          boardId: import.meta.env.VITE_PINTEREST_BOARD_ID,
          imageUrl: imageUrl
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect to publishing service');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Pin published to Pinterest!');
      } else {
        toast.error(data.message || 'Failed to publish Pinterest pin');
      }
    } catch (error) {
      console.error('Pinterest publishing error:', error);
      toast.error('An error occurred while publishing to Pinterest');
    } finally {
      setPublishingId(null);
    }
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog) return;

    setIsUpdating(true);
    try {
      await pb.collection('blog_posts').update(editingBlog.id, {
        title: editingBlog.title,
        slug: editingBlog.slug,
        author: editingBlog.author
      }, { $autoCancel: false });
      
      toast.success('Blog post updated successfully.');
      setEditingBlog(null);
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update blog post.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.toolTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogs = blogs.filter(blog => 
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin Portal</title>
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
            <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="leads">Lead Management</TabsTrigger>
              <TabsTrigger value="blogs">Blog Management</TabsTrigger>
            </TabsList>

            {/* LEADS TAB */}
            <TabsContent value="leads" className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-card border-border"
                  />
                </div>
                <Button onClick={handleDownloadCSV} disabled={leads.length === 0} className="bg-primary text-primary-foreground">
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">Contact</th>
                        <th className="px-6 py-4 font-medium">Location</th>
                        <th className="px-6 py-4 font-medium">Tool Used</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isLoadingLeads ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                          </tr>
                        ))
                      ) : filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-foreground">{lead.name}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-foreground">{lead.email}</span>
                                <span className="text-muted-foreground text-xs">{lead.mobile}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{lead.city || '-'}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                {lead.toolTitle}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(lead.created).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                            No leads found matching your criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* BLOGS TAB */}
            <TabsContent value="blogs" className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-card border-border"
                  />
                </div>
                <Button onClick={fetchBlogs} variant="outline" className="text-muted-foreground">
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-6 py-4 font-medium">Title & Slug</th>
                        <th className="px-6 py-4 font-medium">Author</th>
                        <th className="px-6 py-4 font-medium">Published</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isLoadingBlogs ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4"><Skeleton className="h-8 w-48" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                            <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-32 ml-auto" /></td>
                          </tr>
                        ))
                      ) : filteredBlogs.length > 0 ? (
                        filteredBlogs.map((blog) => (
                          <tr key={blog.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-foreground line-clamp-1">{blog.title}</span>
                                <span className="text-muted-foreground text-xs font-mono">{blog.slug || 'No slug set'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {blog.author || 'System'}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {new Date(blog.published_date || blog.created).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <Dialog open={editingBlog?.id === blog.id} onOpenChange={(open) => !open && setEditingBlog(null)}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 text-xs"
                                    onClick={() => setEditingBlog({...blog})}
                                  >
                                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                  <DialogHeader>
                                    <DialogTitle>Quick Edit Blog Post</DialogTitle>
                                  </DialogHeader>
                                  {editingBlog && (
                                    <form onSubmit={handleUpdateBlog} className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input 
                                          id="title" 
                                          value={editingBlog.title || ''} 
                                          onChange={e => setEditingBlog({...editingBlog, title: e.target.value})}
                                          className="text-foreground"
                                          required
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="slug">Slug (URL Path)</Label>
                                        <Input 
                                          id="slug" 
                                          value={editingBlog.slug || ''} 
                                          onChange={e => setEditingBlog({...editingBlog, slug: e.target.value})}
                                          className="text-foreground"
                                          placeholder="e.g., my-awesome-post"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="author">Author</Label>
                                        <Input 
                                          id="author" 
                                          value={editingBlog.author || ''} 
                                          onChange={e => setEditingBlog({...editingBlog, author: e.target.value})}
                                          className="text-foreground"
                                        />
                                      </div>
                                      <DialogFooter className="mt-4">
                                        <Button type="button" variant="outline" onClick={() => setEditingBlog(null)}>
                                          Cancel
                                        </Button>
                                        <Button type="submit" disabled={isUpdating}>
                                          {isUpdating ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handlePublishPinterest(blog)}
                                disabled={publishingId === blog.id}
                              >
                                {publishingId === blog.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                                ) : (
                                  <Share2 className="w-3.5 h-3.5 mr-1" />
                                )}
                                Pinterest
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                            No blog posts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default AdminLeadsPage;