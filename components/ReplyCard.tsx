import React, { useState } from 'react';
import { Copy, Check, ShieldCheck } from 'lucide-react';
import { GeneratedReply } from '../types';

interface ReplyCardProps {
  reply: GeneratedReply;
  isSafest?: boolean;
}

const ReplyCard: React.FC<ReplyCardProps> = ({ reply, isSafest = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reply.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`
      relative group rounded-xl p-5 border transition-all duration-200
      ${isSafest 
        ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }
    `}>
      {isSafest && (
        <div className="absolute -top-3 right-4 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center border border-emerald-200">
          <ShieldCheck size={12} className="me-1" /> گزینه مطمئن
        </div>
      )}

      <div className="flex justify-between items-start mb-2 mt-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isSafest ? 'text-emerald-700 bg-emerald-100/50' : 'text-slate-500 bg-slate-100'}`}>
          {reply.tone_label}
        </span>
        <button 
          onClick={handleCopy}
          className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
          title="کپی متن"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
        </button>
      </div>

      <p className="text-slate-800 font-medium text-lg leading-relaxed mb-3 break-words font-sans">
        {reply.text}
      </p>

      <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-2">
        {reply.explanation}
      </p>
    </div>
  );
};

export default ReplyCard;