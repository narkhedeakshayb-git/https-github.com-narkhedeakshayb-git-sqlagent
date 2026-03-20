import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  ArrowLeftRight, 
  Filter, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Zap,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'sql-formatter';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { analyzeSQL, SQLAnalysis } from './services/geminiService';

export default function App() {
  const [sql1, setSql1] = useState('');
  const [sql2, setSql2] = useState('');
  const [analysis, setAnalysis] = useState<SQLAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  const handleCompare = async () => {
    if (!sql1 || !sql2) return;
    setIsLoading(true);
    try {
      const result = await analyzeSQL(sql1, sql2);
      setAnalysis(result);
      setActiveFilters(result.filters);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearAll = () => {
    setSql1('');
    setSql2('');
    setAnalysis(null);
    setActiveFilters([]);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">SQL Compare Agent</h1>
              <p className="text-xs text-zinc-500 font-mono">v1.0.0 • AI-Powered Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={clearAll}
              className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              title="Clear All"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleCompare}
              disabled={isLoading || !sql1 || !sql2}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-semibold px-6 py-2 rounded-lg transition-all active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                SQL Query A
              </label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    try { setSql1(format(sql1)); } catch(e) { console.error(e); }
                  }}
                  className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  Format
                </button>
                <button 
                  onClick={() => copyToClipboard(sql1, 1)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  {copied === 1 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 1 ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="relative group">
              <textarea
                value={sql1}
                onChange={(e) => setSql1(e.target.value)}
                placeholder="Paste your first SQL query here..."
                className="w-full h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none placeholder:text-zinc-700"
              />
              <div className="absolute bottom-4 right-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-zinc-600 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                  {sql1.length} chars
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Code2 className="w-3 h-3" />
                SQL Query B
              </label>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    try { setSql2(format(sql2)); } catch(e) { console.error(e); }
                  }}
                  className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  Format
                </button>
                <button 
                  onClick={() => copyToClipboard(sql2, 2)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  {copied === 2 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 2 ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="relative group">
              <textarea
                value={sql2}
                onChange={(e) => setSql2(e.target.value)}
                placeholder="Paste your second SQL query here..."
                className="w-full h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all resize-none placeholder:text-zinc-700"
              />
              <div className="absolute bottom-4 right-4 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-zinc-600 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                  {sql2.length} chars
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <ArrowLeftRight className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Logic Diff</p>
                    <p className="text-xl font-semibold">{analysis.differences.length} Changes</p>
                  </div>
                </div>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Filter className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Filters Found</p>
                    <p className="text-xl font-semibold">{analysis.filters.length} Unique</p>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Record Impact</p>
                    <p className="text-xl font-semibold">{analysis.estimatedRecordCount}</p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Differences & Optimizations */}
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-emerald-400" />
                        Logical Differences
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {analysis.differences.map((diff, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                          <span className="text-emerald-500 font-mono text-xs mt-1">0{i + 1}</span>
                          <p className="text-sm text-zinc-300 leading-relaxed">{diff}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                      <h3 className="font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Optimization Suggestions
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.optimizations.map((opt, i) => (
                        <div key={i} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3">
                          <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="text-sm text-zinc-300">{opt}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Right Column: Interactive Filters */}
                <div className="space-y-6">
                  <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden sticky top-24">
                    <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Filter className="w-4 h-4 text-amber-400" />
                        Active Filters
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveFilters(analysis.filters)}
                          className="text-[10px] uppercase font-bold text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          All
                        </button>
                        <button 
                          onClick={() => setActiveFilters([])}
                          className="text-[10px] uppercase font-bold text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          None
                        </button>
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      {analysis.filters.length > 0 ? (
                        analysis.filters.map((filter, i) => (
                          <button
                            key={i}
                            onClick={() => toggleFilter(filter)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                              activeFilters.includes(filter)
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                          >
                            <span className="text-xs font-mono truncate mr-2">{filter}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              activeFilters.includes(filter)
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-zinc-700 group-hover:border-zinc-500'
                            }`}>
                              {activeFilters.includes(filter) && <Check className="w-3 h-3 text-black" />}
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-600 italic text-center py-4">No explicit filters detected</p>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* Formatted View */}
              <section className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
                  <h3 className="font-semibold">Formatted SQL Reference</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 border-r border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Query A</p>
                    <div className="rounded-xl overflow-hidden border border-zinc-800">
                      <SyntaxHighlighter 
                        language="sql" 
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1.5rem', background: '#09090b', fontSize: '13px' }}
                      >
                        {format(sql1)}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Query B</p>
                    <div className="rounded-xl overflow-hidden border border-zinc-800">
                      <SyntaxHighlighter 
                        language="sql" 
                        style={vscDarkPlus}
                        customStyle={{ margin: 0, padding: '1.5rem', background: '#09090b', fontSize: '13px' }}
                      >
                        {format(sql2)}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!analysis && !isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Database className="w-10 h-10 text-zinc-700" />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-xl font-semibold text-zinc-300">Ready to Analyze</h2>
              <p className="text-sm text-zinc-500">
                Paste two SQL queries above and click "Run Analysis" to compare logic, 
                extract filters, and estimate performance impact.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-800/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <Database className="w-3 h-3" />
            <span>SQL Compare Agent • Powered by Gemini AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Documentation</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
