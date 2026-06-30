import React, { useState } from 'react';
import { Briefcase, MapPin, Lock, X, Loader2, FileText } from 'lucide-react';
import { triggerGumroad } from '@/utils/gumroadHelper.js';
import { useVipAuth } from '@/contexts/VipAuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

const jobs = [
  { title: 'Senior Financial Analyst', location: 'London, UK', description: 'Lead financial modeling and strategic planning.', skills: ['Excel', 'Financial Modeling', 'SQL'] },
  { title: 'AI Content Strategist', location: 'New York, USA', description: 'Develop content strategy using generative AI tools.', skills: ['SEO', 'Prompt Engineering', 'Copywriting'] },
  { title: 'Wealth Management Consultant', location: 'Frankfurt, Germany', description: 'Advise high-net-worth clients on portfolio diversification.', skills: ['Asset Management', 'Client Relations', 'Risk Analysis'] },
  { title: 'Data Science Manager', location: 'San Francisco, USA', description: 'Manage a team of data scientists building predictive models.', skills: ['Python', 'Machine Learning', 'Team Leadership'] },
  { title: 'Investment Research Lead', location: 'Dublin, Ireland', description: 'Conduct deep fundamental research on tech equities.', skills: ['Equity Research', 'Bloomberg Terminal', 'Financial Analysis'] }
];

const GlobalJobFeed = () => {
  const { isVipUser } = useVipAuth();
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJobClick = async (job) => {
    if (!isVipUser) return;
    
    setSelectedJob(job);
    setIsLoading(true);
    setJobDetails('');

    try {
      const response = await apiServerClient.fetch('/generate-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          jobDescription: job.description,
          skills: job.skills
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setJobDetails(data.generatedJobPosting);
      } else {
        setJobDetails('Failed to generate job description. Please try again.');
      }
    } catch (error) {
      console.error('Error generating job description:', error);
      setJobDetails('An error occurred while generating the job description.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedJob(null);
    setJobDetails('');
  };

  return (
    <>
      <div className="bg-[#121212] border border-[#222] rounded-3xl overflow-hidden relative shadow-2xl">
        <div className="p-6 md:p-8 border-b border-[#222] flex items-center gap-4 bg-[#1a1a1a]">
          <div className="w-14 h-14 rounded-xl bg-[#FFD700]/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-7 h-7 text-[#FFD700]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Global Job Feed</h2>
            <p className="text-gray-400 font-medium mt-1">Premium remote opportunities</p>
          </div>
        </div>

        <div className="divide-y divide-[#222]">
          {jobs.map((job, i) => (
            <div 
              key={i} 
              onClick={() => handleJobClick(job)}
              className={`p-6 md:px-8 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isVipUser ? 'cursor-pointer hover:bg-[#1a1a1a] group' : 'hover:bg-[#1a1a1a]/50'}`}
            >
              <div>
                <h3 className={`text-lg font-bold text-white mb-2 ${isVipUser ? 'group-hover:text-[#FFD700] transition-colors' : ''}`}>{job.title}</h3>
                <div className="flex items-center text-gray-400 text-sm font-medium">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {job.location}
                </div>
              </div>
              
              {isVipUser ? (
                <div className="text-[#FFD700] font-semibold text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FileText className="w-4 h-4" /> View Details
                </div>
              ) : (
                <div className="blur-sm select-none text-gray-500 font-mono hidden md:block">
                  $120k - $180k • Apply Now
                </div>
              )}
            </div>
          ))}
        </div>

        {!isVipUser && (
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#121212] via-[#121212]/95 to-transparent flex flex-col items-center justify-end pb-10 px-6">
            <div className="flex items-center justify-center text-center gap-2.5 mb-6 text-[#FFD700]">
              <Lock className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold tracking-wide">Full Job Details & Direct Apply Links are for VIP Members Only</span>
            </div>
            <button
              onClick={triggerGumroad}
              className="px-10 py-4 rounded-xl font-bold text-black text-lg transition-all active:scale-[0.98] shadow-lg flex items-center justify-center"
              style={{ backgroundColor: '#FFD700', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.25)' }}
            >
              Unlock Now
            </button>
          </div>
        )}
      </div>

      {/* VIP Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#333] flex items-start justify-between bg-[#121212]">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedJob.title}</h3>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedJob.location}</span>
                  <span className="px-2 py-0.5 bg-[#FFD700]/10 text-[#FFD700] rounded-md font-medium">Remote</span>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 bg-[#222] text-gray-400 hover:text-white rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-gray-300">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#FFD700]">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-medium animate-pulse">Generating comprehensive job description...</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{jobDetails}</div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-[#333] bg-[#121212] flex justify-end gap-4">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl font-semibold text-gray-300 hover:bg-[#222] transition-colors">
                Close
              </button>
              <button 
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#FFD700] text-black font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                Direct Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalJobFeed;