import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertTriangle, ShieldCheck, HeartPulse, Send, Phone, Star, MessageSquare, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ElderlyProfile, SOSRequest, SOSStatus, VolunteerProfile, ChatMessage } from '../types';

interface SosViewProps {
  profile: ElderlyProfile;
  activeSos: SOSRequest | null;
  assignedVolunteer: VolunteerProfile | null;
  chatMessages: ChatMessage[];
  onTriggerSos: () => void;
  onCancelSos: () => void;
  onSendChatMessage: (text: string) => void;
  onSubmitReview: (rating: number, comment: string) => void;
  onBack: () => void;
}

export default function SosView({
  profile,
  activeSos,
  assignedVolunteer,
  chatMessages,
  onTriggerSos,
  onCancelSos,
  onSendChatMessage,
  onSubmitReview,
  onBack,
}: SosViewProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle countdown trigger
  const handleStartSosPress = () => {
    setIsPressing(true);
    setCountdown(5);
    
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    let currentCount = 5;
    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount <= 0) {
        clearInterval(countdownIntervalRef.current!);
        setCountdown(null);
        setIsPressing(false);
        onTriggerSos();
      } else {
        setCountdown(currentCount);
      }
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdown(null);
    setIsPressing(false);
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput);
    setChatInput('');
  };

  // SOS status checklist tracker helper
  const getStepStatus = (status: SOSStatus, step: 'searching' | 'accepted' | 'on_the_way' | 'completed') => {
    const order = {
      [SOSStatus.SEARCHING]: 1,
      [SOSStatus.ACCEPTED]: 2,
      [SOSStatus.ON_THE_WAY]: 3,
      [SOSStatus.COMPLETED]: 4,
      [SOSStatus.CANCELLED]: 0,
    };
    
    const currentVal = order[status] || 0;
    
    if (step === 'searching') {
      return currentVal >= 1 ? 'done' : 'pending';
    }
    if (step === 'accepted') {
      return currentVal >= 2 ? 'done' : currentVal === 1 ? 'active' : 'pending';
    }
    if (step === 'on_the_way') {
      return currentVal >= 3 ? 'done' : currentVal === 2 ? 'active' : 'pending';
    }
    if (step === 'completed') {
      return currentVal >= 4 ? 'done' : currentVal === 3 ? 'active' : 'pending';
    }
    return 'pending';
  };

  const currentStatus = activeSos ? activeSos.status : null;

  return (
    <div className="flex flex-col min-h-[580px] h-full text-slate-800 bg-slate-50 select-none pb-8 relative">
      {/* --- TOP HEADER --- */}
      <div className="flex items-center p-5 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          id="btn-sos-back"
          className="p-2 -ml-2 text-slate-600 hover:text-emerald-500 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-slate-800 ml-2">ขอความช่วยเหลือ SOS</span>
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[440px] flex flex-col justify-between">
        
        {/* ================= STATE 1: NO ACTIVE SOS (BUTTON DISPLAY) ================= */}
        {!activeSos && countdown === null && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 my-auto py-4">
            <div className="text-center max-w-[260px] space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-800">ส่งสัญญาณฉุกเฉิน</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                เมื่อกดปุ่ม ระบบจะส่งพิกัดที่อยู่ โรคประจำตัว และเบอร์โทรของท่านไปยังอาสาสมัครที่อยู่ใกล้ที่สุดทันที
              </p>
            </div>

            {/* Glowing SOS Button */}
            <div className="relative">
              {/* Pulsing ripples */}
              <div className="absolute inset-0 rounded-full bg-rose-500/20 scale-125 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-rose-500/10 scale-150 animate-pulse" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartSosPress}
                id="btn-trigger-sos"
                className="w-40 h-40 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white font-black text-4xl shadow-xl shadow-red-500/35 border-8 border-white flex flex-col items-center justify-center relative z-10 cursor-pointer"
              >
                <HeartPulse className="w-10 h-10 mb-1 animate-pulse" />
                <span>SOS</span>
                <span className="text-[10px] font-bold tracking-widest uppercase mt-1 opacity-90 text-rose-100">
                  กดปุ่มนี้ด่วน
                </span>
              </motion.button>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 max-w-[280px]">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[10.5px] text-amber-800 leading-relaxed text-left">
                <strong>คำเตือน:</strong> โปรดใช้เฉพาะกรณีฉุกเฉิน เช่น ล้ม เจ็บป่วยกะทันหัน หรือเกิดอุบัติเหตุในบ้านเท่านั้น
              </p>
            </div>
          </div>
        )}

        {/* ================= STATE 2: COUNTDOWN TIMER ACTIVE ================= */}
        {countdown !== null && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 my-auto py-8">
            <h3 className="text-xl font-bold text-slate-800">กำลังจะส่งสัญญาณ SOS ใน...</h3>

            <div className="w-36 h-36 rounded-full bg-rose-100 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-rose-500/10 rounded-full animate-ping scale-110" />
              <span className="text-7xl font-black text-rose-600 font-mono">
                {countdown}
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-[220px] text-center">
              ข้อมูลพิกัดและประวัติการรักษากำลังแพร่กระจายไปยังเครือข่ายกู้ชีพ...
            </p>

            <button
              onClick={handleCancelCountdown}
              id="btn-cancel-countdown"
              className="py-3 px-8 bg-slate-800 text-white font-bold rounded-2xl text-sm shadow-md hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[3]" /> ยกเลิกทันที (Cancel)
            </button>
          </div>
        )}

        {/* ================= STATE 3: SOS ACTIVE & NOT COMPLETED ================= */}
        {activeSos && currentStatus !== SOSStatus.COMPLETED && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            
            {/* Status Steps Tracker */}
            <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm text-left">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-400">ขั้นตอนช่วยเหลือ</span>
                <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" /> กำลังดำเนินการ
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Step 1: Searching */}
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    getStepStatus(currentStatus, 'searching') === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {getStepStatus(currentStatus, 'searching') === 'done' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
                  </div>
                  <span className={`text-xs font-bold ${getStepStatus(currentStatus, 'searching') === 'done' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    กำลังค้นหาอาสาสมัครในพื้นที่ใกล้เคียง...
                  </span>
                </div>

                {/* Step 2: Accepted */}
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    getStepStatus(currentStatus, 'accepted') === 'done'
                      ? 'bg-emerald-500 text-white'
                      : getStepStatus(currentStatus, 'accepted') === 'active'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {getStepStatus(currentStatus, 'accepted') === 'done' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
                  </div>
                  <span className={`text-xs font-bold ${
                    getStepStatus(currentStatus, 'accepted') === 'done'
                      ? 'text-emerald-600'
                      : getStepStatus(currentStatus, 'accepted') === 'active'
                      ? 'text-rose-600'
                      : 'text-slate-400'
                  }`}>
                    อาสาสมัครตอบรับช่วยเหลือแล้ว
                  </span>
                </div>

                {/* Step 3: Travelling */}
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    getStepStatus(currentStatus, 'on_the_way') === 'done'
                      ? 'bg-emerald-500 text-white'
                      : getStepStatus(currentStatus, 'on_the_way') === 'active'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {getStepStatus(currentStatus, 'on_the_way') === 'done' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '3'}
                  </div>
                  <span className={`text-xs font-bold ${
                    getStepStatus(currentStatus, 'on_the_way') === 'done'
                      ? 'text-emerald-600'
                      : getStepStatus(currentStatus, 'on_the_way') === 'active'
                      ? 'text-rose-600'
                      : 'text-slate-400'
                  }`}>
                    อาสาสมัครกำลังเดินทางมาหาคุณปู่...
                  </span>
                </div>

                {/* Step 4: Finished */}
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    getStepStatus(currentStatus, 'completed') === 'done'
                      ? 'bg-emerald-500 text-white'
                      : getStepStatus(currentStatus, 'completed') === 'active'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {getStepStatus(currentStatus, 'completed') === 'done' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '4'}
                  </div>
                  <span className={`text-xs font-bold ${
                    getStepStatus(currentStatus, 'completed') === 'done'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}>
                    ได้รับการช่วยเหลือเสร็จสิ้นสมบูรณ์
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Volunteer details if accepted */}
            {assignedVolunteer ? (
              <div className="bg-white p-4 border border-emerald-500/10 rounded-2xl shadow-sm text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">อาสาที่จะเข้าช่วยเหลือ</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ใกล้คุณ 350 เมตร
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {assignedVolunteer.avatarUrl ? (
                    <img
                      src={assignedVolunteer.avatarUrl}
                      alt="Volunteer Profile"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border border-emerald-500">
                      🧑‍⚕️
                    </div>
                  )}

                  <div className="flex-1 text-left leading-tight">
                    <span className="text-sm font-extrabold text-slate-800 block">คุณ{assignedVolunteer.name} {assignedVolunteer.lastname}</span>
                    <span className="text-xs text-slate-400 block mt-1">สังกัด: {assignedVolunteer.organization}</span>
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1 mt-1">
                      ★ {assignedVolunteer.rating.toFixed(1)} คะแนนรีวิว
                    </span>
                  </div>

                  <a
                    href={`tel:${assignedVolunteer.phone}`}
                    className="p-3 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 transition-colors"
                  >
                    <Phone className="w-4.5 h-4.5" />
                  </a>
                </div>

                {/* Live Chat Logs specifically for this rescue request */}
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-2">
                    <MessageSquare className="w-3.5 h-3.5" /> แชทสนทนาความต้องการด่วน
                  </span>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1.5 h-[110px] overflow-y-auto text-[11px] text-left">
                    {chatMessages.length === 0 ? (
                      <p className="text-slate-400 text-center py-6 italic">ยังไม่มีข้อความส่งคุย</p>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.senderId === profile.userId ? 'items-end' : 'items-start'}`}>
                          <div className={`p-2 rounded-xl max-w-[190px] leading-relaxed font-medium ${
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

                  <form onSubmit={handleChatSend} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="ป้อนข้อความส่งหาอาสา..."
                      className="flex-1 px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg outline-none text-[11.5px] focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-amber-800 animate-pulse">📢 กำลังค้นหาศูนย์กู้ภัยและอาสาที่ใกล้ที่สุด</p>
                <p className="text-[10px] text-slate-500">กรุณาแสตนด์บายโทรศัพท์ของคุณ เจ้าหน้าที่อาจติดต่อกลับมา</p>
              </div>
            )}

            {/* Cancel SOS Request manually */}
            <button
              onClick={onCancelSos}
              className="w-full py-2.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer border border-slate-200"
            >
              ยกเลิกคำขอความช่วยเหลือ SOS
            </button>
          </div>
        )}

        {/* ================= STATE 4: SOS COMPLETED (RATING FEEDBACK SCREEN) ================= */}
        {activeSos && currentStatus === SOSStatus.COMPLETED && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-white p-5 border border-slate-100 rounded-3xl shadow-md text-center space-y-5 my-auto"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800">ได้รับการช่วยเหลือเรียบร้อย!</h3>
              <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                ขอขอบคุณอาสา <span className="font-bold text-emerald-600">{activeSos.volunteerName}</span> ที่เข้าถึงพื้นที่และดูแลช่วยเหลือท่าน
              </p>
            </div>

            {/* Star Rating Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 block mb-1">ความพึงพอใจการช่วยเหลือ</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Comment box */}
            <div className="text-left space-y-1">
              <label className="text-xs font-bold text-slate-400">เขียนคำขอบคุณและข้อชื่นชม</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="ป้อนความคิดเห็นของคุณป้า (เช่น อาสามาเร็วมาก พูดคุยน่ารัก ปฐมพยาบาลดีเยี่ยม)..."
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-700 bg-slate-50 resize-none"
              />
            </div>

            <button
              onClick={() => onSubmitReview(rating, reviewComment)}
              className="w-full py-3 bg-emerald-500 text-white font-black rounded-2xl text-sm shadow-md hover:bg-emerald-600 transition-all cursor-pointer"
            >
              ส่งแบบประเมินและกล่าวคำขอบคุณ
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
