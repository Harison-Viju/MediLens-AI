import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, StopCircle, RefreshCw, History, HeartPulse, Globe, ShieldCheck, X, Lock } from 'lucide-react';
import { analyzeMedicalInput } from './services/geminiService';
import AnalysisResult from './components/AnalysisResult';
import HistoryView from './components/HistoryView';
import { AppView, MedicalAnalysis, ScanHistoryItem, Language } from './types';
import { SUPPORTED_LANGUAGES } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [textDescription, setTextDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalAnalysis | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [showTerms, setShowTerms] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mediLensHistory');
    if (saved) {
      setScanHistory(JSON.parse(saved));
    }
    const hasSeenTerms = localStorage.getItem('mediLensTerms');
    if (!hasSeenTerms) {
      setShowTerms(true);
    }
  }, []);

  const handleTermsAccept = () => {
    localStorage.setItem('mediLensTerms', 'true');
    setShowTerms(false);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('mediLensHistory');
    setScanHistory([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setView(AppView.ANALYZE);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage && !textDescription && !audioBlob) {
      alert("Please provide an image, voice description, or text.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeMedicalInput(selectedImage, audioBlob, textDescription, selectedLanguage);
      setAnalysisResult(result);
      
      // Save to history
      if (selectedImage && imagePreview) {
        const newScan: ScanHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          imageUrl: imagePreview,
          analysis: result
        };
        const updatedHistory = [newScan, ...scanHistory];
        setScanHistory(updatedHistory);
        localStorage.setItem('mediLensHistory', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setSelectedImage(null);
    setImagePreview(null);
    setAudioBlob(null);
    setTextDescription('');
    setView(AppView.LANDING);
  };

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-4 max-w-lg">
        <div className="bg-teal-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-teal-100">
          <HeartPulse className="w-10 h-10 text-teal-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          MediLens <span className="text-teal-600">AI</span>
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed">
          Advanced medical assessment for everyone, everywhere. 
          Powered by Gemini 2.5 Multimodal Intelligence.
        </p>
      </div>

      <div className="w-full max-w-md bg-white p-2 rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative z-10">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-teal-600" />
                </div>
                <p className="mb-1 text-sm text-slate-700 font-semibold">Take a Photo</p>
                <p className="text-xs text-slate-400">or upload an image</p>
            </div>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
        </label>
      </div>

      <button 
        onClick={() => setView(AppView.HISTORY)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium"
      >
        <History className="w-4 h-4" /> View Previous Scans
      </button>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40">
         <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
            <Globe className="w-4 h-4 text-slate-400" />
            <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer"
            >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                ))}
            </select>
         </div>
      </div>
    </div>
  );

  const renderAnalyzeInput = () => (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-20 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
          <button onClick={resetAnalysis} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Cancel</button>
          <h2 className="font-bold text-slate-900">New Analysis</h2>
          <div className="w-10"></div>
      </div>

      <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden shadow-lg group">
        {imagePreview && (
          <>
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            {isAnalyzing && (
              <div className="absolute inset-0 z-20 bg-slate-900/40">
                {/* Scanning Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-teal-400/80 shadow-[0_0_15px_rgba(45,212,191,0.8)] animate-[scan_2s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                      Analyzing Image...
                   </div>
                </div>
              </div>
            )}
          </>
        )}
        {!isAnalyzing && (
            <label className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-slate-900 p-3 rounded-full cursor-pointer shadow-lg hover:bg-white transition-all z-10">
            <RefreshCw className="w-5 h-5" />
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
            </label>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Add Context</h3>
        
        {/* Audio Input */}
        <div className="flex items-center gap-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isAnalyzing}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                    isRecording 
                    ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' 
                    : audioBlob 
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
            >
                {isRecording ? <><StopCircle className="w-5 h-5" /> Stop Recording</> : 
                 audioBlob ? <><Mic className="w-5 h-5" /> Re-record Audio</> : 
                 <><Mic className="w-5 h-5" /> Describe Symptoms</>}
            </button>
        </div>

        {/* Text Input */}
        <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            disabled={isAnalyzing}
            placeholder="Type symptoms here (optional)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all resize-none"
            rows={2}
        />
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
            <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
            </>
        ) : (
            <>Analyze Condition</>
        )}
      </button>
      
      {isAnalyzing && (
        <div className="text-center text-xs text-slate-400">
            Comparing against medical knowledge base...
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 flex flex-col">
      <style>
        {`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
        `}
      </style>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 flex items-center px-4 justify-between md:justify-center transition-all duration-300">
         <div className="flex items-center gap-2 cursor-pointer" onClick={resetAnalysis}>
            <div className="bg-teal-600 p-1.5 rounded-lg">
                <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">MediLens AI</span>
         </div>
         {/* Mobile placeholder for alignment */}
         <div className="w-8 md:hidden"></div>
      </header>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
             <div className="flex items-center gap-3 text-teal-700 mb-2">
                <ShieldCheck className="w-8 h-8" />
                <h3 className="font-bold text-xl">Medical Disclaimer</h3>
             </div>
             <p className="text-slate-600 text-sm leading-relaxed">
               MediLens AI is an assistive tool, not a doctor. Results are for informational purposes only.
               <br/><br/>
               <strong>Always consult a professional healthcare provider for medical decisions.</strong>
             </p>
             <button 
                onClick={handleTermsAccept}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
             >
                I Understand & Accept
             </button>
          </div>
        </div>
      )}

      <main className="flex-grow pt-20 pb-8 container mx-auto max-w-2xl">
        {view === AppView.LANDING && renderLanding()}
        {view === AppView.ANALYZE && !analysisResult && renderAnalyzeInput()}
        {view === AppView.ANALYZE && analysisResult && (
            <div className="px-4">
                <AnalysisResult data={analysisResult} onReset={resetAnalysis} />
            </div>
        )}
        {view === AppView.HISTORY && (
            <div className="px-4">
                <HistoryView 
                    history={scanHistory} 
                    onSelect={(item) => {
                        setImagePreview(item.imageUrl);
                        setAnalysisResult(item.analysis);
                        setView(AppView.ANALYZE);
                    }}
                    onBack={() => setView(AppView.LANDING)}
                    onClear={handleClearHistory}
                />
            </div>
        )}
      </main>

      {/* Privacy Footer */}
      <footer className="py-6 text-center text-slate-400 text-[10px] px-4">
        <div className="flex items-center justify-center gap-1 mb-1">
            <Lock className="w-3 h-3" />
            <span>Privacy First Design</span>
        </div>
        <p>MediLens AI processes data securely via Google Gemini. Personal data is stored locally on your device.</p>
      </footer>
    </div>
  );
};

export default App;