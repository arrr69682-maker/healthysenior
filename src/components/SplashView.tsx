import React from 'react';
import { Heart, Activity, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SplashViewProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onQuickSim: (role: 'elderly' | 'volunteer' | 'admin') => void;
}

export default function SplashView({ onLoginClick, onRegisterClick, onQuickSim }: SplashViewProps) {
  return (
    <div className="flex flex-col items-center justify-between min-h-[580px] h-full p-6 text-center select-none bg-gradient-to-b from-white to-emerald-50/20">
      {/* Decorative top elements */}
      <div className="w-12 h-1 bg-gray-200 rounded-full my-1 mx-auto" />

      {/* Main Branding Section */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {/* Beautiful Animated Heart Logo with Elderly inside */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative w-44 h-44 mb-6 flex items-center justify-center bg-white rounded-[40px] shadow-xl border-4 border-emerald-500/10 p-4"
        >
          {/* Heart Container Outer Glow */}
          <div className="absolute inset-0 bg-emerald-500/5 rounded-[40px] animate-pulse" />
          
          {/* Custom Elderly Logo SVG */}
          <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-500">
            {/* Soft pinkish heart background */}
            <path
              d="M100 160 C100 160 30 115 30 70 C30 35 60 25 100 65 C140 25 170 35 170 70 C170 115 100 160 100 160 Z"
              fill="rgba(239, 68, 68, 0.08)"
              stroke="rgba(255, 138, 101, 0.3)"
              strokeWidth="2"
            />
            {/* Elderly Man outline */}
            <g transform="translate(45, 60)" stroke="#4CAF7A" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Hair */}
              <path d="M 15 25 C 10 10, 35 10, 35 25" strokeWidth="5.5" stroke="#94A3B8" />
              {/* Glasses */}
              <circle cx="20" cy="27" r="6" stroke="#475569" strokeWidth="3" />
              <line x1="26" y1="27" x2="34" y2="27" stroke="#475569" strokeWidth="3" />
              <circle cx="40" cy="27" r="6" stroke="#475569" strokeWidth="3" />
              {/* Head / Face */}
              <path d="M 10 25 C 10 45, 45 45, 45 25" />
              {/* Ears */}
              <path d="M 10 28 Q 6 28 8 32" />
              <path d="M 45 28 Q 49 28 47 32" />
              {/* Smile */}
              <path d="M 22 36 Q 27 41 33 36" strokeWidth="3.5" />
              {/* Body / Shoulders */}
              <path d="M 2 55 Q 12 45 22 47" />
              <path d="M 33 47 Q 43 45 53 55" />
              {/* Collar */}
              <path d="M 22 47 L 27 53 L 33 47" />
            </g>

            {/* Elderly Woman outline */}
            <g transform="translate(95, 63)" stroke="#FF8A65" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Hair - Bun */}
              <circle cx="28" cy="10" r="8" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="3" />
              {/* Hair main */}
              <path d="M 10 25 C 10 12, 46 12, 46 25" strokeWidth="5" stroke="#CBD5E1" />
              {/* Head / Face */}
              <path d="M 13 25 C 13 45, 43 45, 43 25" />
              {/* Glasses */}
              <circle cx="20" cy="27" r="5" stroke="#475569" strokeWidth="3" />
              <circle cx="34" cy="27" r="5" stroke="#475569" strokeWidth="3" />
              <line x1="25" y1="27" x2="29" y2="27" stroke="#475569" strokeWidth="3" />
              {/* Smile */}
              <path d="M 22 36 Q 27 40 32 36" strokeWidth="3.5" />
              {/* Body / Shoulders */}
              <path d="M 2 52 Q 10 44 20 45" />
              <path d="M 32 45 Q 42 44 50 52" />
            </g>

            {/* Sweet Heart Graphic in Hand */}
            <path
              d="M100 132 C100 132 88 122 88 113 C88 106 93 103 100 110 C107 103 112 106 112 113 C112 122 100 132 100 132 Z"
              fill="#EF4444"
            />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          สูงวัย<span className="text-emerald-500">อุ่นใจ</span>
        </h1>
        
        <p className="text-sm font-medium text-amber-600 mt-1 uppercase tracking-wider font-mono">
          Senior Care Connect
        </p>

        <p className="text-base text-slate-500 mt-4 max-w-[260px] leading-relaxed">
          อุ่นใจในทุกวัน... เราจะอยู่เคียงข้างคุณ
        </p>
      </div>

      {/* Brand Values / Trust Badges */}
      <div className="grid grid-cols-3 gap-3 w-full my-5">
        <div className="flex flex-col items-center bg-emerald-500/5 p-2 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
          <span className="text-[10px] font-semibold text-slate-600">ปลอดภัย</span>
        </div>
        <div className="flex flex-col items-center bg-rose-500/5 p-2 rounded-xl">
          <Heart className="w-5 h-5 text-rose-500 mb-1 animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-600">ฉุกเฉิน 24 ชม.</span>
        </div>
        <div className="flex flex-col items-center bg-amber-500/5 p-2 rounded-xl">
          <Activity className="w-5 h-5 text-amber-600 mb-1" />
          <span className="text-[10px] font-semibold text-slate-600">ดูแลสุขภาพ</span>
        </div>
      </div>

      {/* Button controls */}
      <div className="w-full space-y-3 mt-auto">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onLoginClick}
          id="btn-splash-login"
          className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-600 transition-colors shadow-emerald-500/20 flex items-center justify-center cursor-pointer"
        >
          เข้าสู่ระบบ
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onRegisterClick}
          id="btn-splash-register"
          className="w-full py-3.5 bg-white text-emerald-600 rounded-2xl font-bold text-lg border-2 border-emerald-500/20 shadow-sm hover:bg-emerald-50/50 transition-colors flex items-center justify-center cursor-pointer"
        >
          ลงทะเบียนใหม่
        </motion.button>
      </div>

      {/* Quick Demo shortcuts footer */}
      <div className="mt-5 w-full pt-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 font-medium mb-2 flex items-center justify-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> ทดสอบระบบด่วน (เลือกบทบาทจำลอง)
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            onClick={() => onQuickSim('elderly')}
            className="py-1.5 px-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
          >
            ผู้สูงอายุ👵
          </button>
          <button
            onClick={() => onQuickSim('volunteer')}
            className="py-1.5 px-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer"
          >
            อาสาสมัคร🧑‍⚕️
          </button>
          <button
            onClick={() => onQuickSim('admin')}
            className="py-1.5 px-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-all cursor-pointer"
          >
            แอดมิน💻
          </button>
        </div>
      </div>
    </div>
  );
}
