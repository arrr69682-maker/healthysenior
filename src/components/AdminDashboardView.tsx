import React, { useState } from 'react';
import { ArrowLeft, Users, ShieldAlert, FileText, CheckCircle2, Search, Star, Download, Printer, Settings, Database, Filter, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ElderlyProfile, VolunteerProfile, SOSRequest, User, UserType } from '../types';

interface AdminDashboardViewProps {
  users: User[];
  elderly: ElderlyProfile[];
  volunteers: VolunteerProfile[];
  sosRequests: SOSRequest[];
  onBack: () => void;
  onLogout: () => void;
}

export default function AdminDashboardView({
  users,
  elderly,
  volunteers,
  sosRequests,
  onBack,
  onLogout
}: AdminDashboardViewProps) {
  const [activeMenu, setActiveMenu] = useState<'stats' | 'elderly' | 'volunteers' | 'sos'>('stats');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Filter lists based on search
  const filteredElderly = elderly.filter(e =>
    `${e.name} ${e.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.phone.includes(searchQuery)
  );

  const filteredVolunteers = volunteers.filter(v =>
    `${v.name} ${v.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.phone.includes(searchQuery)
  );

  const filteredSos = sosRequests.slice().reverse().filter(s =>
    s.elderlyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.volunteerName && s.volunteerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Statistics calculations
  const totalUsers = users.length;
  const totalElderlyCount = elderly.length;
  const totalVolunteersCount = volunteers.length;
  const totalCompletedSOS = sosRequests.filter(s => s.status === 'completed').length;
  const totalActiveSOS = sosRequests.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length;

  const averageRating = volunteers.reduce((acc, v) => acc + v.rating, 0) / (volunteers.length || 1);

  return (
    <div className="flex flex-col min-h-[580px] h-full text-slate-800 bg-slate-100 select-none pb-8 relative">
      {/* --- TOP ADMIN HEADER --- */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <span className="text-xs text-emerald-400 font-bold block">ผู้ดูแลระบบ (Admin)</span>
            <span className="text-sm font-black block">ศูนย์ควบคุม สูงวัยอุ่นใจ</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 hover:text-white transition-all text-xs cursor-pointer"
        >
          ออกระบบ
        </button>
      </div>

      {/* --- QUICK STATS SUMMARY BANNER --- */}
      <div className="bg-slate-900 text-white px-5 pb-4 pt-1 flex justify-between gap-2 text-center text-xs">
        <div className="flex-1 bg-slate-800/50 p-2 rounded-xl">
          <span className="text-slate-400 font-bold text-[9px] block">ผู้สูงอายุ</span>
          <span className="text-base font-black text-emerald-400">{totalElderlyCount}</span>
        </div>
        <div className="flex-1 bg-slate-800/50 p-2 rounded-xl">
          <span className="text-slate-400 font-bold text-[9px] block">อาสาสมัคร</span>
          <span className="text-base font-black text-amber-400">{totalVolunteersCount}</span>
        </div>
        <div className="flex-1 bg-slate-800/50 p-2 rounded-xl">
          <span className="text-slate-400 font-bold text-[9px] block">SOS วันนี้</span>
          <span className="text-base font-black text-rose-400">{sosRequests.length}</span>
        </div>
        <div className="flex-1 bg-slate-800/50 p-2 rounded-xl">
          <span className="text-slate-400 font-bold text-[9px] block">ช่วยเหลือเสร็จ</span>
          <span className="text-base font-black text-emerald-300">{totalCompletedSOS}</span>
        </div>
      </div>

      {/* --- NAVIGATION MENU TABS --- */}
      <div className="bg-white border-b border-slate-200 px-3.5 pt-3.5 flex justify-between gap-1">
        <button
          onClick={() => { setActiveMenu('stats'); setSearchQuery(''); }}
          className={`flex-1 pb-2.5 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
            activeMenu === 'stats' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'
          }`}
        >
          📊 สถิติรวม
        </button>
        <button
          onClick={() => { setActiveMenu('elderly'); setSearchQuery(''); }}
          className={`flex-1 pb-2.5 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
            activeMenu === 'elderly' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'
          }`}
        >
          👵 ผู้สูงอายุ
        </button>
        <button
          onClick={() => { setActiveMenu('volunteers'); setSearchQuery(''); }}
          className={`flex-1 pb-2.5 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
            activeMenu === 'volunteers' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'
          }`}
        >
          🧑‍⚕️ อาสา
        </button>
        <button
          onClick={() => { setActiveMenu('sos'); setSearchQuery(''); }}
          className={`flex-1 pb-2.5 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
            activeMenu === 'sos' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500'
          }`}
        >
          🚨 เคส SOS
        </button>
      </div>

      {/* --- SEARCH BAR (Show only in directory tabs) --- */}
      {activeMenu !== 'stats' && (
        <div className="p-4 bg-white border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ เบอร์โทร หรือข้อมูลติดต่อ..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* --- SCROLL CONTENT AREA --- */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[380px]">
        {/* ================= STATS VIEW ================= */}
        {activeMenu === 'stats' && (
          <div className="space-y-4">
            {/* Call to actions report download */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>รายงานสถานการณ์ชุมชนและกู้ชีพ</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                ส่งออกสรุปสถิติผู้ป่วยติดเตียง ข้อมูลประชากรสูงวัยในเขต สถิติการตอบรับ SOS และคะแนนความพึงพอใจการปฏิบัติงานเพื่อจัดทำรายงานส่งสังกัดกองสาธารณสุข
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> ดูรายงานสรุปและสั่งพิมพ์ PDF
              </button>
            </div>

            {/* Stats Breakdown Bento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">คะแนนพึงพอใจอาสา</span>
                <span className="text-lg font-black text-slate-800 block mt-2">{averageRating.toFixed(2)} / 5.00</span>
                <div className="flex gap-0.5 text-amber-400 mt-1">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400" />)}
                </div>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm text-left">
                <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">ความกู้ภัยสำเร็จ</span>
                <span className="text-lg font-black text-emerald-600 block mt-2">100 %</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">จากคำขอกู้ชีพทั้งหมด</span>
              </div>
            </div>

            {/* Simple Performance Progress */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm text-left space-y-2.5">
              <span className="text-xs font-bold text-slate-600 block">สัดส่วนอาสาสมัครต่อประชากรสูงวัย</span>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(totalVolunteersCount / (totalElderlyCount || 1)) * 100}%` }} />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>อาสา: {totalVolunteersCount} ท่าน</span>
                <span>ผู้สูงอายุ: {totalElderlyCount} ท่าน</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= ELDERLY DIRECTORY ================= */}
        {activeMenu === 'elderly' && (
          <div className="space-y-3">
            {filteredElderly.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">ไม่พบรายชื่อผู้สูงอายุตามที่ค้นหา</p>
            ) : (
              filteredElderly.map(e => (
                <div key={e.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-extrabold text-slate-800">คุณ{e.name} {e.lastname} ({e.age} ปี)</h4>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">เพศ {e.gender}</span>
                  </div>

                  <p className="text-xs text-slate-500"><strong>ที่อยู่:</strong> {e.address}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-bold block">โรคประจำตัว:</span>
                      <span className="text-slate-700">{e.chronicDiseases}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">ผู้ติดต่อฉุกเฉิน:</span>
                      <span className="text-slate-700">{e.emergencyContactName} ({e.emergencyContactPhone})</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= VOLUNTEERS DIRECTORY ================= */}
        {activeMenu === 'volunteers' && (
          <div className="space-y-3">
            {filteredVolunteers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">ไม่พบรายชื่ออาสาสมัครตามที่ค้นหา</p>
            ) : (
              filteredVolunteers.map(v => (
                <div key={v.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-extrabold text-slate-800">คุณ{v.name} {v.lastname} ({v.age} ปี)</h4>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      ★ {v.rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500"><strong>โทร:</strong> {v.phone} | <strong>สังกัด:</strong> {v.organization}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {v.abilities.map((ab, i) => (
                      <span key={i} className="text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-500/10">
                        {ab}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= SOS REQUESTS LOGS ================= */}
        {activeMenu === 'sos' && (
          <div className="space-y-3">
            {filteredSos.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีประวัติการแจ้ง SOS ใดๆ</p>
            ) : (
              filteredSos.map(sos => {
                const dateText = new Date(sos.timestamp).toLocaleDateString('th-TH', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={sos.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{dateText} น.</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        sos.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : sos.status === 'cancelled'
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-rose-100 text-rose-700 animate-pulse'
                      }`}>
                        {sos.status === 'completed' ? 'ช่วยเหลือเสร็จสิ้น' : sos.status === 'cancelled' ? 'ยกเลิก' : 'กำลังดำเนินการ'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase">ผู้สูงอายุผู้ร้องขอ:</h4>
                      <p className="text-sm font-black text-slate-800 mt-0.5">คุณ{sos.elderlyName} ({sos.elderlyPhone})</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10.5px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-semibold block">อาสาผู้เข้าช่วยเหลือ:</span>
                        <span className="text-slate-700 font-bold">{sos.volunteerName || 'อยู่ระหว่างมอบหมาย'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">ประเมินผล:</span>
                        <span className="text-slate-700 font-bold flex items-center gap-0.5">
                          {sos.rating ? `${sos.rating} ดาว ★` : 'ไม่มีดาว'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ================= PRINT PREVIEW PDF REPORT MODAL ================= */}
      <AnimatePresence>
        {showReportModal && (
          <div className="absolute inset-0 bg-black/70 z-50 overflow-y-auto p-4 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-800 w-full rounded-3xl max-w-sm p-6 text-left space-y-5 shadow-2xl relative"
            >
              {/* Report close */}
              <button
                onClick={() => setShowReportModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Printable Area Wrapper */}
              <div id="printable-pdf-area" className="space-y-4">
                {/* Header info */}
                <div className="text-center space-y-1.5 border-b-2 border-slate-200 pb-3">
                  <span className="text-emerald-600 font-black text-xl flex items-center justify-center gap-1">
                    💚 สูงวัยอุ่นใจ
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">รายงานสรุปสถานการณ์กู้ชีพชุมชนเขตสวนหลวง</h3>
                  <p className="text-[9px] text-slate-400 font-mono">
                    วันที่สรุปรายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Report stats breakdown table */}
                <div className="space-y-2 text-xs">
                  <span className="font-extrabold text-xs text-slate-700 block">1. ตัวชี้วัดหลักประสิทธิภาพกู้ชีพ (KPIs)</span>
                  <table className="w-full border-collapse border border-slate-200 text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-500 font-extrabold">
                        <th className="border border-slate-200 p-2">ตัวชี้วัดสำคัญ</th>
                        <th className="border border-slate-200 p-2 text-right">จำนวนประมวล</th>
                      </tr>
                    </thead>
                    <tbody className="font-medium text-slate-700">
                      <tr>
                        <td className="border border-slate-200 p-2">จำนวนประชากรผู้สูงอายุขึ้นทะเบียน</td>
                        <td className="border border-slate-200 p-2 text-right font-bold text-slate-900">{totalElderlyCount} คน</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">จำนวนอาสาสมัครในเครือข่ายแสตนด์บาย</td>
                        <td className="border border-slate-200 p-2 text-right font-bold text-slate-900">{totalVolunteersCount} คน</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">อัตราตอบรับกู้ภัย SOS ภายใน 5 วินาที</td>
                        <td className="border border-slate-200 p-2 text-right font-bold text-emerald-600">100 %</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">จำนวนเคส SOS คลี่คลายสำเร็จเสร็จสิ้น</td>
                        <td className="border border-slate-200 p-2 text-right font-bold text-slate-900">{totalCompletedSOS} เคส</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-200 p-2">คะแนนประเมินเฉลี่ยความพึงพอใจ</td>
                        <td className="border border-slate-200 p-2 text-right font-bold text-amber-500">{averageRating.toFixed(2)} / 5 ★</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Patient chronic diseases overview */}
                <div className="space-y-2 text-xs">
                  <span className="font-extrabold text-xs text-slate-700 block">2. รายการผู้ป่วยเสี่ยงภัยวิกฤติสูงในระบบ</span>
                  <div className="space-y-1.5 max-h-[80px] overflow-y-auto">
                    {elderly.map((e, i) => (
                      <div key={i} className="text-[10px] p-1.5 bg-slate-50 rounded border border-slate-100 flex justify-between">
                        <span>คุณ{e.name} • เพศ{e.gender} ({e.age} ปี)</span>
                        <span className="font-bold text-rose-600">{e.chronicDiseases}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signature area */}
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-200 text-[10px] text-slate-400">
                  <span>ผู้จัดทำ: ฝ่ายระบบกู้ชีพ สูงวัยอุ่นใจ</span>
                  <span>ลงชื่อผู้รับรอง: _________________</span>
                </div>
              </div>

              {/* Action trigger browser printer */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <Printer className="w-3.5 h-3.5" /> สั่งพิมพ์ด้วยเครื่องพิมพ์
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
