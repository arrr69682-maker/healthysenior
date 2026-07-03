import React, { useState } from 'react';
import { ArrowRight, Bell, CheckCircle2, Navigation, Phone, MessageSquare, ShieldAlert, Star, LogOut, Check, X, Send, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VolunteerProfile, SOSRequest, SOSStatus, ChatMessage, User } from '../types';

interface VolunteerHomeViewProps {
  user: User;
  profile: VolunteerProfile;
  incomingSos: SOSRequest | null; // Any pending SOS in searching status
  activeRescue: SOSRequest | null; // The SOS this volunteer accepted
  rescueHistory: SOSRequest[];
  chatMessages: ChatMessage[];
  onAcceptCase: (sosId: string) => void;
  onDeclineCase: (sosId: string) => void;
  onCompleteCase: (sosId: string) => void;
  onSendChatMessage: (text: string) => void;
  onLogout: () => void;
}

export default function VolunteerHomeView({
  user,
  profile,
  incomingSos,
  activeRescue,
  rescueHistory,
  chatMessages,
  onAcceptCase,
  onDeclineCase,
  onCompleteCase,
  onSendChatMessage,
  onLogout,
}: VolunteerHomeViewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [chatInput, setChatInput] = useState('');

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput);
    setChatInput('');
  };

  // Stats counters
  const totalCompleted = rescueHistory.filter(h => h.status === SOSStatus.COMPLETED).length;
  const totalCasesToday = rescueHistory.length + (activeRescue ? 1 : 0);

  return (
    <div className="flex flex-col min-h-[580px] h-full text-slate-800 bg-slate-50 select-none pb-8 relative">
      
      {/* --- TOP HEADER --- */}
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Volunteer Avatar"
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-500 shadow-sm"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold border-2 border-amber-500 shadow-sm">
              🧑‍⚕️
            </div>
          )}
          <div className="text-left">
            <span className="text-xs text-slate-400 font-bold block leading-none">ผู้ปฏิบัติงานอาสาสมัคร</span>
            <span className="text-base font-extrabold text-slate-800 block mt-0.5">
              คุณ{user.name} {user.lastname}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* --- TABS BAR --- */}
      <div className="px-5 pt-3 bg-white border-b border-slate-100">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'dashboard' ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            📋 งานความช่วยเหลือ
            {activeTab === 'dashboard' && (
              <motion.div layoutId="v-tab-line" className="absolute bottom-0 left-0 right-0 h-0.75 bg-amber-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'history' ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            ⭐️ ประวัติความดี ({rescueHistory.length})
            {activeTab === 'history' && (
              <motion.div layoutId="v-tab-line" className="absolute bottom-0 left-0 right-0 h-0.75 bg-amber-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* --- MAIN SCROLL AREA --- */}
      <div className="flex-grow p-5 overflow-y-auto space-y-4 max-h-[440px]">
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* NO ACTIVE RESCUE STATE */}
            {!activeRescue ? (
              <div className="space-y-4">
                
                {/* Stats grid cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
                    <span className="text-[10.5px] font-bold text-slate-400 block leading-none">งานสะสมของฉัน</span>
                    <span className="text-2xl font-black text-amber-600 block mt-2">{profile.completedCasesCount + totalCompleted} เคส</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
                    <span className="text-[10.5px] font-bold text-slate-400 block leading-none">คะแนนเฉลี่ย</span>
                    <span className="text-2xl font-black text-emerald-600 block mt-2 flex items-baseline gap-0.5">
                      {profile.rating.toFixed(1)} <span className="text-xs text-slate-400 font-bold">★</span>
                    </span>
                  </div>
                </div>

                {/* Standby station status banner */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 p-4 rounded-2xl border border-emerald-500/10 text-left flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping" />
                      กำลังแสตนด์บายออนไลน์
                    </span>
                    <p className="text-[10.5px] text-slate-500 mt-1">คอยรับเคสและพิกัดช่วยเหลือฉุกเฉิน</p>
                  </div>
                  <div className="bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    พร้อมช่วยเหลือ
                  </div>
                </div>

                {/* Simulated map of vicinity */}
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">ศูนย์ช่วยเหลือ สวนหลวง</h4>
                    <p className="text-[11px] text-slate-400">พิกัดรอบตัวคุณมีผู้สูงวัยพำนักรวม {totalCasesToday + 4} ครอบครัว</p>
                  </div>
                </div>
              </div>
            ) : (
              // ================= ACTIVE RESCUE STATE (DIRECTIONS & CONTROL) =================
              <div className="space-y-4">
                
                {/* Active Rescue Brief */}
                <div className="bg-rose-500 text-white p-4.5 rounded-3xl border border-rose-500/10 text-left space-y-3 shadow-lg shadow-rose-500/15">
                  <div className="flex justify-between items-center pb-2 border-b border-white/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-100">เคสกำลังช่วยเหลือด่วน</span>
                    <span className="text-[10px] font-bold bg-white text-rose-600 px-2 py-0.5 rounded-full animate-pulse">
                      กำลังเดินทางมาหาคุณปู่
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-black">คุณ{activeRescue.elderlyName}</h4>
                    <p className="text-xs text-rose-100 font-medium">เบอร์ติดต่อ: {activeRescue.elderlyPhone}</p>
                    <p className="text-xs text-rose-100 font-bold flex items-center gap-1 mt-1.5 bg-rose-600/50 p-2 rounded-xl">
                      <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                      โรคเบาหวาน, ยาความดันโลหิต ทานประจำ
                    </p>
                  </div>
                </div>

                {/* Simulated navigation route map */}
                <div className="h-44 bg-[#E2EFE9] border border-slate-200 rounded-2xl overflow-hidden relative">
                  {/* Custom Route Line */}
                  <svg viewBox="0 0 320 180" className="w-full h-full">
                    {/* Road */}
                    <path d="M 40 140 L 160 140 L 160 80 L 260 80" fill="none" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" />
                    <path d="M 40 140 L 160 140 L 160 80 L 260 80" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="5 3" />

                    {/* Patient / Elderly (260, 80) */}
                    <g transform="translate(260, 80)">
                      <circle cx="0" cy="0" r="10" fill="rgba(239, 68, 68, 0.2)" className="animate-ping" />
                      <circle cx="0" cy="0" r="6" fill="#EF4444" />
                      <text x="0" y="-12" textAnchor="middle" fontSize="7" fontWeight="black" fill="#991B1B">ผู้ป่วย</text>
                    </g>

                    {/* Volunteer ambulance (animated from 40 to 260) */}
                    <g transform="translate(130, 140)">
                      <circle cx="0" cy="0" r="8" fill="#F59E0B" />
                      <circle cx="0" cy="0" r="5" fill="white" />
                      <text x="0" y="15" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#B45309">คุณ (อาสา)</text>
                    </g>
                  </svg>
                  <div className="absolute top-2 left-2 bg-slate-900/80 px-2 py-1 rounded-md text-[9px] font-bold text-white flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-400" />
                    <span>นำทาง: ระยะห่าง 210 เมตร</span>
                  </div>
                </div>

                {/* Rescue chat & Actions */}
                <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm text-left space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> แชทคุยด่วนกับคุณตาคุณยาย
                  </span>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 h-[100px] overflow-y-auto text-[11px] space-y-1.5 text-left">
                    {chatMessages.length === 0 ? (
                      <p className="text-slate-400 text-center py-6 italic">เริ่มส่งสัญญาณคุยเพื่อให้คุณยายอุ่นใจขึ้น</p>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                          <div className={`p-2 rounded-xl max-w-[190px] font-medium leading-relaxed ${
                            msg.senderId === user.id 
                              ? 'bg-amber-500 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-400 mt-0.5">{msg.senderName}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form to message */}
                  <form onSubmit={handleChatSend} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="เช่น กำลังขับรถไปครับป้า ไม่เกิน 3 นาทีครับ..."
                      className="flex-1 px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg outline-none text-[11px] focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

                {/* Emergency Phone and complete rescue controls */}
                <div className="flex gap-2.5">
                  <a
                    href={`tel:${activeRescue.elderlyPhone}`}
                    className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center shadow-sm shrink-0"
                  >
                    <Phone className="w-4.5 h-4.5" />
                  </a>

                  <button
                    onClick={() => onCompleteCase(activeRescue.id)}
                    className="flex-1 py-3 bg-emerald-500 text-white font-black rounded-xl text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" /> ช่วยเหลือเสร็จสิ้น (Arrived & Helped)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: RESCUE HISTORY ================= */}
        {activeTab === 'history' && (
          <div className="space-y-3 text-left">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              ทำเนียบสะสมความพึ่งพอใจและบันทึกประวัติความกู้ภัย
            </span>

            {rescueHistory.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">ยังไม่มีประวัติเคสที่เคยทำมาสะสม</p>
            ) : (
              rescueHistory.map(hist => {
                const isCompleted = hist.status === SOSStatus.COMPLETED;
                const dateText = new Date(hist.timestamp).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div
                    key={hist.id}
                    className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm space-y-2.5"
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{dateText}</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {isCompleted ? 'ช่วยเหลือเสร็จสิ้น' : 'ยกเลิก'}
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">คุณ{hist.elderlyName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{hist.gps.addressName}</p>
                      </div>

                      {hist.rating && (
                        <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                          ★ {hist.rating}
                        </div>
                      )}
                    </div>

                    {hist.reviewComment && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
                        “{hist.reviewComment}”
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ================= RINGING POPUP ALERT FOR NEW SOS INCIDENT ================= */}
      <AnimatePresence>
        {incomingSos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-red-600 text-white z-50 flex flex-col justify-between p-6 overflow-hidden"
          >
            {/* Pulsing ring graphic background */}
            <div className="absolute inset-0 z-0 opacity-15 flex items-center justify-center">
              <div className="w-96 h-96 border-4 border-white rounded-full animate-ping scale-150" />
              <div className="w-80 h-80 border-4 border-white rounded-full animate-pulse scale-125" />
            </div>

            {/* Simulated alarming sound visualizer */}
            <div className="flex justify-center gap-1.5 my-2 z-10">
              {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>

            {/* SOS Details */}
            <div className="text-center space-y-4 z-10 flex-1 flex flex-col justify-center">
              <div className="w-20 h-20 bg-white text-red-600 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
                <span className="font-black text-2xl">🚨</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight">ได้รับแจ้ง SOS ฉุกเฉิน!</h2>
                <p className="text-rose-100 font-semibold text-sm">ต้องการความช่วยเหลือกู้ชีพด่วนในพื้นที่</p>
              </div>

              {/* Patient info details card */}
              <div className="bg-white/10 border border-white/20 p-4.5 rounded-2xl max-w-xs mx-auto text-left space-y-2">
                <p className="text-sm font-black">ชื่อผู้แจ้ง: {incomingSos.elderlyName}</p>
                <p className="text-xs text-rose-100">เบอร์มือถือ: {incomingSos.elderlyPhone}</p>
                <p className="text-xs text-rose-100 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  พิกัด: {incomingSos.gps.addressName}
                </p>
                <div className="border-t border-white/10 pt-2 text-[11px] text-rose-100">
                  <span className="font-bold block text-white">โรคประจำตัว / ข้อควรระวัง:</span>
                  ความดันโลหิตสูง, เบาหวาน
                </div>
              </div>

              <p className="text-xs text-rose-100">ระยะห่างประมาณ 350 เมตรจากศูนย์อาสาของคุณ</p>
            </div>

            {/* Accept / Decline actions */}
            <div className="grid grid-cols-2 gap-4 z-10 mt-auto">
              <button
                onClick={() => onDeclineCase(incomingSos.id)}
                className="py-3.5 bg-red-700/80 hover:bg-red-800 text-white font-bold rounded-2xl text-sm border border-white/10 cursor-pointer"
              >
                ปฏิเสธ (Decline)
              </button>

              <button
                onClick={() => onAcceptCase(incomingSos.id)}
                className="py-3.5 bg-white text-red-600 font-black rounded-2xl text-sm shadow-xl shadow-red-900/35 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1 animate-pulse"
              >
                <Check className="w-5 h-5 stroke-[3]" /> รับเคสนี้ (Accept)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
