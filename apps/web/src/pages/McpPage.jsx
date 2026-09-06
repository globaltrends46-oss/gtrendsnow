import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Search, Download, Star, ExternalLink, Sparkles, Filter, Check, 
  Copy, ArrowUpDown, X, Terminal, ShieldCheck, Database, Globe, 
  FolderTree, Cloud, Cpu, MessageSquare, Wrench, ChevronRight, Zap,
  Layers, Info
} from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'All', label: 'All Repositories & Servers', icon: Layers },
  { id: 'Databases & Storage', label: 'Databases & Storage', icon: Database },
  { id: 'Web & Scraping', label: 'Web & Scraping', icon: Globe },
  { id: 'File Systems & Knowledge', label: 'Filesystems & Docs', icon: FolderTree },
  { id: 'Cloud & DevOps', label: 'Cloud & DevOps', icon: Cloud },
  { id: 'AI Agents & LLMs', label: 'AI Agents & LLMs', icon: Cpu },
  { id: 'Communication & Productivity', label: 'Communication', icon: MessageSquare },
  { id: 'Developer Tools', label: 'Developer Tools', icon: Wrench },
];

const SAMPLE_QUERIES = [
  "Query PostgreSQL with Claude",
  "Headless Chrome browser scraping",
  "Persistent long-term memory graph",
  "Run local LLMs offline on Mac/PC",
  "Docker container log diagnostics",
  "Vector similarity search for RAG"
];

const McpPage = () => {
  const [tools, setTools] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('stars');
  
  // Modal / Drawer state for detailed on-site use case
  const [selectedTool, setSelectedTool] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (sortBy) params.append('sort', sortBy);

      let url = `/hcgi/api/mcp?${params.toString()}`;
      let res = await fetch(url, { signal: AbortSignal.timeout(4000) }).catch(() => null);
      
      if (!res || !res.ok) {
        url = `/api/mcp?${params.toString()}`;
        res = await fetch(url, { signal: AbortSignal.timeout(3000) }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setTools(data.items || []);
        setRecommended(data.recommended || []);
      }
    } catch (err) {
      console.warn('Failed to fetch MCP catalog from API:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy]);

  // 1-Click Direct Download without navigating away
  const handleDownloadZip = (tool) => {
    toast.info(`Preparing 1-click download for ${tool.name}...`);
    
    // Create an invisible anchor to trigger backend stream download
    const downloadUrl = `/hcgi/api/mcp/download/${tool.id}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${tool.repo || tool.id}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Download started for ${tool.name}!`);
  };

  // 1-Click Copy Config Snippet
  const handleCopyConfig = (tool, e) => {
    if (e) e.stopPropagation();
    if (!tool.configSnippet) return;
    navigator.clipboard.writeText(tool.configSnippet);
    setCopiedId(tool.id);
    toast.success(`Copied MCP configuration for ${tool.name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <>
      <Helmet>
        <title>MCP & AI Repositories Directory | 1-Click Download & Use Cases</title>
        <meta 
          name="description" 
          content="Explore the definitive directory of Model Context Protocol (MCP) servers and top AI repositories. Search natural language requirements, inspect full in-depth use cases, and download in 1 click." 
        />
      </Helmet>

      <div className="min-h-screen bg-[#070b14] text-[#f8fafc] flex flex-col font-sans relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-60 pointer-events-none" />
        <div className="mesh-glow-orb mesh-glow-1 opacity-30 pointer-events-none" />
        <div className="mesh-glow-orb mesh-glow-2 opacity-25 pointer-events-none" />
        <Header />

        <main className="flex-1 py-10 md:py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Page Header */}
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> Official & Community MCP Servers & AI Repositories
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                MCP & AI Repositories <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Directory</span>
              </h1>
              <p className="text-base md:text-lg text-slate-400">
                Explore the world's Model Context Protocol servers and premier AI tools. Read comprehensive use cases, search natural language requirements, and download in one click without leaving our site.
              </p>
            </div>

            {/* Smart Natural Language Requirement Search Box */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl p-2 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                <div className="pl-3 pr-2 text-cyan-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you trying to build? (e.g., 'Connect Claude to PostgreSQL', 'Browser scraping', 'Run local models offline')..."
                  className="w-full bg-transparent text-white placeholder:text-slate-500 text-sm md:text-base focus:outline-none py-2"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1.5 pr-2">
                  <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
                    AI Intent Search
                  </span>
                </div>
              </div>

              {/* Sample Intent Prompt Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-500">Try asking:</span>
                {SAMPLE_QUERIES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(sample)}
                    className="px-2.5 py-1 rounded-full bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-cyan-400 transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic "Recommended For Your Need" Banner */}
            {recommended.length > 0 && (
              <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-500/30 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    💡 Recommended For Your Need: <span className="text-cyan-300 italic">"{searchQuery}"</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommended.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedTool(item)}
                      className="bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/60 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{item.stars ? item.stars.toLocaleString() : 'Top Rated'}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors text-sm mb-1.5">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                          {item.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Read Use Case <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadZip(item); }}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3 h-3" /> Download .ZIP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter Pills & Sort Dropdown */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" /> Rank by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="stars">GitHub Stars (Highest)</option>
                  <option value="downloads">Total Downloads</option>
                  <option value="name">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Dense Tabular Grid */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-4 sm:px-6 w-16">Rank</th>
                      <th className="py-4 px-4 sm:px-6">Server / Tool</th>
                      <th className="py-4 px-4 w-32">GitHub Stars</th>
                      <th className="py-4 px-4 w-28 hidden md:table-cell">Downloads</th>
                      <th className="py-4 px-4 hidden lg:table-cell">Key Tags</th>
                      <th className="py-4 px-4 sm:px-6 text-right w-48">1-Click Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-slate-400">
                          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="font-medium">Searching verified MCP registries...</p>
                        </td>
                      </tr>
                    ) : tools.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-16 text-center text-slate-400">
                          <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                          <p className="font-semibold text-white">No tools found matching your requirement</p>
                          <p className="text-xs text-slate-500 mt-1">Try broadening your search keywords or switching category filters</p>
                        </td>
                      </tr>
                    ) : (
                      tools.map((tool, idx) => (
                        <tr 
                          key={tool.id}
                          onClick={() => setSelectedTool(tool)}
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-500 group-hover:text-cyan-400 text-xs">
                            #{idx + 1}
                          </td>

                          {/* Tool Name & Category & Description */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white group-hover:text-cyan-300 transition-colors text-base">
                                  {tool.name}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                                  {tool.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-1">
                                {tool.shortDescription}
                              </p>
                            </div>
                          </td>

                          {/* GitHub Stars */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                              <Star className="w-4 h-4 fill-amber-400" />
                              <span>{tool.stars ? tool.stars.toLocaleString() : '30k+'}</span>
                            </div>
                            {tool.growthRate && (
                              <span className="text-[10px] text-emerald-400 font-medium block">
                                {tool.growthRate}
                              </span>
                            )}
                          </td>

                          {/* Downloads */}
                          <td className="py-4 px-4 whitespace-nowrap hidden md:table-cell text-slate-300 text-xs font-mono">
                            {tool.downloads || '500k+'}
                          </td>

                          {/* Tags */}
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {tool.tags?.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedTool(tool)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                                title="Read full use case & architecture"
                              >
                                <span>Use Case</span>
                              </button>

                              <button
                                onClick={(e) => handleCopyConfig(tool, e)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                title="Copy Claude / Cursor MCP config JSON"
                              >
                                {copiedId === tool.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={() => handleDownloadZip(tool)}
                                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:brightness-110 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 active:scale-95"
                                title="Download repository source .zip without leaving site"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>.ZIP</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>

      {/* In-Depth Use Case Drawer / Modal (Never leaves our site) */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {selectedTool.category}
                  </span>
                  <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedTool.stars?.toLocaleString()} Stars
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedTool.downloads} Downloads
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {selectedTool.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Repository: {selectedTool.owner}/{selectedTool.repo}
                </p>
              </div>

              <button
                onClick={() => setSelectedTool(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
              
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 text-sm">
                <strong>Core Capability:</strong> {selectedTool.shortDescription}
              </div>

              {/* Full Use Case Breakdown */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" /> Complete Problem & Enterprise Use Case
                </h4>
                <div className="whitespace-pre-line text-slate-300 text-sm leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  {selectedTool.fullUseCase}
                </div>
              </div>

              {/* Supported Agent Tools */}
              {selectedTool.toolsProvided?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-indigo-400" /> Tools & Capabilities Provided to AI Agents
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedTool.toolsProvided.map((t, i) => (
                      <div key={i} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                        <span className="font-mono text-xs font-bold text-cyan-400 block mb-1">
                          `{t.name}`
                        </span>
                        <p className="text-xs text-slate-400">
                          {t.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Claude Desktop / Cursor Config JSON */}
              {selectedTool.configSnippet && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-purple-400" /> 1-Click Claude / Cursor Config Snippet
                    </h4>
                    <button
                      onClick={(e) => handleCopyConfig(selectedTool, e)}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md flex items-center gap-1 transition-colors"
                    >
                      {copiedId === selectedTool.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === selectedTool.id ? 'Copied!' : 'Copy Config'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-slate-300 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                    {selectedTool.configSnippet}
                  </pre>
                </div>
              )}

              {/* Installation Guide */}
              {selectedTool.installGuide && (
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" /> Quick Installation & Setup
                  </h4>
                  <div className="whitespace-pre-line text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300">
                    {selectedTool.installGuide}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Direct download streamed from GTrends Global
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTool(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadZip(selectedTool)}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>1-Click Download (.ZIP)</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default McpPage;
