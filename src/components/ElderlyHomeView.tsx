import React, { useState } from 'react';
import { Heart, Activity, MapPin, BookOpen, Bell, ArrowRight, LogOut, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { User, ElderlyProfile, HealthRecord, AppNotification } from '../types';
import { getDB } from '../lib/db';

interface ElderlyHomeViewProps {
  user: User;
  profile: ElderlyProfile;
  latestHealth: HealthRecord | null;
  notifications: AppNotification[];
  onNavigate: (tab: 'home' | 'health' | 'sos' | 'maps' | 'settings') => void;
  onLogout: () => void;
}

export default function ElderlyHomeView({
  user,
  profile,
  latestHealth,
  notifications,
  onNavigate,
  onLogout,
}: ElderlyHomeViewProps) {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Render a friendly status badge based on latest BP/Heart Rate
  const getStatusBadge = (record: HealthRecord | null) => {
    if (!record) return { label: 'ยังไม่มีบันทึก', color: 'bg-slate-100 text-slate-500' };
    if (record.status === 'danger') return { label: '⚠️ เสี่ยงอันตราย', color: 'bg-red-100 text-red-700 animate-pulse' };
    if (record.status === 'warning') return { label: '⚡ ควรระวัง', color: 'bg-amber-100 text-amber-700' };
    return { label: '💚 สุขภาพดีปกติ', color: 'bg-emerald-100 text-emerald-700' };
  };

  const statusBadge = getStatusBadge(latestHealth);

  return (
    <div className="flex flex-col min-h-[580px] h-full text-slate-800 bg-slate-50 select-none relative">
      
      {/* --- TOP BAR --- */}
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Elderly Avatar"
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold border-2 border-emerald-500 shadow-sm">
              👵
            </div>
          )}
          <div className="text-left">
            <span className="text-xs text-slate-400 font-bold block leading-none">สวัสดีค่ะคุณป้า/คุณยาย</span>
            <span className="text-base font-extrabold text-slate-800 block mt-0.5">
              คุณ{user.name} {user.lastname}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Notification bell */}
          <button
            onClick={() => setShowNotificationCenter(!showNotificationCenter)}
            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT SCROLL AREA --- */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[440px]">
        
        {/* Notification Center Popover */}
        {showNotificationCenter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-30 relative"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">กระดิ่งแจ้งเตือน</span>
              <button
                onClick={() => setShowNotificationCenter(false)}
                className="text-xs text-emerald-600 font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">ไม่มีรายการแจ้งเตือนใหม่</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-left text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span>{n.title}</span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1">{n.body}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* --- TODAY HEALTH BRIEF CARD --- */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md shadow-slate-100/50">
          <div className="flex justify-between items-center mb-3.5">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
              <Activity className="w-5 h-5 text-emerald-500" /> สุขภาพวันนี้
            </h3>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Blood Pressure Item */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl text-left">
              <span className="text-[11px] font-bold text-slate-500 block leading-none">ความดันโลหิต</span>
              <span className="text-lg font-black text-slate-800 block mt-1.5 leading-none">
                {latestHealth ? `${latestHealth.bloodPressureSys}/${latestHealth.bloodPressureDia}` : '---/---'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">mmHg</span>
            </div>

            {/* Pulse Rate Item */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-2xl text-left">
              <span className="text-[11px] font-bold text-slate-500 block leading-none">ชีพจรการเต้นหัวใจ</span>
              <span className="text-lg font-black text-slate-800 block mt-1.5 leading-none">
                {latestHealth ? `${latestHealth.heartRate}` : '---'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">ครั้ง/นาที (bpm)</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('health')}
            className="w-full mt-3.5 py-2.5 bg-slate-50 text-slate-600 font-bold text-xs rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-100"
          >
            ดูประวัติการตรวจวัดและแจ้งเตือนยา
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* --- 4 BIG TACTILE BUTTONS BENTO GRID --- */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Button 1: Health Menu */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('health')}
            className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-md shadow-slate-200/40 hover:shadow-lg transition-all text-left flex flex-col justify-between h-[125px] cursor-pointer group"
          >
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Heart className="w-5.5 h-5.5 fill-emerald-100/20" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 block">เมนูสุขภาพ</span>
              <span className="text-[10px] text-slate-400 mt-1 block">เตือนกินยา & ตรวจร่างกาย</span>
            </div>
          </motion.button>

          {/* Button 2: SOS Emergency Request */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('sos')}
            className="bg-rose-500 p-4.5 rounded-3xl border-2 border-rose-500/10 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/35 transition-all text-left flex flex-col justify-between h-[125px] cursor-pointer group animate-pulse"
          >
            <div className="w-10 h-10 bg-white text-rose-600 rounded-2xl flex items-center justify-center shadow-md shadow-rose-500/10">
              <span className="font-bold text-xs">🚨 SOS</span>
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">SOS ขอความช่วยเหลือ</span>
              <span className="text-[10px] text-rose-100/90 mt-1 block">กดปุ่มแจ้งฉุกเฉินด่วน 24 ชม.</span>
            </div>
          </motion.button>

          {/* Button 3: Volunteers Near Me */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('maps')}
            className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-md shadow-slate-200/40 hover:shadow-lg transition-all text-left flex flex-col justify-between h-[125px] cursor-pointer group"
          >
            <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20">
              <MapPin className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 block">อาสาสมัครใกล้ฉัน</span>
              <span className="text-[10px] text-slate-400 mt-1 block">ดูตำแหน่งอาสาพร้อมดูแล</span>
            </div>
          </motion.button>

          {/* Button 4: Health Articles */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              alert('ฟีเจอร์ความรู้สุขภาพ: จะแสดงบทความเพื่อสุขภาพผู้สูงวัย การทานอาหาร การยืดเส้นยืดสาย และคำแนะนำด้านโภชนาการ');
            }}
            className="bg-white p-4.5 rounded-3xl border border-slate-100 shadow-md shadow-slate-200/40 hover:shadow-lg transition-all text-left flex flex-col justify-between h-[125px] cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-800 block">บทความน่ารู้</span>
              <span className="text-[10px] text-slate-400 mt-1 block">การดูแลตนเอง & ออกกำลังกาย</span>
            </div>
          </motion.button>

        </div>

        {/* --- EMERGENCY BANNER / INFORMATION CARD --- */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-500/10 p-4.5 rounded-2xl text-left">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block animate-ping" />
            <span>เบอร์ติดต่อฉุกเฉินส่วนตัวของคุณ</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            หากเกิดเหตุด่วนร้ายแรงที่นอกเหนือบริการชุมชน สามารถติดต่อเบอร์ลูกหลาน 
            <span className="font-bold text-slate-800"> {profile.emergencyContactName} ({profile.emergencyContactPhone})</span> หรือโทรสารารณภัยแพทย์ฉุกเฉินแห่งชาติ <span className="text-rose-600 font-bold">1669</span> ได้ทันที
          </p>
        </div>

      </div>

      {/* --- FLOATING DISMISS BUTTONS FOR SAFETY --- */}
      <div className="px-5 pb-5 pt-2 bg-white border-t border-slate-100 flex items-center justify-between shadow-sm text-slate-600">
        <button
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          <Settings className="w-5.5 h-5.5" />
          <span className="text-[10px] font-bold">ตั้งค่า</span>
        </button>

        <button
          onClick={onLogout}
          className="py-2.5 px-4 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>

    </div>
  );
}
