import React, { useState, useEffect } from 'react';
import { ReasoningMode } from '../types';

interface InputPanelProps {
  onAnalyze: (text: string, mode: ReasoningMode) => void;
  isLoading: boolean;
}

const EXAMPLE_TEXT = "We should clearly ban all cars from the city center immediately. Pollution is killing the planet and making kids sick. Plus, I saw a study on Twitter that said car-free cities are 50% happier. If we don't act now, the city will be unlivable in 5 years.";

const InputPanel: React.FC<InputPanelProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<ReasoningMode>(ReasoningMode.MAP);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setText(prev => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, []);

  const toggleListening = () => {
    if (!speechRecognition) return;
    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
      setIsListening(true);
    }
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    onAnalyze(text, mode);
  };

  const loadExample = () => {
    setText(EXAMPLE_TEXT);
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-100">Input Reasoning</h2>
        <div className="flex gap-2">
          {Object.values(ReasoningMode).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                mode === m
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {m.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <textarea
          className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none font-mono text-sm"
          placeholder="Paste an argument, belief, or plan here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
        />
        
        {/* Voice Button */}
        {speechRecognition && (
          <button
            onClick={toggleListening}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${
              isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
            }`}
            title="Dictate"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex justify-start">
        <button
          onClick={loadExample}
          disabled={isLoading}
          className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Load Example Argument
        </button>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading || !text.trim()}
        className={`w-full py-3 rounded-lg font-semibold tracking-wide transition-all ${
          isLoading
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          "DECOMPOSE & ANALYZE"
        )}
      </button>
    </div>
  );
};

export default InputPanel;