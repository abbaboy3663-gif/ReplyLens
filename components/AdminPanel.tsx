
import React, { useEffect, useState } from 'react';
import { authService, UserSession } from '../libs/supabaseClient';
import { Users, Crown, Shield, Search, TrendingUp, DollarSign, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
    setCurrentUser(authService.getSession());
  }, []);

  const loadData = () => {
    const allUsers = authService.getAllUsers();
    setUsers(allUsers);
  };

  // Stats
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.isPro).length;
  const totalRevenue = proUsers * 49000;

  // Actions
  const handleTogglePro = async (user: any) => {
    if (user.isAdmin) return; // Don't touch admin
    const newStatus = !user.isPro;
    await authService.updateUser(user.id, { isPro: newStatus });
    loadData();
  };

  const handleDeleteUser = async (user: any) => {
    if (user.isAdmin) {
      alert("نمی‌توانید مدیر سیستم را حذف کنید.");
      return;
    }
    if (window.confirm(`آیا مطمئن هستید که می‌خواهید کاربر ${user.email} را حذف کنید؟ این عملیات غیرقابل بازگشت است.`)) {
      await authService.deleteUser(user.id);
      loadData();
    }
  };

  // Filter
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      <div className="text-center space-y-2 mt-4">
        <h2 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center">
          <Shield className="mr-2 text-indigo-600" /> پنل مدیریت
        </h2>
        <p className="text-slate-500">مشاهده آمار و مدیریت کاربران</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center group hover:border-indigo-300 transition-colors">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <span className="text-slate-500 text-sm font-medium">کل کاربران</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{totalUsers}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center group hover:border-amber-300 transition-colors">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600 mb-3 group-hover:scale-110 transition-transform">
            <Crown size={24} />
          </div>
          <span className="text-slate-500 text-sm font-medium">کاربران ویژه (Pro)</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{proUsers}</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center group hover:border-emerald-300 transition-colors">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
          <span className="text-slate-500 text-sm font-medium">درآمد تخمینی</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{totalRevenue.toLocaleString()} <span className="text-xs text-slate-400">تومان</span></span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-700 flex items-center">
            <TrendingUp size={18} className="me-2 text-slate-400" />
            لیست کاربران
          </h3>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="جستجو در ایمیل..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ایمیل</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">نقش</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium flex flex-col">
                      <span>{user.email}</span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5">{user.id.substring(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isPro ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Crown size={12} className="me-1" /> Pro
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          رایگان
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="text-indigo-600 font-bold flex items-center">
                          <Shield size={14} className="me-1" /> مدیر
                        </span>
                      ) : (
                        <span className="text-slate-500">کاربر</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2 space-x-reverse opacity-50 group-hover:opacity-100 transition-opacity">
                        {!user.isAdmin && (
                          <>
                            <button 
                              onClick={() => handleTogglePro(user)}
                              className={`p-2 rounded-lg transition-colors ${user.isPro ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200' : 'text-amber-500 hover:text-amber-700 hover:bg-amber-100'}`}
                              title={user.isPro ? "لغو اشتراک Pro" : "ارتقا به Pro"}
                            >
                              {user.isPro ? <XCircle size={18} /> : <Crown size={18} />}
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف کاربر"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {user.isAdmin && (
                          <span className="text-xs text-slate-300 cursor-not-allowed">بدون عملیات</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    کاربری یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
