import React, { useState } from 'react';
import { authService } from '../libs/supabaseClient';
import { X, Mail, Lock, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await authService.signIn(email, password);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authService.signUp(email, password);
        if (error) throw new Error(error.message);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
          {isLogin ? 'ورود به حساب' : 'ساخت حساب جدید'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'ورود' : 'ثبت نام')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? 'حساب ندارید؟' : 'قبلاً ثبت نام کرده‌اید؟'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 font-bold mr-1 hover:underline"
          >
            {isLogin ? 'ساخت حساب' : 'وارد شوید'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;