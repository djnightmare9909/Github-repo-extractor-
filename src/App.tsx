/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Search, 
  Key, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  RefreshCcw,
  Binary,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRepoDownloader } from './hooks/useRepoDownloader';

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    idle: 'bg-zinc-800 text-zinc-400',
    fetching_meta: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    fetching_tree: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    fetching_blobs: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    assembling: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    ready: 'bg-emerald-500 text-white',
    error: 'bg-red-500/10 text-red-500 border border-red-500/20',
  };

  const labels: Record<string, string> = {
    idle: 'Ready',
    fetching_meta: 'Fetching Meta',
    fetching_tree: 'Mapping Files',
    fetching_blobs: 'Downloading Code',
    assembling: 'Assembling Digest',
    ready: 'Complete',
    error: 'Failed',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${colors[status] || colors.idle}`}>
      {labels[status] || status}
    </span>
  );
};

export default function App() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState<{ time: string, msg: string, color?: string }[]>([]);
  
  const { 
    status, 
    error, 
    progress, 
    output, 
    repoName, 
    start, 
    download, 
    reset 
  } = useRepoDownloader();

  useEffect(() => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (status === 'fetching_meta') {
      setLogs([{ time, msg: `PARSING: ${url}` }]);
    } else if (status === 'fetching_tree') {
      setLogs(prev => [...prev, { time, msg: 'FETCHING: git/trees/main?recursive=1', color: 'text-zinc-300' }]);
    } else if (status === 'fetching_blobs') {
      setLogs(prev => [...prev, { time, msg: `SUCCESS: Tree identified.`, color: 'text-zinc-500' }]);
    } else if (status === 'ready') {
      setLogs(prev => [...prev, { time, msg: 'DIGEST_READY: Archive available for download.', color: 'text-white' }]);
    } else if (status === 'error') {
      setLogs(prev => [...prev, { time, msg: `CRITICAL_FAIL: ${error}`, color: 'text-red-500 font-bold' }]);
    }
  }, [status, error, url]);

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) start(url, token);
  };

  const progressPercentage = progress.total > 0 
    ? Math.round((progress.fetched / progress.total) * 100) 
    : 0;

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] text-[#E0E0E0] font-sans flex flex-col selection:bg-white selection:text-black">
      <header className="flex justify-between items-end p-12 border-b border-zinc-800">
        <div className="space-y-1">
          <h1 className="text-8xl font-black tracking-tighter leading-[0.8] uppercase flex items-baseline">
            Repo<span className="text-zinc-600">.</span>Txt
          </h1>
          <p className="text-[10px] font-mono tracking-[0.4em] text-zinc-500 uppercase">
            Source Code Extraction Engine / v1.4.2
          </p>
        </div>
        <div className="text-right space-y-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">System status</span>
            <span className="flex items-center gap-2 text-emerald-500 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
              GITHUB_API_OK
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Input Section */}
        <section className="col-span-12 lg:col-span-7 p-12 border-r border-zinc-800 flex flex-col justify-between">
          <form onSubmit={handleConvert} className="space-y-16">
            <div className="space-y-4">
              <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block">Target Repository URL</label>
              <input 
                type="url" 
                required
                disabled={status !== 'idle' && status !== 'error' && status !== 'ready'}
                placeholder="https://github.com/facebook/react" 
                className="w-full bg-transparent border-b-2 border-zinc-800 focus:border-white text-3xl py-2 outline-none transition-all placeholder:text-zinc-900 font-light italic"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 block">Access Token</label>
                <input 
                  type="password" 
                  disabled={status !== 'idle' && status !== 'error' && status !== 'ready'}
                  placeholder="ghp_••••••••••••" 
                  className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-400 py-2 outline-none transition-all placeholder:text-zinc-900 text-sm font-mono tracking-tighter"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <div className="flex items-end pb-1">
                <p className="text-[10px] text-zinc-600 leading-tight italic font-serif">
                  Tokens increase rate limits from 60 to 5,000 requests per hour. Stored only in session memory.
                </p>
              </div>
            </div>

            <div className="pt-12">
              <div className="h-[1px] bg-gradient-to-r from-zinc-800 to-transparent mb-12"></div>
              
              {status === 'ready' ? (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={download}
                    className="group relative h-24 bg-white text-black font-black text-3xl uppercase tracking-tighter hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
                  >
                    Download
                    <Download className="w-8 h-8" />
                    <span className="absolute top-2 right-4 text-[10px] font-mono">EXPORT_CMD</span>
                  </button>
                  <button 
                    type="button"
                    onClick={reset}
                    className="h-24 border border-zinc-800 text-zinc-400 font-bold text-xl uppercase tracking-widest hover:text-white hover:border-white transition-all flex items-center justify-center gap-4"
                  >
                    Reset
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  type="submit"
                  disabled={status !== 'idle' && status !== 'error'}
                  className={`group relative w-full h-24 font-black text-3xl uppercase tracking-tighter transition-all active:scale-[0.98] ${
                    status === 'idle' || status === 'error' 
                      ? 'bg-white text-black hover:bg-zinc-200' 
                      : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                  }`}
                >
                  {status === 'idle' || status === 'error' ? 'Generate .txt' : 'Extracting...'}
                  <span className="absolute top-2 right-4 text-[10px] font-mono">
                    {status === 'idle' ? 'EXTRACT_START' : status.toUpperCase()}
                  </span>
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Process Monitor Section */}
        <section className="col-span-12 lg:col-span-12 xl:col-span-5 flex flex-col bg-[#0D0D0D] border-t lg:border-t-0 border-zinc-800">
          <div className="flex-1 p-12 space-y-8 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">Process Monitor</span>
              <span className="text-[10px] font-mono text-zinc-700 tracking-tighter">ID: TXT-990-23</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400 italic font-serif">
                  {status === 'idle' ? 'System Idle' : 
                   status === 'fetching_meta' ? 'Resolving Repository...' :
                   status === 'fetching_tree' ? 'Analyzing Tree Structure...' :
                   status === 'fetching_blobs' ? 'Downloading Blobs...' :
                   status === 'assembling' ? 'Constructing Digest...' :
                   status === 'ready' ? 'Process Terminated Successfully' : 'Error Signal Detected'}
                </span>
                <span className={status === 'ready' ? 'text-emerald-500' : 'text-white'}>
                  {status === 'ready' ? '100%' : `${progressPercentage}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: status === 'ready' ? '100%' : `${progressPercentage}%` }}
                  className={`h-full ${status === 'ready' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}
                />
              </div>
            </div>

            <div className="flex-1 font-mono text-[11px] leading-relaxed text-zinc-500 space-y-2 mt-8 overflow-y-auto max-h-[300px] scrollbar-hide">
              {logs.map((log, idx) => (
                <div key={idx} className={`flex gap-4 ${log.color || ''}`}>
                  <span className="text-zinc-800">[{log.time}]</span>
                  <span>{log.msg}</span>
                </div>
              ))}
              {status !== 'idle' && status !== 'ready' && status !== 'error' && (
                <div className="flex gap-4 animate-pulse">
                  <span className="text-zinc-800">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className="text-zinc-400">EXECUTING: DATA_EXTRACTION_SEQUENCE...</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-12 bg-zinc-900/50 border-t border-zinc-800 mt-auto">
            <div className="flex justify-between items-center opacity-40">
              <div className="flex gap-8">
                <div className="text-[10px] font-mono">NODES: {progress.total}</div>
                <div className="text-[10px] font-mono">REPO: {repoName || 'NULL'}</div>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest">
                {status === 'ready' ? 'Ready for output' : 'Wait for ready'}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="h-16 border-t border-zinc-800 flex items-center px-12 justify-between">
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">© 2024 REPODIGEST.ENGINEERING / RAW_DATA_EXTRACT</span>
        <div className="flex gap-8">
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Rate: {token ? '5000/hr' : '60/hr'} (current)</span>
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Environment: browser-side</span>
        </div>
      </footer>
    </div>
  );
}
