import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, User, Eye, Activity, MessageSquare, Star, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { UserType, SOSStatus } from '../types';

interface SimControllerProps {
  currentRole: UserType | null;
  activeSosId: string | null;
  sosStatus: SOSStatus | null;
  onRoleSwitch: (role: UserType) => void;
  onRunAutoDemo: () => void;
  onResetDatabase: () => void;
  simLogs: string[];
  isDemoRunning: boolean;
}

export default function SimController({
  currentRole,
  activeSosId,
  sosStatus,
  onRoleSwitch,
  onRunAutoDemo,
  onResetDatabase,
  simLogs,
  isDemoRunning,
}: SimControllerProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-slate-900 border-2 border-slate-800 text-slate-100 rounded-3xl p-5 w-full md:w-[320px] shadow-2xl flex flex-col justify-between space-y-4 text-left select-none max-h-[640px] overflow-y-auto">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse" />
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">
            ระบบจำลองสถานการณ์
          </h2>
        </div>
        <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
          v1.2.0 (Live Dev)
        </span>
      </div>

      {/* --- INSTANT ROLE HOVER SWITCHES --- */}
      <div className="space-y-2">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
          1. สลับบัญชีบทบาท (Hot Swap Role)
        </span>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <button
            onClick={() => onRoleSwitch(UserType.ELDERLY)}
            disabled={isDemoRunning}
            className={`py-2 px-1 rounded-xl font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50 ${
              currentRole === UserType.ELDERLY
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            👵
            <span className="text-[9px]">ผู้สูงอายุ</span>
          </button>
          
          <button
            onClick={() => onRoleSwitch(UserType.VOLUNTEER)}
            disabled={isDemoRunning}
            className={`py-2 px-1 rounded-xl font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50 ${
              currentRole === UserType.VOLUNTEER
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            🧑‍⚕️
            <span className="text-[9px]">อาสาสมัคร</span>
          </button>

          <button
            onClick={() => onRoleSwitch(UserType.ADMIN)}
            disabled={isDemoRunning}
            className={`py-2 px-1 rounded-xl font-bold border transition-all flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50 ${
              currentRole === UserType.ADMIN
                ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            💻
            <span className="text-[9px]">แอดมิน</span>
          </button>
        </div>
      </div>

      {/* --- LIVE DEMO AUTOMATION LOOP --- */}
      <div className="bg-slate-800/40 p-3.5 border border-slate-800 rounded-2xl space-y-2.5 text-left">
        <div>
          <span className="text-xs font-black text-slate-200 block">⚡ เล่นภาพรวมฉุกเฉิน (SOS Auto Demo)</span>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            ทดสอบโฟลว์ SOS ทั้งระบบตั้งแต่ต้นจนจบแบบอัตโนมัติภายในหน้าต่างเดียว ไม่ต้องลงทะเบียนหรือปัดหน้าจอ
          </p>
        </div>

        <button
          onClick={onRunAutoDemo}
          disabled={isDemoRunning}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          {isDemoRunning ? (
            <>
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              กำลังจำลองเคสฉุกเฉิน...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" /> รันโฟลว์อัตโนมัติ (SOS Loop Demo)
            </>
          )}
        </button>
      </div>

      {/* --- LIVE SIMULATION NETWORK TRAFFIC LOGS --- */}
      <div className="flex-1 flex flex-col min-h-[140px] space-y-1.5">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">
          2. คอนโซลจำลองระบบเครือข่าย (Console Logs)
        </span>

        <div className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[10px] text-emerald-400 space-y-1.5 overflow-y-auto max-h-[150px] leading-relaxed text-left">
          {simLogs.map((log, i) => (
            <div key={i} className="flex gap-1.5 items-start">
              <span className="text-slate-600 font-bold">»</span>
              <span className="break-all">{log}</span>
            </div>
          ))}
          {simLogs.length === 0 && (
            <p className="text-slate-600 italic text-center py-8">สแตนด์บายรับทราฟฟิกเหตุการณ์ฉุกเฉิน...</p>
          )}
        </div>
      </div>

      {/* --- RESET SYSTEM ENVIRONMENT --- */}
      <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
        <div className="text-[10px] text-slate-400">
          <span className="font-bold block">สถานะฐานข้อมูล:</span>
          <span className="font-mono text-emerald-500">LOCAL (Persistent)</span>
        </div>
        <button
          onClick={onResetDatabase}
          className="px-3 py-1.5 bg-slate-800 text-rose-400 font-bold border border-slate-700 rounded-xl hover:bg-rose-500/10 hover:border-rose-500/20 transition-all flex items-center gap-1 cursor-pointer text-[10.5px]"
        >
          <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตข้อมูล (Reset)
        </button>
      </div>

    </div>
  );
}
