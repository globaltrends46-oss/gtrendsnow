import React from 'react';
import { Download } from 'lucide-react';

const DownloadButton = ({ data, filename }) => {
  const handleDownload = () => {
    const timestamp = new Date().toLocaleString();
    const content = `--- ${filename} Results ---\nGenerated on: ${timestamp}\n\n${data}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\s+/g, '_')}_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={handleDownload}
      className="w-full mt-6 flex items-center justify-center py-3 px-4 border border-primary/30 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-semibold"
    >
      <Download className="w-5 h-5 mr-2" />
      Download Results
    </button>
  );
};

export default DownloadButton;