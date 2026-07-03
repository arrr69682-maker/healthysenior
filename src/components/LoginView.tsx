import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getDB } from '../lib/db';
import { User as AppUser, UserType } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  onRegisterClick: () => void;
  onBack: () => void;
}

export default function LoginView({ onLoginSuccess, onRegisterClick, onBack }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const db = getDB();
      const matchedUser = db.users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      // In real code we'd match password. For prototype simulation, any password is fine
      // but let's encourage at least typing something or matched mock users
      if (matchedUser) {
        onLoginSuccess(matchedUser);
      } else {
        setError('ไม่พบอีเมลผู้ใช้งานนี้ หรือรหัสผ่านไม่ถูกต้อง');
      }
      setIsLoading(false);
    }, 800);
  };

  // Preset Fast Login helper
  const handleQuickLogin = (presetEmail: string) => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const db = getDB();
      const matchedUser = db.users.find(u => u.email === presetEmail);
      if (matchedUser) {
        onLoginSuccess(matchedUser);
      }
      setIsLoading(false);
    }, 500);
  };

  // Google Login simulation
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      // Log in as default elderly Grandma Somjai
      const db = getDB();
      const somjaiUser = db.users.find(u => u.email === 'somjai@gmail.com');
      if (somjaiUser) {
        onLoginSuccess(somjaiUser);
      } else {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sign-in');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-[580px] h-full p-6 text-slate-800 bg-white select-none">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          id="btn-login-back"
          className="p-2 -ml-2 text-slate-600 hover:text-emerald-500 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold text-slate-800 ml-2">เข้าสู่ระบบ</span>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-5">
        <div className="text-left space-y-1.5">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">ยินดีต้อนรับกลับมา</h2>
          <p className="text-slate-500 text-sm">กรุณากรอกข้อมูลของคุณเพื่อเข้าใช้งาน สูงวัยอุ่นใจ</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 font-medium text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">อีเมล</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="somjai@gmail.com"
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500">รหัสผ่าน</label>
              <button type="button" className="text-xs text-emerald-600 hover:underline cursor-pointer font-medium">
                ลืมรหัสผ่าน?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="ป้อนรหัสผ่าน 6 หลักของคุณ"
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            id="btn-submit-login"
            className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-md hover:bg-emerald-600 transition-colors shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:bg-emerald-400"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                เข้าสู่ระบบ
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Separator */}
        <div className="relative my-4 flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            หรือ
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Google Login Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3 bg-white text-slate-700 rounded-2xl font-bold text-sm border-2 border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
        >
          {/* SVG Google icon */}
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01 1 12 1 7.24 1 3.21 3.73 1.25 7.72l3.86 3C6.01 7.72 8.78 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.88 3.75-8.54z"
            />
            <path
              fill="#FBBC05"
              d="M5.11 10.72c-.25-.72-.39-1.5-.39-2.31 0-.81.14-1.59.39-2.31L1.25 3.1A11.967 11.967 0 000 8.41c0 1.95.47 3.8 1.25 5.43l3.86-3.12z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.1.74-2.52 1.18-4.3 1.18-3.22 0-5.99-2.68-6.89-5.68L1.25 15.86C3.21 19.86 7.24 23 12 23z"
            />
          </svg>
          ลงชื่อเข้าใช้ด้วย Google
        </motion.button>

        {/* Quick Testing Badges Container */}
        <div className="bg-emerald-50/40 p-4 border border-emerald-500/10 rounded-2xl text-left space-y-2">
          <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" /> เข้าสู่ระบบด่วนสำหรับการทดสอบ:
          </p>
          <div className="grid grid-cols-1 gap-1.5 text-[11px]">
            <button
              onClick={() => handleQuickLogin('somjai@gmail.com')}
              className="py-1 px-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>👵 ผู้สูงอายุ (คุณยายสมใจ)</span>
              <span className="text-[9px] text-emerald-600">somjai@gmail.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin('kittipong@gmail.com')}
              className="py-1 px-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>🧑‍⚕️ อาสาสมัคร (คุณกิตติพงษ์)</span>
              <span className="text-[9px] text-emerald-600">kittipong@gmail.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin@seniorcare.org')}
              className="py-1 px-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-slate-400 hover:bg-slate-100 transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <span>💻 แอดมิน (ผู้ดูแลระบบ)</span>
              <span className="text-[9px] text-slate-500">admin@seniorcare.org</span>
            </button>
          </div>
        </div>
      </div>

      {/* Register Offer Footer */}
      <div className="mt-auto text-center pt-6">
        <p className="text-sm text-slate-500">
          ยังไม่มีบัญชีผู้ใช้?{' '}
          <button
            onClick={onRegisterClick}
            className="text-emerald-600 font-bold hover:underline focus:outline-none cursor-pointer"
          >
            สมัครสมาชิกใหม่
          </button>
        </p>
      </div>
    </div>
  );
}
