import React, { useState } from 'react';
import { ArrowLeft, Phone, MessageSquare, Star, MapPin, Check, Send, Navigation, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ElderlyProfile, VolunteerProfile, ChatMessage } from '../types';

interface VolunteersNearMeViewProps {
  profile: ElderlyProfile;
  volunteers: VolunteerProfile[];
  onBack: () => void;
}

export default function VolunteersNearMeView({ profile, volunteers, onBack }: VolunteersNearMeViewProps) {
  const [selectedVol, setSelectedVol] = useState<VolunteerProfile | null>(volunteers[0] || null);
  const [chattingVol, setChattingVol] = useState<VolunteerProfile | null>(null);
  const [dialingVol, setDialingVol] = useState<VolunteerProfile | null>(null);

  // Chatting state inside map context
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState<ChatMessage[]>([]);

  const handleSendLocalMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chattingVol) return;

    const myMsg: ChatMessage = {
      id: `m-map-${Date.now()}`,
      sosRequestId: 'general',
      senderId: profile.userId,
      senderName: profile.name,
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChats(prev => [...prev, myMsg]);
    setChatInput('');

    // Simulate reply from volunteer
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        sosRequestId: 'general',
        senderId: chattingVol.userId,
        senderName: chattingVol.name,
        text: `สวัสดีครับป้าสมใจ มีอะไรให้ผมช่วยเหลือด่วนไหมครับ? สามารถบอกได้เลยครับ`,
        timestamp: new Date().toISOString()
      };
      setChats(prev => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-[580px] h-full text-slate-800 bg-slate-50 select-none pb-8 relative">
      {/* --- TOP BAR --- */}
      <div className="flex items-center p-5 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          id="btn-maps-back"
          className="p-2 -ml-2 text-slate-600 hover:text-emerald-500 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-slate-800 ml-2">อาสาสมัครใกล้เคียง</span>
      </div>

      {/* --- INTERACTIVE SVG MOCK MAP --- */}
      <div className="relative h-44 bg-[#EAF2ED] overflow-hidden border-b border-slate-200">
        <svg viewBox="0 0 320 180" className="w-full h-full">
          {/* Roads/streets representation background */}
          <rect width="320" height="180" fill="#E2EFE9" />
          {/* Saphantheewan River / Canal */}
          <path d="M 0 120 C 100 110, 200 160, 320 140 L 320 180 L 0 180 Z" fill="#B3D9EA" />
          {/* Green parks */}
          <rect x="220" y="20" width="80" height="60" rx="15" fill="#C5E3D2" />
          <circle cx="50" cy="40" r="25" fill="#C5E3D2" />

          {/* Streets networks lines */}
          <path d="M 0 70 L 320 70" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <path d="M 90 0 L 90 180" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
          <path d="M 240 0 L 240 180" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
          <path d="M 0 110 L 240 110" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />

          {/* Saphantheewan bridge outline */}
          <line x1="240" y1="110" x2="240" y2="150" stroke="#E2E8F0" strokeWidth="4" />

          {/* Elderly beacon pin (Center location at (160, 85)) */}
          <g transform="translate(160, 85)">
            <circle cx="0" cy="0" r="14" fill="rgba(59, 130, 246, 0.15)" className="animate-ping" />
            <circle cx="0" cy="0" r="8" fill="rgba(59, 130, 246, 0.35)" />
            <circle cx="0" cy="0" r="4.5" fill="#3B82F6" />
            {/* Tiny "Me" tooltip */}
            <text x="0" y="-12" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#1E3A8A" className="bg-white px-1">
              ตำแหน่งของท่าน
            </text>
          </g>

          {/* Routing route line from elderly to selected volunteer if active */}
          {selectedVol && (
            <path
              d={
                selectedVol.id === 'v-1'
                  ? 'M 160 85 L 160 70 L 110 70 L 110 100 L 120 100' // mock route to Kittipong
                  : 'M 160 85 L 210 85 L 210 65 L 230 65' // mock route to Jirapa
              }
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              className="animate-[dash_2s_linear_infinite]"
              style={{
                strokeDashoffset: 10,
              }}
            />
          )}

          {/* Volunteer Pin 1: Kittipong (120, 100) */}
          <g
            transform="translate(110, 105)"
            className="cursor-pointer"
            onClick={() => setSelectedVol(volunteers.find(v => v.id === 'v-1') || null)}
          >
            <circle cx="0" cy="0" r="10" fill={selectedVol?.id === 'v-1' ? '#F59E0B' : '#4CAF7A'} className="animate-pulse" />
            <circle cx="0" cy="0" r="7.5" fill="white" />
            {/* Mini avatar representation */}
            <clipPath id="avatar-clip-1">
              <circle cx="0" cy="0" r="6" />
            </clipPath>
            <image
              href="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60"
              x="-6"
              y="-6"
              width="12"
              height="12"
              clipPath="url(#avatar-clip-1)"
            />
          </g>

          {/* Volunteer Pin 2: Jirapa (230, 65) */}
          <g
            transform="translate(225, 60)"
            className="cursor-pointer"
            onClick={() => setSelectedVol(volunteers.find(v => v.id === 'v-2') || null)}
          >
            <circle cx="0" cy="0" r="10" fill={selectedVol?.id === 'v-2' ? '#F59E0B' : '#4CAF7A'} className="animate-pulse" />
            <circle cx="0" cy="0" r="7.5" fill="white" />
            <clipPath id="avatar-clip-2">
              <circle cx="0" cy="0" r="6" />
            </clipPath>
            <image
              href="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60"
              x="-6"
              y="-6"
              width="12"
              height="12"
              clipPath="url(#avatar-clip-2)"
            />
          </g>
        </svg>

        {/* Small floating locator badge */}
        <div className="absolute top-2.5 right-2.5 bg-white px-2.5 py-1.5 rounded-xl shadow-sm text-[9.5px] font-bold text-slate-600 flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
          <span>GPS สัญญาณดีเยี่ยม</span>
        </div>
      </div>

      {/* --- VOLUNTEERS DIRECTORY LIST --- */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3.5 max-h-[260px]">
        <div className="flex justify-between items-center px-1">
          <span className="font-extrabold text-sm text-slate-800">รายชื่ออาสารอบตัวคุณ</span>
          <span className="text-[10px] font-bold text-slate-400">เรียงตามระยะทางใกล้ที่สุด</span>
        </div>

        <div className="space-y-3">
          {volunteers.map(v => {
            const isSelected = selectedVol?.id === v.id;
            const isKittipong = v.id === 'v-1';
            const distanceText = isKittipong ? '350 เมตร' : '450 เมตร';

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVol(v)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    {v.avatarUrl ? (
                      <img
                        src={v.avatarUrl}
                        alt={v.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold">
                        🧑‍⚕️
                      </div>
                    )}
                    {v.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-sm font-extrabold text-slate-800 truncate">คุณ{v.name} {v.lastname}</h4>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md shrink-0">
                        {distanceText}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">สังกัด: {v.organization}</p>
                    
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        {v.rating.toFixed(1)}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400 font-medium text-[10.5px]">ช่วยแล้ว {v.completedCasesCount} เคส</span>
                    </div>
                  </div>
                </div>

                {/* Sub Action Buttons inside list card when selected */}
                {isSelected && (
                  <div className="flex gap-2 border-t border-slate-100 mt-3.5 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDialingVol(v);
                      }}
                      className="flex-1 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                    >
                      <Phone className="w-3.5 h-3.5" /> โทรหาอาสา
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setChattingVol(v);
                      }}
                      className="flex-1 py-2 bg-white text-emerald-600 font-bold text-xs rounded-xl border border-emerald-500/20 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> แชทสนทนา
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL DIALER PHONE CALL SIMULATION ================= */}
      <AnimatePresence>
        {dialingVol && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 text-white w-full rounded-3xl max-w-xs p-6 text-center space-y-6"
            >
              <div className="space-y-2">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-500 mx-auto animate-pulse">
                  <img src={dialingVol.avatarUrl} alt="Dialing" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-black">{dialingVol.name} {dialingVol.lastname}</h3>
                <p className="text-xs text-emerald-400 font-bold animate-pulse">กำลังโทรศัพท์จำลอง (Call Simulation)...</p>
                <p className="text-xs text-slate-400 font-mono">{dialingVol.phone}</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl text-left text-[11px] text-slate-300 flex gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>นี่เป็นหน้าต่างจำลองเพื่อโทรติดต่ออาสารอบชุมชน สามารถคุยในแอปด้วยระบบแชทได้เช่นเดียวกัน</span>
              </div>

              <button
                onClick={() => setDialingVol(null)}
                className="w-full py-3 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all cursor-pointer text-sm"
              >
                วางสายโทรศัพท์
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL LIVE CHAT DRAWER ================= */}
      <AnimatePresence>
        {chattingVol && (
          <div className="absolute inset-0 bg-black/50 z-30 flex items-end justify-center p-4">
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full rounded-t-3xl max-w-sm p-5 text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src={chattingVol.avatarUrl} alt="Chat target" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-extrabold text-sm text-slate-800">แชทกับ คุณ{chattingVol.name}</span>
                </div>
                <button
                  onClick={() => {
                    setChattingVol(null);
                    setChats([]);
                  }}
                  className="p-1 bg-slate-100 text-slate-400 rounded-full cursor-pointer hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat messages container */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 h-[150px] overflow-y-auto text-xs">
                {chats.length === 0 ? (
                  <p className="text-slate-400 text-center py-10 italic">พิมพ์ข้อความเพื่อเปิดบทสนทนากับอาสา</p>
                ) : (
                  chats.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderId === profile.userId ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl max-w-[210px] leading-relaxed font-semibold ${
                        msg.senderId === profile.userId 
                          ? 'bg-emerald-500 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-400 mt-0.5">{msg.senderName}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendLocalMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="พิมพ์ข้อความคุยด่วนที่ต้องการ..."
                  className="flex-1 px-4 py-2 border border-slate-200 bg-slate-50 rounded-xl outline-none text-xs focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
