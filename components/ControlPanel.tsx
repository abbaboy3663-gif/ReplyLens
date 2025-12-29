
import React from 'react';
import { Goal, Tone, Language, UserConfig } from '../types';
import { Sparkles, Languages, MessageCircle, Ruler, FileText } from 'lucide-react';

interface ControlPanelProps {
  config: UserConfig;
  setConfig: React.Dispatch<React.SetStateAction<UserConfig>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onGenerate, isGenerating }) => {
  
  const handleChange = <K extends keyof UserConfig>(key: K, value: UserConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Check if Persian/Finglish to show Tarof
  const isIranianLang = config.language === Language.PERSIAN || config.language === Language.FINGLISH;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 w-full max-w-lg mx-auto">
      <div className="space-y-5">
        
        {/* Language */}
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
            <Languages size={16} className="ms-1 me-2 text-indigo-500" /> زبان پاسخ
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.values(Language).map((lang) => (
              <button
                key={lang}
                onClick={() => handleChange('language', lang)}
                className={`text-sm py-2 px-3 rounded-lg border transition-all ${
                  config.language === lang
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
            <Sparkles size={16} className="ms-1 me-2 text-indigo-500" /> هدف شما
          </label>
          <select 
            value={config.goal}
            onChange={(e) => handleChange('goal', e.target.value as Goal)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {Object.values(Goal).map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
            <MessageCircle size={16} className="ms-1 me-2 text-indigo-500" /> لحن و مود
          </label>
          <select 
            value={config.tone}
            onChange={(e) => handleChange('tone', e.target.value as Tone)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {Object.values(Tone).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Additional Context (New) */}
        <div>
          <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
            <FileText size={16} className="ms-1 me-2 text-indigo-500" /> توضیحات تکمیلی (اختیاری)
          </label>
          <textarea 
            value={config.additionalContext || ''}
            onChange={(e) => handleChange('additionalContext', e.target.value)}
            placeholder="مثلاً: ما قبلاً با هم دعوا کردیم، یا این همکارمه و باید رسمی باشم..."
            className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
          />
        </div>

        {/* Tarof Slider (Conditional) */}
        {isIranianLang && (
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
             <div className="flex justify-between items-center mb-2">
               <label className="text-sm font-semibold text-amber-900">
                 میزان تعارف
               </label>
               <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-1 rounded-md">
                 {config.tarofLevel}/10
               </span>
             </div>
             <input
               type="range"
               min="0"
               max="10"
               step="1"
               value={config.tarofLevel}
               onChange={(e) => handleChange('tarofLevel', parseInt(e.target.value))}
               className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600 dir-ltr"
               style={{ direction: 'ltr' }} 
             />
             <div className="flex justify-between text-xs text-amber-700 mt-1">
               <span>مستقیم</span>
               <span>معمولی</span>
               <span>مجلسی</span>
             </div>
          </div>
        )}

        {/* Length */}
        <div>
           <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
            <Ruler size={16} className="ms-1 me-2 text-indigo-500" /> طول پاسخ
          </label>
          <div className="flex space-x-2 space-x-reverse">
            {[
              { id: 'short', label: 'کوتاه' }, 
              { id: 'medium', label: 'متوسط' }, 
              { id: 'long', label: 'طولانی' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleChange('length', opt.id as any)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border ${
                  config.length === opt.id 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.98]
          ${isGenerating 
            ? 'bg-indigo-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200'
          }`}
      >
        {isGenerating ? 'در حال نوشتن...' : 'تولید پاسخ‌ها'}
      </button>
    </div>
  );
};

export default ControlPanel;
