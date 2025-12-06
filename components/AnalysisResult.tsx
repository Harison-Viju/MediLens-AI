import React, { useState, useEffect } from 'react';
import { MedicalAnalysis } from '../types';
import { 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  Info, 
  Stethoscope, 
  ArrowRight, 
  Volume2, 
  Square,
  MapPin, 
  Share2,
  FileText
} from 'lucide-react';

interface Props {
  data: MedicalAnalysis;
  onReset: () => void;
}

const AnalysisResult: React.FC<Props> = ({ data, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToRead = `${data.condition_name}. Severity ${data.severity_score} out of 10. ${data.summary}. Recommended actions: ${data.immediate_actions.join(', ')}.`;
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.onend = () => setIsPlaying(false);
    // Attempt to match the detected language if possible, defaulting to English
    // In a real app, we'd map the selectedLanguage prop to an ISO code (e.g., 'es-ES')
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleShare = async () => {
    const text = `MediLens Analysis:\nCondition: ${data.condition_name}\nSeverity: ${data.severity_score}/10\nSummary: ${data.summary}\n\nDisclaimer: AI generation, consult a doctor.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MediLens Health Report',
          text: text,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Report copied to clipboard!');
    }
  };

  const handleFindCare = () => {
    // Construct a search query based on the condition
    const query = `${data.condition_name} doctor near me`;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
  };

  const getSeverityColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100 border-green-200';
    if (score <= 7) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'Emergency': return 'bg-red-600 text-white animate-pulse';
      case 'Urgent': return 'bg-orange-500 text-white';
      case 'Monitor': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className={`p-6 ${data.urgency_level === 'Emergency' ? 'bg-red-50' : 'bg-slate-50'} border-b border-slate-100`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{data.condition_name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getUrgencyColor(data.urgency_level)}`}>
                  {data.urgency_level}
                </span>
                <span className="text-slate-500 text-sm font-medium">AI Confidence: High</span>
              </div>
            </div>
            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 ${getSeverityColor(data.severity_score)}`}>
              <span className="text-2xl font-bold">{data.severity_score}</span>
              <span className="text-[10px] uppercase font-bold opacity-80">Severity</span>
            </div>
          </div>
          <p className="text-slate-700 leading-relaxed text-lg">{data.summary}</p>
          
          {/* Action Bar */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/50 overflow-x-auto">
            <button 
                onClick={handleSpeak}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all whitespace-nowrap"
            >
                {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                {isPlaying ? 'Stop' : 'Read Aloud'}
            </button>
            <button 
                onClick={handleFindCare}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all whitespace-nowrap"
            >
                <MapPin className="w-4 h-4 text-red-500" />
                Find Care
            </button>
            <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all whitespace-nowrap"
            >
                <Share2 className="w-4 h-4 text-blue-500" />
                Share Report
            </button>
          </div>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2">
            {/* Immediate Actions */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-teal-700 mb-2">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Recommended Actions</h3>
                </div>
                <ul className="space-y-3">
                    {data.immediate_actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-teal-50 p-3 rounded-xl border border-teal-100">
                            <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                            <span className="text-teal-900 text-sm font-medium">{action}</span>
                        </li>
                    ))}
                </ul>
            </div>

             {/* Medical Reasoning */}
             <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 mb-2">
                    <Stethoscope className="w-5 h-5" />
                    <h3 className="font-bold text-lg">AI Reasoning</h3>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900 text-sm leading-relaxed">
                    {data.medical_reasoning}
                </div>
                
                <div className="mt-4">
                     <div className="flex items-center gap-2 text-indigo-700 mb-2">
                        <Info className="w-5 h-5" />
                        <h3 className="font-bold text-sm">Ask a Doctor</h3>
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                        {data.questions_for_doctor.map((q, i) => (
                            <li key={i}>{q}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800 text-xs leading-relaxed font-medium">
          {data.disclaimer}
        </p>
      </div>

      <button
        onClick={onReset}
        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
      >
        Start New Analysis <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AnalysisResult;