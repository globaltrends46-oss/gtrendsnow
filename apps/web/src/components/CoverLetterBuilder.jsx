import React, { useState } from 'react';
import { Mail, Download, Lock, Crown, Sparkles, Loader2 } from 'lucide-react';
import { triggerGumroad } from '@/utils/gumroadHelper.js';
import { isVipUser, canGenerateDocument, markGenerationUsed } from '@/utils/vipTracker.js';
import PaywallModal from '@/components/PaywallModal.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

const CoverLetterBuilder = () => {
  const [formData, setFormData] = useState({
    name: '',
    target_job_title: '',
    company_name: '',
    experience: '',
    skills: '',
    achievements: '',
    region: 'Auto'
  });

  const [showPaywall, setShowPaywall] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    if (!formData.name || !formData.target_job_title || !formData.company_name) return;
    
    if (!canGenerateDocument()) {
      setShowPaywall(true);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');
    
    try {
      const response = await apiServerClient.fetch('/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          jobTitle: formData.target_job_title,
          company: formData.company_name,
          skills: formData.skills + (formData.experience ? ` | Experience: ${formData.experience}` : '') + (formData.achievements ? ` | Achievements: ${formData.achievements}` : '')
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.coverLetter);
        markGenerationUsed();
      } else {
        setError(data.error || 'Failed to generate cover letter. Please try again.');
      }
    } catch (err) {
      console.error('Cover Letter Generation Error:', err);
      setError('A connection error occurred. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isVip = isVipUser();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl mt-12">
      <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">AI Cover Letter Builder</h3>
            <p className="text-sm text-muted-foreground">Persuasive outreach tailored to the role</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            disabled={!isVip || isGenerating || !generatedContent} 
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:brightness-110 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Form Section */}
        <div className="p-6 lg:p-8 border-r border-border bg-background overflow-y-auto max-h-[800px] space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Alex Mercer" className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Region Format</label>
                <select name="region" value={formData.region} onChange={handleChange} className="w-full px-3 py-2 bg-input text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50">
                  <option value="Auto">Auto-detect</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="EU">European Union</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Target Job Title *</label>
                <input type="text" name="target_job_title" value={formData.target_job_title} onChange={handleChange} placeholder="Data Science Manager" className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Company Name *</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Global Tech Solutions" className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Relevant Experience</label>
              <textarea name="experience" value={formData.experience} onChange={handleChange} rows="3" placeholder="Briefly describe your most relevant role..." className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Key Achievements</label>
              <textarea name="achievements" value={formData.achievements} onChange={handleChange} rows="2" placeholder="Spearheaded a project that increased sales by 22%..." className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Skills to Highlight</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Machine Learning, Leadership, Product Launch..." className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.name || !formData.target_job_title || !formData.company_name}
            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? 'Drafting Letter...' : 'Generate with AI'}
          </button>
        </div>

        {/* Preview Section */}
        <div className="p-6 lg:p-8 bg-muted/10 relative flex items-center justify-center min-h-[500px]">
          <div className="w-full max-w-[450px] min-h-[600px] bg-white rounded shadow-md border border-gray-200 p-8 overflow-hidden relative text-black font-sans">
            {isGenerating ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-4 w-1/4 bg-gray-200 rounded mb-8"></div>
                <div className="pt-4 space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                </div>
                <div className="pt-4 space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-1/3 bg-gray-200 rounded mt-8"></div>
              </div>
            ) : generatedContent ? (
              <div className={`whitespace-pre-wrap text-sm leading-relaxed ${!isVip ? 'blur-[4px] select-none opacity-60' : ''}`}>
                {generatedContent}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-32">
                <Mail className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Fill out the form and generate to see preview</p>
              </div>
            )}

            {/* Paywall Overlay */}
            {!isVip && generatedContent && !isGenerating && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-6 text-center">
                <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-[#FFD700]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Blurred Preview</h3>
                <p className="text-gray-600 text-sm mb-6 max-w-xs">
                  Subscribe to VIP to unlock high-resolution PDF downloads and unblurred text.
                </p>
                <button
                  onClick={triggerGumroad}
                  className="w-full max-w-xs py-3 rounded-xl font-bold text-black transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#FFD700', boxShadow: '0 4px 14px rgba(255, 215, 0, 0.25)' }}
                >
                  <Crown className="w-5 h-5" />
                  Subscribe Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
};

export default CoverLetterBuilder;