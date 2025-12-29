
import React, { useState, useEffect } from 'react';
import { extractTextFromImage, generateReplies } from './services/geminiService';
import { authService, UserSession } from './libs/supabaseClient';
import UploadZone from './components/UploadZone';
import ControlPanel from './components/ControlPanel';
import ReplyCard from './components/ReplyCard';
import AuthModal from './components/AuthModal';
import SubscriptionModal from './components/SubscriptionModal';
import AdInterstitial from './components/AdInterstitial';
import AdminPanel from './components/AdminPanel';
import { AppStep, UserConfig, ReplyResponse, Goal, Tone, Language } from './types';
import { MessageSquareText, ChevronRight, AlertTriangle, Edit3, XCircle, User, Crown, LogOut, Shield } from 'lucide-react';

const App: React.FC = () => {
  // --- App State ---
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReplyResponse | null>(null);

  // --- Auth & Pro State ---
  const [session, setSession] = useState<UserSession | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [showAd, setShowAd] = useState(false);
  
  // --- Admin State ---
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // --- Config State ---
  const [config, setConfig] = useState<UserConfig>({
    goal: Goal.KEEP_GOING,
    tone: Tone.FRIENDLY,
    language: Language.PERSIAN,
    tarofLevel: 5,
    length: 'medium',
    additionalContext: ''
  });

  // --- Effects ---
  useEffect(() => {
    // Initial Load
    const user = authService.getSession();
    setSession(user);
    if (user) setIsPro(user.isPro);

    // Listen for auth changes
    const handleAuthChange = () => {
      const user = authService.getSession();
      setSession(user);
      setIsPro(user?.isPro || false);
      // If user logs out, close admin panel
      if (!user) setShowAdminPanel(false);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    handleReset();
  };

  // --- Handlers ---

  const handleImageSelected = async (base64: string) => {
    setImage(base64);
    setIsLoading(true);
    setError(null);
    try {
      const text = await extractTextFromImage(base64);
      setExtractedText(text);
      setStep(AppStep.EDIT_TEXT);
    } catch (err: any) {
      setError(err.message || "خطا در تحلیل تصویر");
      setImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = () => {
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    performGeneration();
  };

  const performGeneration = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateReplies(extractedText, config);
      setResults(response);
      
      if (isPro) {
        setStep(AppStep.RESULTS);
      } else {
        setShowAd(true); // Trigger Ad flow
      }
    } catch (err: any) {
      setError(err.message || "خطا در تولید پاسخ‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  const onAdComplete = () => {
    setShowAd(false);
    setStep(AppStep.RESULTS);
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setImage(null);
    setExtractedText('');
    setResults(null);
    setError(null);
    setShowAd(false);
    setShowAdminPanel(false); // Close admin panel on reset/home click
  };

  // Render logic helper
  const renderContent = () => {
    if (showAdminPanel && session?.isAdmin) {
      return <AdminPanel />;
    }

    if (error) {
       return (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start">
            <XCircle className="shrink-0 ms-1 me-2 mt-0.5" size={18} />
            <span className="text-sm">{error}</span>
          </div>
       );
    }

    switch (step) {
      case AppStep.UPLOAD:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2 mt-10">
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                نمی‌دونی چی جواب بدی؟
              </h2>
              <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
                یه اسکرین‌شات از چت آپلود کن، مودت رو انتخاب کن، تا هوش مصنوعی بهترین جواب رو برات بنویسه.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50">
              <UploadZone onImageSelected={handleImageSelected} isProcessing={isLoading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-slate-400 font-medium">
               <div className="bg-slate-100 rounded-lg p-2">✨ دستیار دلبری (Rizz)</div>
               <div className="bg-slate-100 rounded-lg p-2">🛡️ چک آداب معاشرت</div>
               <div className="bg-slate-100 rounded-lg p-2">🇮🇷 مود تعارف ایرانی</div>
            </div>
          </div>
        );
      
      case AppStep.EDIT_TEXT:
        return (
          <div className="space-y-6 max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-700 flex items-center">
                  <Edit3 size={14} className="ms-1 me-2 text-indigo-500" />
                  بازبینی و ویرایش متن
                </label>
                <span className="text-xs text-slate-400">مرحله ۱ از ۲</span>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                اگر متن اشتباه خوانده شده یا نیاز به سانسور نام‌ها دارید، اینجا ویرایش کنید.
              </p>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-64 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                dir="auto"
              />
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button 
                onClick={handleReset}
                className="flex-1 py-3 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                برگشت
              </button>
              <button 
                onClick={() => setStep(AppStep.CONFIGURE)}
                className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-transform active:scale-95"
              >
                بعدی: انتخاب لحن
              </button>
            </div>
          </div>
        );

      case AppStep.CONFIGURE:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 space-x-reverse text-slate-500 mb-2 cursor-pointer hover:text-indigo-600" onClick={() => setStep(AppStep.EDIT_TEXT)}>
              <ChevronRight size={16} />
              <span className="text-sm font-medium">برگشت به متن</span>
            </div>
            
            <ControlPanel 
              config={config} 
              setConfig={setConfig} 
              onGenerate={handleGenerateClick} 
              isGenerating={isLoading} 
            />
          </div>
        );

      case AppStep.RESULTS:
        return results ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">پیشنهادها</h2>
              <button 
                onClick={() => setStep(AppStep.CONFIGURE)}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                تغییر تنظیمات
              </button>
            </div>

            {/* Risk Flags */}
            {results.risk_flags && results.risk_flags.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h4 className="flex items-center text-orange-800 font-bold mb-2">
                  <AlertTriangle size={18} className="ms-1 me-2" /> هشدار ایمنی
                </h4>
                <ul className="list-disc list-inside text-sm text-orange-700 space-y-1 marker:text-orange-400">
                  {results.risk_flags.map((flag, i) => <li key={i}>{flag}</li>)}
                </ul>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Safest Option - Full Width */}
              <div className="md:col-span-2">
                 <ReplyCard reply={results.safest_reply} isSafest={true} />
              </div>

              {/* Other Options */}
              {results.reply_options.map((reply, idx) => (
                <ReplyCard key={idx} reply={reply} />
              ))}
            </div>

            {/* Follow Ups */}
            {results.follow_ups.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
                  استراتژی‌های پیشنهادی (Follow-ups)
                </h3>
                <div className="grid gap-3">
                  {results.follow_ups.map((tip, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg text-sm text-slate-600 flex items-start">
                      <span className="text-indigo-500 ms-1 me-2 font-bold">{idx + 1}.</span>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="h-8"></div>
          </div>
        ) : null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-10">
      
      {/* Modals & Overlays */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
           // User logged in, immediately trigger generation if we were waiting
           if (extractedText && step === AppStep.CONFIGURE) {
             performGeneration();
           }
        }} 
      />

      <SubscriptionModal 
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onUpgradeSuccess={() => setIsPro(true)}
      />

      {showAd && <AdInterstitial onComplete={onAdComplete} />}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse cursor-pointer" onClick={handleReset}>
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-lg text-white shadow-md">
              <MessageSquareText size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">ReplyLens</h1>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            {session ? (
              <>
                {/* Admin Button */}
                {session.isAdmin && (
                  <button 
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors
                      ${showAdminPanel ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                    `}
                  >
                    <Shield size={14} className="ml-1" />
                    مدیریت
                  </button>
                )}

                {!isPro && (
                  <button 
                    onClick={() => setIsSubModalOpen(true)}
                    className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center transition-colors"
                  >
                    <Crown size={14} className="ml-1" />
                    خرید اشتراک
                  </button>
                )}
                 {isPro && (
                  <div className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center">
                    <Crown size={14} className="ml-1 text-yellow-500" />
                    Pro
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="خروج"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors flex items-center"
              >
                <User size={16} className="ml-1" />
                ورود / ثبت‌نام
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
