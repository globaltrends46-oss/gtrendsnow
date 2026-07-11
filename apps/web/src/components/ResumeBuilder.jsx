import React, { useState, useRef } from 'react';
import { FileText, Download, Lock, Crown, Sparkles, Loader2, Upload, FileCheck, CheckCircle2, AlertCircle, Palette, Type, Layout } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';

// Simple markdown-to-html converter for PDF generation
const parseMarkdownToHtmlForPDF = (text) => {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Wrap consecutive list items in <ul>
    .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

const ResumeBuilder = () => {
  const fileInputRef = useRef(null);

  const checkGenerationLimit = () => {
    const limitKey = 'gtrends_cv_generations';
    const limitData = localStorage.getItem(limitKey);
    const now = Date.now();
    const FOUR_HOURS = 4 * 60 * 60 * 1000;

    if (!limitData) {
      return { allowed: true, count: 0 };
    }

    try {
      const { count, firstGenTime } = JSON.parse(limitData);

      if (now - firstGenTime > FOUR_HOURS) {
        localStorage.removeItem(limitKey);
        return { allowed: true, count: 0 };
      }

      if (count >= 2) {
        const remainingMs = firstGenTime + FOUR_HOURS - now;
        const hours = Math.floor(remainingMs / (60 * 60 * 1000));
        const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        return { allowed: false, hours, minutes };
      }

      return { allowed: true, count };
    } catch (e) {
      localStorage.removeItem(limitKey);
      return { allowed: true, count: 0 };
    }
  };

  const incrementGenerationCount = () => {
    const limitKey = 'gtrends_cv_generations';
    const limitData = localStorage.getItem(limitKey);
    const now = Date.now();

    if (!limitData) {
      localStorage.setItem(limitKey, JSON.stringify({ count: 1, firstGenTime: now }));
    } else {
      try {
        const { count, firstGenTime } = JSON.parse(limitData);
        localStorage.setItem(limitKey, JSON.stringify({ count: count + 1, firstGenTime }));
      } catch (e) {
        localStorage.setItem(limitKey, JSON.stringify({ count: 1, firstGenTime: now }));
      }
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    targetJobTitle: '',
    targetJobDescription: '',
    experience: '',
    skills: '',
    education: '',
    certifications: '',
    achievements: '',
    currentCvText: '',
  });

  const [customization, setCustomization] = useState({
    template: 'Classic', // Classic, Modern, Executive
    color: 'blue', // blue, green, charcoal, burgundy
    font: 'Inter', // Inter, Playfair, Outfit
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [atsAudit, setAtsAudit] = useState({
    score: null,
    missingKeywords: [],
    suggestions: [],
  });
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomizationChange = (key, value) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, currentCvText: event.target.result }));
      };
      reader.readAsText(file);
    } else {
      // In case of other formats, prompt text pasting
      setFormData(prev => ({ 
        ...prev, 
        currentCvText: `[File Uploaded: ${file.name} - For PDF/Word uploads, please copy-paste your CV text below for optimal ATS parsing]`
      }));
    }
  };

  const handleGenerate = async () => {
    if (!formData.name || (!formData.experience && !formData.currentCvText)) {
      setError('Please provide your name and experience or upload your CV.');
      return;
    }
    
    const limitStatus = checkGenerationLimit();
    if (!limitStatus.allowed) {
      setError(`You have reached the free limit of 2 optimizations. Please come back in ${limitStatus.hours} hour(s) and ${limitStatus.minutes} minute(s) to retry!`);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');
    setAtsAudit({ score: null, missingKeywords: [], suggestions: [] });
    
    try {
      const response = await apiServerClient.fetch('/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          targetJobTitle: formData.targetJobTitle,
          targetJobDescription: formData.targetJobDescription,
          experience: formData.experience + (formData.achievements ? `\nAchievements: ${formData.achievements}` : ''),
          skills: formData.skills,
          education: formData.education + (formData.certifications ? `\nCertifications: ${formData.certifications}` : ''),
          currentCvText: formData.currentCvText
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.generatedCV);
        setAtsAudit({
          score: data.atsScore || 75,
          missingKeywords: data.missingKeywords || [],
          suggestions: data.suggestions || [],
        });
        incrementGenerationCount();
      } else {
        setError('Failed to generate resume. Please check your inputs and try again.');
      }
    } catch (err) {
      console.error('CV Generation Error:', err);
      setError('A connection error occurred. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedContent) return;
    
    const printWindow = window.open('', '_blank');
    
    const fontStyles = {
      Inter: 'font-family: "Inter", sans-serif;',
      Playfair: 'font-family: "Playfair Display", serif;',
      Outfit: 'font-family: "Outfit", sans-serif;'
    };
    
    const colors = {
      blue: { primary: '#1e3a8a', text: '#1e293b' },
      green: { primary: '#065f46', text: '#1e293b' },
      charcoal: { primary: '#1f2937', text: '#1e293b' },
      burgundy: { primary: '#7f1d1d', text: '#1e293b' }
    };
    
    const theme = colors[customization.color] || colors.blue;
    const resumeHtml = parseMarkdownToHtmlForPDF(generatedContent);
    
    let templateCss = '';
    if (customization.template === 'Modern') {
      templateCss = `
        body { margin: 40px; color: #334155; font-size: 11pt; line-height: 1.6; }
        h1 { color: ${theme.primary}; font-size: 26pt; font-weight: 800; border-bottom: 2px solid ${theme.primary}; padding-bottom: 10px; margin-bottom: 20px; }
        h2 { color: ${theme.primary}; font-size: 16pt; font-weight: 700; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px; margin-bottom: 12px; }
        h3 { font-size: 12pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
        ul { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 5px; }
      `;
    } else if (customization.template === 'Executive') {
      templateCss = `
        body { margin: 50px; color: #0f172a; font-size: 11pt; line-height: 1.5; }
        h1 { color: ${theme.primary}; font-size: 24pt; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        h2 { color: #0f172a; font-size: 14pt; border-bottom: 2px solid ${theme.primary}; padding-bottom: 3px; margin-top: 30px; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; }
        h3 { font-size: 12pt; font-weight: 700; display: flex; justify-content: space-between; margin-top: 15px; margin-bottom: 5px; }
        ul { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 6px; }
      `;
    } else { // Classic
      templateCss = `
        body { margin: 45px; color: #1e293b; font-size: 11pt; line-height: 1.6; }
        h1 { color: ${theme.primary}; font-size: 28pt; font-weight: bold; margin-bottom: 8px; }
        h2 { color: ${theme.primary}; font-size: 15pt; font-weight: bold; border-bottom: 1.5px solid ${theme.primary}; padding-bottom: 4px; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; }
        h3 { font-size: 12pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; }
        ul { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 4px; }
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${formData.name} - Resume</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&family=Outfit:wght@400;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body { ${fontStyles[customization.font] || fontStyles.Inter} }
            ${templateCss}
            @media print {
              body { margin: 0; padding: 20px; }
              @page { size: letter; margin: 1in; }
            }
          </style>
        </head>
        <body>
          ${resumeHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500 border-green-500 bg-green-500/10';
    if (score >= 60) return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
    return 'text-red-500 border-red-500 bg-red-500/10';
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-border bg-muted/30 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">ATS Resume Builder</h3>
            <p className="text-sm text-muted-foreground">Optimize your profile with AI Audit scorecard</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating || !generatedContent} 
            className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:brightness-110 transition-all active:scale-[0.98] shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Form Controls Section */}
        <div className="p-6 lg:p-8 border-r border-border bg-background overflow-y-auto max-h-[850px] space-y-6">
          
          {/* Section 1: Target Position */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider">1. Job Targeting</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Target Job Title</label>
                <input 
                  type="text" 
                  name="targetJobTitle" 
                  value={formData.targetJobTitle} 
                  onChange={handleChange} 
                  placeholder="e.g. Senior Software Engineer" 
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Jane Doe" 
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Target Job Description (Paste for ATS match)</label>
              <textarea 
                name="targetJobDescription" 
                value={formData.targetJobDescription} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Paste the target job description to match skills and keywords..." 
                className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm" 
              />
            </div>
          </div>

          {/* Section 2: Input CV details or upload */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-primary uppercase tracking-wider">2. Profile Details</h4>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs flex items-center gap-1.5 text-primary hover:underline font-semibold"
              >
                <Upload className="w-3.5 h-3.5" /> Upload .TXT CV
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt" 
                className="hidden" 
              />
            </div>

            {uploadedFileName && (
              <div className="p-2.5 bg-primary/10 rounded-lg flex items-center gap-2 text-xs font-semibold text-primary">
                <FileCheck className="w-4 h-4" />
                <span>Uploaded: {uploadedFileName}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Current Resume / Experience details</label>
              <textarea 
                name={formData.currentCvText ? "currentCvText" : "experience"} 
                value={formData.currentCvText || formData.experience} 
                onChange={handleChange} 
                rows="5" 
                placeholder="Pasted resume text, or type your work experience history..." 
                className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Skills (comma separated)</label>
              <input 
                type="text" 
                name="skills" 
                value={formData.skills} 
                onChange={handleChange} 
                placeholder="Python, AWS, Strategic Planning..." 
                className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Education</label>
                <input 
                  type="text" 
                  name="education" 
                  value={formData.education} 
                  onChange={handleChange} 
                  placeholder="Degree, University..." 
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Certifications / Achievements</label>
                <input 
                  type="text" 
                  name="certifications" 
                  value={formData.certifications} 
                  onChange={handleChange} 
                  placeholder="CFA, AWS Architect..." 
                  className="w-full px-3 py-2 bg-input text-foreground placeholder:text-muted-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                />
              </div>
            </div>
          </div>

          {/* Section 3: Design Options */}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider">3. Styling Options</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Layout className="w-3 h-3"/> Layout</label>
                <select 
                  value={customization.template} 
                  onChange={(e) => handleCustomizationChange('template', e.target.value)}
                  className="w-full px-2 py-1.5 bg-input text-xs text-foreground border border-border rounded focus:outline-none"
                >
                  <option value="Classic">Classic</option>
                  <option value="Modern">Modern</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Palette className="w-3 h-3"/> Palette</label>
                <select 
                  value={customization.color} 
                  onChange={(e) => handleCustomizationChange('color', e.target.value)}
                  className="w-full px-2 py-1.5 bg-input text-xs text-foreground border border-border rounded focus:outline-none"
                >
                  <option value="blue">Midnight Blue</option>
                  <option value="green">Forest Green</option>
                  <option value="charcoal">Charcoal Black</option>
                  <option value="burgundy">Burgundy</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Type className="w-3 h-3"/> Font</label>
                <select 
                  value={customization.font} 
                  onChange={(e) => handleCustomizationChange('font', e.target.value)}
                  className="w-full px-2 py-1.5 bg-input text-xs text-foreground border border-border rounded focus:outline-none"
                >
                  <option value="Inter">Inter (Sans)</option>
                  <option value="Playfair">Playfair (Serif)</option>
                  <option value="Outfit">Outfit (Modern)</option>
                </select>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.name || (!formData.experience && !formData.currentCvText)}
            className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? 'Building and Auditing...' : 'Build ATS CV & Audit'}
          </button>
        </div>

        {/* Live Preview & ATS Report Card Section */}
        <div className="p-6 lg:p-8 bg-muted/10 flex flex-col gap-6 max-h-[850px] overflow-y-auto">
          
          {/* ATS SCORECARD DISPLAY */}
          {atsAudit.score !== null && (
            <div className="p-4 bg-background border border-border rounded-xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg ${getScoreColor(atsAudit.score)}`}>
                {atsAudit.score}%
              </div>
              <div className="flex-1 text-center md:text-left">
                <h5 className="font-bold text-foreground text-sm flex items-center gap-1.5 justify-center md:justify-start">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> ATS Optimization Audit Complete
                </h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Missing Keywords identified: <span className="font-semibold text-primary">{atsAudit.missingKeywords.join(', ') || 'None'}</span>
                </p>
                <div className="mt-2 space-y-1 text-left">
                  {atsAudit.suggestions.map((rec, idx) => (
                    <p key={idx} className="text-[11px] text-muted-foreground leading-normal">• {rec}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Document Sheet */}
          <div className="flex-1 flex justify-center items-start min-h-[500px]">
            <div 
              style={{
                fontFamily: customization.font === 'Playfair' ? '"Playfair Display", serif' : customization.font === 'Outfit' ? '"Outfit", sans-serif' : '"Inter", sans-serif',
                borderColor: customization.color === 'green' ? '#065f46' : customization.color === 'charcoal' ? '#1f2937' : customization.color === 'burgundy' ? '#7f1d1d' : '#1e3a8a'
              }}
              className="w-full max-w-[460px] min-h-[620px] bg-white rounded shadow-md border-t-[6px] p-8 overflow-hidden relative text-black text-xs leading-relaxed"
            >
              {isGenerating ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-8 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  <div className="pt-4 space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="pt-4 space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="whitespace-pre-wrap">
                  {generatedContent}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-32">
                  <FileText className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">Build your profile and click generate to audit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;