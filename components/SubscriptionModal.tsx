import React, { useState } from 'react';
import { Check, X, Zap } from 'lucide-react';
import { authService } from '../libs/supabaseClient';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgradeSuccess }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    // Simulation of payment process
    setTimeout(async () => {
      try {
        await authService.upgradeUserToPro();
        onUpgradeSuccess();
        onClose();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-0 overflow-hidden shadow-2xl relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 left-4 z-10 text-white/80 hover:text-white">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <Zap size={48} className="mx-auto mb-4 text-yellow-300 drop-shadow-lg" />
          <h2 className="text-2xl font-black tracking-tight mb-2">نسخه حرفه‌ای</h2>
          <p className="text-indigo-100 text-sm">تجربه بدون تبلیغات و با سرعت بالا</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <ul className="space-y-3">
            {[
              'حذف کامل تبلیغات',
              'تولید پاسخ‌های نامحدود',
              'دسترسی به مودهای اختصاصی',
              'پشتیبانی اولویت‌دار'
            ].map((item, i) => (
              <li key={i} className="flex items-center text-slate-700 text-sm font-medium">
                <div className="bg-green-100 text-green-600 rounded-full p-1 ml-3">
                  <Check size={14} />
                </div>
                {item}
              </li>
            ))}
          </ul>

          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <span className="text-slate-400 text-xs line-through ml-2">۹۹,۰۰۰ تومان</span>
            <span className="text-slate-900 font-black text-xl">۴۹,۰۰۰ تومان</span>
            <span className="text-slate-500 text-xs block mt-1">پرداخت یک‌بار برای همیشه</span>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال پردازش...' : 'ارتقا به پرو'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;