import React, { useState } from 'react';
import ReasoningGraph from './components/ReasoningGraph';
import InputPanel from './components/InputPanel';
import AnalysisPanel from './components/AnalysisPanel';
import { analyzeReasoning } from './services/geminiService';
import { AnalysisResponse, ReasoningMode } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string, mode: ReasoningMode) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setSelectedNodeId(null);

    try {
      const result = await analyzeReasoning(text, mode);
      setAnalysisResult(result);
    } catch (err) {
      setError("Failed to analyze reasoning. Please check your API Key and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight">
              ReasonSketch
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">Cognitive Instrument v1.0</span>
          </div>
          <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Documentation</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Col: Input & Analysis List */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
          <InputPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          <div className="flex-1 min-h-0 bg-slate-900/50 rounded-xl border border-slate-800 p-4 overflow-y-auto">
             {error ? (
                <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-300 rounded-lg text-sm">
                  {error}
                </div>
             ) : (
               <AnalysisPanel result={analysisResult} selectedNodeId={selectedNodeId} />
             )}
          </div>
        </div>

        {/* Right Col: Visualization */}
        <div className="lg:col-span-8 h-full min-h-[500px] flex flex-col">
          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl relative overflow-hidden">
            {analysisResult ? (
              <ReasoningGraph 
                data={analysisResult.reasoning_map} 
                onNodeClick={handleNodeClick} 
              />
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900/50">
                  <div className="w-64 h-64 border border-slate-800 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 rounded-full border border-slate-700 animate-[spin_10s_linear_infinite] opacity-20"></div>
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-24 h-24 opacity-20">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                    </svg>
                  </div>
                  <p className="text-lg font-light tracking-wide">Waiting for cognitive input...</p>
               </div>
            )}
            
            {/* Overlay Title for graph */}
            <div className="absolute top-4 left-4 pointer-events-none">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Reasoning Map</h2>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;