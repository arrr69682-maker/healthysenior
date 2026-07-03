import React from 'react';
import { ArrowLeft, User, HeartHandshake, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { UserType } from '../types';

interface UserTypeSelectionViewProps {
  onSelect: (type: UserType) => void;
  onBack: () => void;
}

export default function UserTypeSelectionView({ onSelect, onBack }: UserTypeSelectionViewProps) {
  return (
    <div className="flex flex-col min-h-[580px] h-full p-6 bg-white select-none">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          id="btn-selection-back"
          className="p-2 -ml-2 text-slate-600 hover:text-emerald-500 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-lg font-bold text-slate-800 ml-2">ลงทะเบียนใหม่</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">เลือกบทบาทของคุณ</h2>
        <p className="text-slate-500 text-sm mb-8">
          กรุณาเลือกประเภทบัญชีผู้ใช้เพื่อรับการดูแล หรือเข้าร่วมช่วยเหลือสังคม
        </p>

        <div className="space-y-4">
          {/* Elderly Selection Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(UserType.ELDERLY)}
            id="card-select-elderly"
            className="group relative flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50/70 to-emerald-50/20 border-2 border-emerald-500/15 rounded-2xl cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10">
                <User className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  ผู้สูงอายุ (Elderly)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[190px]">
                  เพื่อเข้าถึงบริการดูแลสุขภาพ คัดกรองอาการ และแจ้งเหตุฉุกเฉิน SOS
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-500/80 group-hover:translate-x-1 transition-transform" />
          </motion.div>

          {/* Volunteer Selection Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(UserType.VOLUNTEER)}
            id="card-select-volunteer"
            className="group relative flex items-center justify-between p-5 bg-gradient-to-r from-amber-50/70 to-amber-50/20 border-2 border-amber-500/15 rounded-2xl cursor-pointer hover:border-amber-500 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-500 text-white rounded-xl shadow-md shadow-amber-500/10">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                  อาสาสมัคร (Volunteer)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[190px]">
                  เพื่อรับแจ้งเตือน ช่วยเหลือดูแลผู้สูงอายุ และบันทึกประวัติความดี
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-500/80 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </div>

      {/* Trust Quote / Caption at bottom */}
      <div className="mt-auto text-center pt-6">
        <p className="text-xs text-slate-400">
          * ข้อมูลทั้งหมดจะได้รับการจัดเก็บอย่างปลอดภัยเป็นส่วนตัว
        </p>
      </div>
    </div>
  );
}
