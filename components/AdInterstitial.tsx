
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AdInterstitialProps {
  onComplete: () => void;
}

const AdInterstitial: React.FC<AdInterstitialProps> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-6">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
        <div className="mb-2 uppercase text-xs font-bold tracking-widest text-white/50 border border-white/20 inline-block px-2 py-1 rounded">
          آگهی تبلیغاتی
        </div>
        
        {/* Ad Placeholder Box */}
        <div className="bg-slate-800 rounded-xl h-64 w-full my-6 flex items-center justify-center border-2 border-dashed border-slate-600">
          <p className="text-slate-500 font-medium">محل نمایش تبلیغ شما</p>
        </div>

        <p className="text-lg font-bold mb-6">پاسخ شما آماده است...</p>

        <button
          onClick={onComplete}
          disabled={timeLeft > 0}
          className={`
            w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center
            ${timeLeft > 0 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/10'
            }
          `}
        >
          {timeLeft > 0 ? (
            <>
              <Loader2 className="animate-spin ml-2" size={18} />
              {timeLeft} ثانیه تا رد کردن
            </>
          ) : (
             'مشاهده پاسخ'
          )}
        </button>
      </div>
      
      <p className="mt-8 text-sm text-slate-500">
        با خرید نسخه حرفه‌ای، تبلیغات را حذف کنید.
      </p>
    </div>
  );
};

export default AdInterstitial;
