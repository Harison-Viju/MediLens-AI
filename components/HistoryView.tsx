import React from 'react';
import { ScanHistoryItem } from '../types';
import { Calendar, ChevronRight, Trash2, ArrowLeft } from 'lucide-react';

interface Props {
  history: ScanHistoryItem[];
  onSelect: (item: ScanHistoryItem) => void;
  onBack: () => void;
  onClear: () => void;
}

const HistoryView: React.FC<Props> = ({ history, onSelect, onBack, onClear }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900">Patient History</h2>
        </div>
        
        {history.length > 0 && (
            <button 
                onClick={() => {
                    if(window.confirm('Are you sure you want to delete all history? This cannot be undone.')) {
                        onClear();
                    }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
            >
                <Trash2 className="w-3 h-3" />
                Clear All
            </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No previous scans found.</p>
          <p className="text-slate-400 text-sm mt-1">Your analysis history will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 pb-10">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-teal-100 transition-all text-left group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                <img src={item.imageUrl} alt="Scan" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 truncate">{item.analysis.condition_name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.timestamp).toLocaleDateString()} &bull; {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    item.analysis.urgency_level === 'Emergency' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.analysis.urgency_level}
                  </div>
                 <div className="flex items-center text-teal-600 text-xs font-bold">
                    Score: {item.analysis.severity_score}
                 </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;