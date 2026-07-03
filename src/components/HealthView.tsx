import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, Heart, ClipboardList, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { ElderlyProfile, HealthRecord, PillReminder, AppointmentReminder } from '../types';

interface HealthViewProps {
  profile: ElderlyProfile;
  healthRecords: HealthRecord[];
  pills: PillReminder[];
  appointments: AppointmentReminder[];
  onAddRecord: (record: { bloodPressureSys: number; bloodPressureDia: number; heartRate: number; bloodSugar?: number; weight?: number; note?: string }) => void;
  onTogglePill: (id: string) => void;
  onAddPill: (pill: { medicineName: string; dosage: string; time: string; frequency: string }) => void;
  onAddAppointment: (appt: { doctorName: string; hospital: string; date: string; time: string; purpose: string }) => void;
  onBack: () => void;
}

export default function HealthView({
  profile,
  healthRecords,
  pills,
  appointments,
  onAddRecord,
  onTogglePill,
  onAddPill,
  onAddAppointment,
  onBack,
}: HealthViewProps) {
  const [activeTab, setActiveTab] = useState<'tracker' | 'pills' | 'appointments'>('tracker');
  const [showLogRecord, setShowLogRecord] = useState(false);
  const [showAddPill, setShowAddPill] = useState(false);
  const [showAddAppt, setShowAddAppt] = useState(false);

  // Forms states
  const [sys, setSys] = useState('120');
  const [dia, setDia] = useState('80');
  const [hr, setHr] = useState('72');
  const [sugar, setSugar] = useState('');
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');

  const [pillName, setPillName] = useState('');
  const [pillDosage, setPillDosage] = useState('1 เม็ด');
  const [pillTime, setPillTime] = useState('08:00');
  const [pillFreq, setPillFreq] = useState('ทุกวันหลังอาหารเช้า');

  const [apptDoctor, setApptDoctor] = useState('');
  const [apptHospital, setApptHospital] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('09:00');
  const [apptPurpose, setApptPurpose] = useState('');

  // Submit handers
  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({
      bloodPressureSys: Number(sys),
      bloodPressureDia: Number(dia),
      heartRate: Number(hr),
      bloodSugar: sugar ? Number(sugar) : undefined,
      weight: weight ? Number(weight) : undefined,
      note: note || undefined,
    });
    setShowLogRecord(false);
    // Reset form
    setNote('');
    setSugar('');
  };

  const handlePillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pillName) return;
    onAddPill({
      medicineName: pillName,
      dosage: pillDosage,
      time: pillTime,
      frequency: pillFreq,
    });
    setShowAddPill(false);
    setPillName('');
  };

  const handleApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptDoctor || !apptHospital || !apptDate) return;
    onAddAppointment({
      doctorName: apptDoctor,
      hospital: apptHospital,
      date: apptDate,
      time: apptTime,
      purpose: apptPurpose,
    });
    setShowAddAppt(false);
    setApptDoctor('');
    setApptHospital('');
    setApptDate('');
    setApptPurpose('');
  };

  // --- CUSTOM SVG LINE CHART ---
  // Renders a stunning responsive line chart of blood pressure history
  const renderLineChart = () => {
    const records = [...healthRecords].sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
    if (records.length < 2) {
      return (
        <div className="h-36 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-400">
          สะสมบันทึกมากกว่า 2 รายการเพื่อแสดงกราฟวิเคราะห์แนวโน้ม
        </div>
      );
    }

    const width = 280;
    const height = 130;
    const paddingLeft = 32;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 20;

    // Scale mapping values
    const minSys = Math.min(...records.map(r => r.bloodPressureSys), 100) - 10;
    const maxSys = Math.max(...records.map(r => r.bloodPressureSys), 140) + 10;
    const minDia = Math.min(...records.map(r => r.bloodPressureDia), 60) - 10;
    const maxDia = Math.max(...records.map(r => r.bloodPressureDia), 90) + 10;

    const minVal = Math.min(minSys, minDia);
    const maxVal = Math.max(maxSys, maxDia);

    const getX = (index: number) => {
      const step = (width - paddingLeft - paddingRight) / (records.length - 1);
      return paddingLeft + index * step;
    };

    const getY = (val: number) => {
      return height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
    };

    // Construct paths
    let sysPath = '';
    let diaPath = '';

    records.forEach((r, i) => {
      const x = getX(i);
      const ySys = getY(r.bloodPressureSys);
      const yDia = getY(r.bloodPressureDia);

      if (i === 0) {
        sysPath = `M ${x} ${ySys}`;
        diaPath = `M ${x} ${yDia}`;
      } else {
        sysPath += ` L ${x} ${ySys}`;
        diaPath += ` L ${x} ${yDia}`;
      }
    });

    return (
      <div className="bg-white p-3 border border-slate-100 rounded-2xl shadow-sm text-left">
        <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400 px-1">
          <div className="flex gap-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> SYS (ความดันบน)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> DIA (ความดันล่าง)</span>
          </div>
          <span>ประวัติ 5 ครั้งล่าสุด</span>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          <line x1={paddingLeft} y1={getY(120)} x2={width - paddingRight} y2={getY(120)} stroke="#F1F5F9" strokeDasharray="3 3" strokeWidth="1" />
          <line x1={paddingLeft} y1={getY(80)} x2={width - paddingRight} y2={getY(80)} stroke="#F1F5F9" strokeDasharray="3 3" strokeWidth="1" />
          <text x={paddingLeft - 5} y={getY(120) + 3} textAnchor="end" fontSize="7" fill="#EF4444" fontWeight="bold">120</text>
          <text x={paddingLeft - 5} y={getY(80) + 3} textAnchor="end" fontSize="7" fill="#10B981" fontWeight="bold">80</text>

          {/* Left Y-axis */}
          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Bottom X-axis */}
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Lines paths */}
          <path d={sysPath} fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d={diaPath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Scatter dots & value labels */}
          {records.map((r, i) => {
            const x = getX(i);
            const ySys = getY(r.bloodPressureSys);
            const yDia = getY(r.bloodPressureDia);
            const formattedDate = new Date(r.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

            return (
              <g key={r.id}>
                {/* Dots */}
                <circle cx={x} cy={ySys} r="4.5" fill="white" stroke="#EF4444" strokeWidth="2" />
                <circle cx={x} cy={yDia} r="4.5" fill="white" stroke="#10B981" strokeWidth="2" />

                {/* Values values overlay */}
                <text x={x} y={ySys - 8} textAnchor="middle" fontSize="7.5" fill="#EF4444" fontWeight="extrabold">
                  {r.bloodPressureSys}
                </text>
                <text x={x} y={yDia + 12} textAnchor="middle" fontSize="7.5" fill="#10B981" fontWeight="extrabold">
                  {r.bloodPressureDia}
                </text>

                {/* X labels */}
                <text x={x} y={height - 6} textAnchor="middle" fontSize="6.5" fill="#94A3B8" fontWeight="semibold">
                  {formattedDate}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[580px] h-full text-slate-800 bg-slate-50 select-none pb-8 relative">
      {/* --- TOP HEADER --- */}
      <div className="flex items-center p-5 border-b border-slate-100 bg-white sticky top-0 z-10 shadow-sm">
        <button
          onClick={onBack}
          id="btn-health-back"
          className="p-2 -ml-2 text-slate-600 hover:text-emerald-500 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-slate-800 ml-2">จัดการดูแลสุขภาพ</span>
      </div>

      {/* --- TABS SELECTOR --- */}
      <div className="px-5 pt-3.5 bg-white border-b border-slate-100">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-white text-emerald-600 shadow-sm scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📊 บันทึกตรวจวัด
          </button>
          <button
            onClick={() => setActiveTab('pills')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pills'
                ? 'bg-white text-emerald-600 shadow-sm scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            💊 แจ้งเตือนยา
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-white text-emerald-600 shadow-sm scale-[1.02]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🩺 ตารางนัดหมาย
          </button>
        </div>
      </div>

      {/* --- BODY SCROLL AREA --- */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px]">
        {/* ================= TAB 1: TRACKER ================= */}
        {activeTab === 'tracker' && (
          <div className="space-y-4">
            {/* Custom SVG BP Chart */}
            {renderLineChart()}

            {/* Quick stats grid */}
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-sm text-slate-800">บันทึกล่าสุด</span>
              <button
                onClick={() => setShowLogRecord(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> บันทึกค่าใหม่
              </button>
            </div>

            {/* Health Logs History List */}
            <div className="space-y-2.5">
              {healthRecords
                .slice()
                .reverse()
                .map(r => {
                  const isNormal = r.status === 'normal';
                  const isWarning = r.status === 'warning';
                  const formattedDate = new Date(r.date).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={r.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left relative flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400">{formattedDate} • {r.time} น.</span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                              isNormal
                                ? 'bg-emerald-100 text-emerald-700'
                                : isWarning
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isNormal ? 'ปกติ' : isWarning ? 'ควรระวัง' : 'เสี่ยงอันตราย'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-800">{r.bloodPressureSys}/{r.bloodPressureDia}</span>
                          <span className="text-[10px] font-bold text-slate-400">mmHg</span>
                          <span className="text-xs font-bold text-slate-500 ml-4">ชีพจร: <span className="font-extrabold text-slate-800">{r.heartRate}</span> bpm</span>
                        </div>
                        {r.bloodSugar && (
                          <div className="text-xs font-medium text-slate-500 flex gap-4">
                            <span>น้ำตาลในเลือด: <span className="font-extrabold text-emerald-600">{r.bloodSugar}</span> mg/dL</span>
                            {r.weight && <span>น้ำหนัก: <span className="font-extrabold text-slate-700">{r.weight}</span> กก.</span>}
                          </div>
                        )}
                        {r.note && <p className="text-[10.5px] text-slate-400 italic">บันทึกช่วยจำ: {r.note}</p>}
                      </div>

                      <div className="p-2 bg-slate-50 rounded-xl">
                        <Heart className={`w-5 h-5 ${isNormal ? 'text-emerald-500' : isWarning ? 'text-amber-500' : 'text-rose-500 animate-pulse'}`} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PILLS ================= */}
        {activeTab === 'pills' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-sm text-slate-800">แจ้งเตือนยาที่ป้าต้องทานวันนี้</span>
              <button
                onClick={() => setShowAddPill(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มการแจ้งยา
              </button>
            </div>

            <div className="space-y-2.5">
              {pills.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีการตั้งค่าแจ้งเตือนยา</p>
              ) : (
                pills.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onTogglePill(p.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left flex items-center justify-between ${
                      p.takenToday
                        ? 'border-emerald-500 bg-emerald-500/5 text-slate-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          p.takenToday ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        <span className="text-lg">💊</span>
                      </div>
                      <div>
                        <h4 className={`text-sm font-extrabold ${p.takenToday ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {p.medicineName}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                          ขนาด: {p.dosage} | เวลา: {p.time} น. ({p.frequency})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                          p.takenToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {p.takenToday && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {p.takenToday ? 'ทานแล้ว' : 'ยังไม่ได้ทาน'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: APPOINTMENTS ================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-sm text-slate-800">ตารางพบแพทย์</span>
              <button
                onClick={() => setShowAddAppt(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> เพิ่มนัดใหม่
              </button>
            </div>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีกำหนดนัดหมายตรวจโรค</p>
              ) : (
                appointments.map(ap => {
                  const formattedDate = new Date(ap.date).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={ap.id}
                      className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm text-left flex gap-3.5"
                    >
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 text-left flex-1">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md block w-fit">
                          {formattedDate} • {ap.time} น.
                        </span>
                        <h4 className="text-sm font-black text-slate-800">{ap.doctorName}</h4>
                        <p className="text-xs font-bold text-slate-500">{ap.hospital}</p>
                        <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded-xl mt-1.5 italic">
                          วัตถุประสงค์: {ap.purpose}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: LOG NEW MEASUREMENT ================= */}
      {showLogRecord && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-end justify-center p-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white w-full rounded-t-3xl max-w-sm p-6 text-left space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-base text-slate-800">🩺 บันทึกค่าสุขภาพป้าคุณปู่</span>
              <button onClick={() => setShowLogRecord(false)} className="text-xs text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-md">ปิด</button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">ความดัน Systolic (ตัวบน)</label>
                  <input
                    type="number"
                    value={sys}
                    onChange={e => setSys(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 bg-slate-50 text-center"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">ความดัน Diastolic (ตัวล่าง)</label>
                  <input
                    type="number"
                    value={dia}
                    onChange={e => setDia(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 bg-slate-50 text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">ชีพจร (ครั้ง/นาที)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={e => setHr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 bg-slate-50 text-center"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">น้ำตาลในเลือด (mg/dL)</label>
                  <input
                    type="number"
                    value={sugar}
                    onChange={e => setSugar(e.target.value)}
                    placeholder="ระบุหรือไม่ระบุก็ได้"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 bg-slate-50 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">น้ำหนักตัว (กก.)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="เช่น 58"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">บันทึกอาการช่วยจำ</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="เช่น ทานข้าวก่อนวัด 1 ชม."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-xs text-slate-700 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-emerald-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" /> บันทึกและวิเคราะห์ผลลัพธ์
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: ADD PILL REMINDER ================= */}
      {showAddPill && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-end justify-center p-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white w-full rounded-t-3xl max-w-sm p-6 text-left space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-base text-slate-800">💊 ตั้งค่าตารางแจ้งเตือนยา</span>
              <button onClick={() => setShowAddPill(false)} className="text-xs text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-md">ปิด</button>
            </div>

            <form onSubmit={handlePillSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-400">ชื่อยาที่กิน</label>
                <input
                  type="text"
                  value={pillName}
                  onChange={e => setPillName(e.target.value)}
                  placeholder="เช่น ยาควบคุมเบาหวาน (Metformin)"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">ขนาด / ปริมาณการกิน</label>
                  <input
                    type="text"
                    value={pillDosage}
                    onChange={e => setPillDosage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">เวลากลืนยา (น.)</label>
                  <input
                    type="time"
                    value={pillTime}
                    onChange={e => setPillTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">ความถี่และเงื่อนไขการกิน</label>
                <input
                  type="text"
                  value={pillFreq}
                  onChange={e => setPillFreq(e.target.value)}
                  placeholder="เช่น ทุกวันหลังอาหารเย็น, ก่อนนอน"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-emerald-600 transition-all cursor-pointer"
              >
                เพิ่มรายการแจ้งกินยา
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ================= MODAL: ADD APPOINTMENT ================= */}
      {showAddAppt && (
        <div className="absolute inset-0 bg-black/50 z-30 flex items-end justify-center p-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white w-full rounded-t-3xl max-w-sm p-6 text-left space-y-4"
          >
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-base text-slate-800">🩺 นัดหมายเข้าพบแพทย์</span>
              <button onClick={() => setShowAddAppt(false)} className="text-xs text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-md">ปิด</button>
            </div>

            <form onSubmit={handleApptSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-400">ชื่อแพทย์ / คลินิกประสาท</label>
                <input
                  type="text"
                  value={apptDoctor}
                  onChange={e => setApptDoctor(e.target.value)}
                  placeholder="เช่น นพ. เกริกเกียรติ สุขสว่าง"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">สถานพยาบาล / โรงพยาบาล</label>
                <input
                  type="text"
                  value={apptHospital}
                  onChange={e => setApptHospital(e.target.value)}
                  placeholder="เช่น โรงพยาบาลสมิติเวช สุขุมวิท"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400">วันที่นัดตรวจ</label>
                  <input
                    type="date"
                    value={apptDate}
                    onChange={e => setApptDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none text-xs text-slate-700 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">เวลานัดตรวจ (น.)</label>
                  <input
                    type="time"
                    value={apptTime}
                    onChange={e => setApptTime(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">วัตถุประสงค์การนัดหมาย</label>
                <input
                  type="text"
                  value={apptPurpose}
                  onChange={e => setApptPurpose(e.target.value)}
                  placeholder="เช่น เจาะเลือดและรับยาลดไขมันเพิ่ม"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-md hover:bg-emerald-600 transition-all cursor-pointer"
              >
                บันทึกกำหนดนัดหมายแพทย์
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
