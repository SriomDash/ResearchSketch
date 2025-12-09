import React from 'react';
import { AnalysisResponse, Node } from '../types';

interface AnalysisPanelProps {
  result: AnalysisResponse | null;
  selectedNodeId: string | null;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, selectedNodeId }) => {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border border-slate-700/50 rounded-xl bg-slate-800/20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 opacity-50">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
        <p className="text-lg font-medium">No Analysis Data</p>
        <p className="text-sm">Input reasoning to see structural decomposition.</p>
      </div>
    );
  }

  const selectedNode = result.reasoning_map.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
      
      {/* Selection Detail */}
      {selectedNode && (
        <div className="bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500 shadow-lg animate-fade-in">
          <div className="text-xs text-blue-400 font-bold uppercase mb-1">{selectedNode.type} Node</div>
          <div className="text-lg text-white">{selectedNode.text}</div>
        </div>
      )}

      {/* Fragile Points */}
      {result.fragile_points.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-red-900/50 overflow-hidden">
          <div className="bg-red-900/20 px-4 py-3 border-b border-red-900/30 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-bold text-red-200">Fragile Points</h3>
          </div>
          <div className="p-4 space-y-3">
            {result.fragile_points.map((fp, i) => {
              const node = result.reasoning_map.nodes.find(n => n.id === fp.node_id);
              return (
                <div key={i} className="text-sm">
                  <span className="font-semibold text-red-300 block mb-1">
                     If "{node ? node.text.substring(0, 30) + '...' : fp.node_id}" is wrong:
                  </span>
                  <span className="text-slate-400">{fp.why_fragile}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Variables */}
      {result.missing_variables.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
           <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-slate-200">Missing Variables</h3>
          </div>
          <ul className="p-4 list-disc list-inside text-sm text-slate-400 space-y-1">
            {result.missing_variables.map((mv, i) => (
              <li key={i}>{mv}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mode Specific: Rewritten Content */}
      {result.rewritten_reasoning && (
        <div className="bg-emerald-900/10 rounded-xl border border-emerald-900/50 overflow-hidden">
           <div className="bg-emerald-900/20 px-4 py-3 border-b border-emerald-900/30 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="font-bold text-emerald-200">Rewritten Reasoning</h3>
          </div>
          <div className="p-4">
             <div className="text-slate-300 font-serif leading-relaxed italic border-l-2 border-emerald-700 pl-4 mb-4">
                "{result.rewritten_reasoning}"
             </div>
             {result.changes_made && (
               <div className="mt-4">
                 <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Structural Changes</h4>
                 <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                   {result.changes_made.map((change, i) => (
                     <li key={i}>{change}</li>
                   ))}
                 </ul>
               </div>
             )}
          </div>
        </div>
      )}
      
      {/* Mode Specific: Teaching Points */}
      {result.teaching_points && (
        <div className="bg-blue-900/10 rounded-xl border border-blue-900/50 overflow-hidden">
           <div className="bg-blue-900/20 px-4 py-3 border-b border-blue-900/30 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="font-bold text-blue-200">Cognitive Patterns</h3>
          </div>
          <div className="p-4 text-sm text-slate-300">
             <ul className="space-y-2 list-disc list-inside">
                {result.teaching_points.map((tp, i) => (
                  <li key={i}>{tp}</li>
                ))}
             </ul>
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalysisPanel;