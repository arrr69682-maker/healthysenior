import React, { useState } from 'react';
import { ArrowLeft, User, Heart, Shield, MapPin, Upload, CheckCircle2, Phone, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { UserType, ElderlyProfile, VolunteerProfile, User as AppUser } from '../types';
import { getDB, saveDB } from '../lib/db';

interface RegisterViewProps {
  userType: UserType;
  onRegisterSuccess: (user: AppUser) => void;
  onBack: () => void;
}

export default function RegisterView({ userType, onRegisterSuccess, onBack }: RegisterViewProps) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // General accounts state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Elderly specific
  const [gender, setGender] = useState('ชาย');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [regularMedicines, setRegularMedicines] = useState('');
  const [bloodType, setBloodType] = useState('O');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Volunteer specific
  const [organization, setOrganization] = useState('');
  const [abilities, setAbilities] = useState<string[]>([]);
  const [convenientTime, setConvenientTime] = useState('');
  const [volunteerCard, setVolunteerCard] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // GPS position (Simulated on button press)
  const [gps, setGps] = useState<{ lat: number; lng: number; addressName: string } | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);

  // Available Abilities checkboxes
  const AVAILABLE_ABILITIES = [
    'ปฐมพยาบาลเบื้องต้น',
    'ประคอง/ยกย้ายผู้ป่วย',
    'ขับรถพาไปโรงพยาบาล',
    'ทักษะ CPR',
    'วัดความดันโลหิต/น้ำตาล',
    'ดูแลประคับประคองจิตใจ'
  ];

  const handleAbilityChange = (ability: string) => {
    if (abilities.includes(ability)) {
      setAbilities(abilities.filter(a => a !== ability));
    } else {
      setAbilities([...abilities, ability]);
    }
  };

  // Simulate obtaining GPS coordinates
  const handleGetGps = () => {
    setIsGettingGps(true);
    setTimeout(() => {
      // Simulate real coordinates in Sukhumvit/Oonnut area
      const randomOffsetLat = (Math.random() - 0.5) * 0.01;
      const randomOffsetLng = (Math.random() - 0.5) * 0.01;
      setGps({
        lat: Number((13.7244 + randomOffsetLat).toFixed(4)),
        lng: Number((100.6015 + randomOffsetLng).toFixed(4)),
        addressName: 'แขวงสวนหลวง เขตสวนหลวง กรุงเทพมหานคร'
      });
      setIsGettingGps(false);
    }, 1200);
  };

  const handleNext = () => {
    setError('');
    
    // Step validation
    if (step === 1) {
      if (!name || !lastname || !age || !phone || !email || !password) {
        setError('กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน');
        return;
      }
      if (isNaN(Number(age)) || Number(age) <= 0) {
        setError('กรุณากรอกอายุที่ถูกต้อง');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (userType === UserType.ELDERLY) {
        if (!chronicDiseases || !regularMedicines) {
          setError('กรุณากรอกข้อมูลประวัติสุขภาพพื้นฐาน');
          return;
        }
        setStep(3);
      } else {
        // Volunteer step 2
        if (!address || !organization || !convenientTime) {
          setError('กรุณากรอกข้อมูลติดต่อและข้อมูลอาสาให้ครบถ้วน');
          return;
        }
        setStep(3);
      }
    } else if (step === 3) {
      if (userType === UserType.ELDERLY) {
        if (!emergencyContactName || !emergencyContactPhone || !address) {
          setError('กรุณากรอกข้อมูลผู้ติดต่อฉุกเฉินและที่อยู่');
          return;
        }
        setStep(4);
      } else {
        // Volunteer step 3 (Area & Verification)
        if (!gps) {
          setError('กรุณาปักหมุดตำแหน่งพิกัด GPS เพื่อใช้ค้นหาเคสใกล้ตัว');
          return;
        }
        setStep(4);
      }
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleRegisterSubmit = () => {
    setError('');
    const db = getDB();

    // Check email uniqueness
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError('อีเมลนี้เคยลงทะเบียนในระบบแล้ว');
      return;
    }

    if (userType === UserType.ELDERLY) {
      if (!gps) {
        setError('กรุณาระบุตำแหน่งพิกัดเพื่อใช้รับความช่วยเหลือ SOS');
        return;
      }
    }

    // 1. Create unique IDs
    const newUserId = `u-reg-${Date.now()}`;
    const newProfileId = `${userType === UserType.ELDERLY ? 'e' : 'v'}-reg-${Date.now()}`;

    // 2. Create User
    const newUser: AppUser = {
      id: newUserId,
      email: email,
      userType: userType,
      name: name,
      lastname: lastname,
      avatar: profilePic || (userType === UserType.ELDERLY 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
    };

    // 3. Create Profile
    if (userType === UserType.ELDERLY) {
      const elderlyProf: ElderlyProfile = {
        id: newProfileId,
        userId: newUserId,
        name: name,
        lastname: lastname,
        age: Number(age),
        gender: gender,
        phone: phone,
        address: address,
        gps: gps || { lat: 13.7244, lng: 100.6015, addressName: 'สวนหลวง, กรุงเทพฯ' },
        chronicDiseases: chronicDiseases,
        regularMedicines: regularMedicines,
        bloodType: bloodType,
        emergencyContactName: emergencyContactName,
        emergencyContactPhone: emergencyContactPhone
      };
      db.elderly.push(elderlyProf);

      // Create an initial Health log matching what they filled in
      db.health.push({
        id: `h-reg-${Date.now()}`,
        elderlyId: newProfileId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        bloodPressureSys: 120,
        bloodPressureDia: 80,
        heartRate: 72,
        status: 'normal',
        note: 'บันทึกอัตโนมัติจากการสมัครสมาชิก'
      });
    } else {
      const volunteerProf: VolunteerProfile = {
        id: newProfileId,
        userId: newUserId,
        name: name,
        lastname: lastname,
        age: Number(age),
        phone: phone,
        email: email,
        address: address,
        gps: gps || { lat: 13.7214, lng: 100.5995, addressName: 'สวนหลวง, กรุงเทพฯ' },
        organization: organization,
        abilities: abilities.length > 0 ? abilities : ['ช่วยเหลือทั่วไป'],
        convenientTime: convenientTime,
        volunteerCardUrl: volunteerCard || undefined,
        avatarUrl: profilePic || undefined,
        rating: 5.0,
        completedCasesCount: 0,
        isOnline: true
      };
      db.volunteers.push(volunteerProf);
    }

    // Save to users table
    db.users.push(newUser);

    // Save database state
    saveDB(db);

    // Callback on success
    onRegisterSuccess(newUser);
  };

  const isElderly = userType === UserType.ELDERLY;

  // Step headers lists
  const elderlySteps = ['ข้อมูลส่วนตัว', 'ข้อมูลสุขภาพ', 'ติดต่อฉุกเฉิน', 'ตำแหน่ง GPS'];
  const volunteerSteps = ['ข้อมูลส่วนตัว', 'ข้อมูลติดต่อ', 'ความสามารถ', 'อัปโหลดหลักฐาน'];

  const stepsList = isElderly ? elderlySteps : volunteerSteps;

  return (
    <div className="flex flex-col min-h-[580px] h-full bg-white text-slate-800 select-none pb-8">
      {/* Top Navigation */}
      <div className="flex items-center p-6 border-b border-slate-100 bg-slate-50/50">
        <button
          onClick={handleBackStep}
          id="btn-register-back"
          className="p-2 -ml-2 text-slate-600 hover:text-emerald-500 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-slate-800 ml-2">
          ลงทะเบียน {isElderly ? 'ผู้สูงอายุ' : 'อาสาสมัคร'}
        </span>
        <span className="ml-auto text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
          ขั้นตอน {step} / 4
        </span>
      </div>

      {/* Modern Multi-step progress tracker */}
      <div className="px-6 py-4 bg-emerald-50/20 border-b border-emerald-500/5">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 transition-all duration-300 z-0"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          {stepsList.map((stepName, idx) => {
            const currentIdx = idx + 1;
            const isCompleted = step > currentIdx;
            const isActive = step === currentIdx;

            return (
              <div key={idx} className="flex flex-col items-center z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-110'
                      : 'bg-white text-slate-400 border-2 border-slate-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : currentIdx}
                </div>
                <span
                  className={`text-[9px] mt-1.5 font-bold transition-all duration-300 ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {stepName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content Scrollable Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[420px]">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Personal Details (Both) */}
        {step === 1 && (
          <div className="space-y-3.5">
            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อจริง</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="กรอกชื่อจริง"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>

            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 block mb-1">นามสกุล</label>
              <input
                type="text"
                value={lastname}
                onChange={e => setLastname(e.target.value)}
                placeholder="กรอกนามสกุล"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">อายุ (ปี)</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="เช่น 72"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
                />
              </div>
              {isElderly ? (
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">เพศ</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50 h-[48px]"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                    <option value="อื่น ๆ">อื่น ๆ</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="เช่น 086-xxx-xxxx"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
                  />
                </div>
              )}
            </div>

            {isElderly && (
              <div className="text-left">
                <label className="text-xs font-bold text-slate-500 block mb-1">เบอร์โทรศัพท์มือถือ</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="เช่น 081-xxx-xxxx"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
                />
              </div>
            )}

            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 block mb-1">อีเมลผู้ใช้งาน</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ตัวอย่าง somjai@gmail.com"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>

            <div className="text-left">
              <label className="text-xs font-bold text-slate-500 block mb-1">รหัสผ่านสำหรับเข้าสู่ระบบ</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="รหัสผ่านอย่างน้อย 6 หลัก"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Elderly Health Info OR Volunteer Address & Org */}
        {step === 2 && isElderly && (
          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">กรุ๊ปเลือด</label>
              <div className="grid grid-cols-4 gap-2">
                {['A', 'B', 'AB', 'O'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBloodType(type)}
                    className={`py-2.5 rounded-xl font-bold border-2 transition-all cursor-pointer ${
                      bloodType === type
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/15'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">โรคประจำตัว (ระบุถ้าไม่มีใส่ "-")</label>
              <textarea
                value={chronicDiseases}
                onChange={e => setChronicDiseases(e.target.value)}
                placeholder="เช่น เบาหวาน, ความดันสูง, อัมพฤกษ์..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">ยาที่ใช้เป็นประจำและขนาดการกิน</label>
              <textarea
                value={regularMedicines}
                onChange={e => setRegularMedicines(e.target.value)}
                placeholder="เช่น ยาความดันโลหิต ทานเช้า 1 เม็ด..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50 resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && !isElderly && (
          <div className="space-y-3.5 text-left">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">ที่อยู่อาศัย / จุดแสตนด์บายช่วยเหลือ</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="กรอกบ้านเลขที่ ซอย ถนน แขวง เขต..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">หน่วยงาน / สังกัดอาสา (ถ้ามี)</label>
              <input
                type="text"
                value={organization}
                onChange={e => setOrganization(e.target.value)}
                placeholder="เช่น อาสาสมัครกู้ชีพร่วมกตัญญู, มูลนิธิหัวใจดี"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">ช่วงเวลาที่สะดวกพร้อมให้ความช่วยเหลือ</label>
              <input
                type="text"
                value={convenientTime}
                onChange={e => setConvenientTime(e.target.value)}
                placeholder="เช่น จันทร์-ศุกร์ เย็น, เสาร์-อาทิตย์ ตลอดวัน"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Elderly Emergency Contacts OR Volunteer Abilities */}
        {step === 3 && isElderly && (
          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">ชื่อผู้ติดต่อฉุกเฉิน (เช่น ลูก/ญาติ)</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={e => setEmergencyContactName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล และความสัมพันธ์"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉิน</label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={e => setEmergencyContactPhone(e.target.value)}
                placeholder="เบอร์มือถือที่ติดต่อได้ทันที 24 ชม."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">ที่อยู่อาศัยที่ป้า/ปู่อยู่จริงในปัจจุบัน</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="กรอกรายละเอียดสำหรับนำทางกรณีช่วยเหลือฉุกเฉิน บ้านเลขที่ ซอย ถนน เขต..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 outline-none text-sm transition-all bg-slate-50/50 resize-none"
              />
            </div>
          </div>
        )}

        {step === 3 && !isElderly && (
          <div className="space-y-3.5 text-left">
            <label className="text-xs font-bold text-slate-500 block mb-1">
              ทักษะและความรู้ความชำนาญเฉพาะตัว (เลือกได้หลายข้อ)
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {AVAILABLE_ABILITIES.map(ability => {
                const isSelected = abilities.includes(ability);
                return (
                  <button
                    key={ability}
                    type="button"
                    onClick={() => handleAbilityChange(ability)}
                    className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span>{ability}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Elderly GPS Pinpoint OR Volunteer Verification */}
        {step === 4 && (
          <div className="space-y-4 text-left">
            {isElderly ? (
              <div className="space-y-4">
                <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <MapPin className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">ยืนยันพิกัดที่อยู่ฉุกเฉิน</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      ตำแหน่งพิกัดนี้จะใช้ส่งตรงไปยังอาสาสมัครเมื่อกดปุ่ม SOS ฉุกเฉินเพื่อส่งรถช่วยเหลือได้ถูกต้อง
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={isGettingGps}
                    className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2 mx-auto shadow-md shadow-rose-500/10 cursor-pointer disabled:bg-rose-400"
                  >
                    {isGettingGps ? (
                      <>
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        กำลังจับสัญญาณ GPS...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" />
                        {gps ? 'ปักพิกัดใหม่แล้ว' : 'ปักหมุดพิกัดปัจจุบัน'}
                      </>
                    )}
                  </button>
                </div>

                {gps ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-emerald-800">
                      <span className="font-bold block">บันทึกตำแหน่งพิกัดเรียบร้อย</span>
                      <span className="font-mono text-[10px] text-emerald-600">
                        Latitude: {gps.lat} | Longitude: {gps.lng}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-center text-amber-600 font-bold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> กรุณาปักหมุด GPS เพื่อรับความมั่นใจ 100%
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">อัปโหลดภาพหลักฐานเพื่ออนุมัติบัญชีอาสา</h4>
                  <p className="text-[11px] text-slate-500">
                    เพื่อความปลอดภัยของผู้สูงอายุ อาสาจำเป็นต้องยื่นบัตรยืนยันตน
                  </p>
                </div>

                {/* Simulated ID Card Upload */}
                <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center hover:border-amber-500 transition-all cursor-pointer bg-slate-50/50"
                  onClick={() => setVolunteerCard('https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=300')}
                >
                  {volunteerCard ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-700">อัปโหลดบัตรประชาชนอาสาสมัครแล้ว</span>
                      <span className="text-[10px] text-slate-400">คลิกเพื่ออัปโหลดใหม่</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-7 h-7 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">คลิกจำลองอัปโหลดบัตรอาสารับรอง</span>
                      <span className="text-[10px] text-slate-400">PDF, JPG ขนาดไม่เกิน 5MB</span>
                    </div>
                  )}
                </div>

                {/* Profile Pic Upload */}
                <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center hover:border-emerald-500 transition-all cursor-pointer bg-slate-50/50"
                  onClick={() => setProfilePic('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')}
                >
                  {profilePic ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500">
                        <img src={profilePic} alt="Profile preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700">อัปโหลดรูปโปรไฟล์แล้ว</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <User className="w-7 h-7 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">คลิกจำลองอัปโหลดรูปภาพโปรไฟล์</span>
                      <span className="text-[10px] text-slate-400">สัดส่วนจัตุรัส ใบหน้าชัดเจน</span>
                    </div>
                  )}
                </div>

                {/* Simulated GPS capture for standby station */}
                <div className="bg-amber-50/50 border border-amber-200 p-3.5 rounded-xl text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold">บันทึกพิกัดศูนย์อาสาแสตนด์บาย</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={isGettingGps}
                    className="w-full py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer"
                  >
                    {isGettingGps ? 'กำลังดึงสัญญาณ...' : gps ? 'ปักพิกัดจุดแสตนด์บายใหม่' : 'จับพิกัดจุดสแตนด์บายของฉัน'}
                  </button>
                  {gps && (
                    <span className="text-[10px] font-mono text-amber-700 block mt-1">
                      Lat: {gps.lat}, Lng: {gps.lng} ({gps.addressName})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Action Controls Footer */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto flex gap-3">
        <button
          onClick={handleBackStep}
          className="flex-1 py-3 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer text-sm"
        >
          {step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
        </button>

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 cursor-pointer text-sm"
          >
            ต่อไป
          </button>
        ) : (
          <button
            onClick={handleRegisterSubmit}
            id="btn-register-submit"
            className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/15 cursor-pointer text-sm flex items-center justify-center gap-1"
          >
            <Sparkles className="w-4 h-4" />
            ยินยันลงทะเบียน
          </button>
        )}
      </div>
    </div>
  );
}
