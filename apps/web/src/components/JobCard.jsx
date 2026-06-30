import React from 'react';
import { Building2, ExternalLink, Briefcase, Clock, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';

const currencySymbols = {
  USD: '$',
  GBP: '£',
  EUR: '€'
};

const JobCard = ({ job }) => {
  const symbol = currencySymbols[job.currency] || '$';
  
  // Format the salary range to include the symbol on both ends if it's a range
  const formattedSalary = job.salaryRange.split(' - ').map(amount => `${symbol}${amount}`).join(' - ');

  return (
    <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full group relative overflow-hidden">
      {/* Subtle background glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-500 group-hover:bg-primary/10" />

      <div className="mb-5 flex items-start justify-between gap-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-card-foreground mb-3 group-hover:text-primary transition-colors duration-200 leading-tight">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-secondary" />
              {job.company}
            </div>
            <div className="w-1 h-1 rounded-full bg-border"></div>
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <Banknote className="w-4 h-4" />
              {formattedSalary}
            </div>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 border border-secondary/20 shadow-sm">
          <Briefcase className="w-6 h-6 text-secondary" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground relative z-10">
        <Clock className="w-4 h-4" />
        <span>Experience: <span className="font-semibold text-foreground">{job.experience}</span></span>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 flex-grow relative z-10">
        {job.skills.map((skill, i) => (
          <span key={i} className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-xs font-semibold border border-border/50 tracking-wide hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/20 transition-colors">
            {skill}
          </span>
        ))}
      </div>
      
      <Button asChild className="w-full bg-primary text-primary-foreground hover:brightness-110 mt-auto transition-all duration-200 active:scale-[0.98] cursor-pointer relative z-10 shadow-md shadow-primary/10">
        <a href={job.viewDetailsLink} target="_blank" rel="noopener noreferrer">
          View Details
          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
        </a>
      </Button>
    </div>
  );
};

export default JobCard;