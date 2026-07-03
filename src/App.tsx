import React, { useState, useEffect, useMemo } from 'react';
import { getDB, saveDB, resetDB, DatabaseState } from './lib/db';
import {
  User,
  UserType,
  ElderlyProfile,
  VolunteerProfile,
  HealthRecord,
  PillReminder,
  AppointmentReminder,
  SOSRequest,
  SOSStatus,
  AppNotification,
  Review,
  ChatMessage
} from './types';
import SplashView from './components/SplashView';
import UserTypeSelectionView from './components/UserTypeSelectionView';
import RegisterView from './components/RegisterView';
import LoginView from './components/LoginView';
import ElderlyHomeView from './components/ElderlyHomeView';
import HealthView from './components/HealthView';
import SosView from './components/SosView';
import VolunteersNearMeView from './components/VolunteersNearMeView';
import VolunteerHomeView from './components/VolunteerHomeView';
import AdminDashboardView from './components/AdminDashboardView';
import SimController from './components/SimController';

export default function App() {
  const [db, setDb] = useState<DatabaseState>(getDB());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'splash' | 'login' | 'selectType' | 'register' | 'home' | 'health' | 'sos' | 'maps' | 'admin'>('splash');
  const [selectedRegisterType, setSelectedRegisterType] = useState<UserType | null>(null);

  // Simulation Console States
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const addLog = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSimLogs(prev => [`[${timeStr}] ${msg}`, ...prev].slice(0, 50));
  };

  // Sync database state reactive helper
  const syncDB = (updatedState: DatabaseState) => {
    saveDB(updatedState);
    setDb(updatedState);
  };

  // Reset database state back to defaults
  const handleResetDatabase = () => {
    if (isDemoRunning) return;
    const cleanState = resetDB();
    setDb(cleanState);
    setCurrentUser(null);
    setActiveTab('splash');
    setSimLogs([]);
    addLog('รีเซ็ตฐานข้อมูลเป็นค่าตั้งต้นเรียบร้อย');
  };

  // Switch role instantly via Simulation operators
  const handleRoleSwitch = (role: UserType) => {
    if (isDemoRunning) return;
    const dbState = getDB();
    
    let targetUser: User | null = null;
    if (role === UserType.ELDERLY) {
      targetUser = dbState.users.find(u => u.userType === UserType.ELDERLY) || null;
      addLog(`จำลองสลับเป็น: ผู้สูงอายุ (คุณยายสมใจ)`);
    } else if (role === UserType.VOLUNTEER) {
      targetUser = dbState.users.find(u => u.userType === UserType.VOLUNTEER && u.email === 'kittipong@gmail.com') || null;
      addLog(`จำลองสลับเป็น: อาสาสมัคร (คุณกิตติพงษ์)`);
    } else if (role === UserType.ADMIN) {
      targetUser = dbState.users.find(u => u.userType === UserType.ADMIN) || null;
      addLog(`จำลองสลับเป็น: ผู้ดูแลระบบ (แอดมิน)`);
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      if (role === UserType.ADMIN) {
        setActiveTab('admin');
      } else {
        setActiveTab('home');
      }
    }
  };

  // --- COMPUTE PROFILE CONTEXTS ---
  const currentElderlyProfile = useMemo(() => {
    if (!currentUser || currentUser.userType !== UserType.ELDERLY) return null;
    return db.elderly.find(e => e.userId === currentUser.id) || null;
  }, [db.elderly, currentUser]);

  const currentVolunteerProfile = useMemo(() => {
    if (!currentUser || currentUser.userType !== UserType.VOLUNTEER) return null;
    return db.volunteers.find(v => v.userId === currentUser.id) || null;
  }, [db.volunteers, currentUser]);

  const latestHealthRecord = useMemo(() => {
    if (!currentElderlyProfile) return null;
    const records = db.health.filter(h => h.elderlyId === currentElderlyProfile.id);
    if (records.length === 0) return null;
    return records[records.length - 1];
  }, [db.health, currentElderlyProfile]);

  const activeSos = useMemo(() => {
    if (!currentUser || currentUser.userType !== UserType.ELDERLY || !currentElderlyProfile) return null;
    return db.sosRequests.find(
      s => s.elderlyId === currentElderlyProfile.id && s.status !== SOSStatus.CANCELLED
    ) || null;
  }, [db.sosRequests, currentUser, currentElderlyProfile]);

  const activeRescue = useMemo(() => {
    if (!currentUser || currentUser.userType !== UserType.VOLUNTEER || !currentVolunteerProfile) return null;
    return db.sosRequests.find(
      s => s.volunteerId === currentVolunteerProfile.id && s.status !== SOSStatus.COMPLETED && s.status !== SOSStatus.CANCELLED
    ) || null;
  }, [db.sosRequests, currentUser, currentVolunteerProfile]);

  const incomingSosForVolunteer = useMemo(() => {
    // Return any SOS request in searching state
    return db.sosRequests.find(s => s.status === SOSStatus.SEARCHING) || null;
  }, [db.sosRequests]);

  const currentChatMessages = useMemo(() => {
    const activeSosId = activeSos?.id || activeRescue?.id;
    if (!activeSosId) return [];
    return db.chats.filter(c => c.sosRequestId === activeSosId);
  }, [db.chats, activeSos, activeRescue]);

  const currentNotifications = useMemo(() => {
    if (!currentUser) return [];
    return db.notifications.filter(n => n.recipientId === currentUser.id);
  }, [db.notifications, currentUser]);

  const currentRescueHistory = useMemo(() => {
    if (!currentVolunteerProfile) return [];
    return db.sosRequests.filter(s => s.volunteerId === currentVolunteerProfile.id && s.status === SOSStatus.COMPLETED);
  }, [db.sosRequests, currentVolunteerProfile]);

  // --- ACTIONS HANDLERS ---

  // Log new health measurements
  const handleAddHealthRecord = (record: { bloodPressureSys: number; bloodPressureDia: number; heartRate: number; bloodSugar?: number; weight?: number; note?: string }) => {
    if (!currentElderlyProfile) return;
    const dbState = { ...db };
    
    // Evaluate warning status
    let status: 'normal' | 'warning' | 'danger' = 'normal';
    if (record.bloodPressureSys >= 140 || record.bloodPressureDia >= 90) {
      status = 'danger';
    } else if (record.bloodPressureSys >= 130 || record.bloodPressureDia >= 85) {
      status = 'warning';
    }

    const newRecord: HealthRecord = {
      id: `h-logged-${Date.now()}`,
      elderlyId: currentElderlyProfile.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      ...record,
      status
    };

    dbState.health.push(newRecord);

    // If danger status, automatically push an alert notification to notifications table!
    if (status === 'danger') {
      dbState.notifications.push({
        id: `n-bp-alert-${Date.now()}`,
        recipientId: currentUser!.id,
        title: '⚠️ ตรวจพบความดันโลหิตสูงเกินเกณฑ์',
        body: `ความดันวัดได้ ${record.bloodPressureSys}/${record.bloodPressureDia} mmHg อยู่ในระดับอันตราย โปรดพักผ่อน 15 นาทีแล้ววัดใหม่ หากรู้สึกเวียนหัว โปรดกดปุ่ม SOS ทันที`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'system'
      });
      addLog(`ตรวจพบคลิกวัดค่าความดันระดับวิกฤติ! ส่งแจ้งเตือนคำเตือนความปลอดภัยทันที`);
    } else {
      addLog(`ผู้สูงอายุบันทึกข้อมูลสุขภาพสำเร็จ: BP ${record.bloodPressureSys}/${record.bloodPressureDia}, ชีพจร ${record.heartRate}`);
    }

    syncDB(dbState);
  };

  // Toggle Medicine pills taken state
  const handleTogglePill = (pillId: string) => {
    const dbState = { ...db };
    const matchedPill = dbState.pills.find(p => p.id === pillId);
    if (matchedPill) {
      matchedPill.takenToday = !matchedPill.takenToday;
      addLog(`ผู้สูงอายุทำรายการแจ้งเตือนกินยา: ${matchedPill.medicineName} -> ${matchedPill.takenToday ? 'รับทานยาแล้ว' : 'ยกเลิก'}`);
      syncDB(dbState);
    }
  };

  const handleAddPill = (pill: { medicineName: string; dosage: string; time: string; frequency: string }) => {
    if (!currentElderlyProfile) return;
    const dbState = { ...db };
    const newPill: PillReminder = {
      id: `p-added-${Date.now()}`,
      elderlyId: currentElderlyProfile.id,
      ...pill,
      isActive: true,
      takenToday: false
    };
    dbState.pills.push(newPill);
    addLog(`เพิ่มการแจ้งเตือนกินยาสำเร็จ: ${pill.medicineName}`);
    syncDB(dbState);
  };

  const handleAddAppointment = (appt: { doctorName: string; hospital: string; date: string; time: string; purpose: string }) => {
    if (!currentElderlyProfile) return;
    const dbState = { ...db };
    const newAppt: AppointmentReminder = {
      id: `ap-added-${Date.now()}`,
      elderlyId: currentElderlyProfile.id,
      ...appt
    };
    dbState.appointments.push(newAppt);
    addLog(`ลงตารางนัดตรวจพบแพทย์สำเร็จ: ${appt.doctorName} ณ ${appt.hospital}`);
    syncDB(dbState);
  };

  // TRIGGER SOS EMERGENCY
  const handleTriggerSos = () => {
    if (!currentElderlyProfile || !currentUser) return;
    const dbState = { ...db };

    const newSos: SOSRequest = {
      id: `sos-req-${Date.now()}`,
      elderlyId: currentElderlyProfile.id,
      elderlyName: `${currentElderlyProfile.name} ${currentElderlyProfile.lastname}`,
      elderlyPhone: currentElderlyProfile.phone,
      gps: currentElderlyProfile.gps,
      timestamp: new Date().toISOString(),
      status: SOSStatus.SEARCHING
    };

    dbState.sosRequests.push(newSos);

    // Push simulated loud FCM push notifications to all volunteer users!
    dbState.users.forEach(u => {
      if (u.userType === UserType.VOLUNTEER) {
        dbState.notifications.push({
          id: `n-sos-alert-${Date.now()}-${u.id}`,
          recipientId: u.id,
          title: '🚨 เกิดเหตุ SOS ด่วน!',
          body: `คุณยาย${currentElderlyProfile.name} กดแจ้งเหตุฉุกเฉินด่วน ห่างจากท่าน 350 เมตร โปรดเปิดแอปรับเคสช่วยชีวิตคนไข้!`,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'sos',
          referenceId: newSos.id
        });
      }
    });

    addLog(`🔊 คุณยาย ${currentElderlyProfile.name} สตาร์ทกดสัญญาณฉุกเฉิน SOS! แจ้งเตือนส่งสัญญาณไปยังอาสาสมัครในพิกัดใกล้สุด`);
    syncDB(dbState);
  };

  // CANCEL SOS
  const handleCancelSos = () => {
    if (!activeSos) return;
    const dbState = { ...db };
    const matchedSos = dbState.sosRequests.find(s => s.id === activeSos.id);
    if (matchedSos) {
      matchedSos.status = SOSStatus.CANCELLED;
      addLog(`❌ คุณยายกดยกเลิกสัญญาณแจ้งฉุกเฉิน SOS แล้ว`);
      syncDB(dbState);
    }
  };

  // VOLUNTEER ACCEPTS EMERGENCY CASE
  const handleAcceptCase = (sosId: string) => {
    if (!currentVolunteerProfile || !currentUser) return;
    const dbState = { ...db };
    const matchedSos = dbState.sosRequests.find(s => s.id === sosId);
    
    if (matchedSos) {
      matchedSos.status = SOSStatus.ACCEPTED;
      matchedSos.volunteerId = currentVolunteerProfile.id;
      matchedSos.volunteerName = `${currentVolunteerProfile.name} ${currentVolunteerProfile.lastname}`;
      matchedSos.volunteerPhone = currentVolunteerProfile.phone;
      matchedSos.volunteerGps = { lat: currentVolunteerProfile.gps.lat, lng: currentVolunteerProfile.gps.lng };

      // Send accepted feedback push back to the elderly patient
      const elderlyUser = dbState.elderly.find(e => e.id === matchedSos.elderlyId);
      if (elderlyUser) {
        dbState.notifications.push({
          id: `n-sos-accepted-${Date.now()}`,
          recipientId: elderlyUser.userId,
          title: '💚 อาสาสมัครกำลังเข้าช่วยเหลือ',
          body: `คุณ${currentVolunteerProfile.name} สังกัด ${currentVolunteerProfile.organization} ตอบรับเคสแล้ว กำลังรีบเดินทางเข้าหาท่าน`,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'accept'
        });
      }

      addLog(`🧑‍⚕️ อาสาสมัครคุณ ${currentVolunteerProfile.name} กดรับเคสฉุกเฉินเรียบร้อย กำลังแสตนด์บายเตรียมเคลื่อนย้าย`);
      syncDB(dbState);

      // Simulate vehicle traveling automatic transition after 3 seconds
      setTimeout(() => {
        const checkDb = getDB();
        const activeCall = checkDb.sosRequests.find(s => s.id === sosId);
        if (activeCall && activeCall.status === SOSStatus.ACCEPTED) {
          activeCall.status = SOSStatus.ON_THE_WAY;
          addLog(`🚲 อาสาเข้าสู่ขั้นตอน: กำลังเดินทาง (On the way) นำทางความปลอดภัยผ่าน GPS`);
          saveDB(checkDb);
          setDb(checkDb);
        }
      }, 3000);
    }
  };

  // Decline/Skip Case
  const handleDeclineCase = (sosId: string) => {
    addLog(`อาสาสมัครปัดผ่านเคส ให้เครือข่ายศูนย์กู้ชีพเวียนมอบหมายคนต่อไป`);
    // Close the incoming view state locally
  };

  // COMPLETE RESCUE
  const handleCompleteCase = (sosId: string) => {
    const dbState = { ...db };
    const matchedSos = dbState.sosRequests.find(s => s.id === sosId);
    if (matchedSos) {
      matchedSos.status = SOSStatus.COMPLETED;
      
      // Update volunteer total completed counts
      if (matchedSos.volunteerId) {
        const matchedVol = dbState.volunteers.find(v => v.id === matchedSos.volunteerId);
        if (matchedVol) {
          matchedVol.completedCasesCount += 1;
        }
      }

      addLog(`🎉 อาสาสมัครเข้าถึงที่หมาย ทำภารกิจกู้ชีพปฐมพยาบาลเสร็จสิ้นเรียบร้อย ปลอดภัยดี!`);
      syncDB(dbState);
    }
  };

  // SEND CHAT MESSAGE
  const handleSendChatMessage = (text: string) => {
    if (!currentUser) return;
    const activeSosId = activeSos?.id || activeRescue?.id;
    if (!activeSosId) return;

    const dbState = { ...db };
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sosRequestId: activeSosId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString()
    };

    dbState.chats.push(newMsg);
    addLog(`💬 ข้อความแชทส่งสำเร็จโดย [คุณ ${currentUser.name}]: "${text}"`);
    syncDB(dbState);
  };

  // SUBMIT REVIEW FEEDBACK
  const handleReviewSubmit = (rating: number, comment: string) => {
    if (!activeSos) return;
    const dbState = { ...db };
    const matchedSos = dbState.sosRequests.find(s => s.id === activeSos.id);
    
    if (matchedSos && matchedSos.volunteerId) {
      matchedSos.rating = rating;
      matchedSos.reviewComment = comment;

      // Log review details
      const newReview: Review = {
        id: `r-added-${Date.now()}`,
        sosRequestId: matchedSos.id,
        volunteerId: matchedSos.volunteerId,
        elderlyId: matchedSos.elderlyId,
        elderlyName: matchedSos.elderlyName,
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      dbState.reviews.push(newReview);

      // Recalculate volunteer average rating
      const volReviews = dbState.reviews.filter(r => r.volunteerId === matchedSos.volunteerId);
      const matchedVol = dbState.volunteers.find(v => v.id === matchedSos.volunteerId);
      if (matchedVol && volReviews.length > 0) {
        const avg = volReviews.reduce((sum, r) => sum + r.rating, 0) / volReviews.length;
        matchedVol.rating = Number(avg.toFixed(1));
      }

      // Add feedback notification for volunteer to feel proud
      const volunteerUser = dbState.volunteers.find(v => v.id === matchedSos.volunteerId);
      if (volunteerUser) {
        dbState.notifications.push({
          id: `n-review-${Date.now()}`,
          recipientId: volunteerUser.userId,
          title: '🌟 เคสช่วยเหลือเสร็จสิ้น (คำชมจากคนไข้)',
          body: `คุณยายให้คะแนนความพอใจ ${rating} ดาว และกล่าวว่า: "${comment}" ขอชื่นชมในความดีงามครับ!`,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'review'
        });
      }

      addLog(`⭐️ คนไข้ส่งประเมินผลสำเร็จ: ให้คะแนนอาสาสมัคร ${rating} ดาว พร้อมรีวิวชื่นชม`);
      syncDB(dbState);
    }
  };

  // ================= THE FULL LIVE AUTOMATED RESCUE SCENARIO SIMULATION =================
  const handleRunAutoDemo = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    addLog('🚩 สตาร์ทเริ่มรันโหมดจำลองเคสฉุกเฉิน SOS ทั้งระบะด่วนแบบเรียลไทม์ (Auto Demo Mode)...');

    // 1. Log in as Grandma Somjai
    const dbState = getDB();
    const somjaiUser = dbState.users.find(u => u.userType === UserType.ELDERLY)!;
    
    // Step 1: Grandma somjai dashboard
    setCurrentUser(somjaiUser);
    setActiveTab('home');
    addLog('สลับมุมมองเข้าสู่ระบบเป็น: [ผู้สูงอายุ (คุณยายสมใจ อุ่นใจ)] ตรวจสุขภาพประตัวปกติ');

    // Step 2: Open SOS tab after 1.8 seconds
    setTimeout(() => {
      setActiveTab('sos');
      addLog('ระบบจำลองจำลองแตะเมนู: [SOS ขอความช่วยเหลือด่วน] สีแดงขนาดใหญ่');
    }, 1800);

    // Step 3: Trigger SOS after 3.2 seconds
    setTimeout(() => {
      // Trigger the SOS Request manually in code to avoid double count downs during demo
      const demoDb = getDB();
      const somjaiProf = demoDb.elderly.find(e => e.userId === somjaiUser.id)!;
      const demoSos: SOSRequest = {
        id: 'sos-demo-active',
        elderlyId: somjaiProf.id,
        elderlyName: `${somjaiProf.name} ${somjaiProf.lastname}`,
        elderlyPhone: somjaiProf.phone,
        gps: somjaiProf.gps,
        timestamp: new Date().toISOString(),
        status: SOSStatus.SEARCHING
      };
      
      // Clear any remaining active so we don't duplicate
      demoDb.sosRequests = demoDb.sosRequests.filter(s => s.status === SOSStatus.COMPLETED || s.id !== 'sos-demo-active');
      demoDb.sosRequests.push(demoSos);

      // Notify volunteers
      demoDb.users.forEach(u => {
        if (u.userType === UserType.VOLUNTEER) {
          demoDb.notifications.push({
            id: `n-demo-${Date.now()}-${u.id}`,
            recipientId: u.id,
            title: '🚨 เคส SOS ฉุกเฉินล้มในบ้าน!',
            body: 'คุณยายสมใจเกิดอาการหน้ามืดและหกล้ม ต้องการความช่วยเหลือด่วน!',
            timestamp: new Date().toISOString(),
            isRead: false,
            type: 'sos',
            referenceId: demoSos.id
          });
        }
      });

      saveDB(demoDb);
      setDb(demoDb);
      addLog('📢 สัญญาณแจ้งฉุกเฉิน SOS ถูกปล่อยออกแล้ว! ระบบค้นหาพิกัดและกระจายสัญญาณไซเรนไปในเครือข่าย');
    }, 3500);

    // Step 4: Swap to Volunteer view after 5.5 seconds to show Alert ringing
    setTimeout(() => {
      const demoDb = getDB();
      const kittipongUser = demoDb.users.find(u => u.email === 'kittipong@gmail.com')!;
      setCurrentUser(kittipongUser);
      setActiveTab('home');
      addLog('🔊 สวิตช์มุมมองอัตโนมัติไปยัง: [อาสาสมัคร (คุณกิตติพงษ์)] ได้รับสัญญาณไซเรนสั่นเตือนภัยพิกัดคนไข้!');
    }, 5500);

    // Step 5: Volunteer Accepts case after 8.5 seconds
    setTimeout(() => {
      const demoDb = getDB();
      const currentVolProf = demoDb.volunteers.find(v => v.userId === 'u-volunteer-1')!;
      const matchedSos = demoDb.sosRequests.find(s => s.id === 'sos-demo-active')!;

      matchedSos.status = SOSStatus.ACCEPTED;
      matchedSos.volunteerId = currentVolProf.id;
      matchedSos.volunteerName = `${currentVolProf.name} ${currentVolProf.lastname}`;
      matchedSos.volunteerPhone = currentVolProf.phone;
      matchedSos.volunteerGps = { lat: currentVolProf.gps.lat, lng: currentVolProf.gps.lng };

      // Send accepted feedback push back to the elderly patient
      demoDb.notifications.push({
        id: `n-demo-accept-${Date.now()}`,
        recipientId: somjaiUser.id,
        title: '💚 อาสาสมัครกิตติพงษ์รับเคสแล้ว',
        body: `คุณกิตติพงษ์กำลังวิ่งฝ่าการจราจรรีบเดินทางเข้าไปยังพิกัดบ้านท่านอย่างเร่งด่วน`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'accept'
      });

      saveDB(demoDb);
      setDb(demoDb);
      addLog('🧑‍⚕️ อาสาสมัครกิตติพงษ์ ตะลีตะลานกด: [รับเคสช่วยชีวิต (Accept)] ระบบคำนวณเส้นทางขับขี่ทันที');
    }, 8500);

    // Step 6: Volunteer messages and moves to travelling phase after 11 seconds
    setTimeout(() => {
      const demoDb = getDB();
      const matchedSos = demoDb.sosRequests.find(s => s.id === 'sos-demo-active')!;
      matchedSos.status = SOSStatus.ON_THE_WAY;

      // Add volunteer chat message
      demoDb.chats.push({
        id: `chat-demo-${Date.now()}`,
        sosRequestId: matchedSos.id,
        senderId: 'u-volunteer-1',
        senderName: 'กิตติพงษ์ อาสา',
        text: 'สวัสดีครับป้าสมใจ ไม่ต้องตกใจนะครับ ผมสแตนด์บายอยู่ปากซอย 17 กำลังวิ่งเท้าเข้าไปหาป้าทันที ไม่เกิน 2 นาทีถึงเตียงเลยครับ!',
        timestamp: new Date().toISOString()
      });

      saveDB(demoDb);
      setDb(demoDb);
      addLog('🚲 อาสาสมัครปรับทิศทาง: [กำลังเดินทางมาหาคุณปู่] พร้อมแชทส่งพิกัดข้อความความมั่นใจให้ลุ้นสั่นกลัว');
    }, 11000);

    // Step 7: Swap back to Elderly perspective after 13.5 seconds to show status & reply chat
    setTimeout(() => {
      setCurrentUser(somjaiUser);
      setActiveTab('sos');
      addLog('👵 สวิตช์มุมมองกลับมาที่: [คุณยายสมใจ] ติดตามความเคลื่อนไหวผ่านแผนที่นำทางแบบเรียลไทม์');
    }, 13500);

    // Step 8: Elderly automatic chat reply at 15.5 seconds
    setTimeout(() => {
      const demoDb = getDB();
      demoDb.chats.push({
        id: `chat-demo-reply-${Date.now()}`,
        sosRequestId: 'sos-demo-active',
        senderId: 'u-elderly-1',
        senderName: 'คุณยายสมใจ',
        text: 'ขอบใจมากเลยลูกยายล้มลุกไม่ไหวปวดข้อเท้า นอนรออยู่ข้างเตียงนะลูกเอ๊ย',
        timestamp: new Date().toISOString()
      });
      saveDB(demoDb);
      setDb(demoDb);
      addLog('ยายส่งข้อความแชทตอบรับอาสา: "ขอบใจมากเลยลูกยายล้มลุกไม่ไหวปวดข้อเท้า..."');
    }, 15500);

    // Step 9: Rescue completed at 18 seconds
    setTimeout(() => {
      const demoDb = getDB();
      const matchedSos = demoDb.sosRequests.find(s => s.id === 'sos-demo-active')!;
      matchedSos.status = SOSStatus.COMPLETED;

      // Update volunteer total completed counts
      const matchedVol = demoDb.volunteers.find(v => v.id === 'v-1')!;
      matchedVol.completedCasesCount += 1;

      saveDB(demoDb);
      setDb(demoDb);
      addLog('🎉 อาสาเดินทางถึงบ้าน พยุงลุกวัดความดันปฐมพยาบาลจนอาการปกติดี และกด: [ช่วยเหลือเสร็จสิ้น]');
    }, 18000);

    // Step 10: Feedback submittion at 21.5 seconds
    setTimeout(() => {
      const demoDb = getDB();
      const matchedSos = demoDb.sosRequests.find(s => s.id === 'sos-demo-active')!;
      matchedSos.rating = 5;
      matchedSos.reviewComment = 'คุณอาสากิตติพงษ์น่ารักมาก เข้าพึ่งถึงรวดเร็วมาก ช่วยดูแลประคองจนลุกพยุงปลอดภัย ประทับใจที่สุดค่ะ!';

      // Log review details
      demoDb.reviews.push({
        id: `r-demo-rev-${Date.now()}`,
        sosRequestId: matchedSos.id,
        volunteerId: matchedSos.volunteerId!,
        elderlyId: matchedSos.elderlyId,
        elderlyName: matchedSos.elderlyName,
        rating: 5,
        comment: matchedSos.reviewComment,
        date: new Date().toISOString().split('T')[0]
      });

      // Recalculate average rating
      const volReviews = demoDb.reviews.filter(r => r.volunteerId === 'v-1');
      const matchedVol = demoDb.volunteers.find(v => v.id === 'v-1')!;
      const avg = volReviews.reduce((sum, r) => sum + r.rating, 0) / volReviews.length;
      matchedVol.rating = Number(avg.toFixed(1));

      // Push final review notification for Volunteer
      demoDb.notifications.push({
        id: `n-demo-review-${Date.now()}`,
        recipientId: 'u-volunteer-1',
        title: '🌟 ชื่นชมประเมินผลความดี 5 ดาว!',
        body: 'คุณยายสมใจ อุ่นใจ ส่งประเมินผล: "คุณอาสากิตติพงษ์น่ารักมาก เข้าช่วยเหลืออย่างรวดเร็วมาก..."',
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'review'
      });

      // Clear the active SOS request so they return to standard dashboard
      demoDb.sosRequests = demoDb.sosRequests.filter(s => s.id !== 'sos-demo-active');
      
      saveDB(demoDb);
      setDb(demoDb);
      setCurrentUser(somjaiUser);
      setActiveTab('home');
      setIsDemoRunning(false);
      addLog('🏆 จำลองระบบ SOS ครบวงจรเสร็จสมบูรณ์! การทดสอบช่วยเหลือเสร็จสิ้นและบันทึกประวัติความดีแล้ว');
    }, 21500);
  };

  // Render correct simulated phone viewport view based on active state
  const renderPhoneView = () => {
    switch (activeTab) {
      case 'splash':
        return (
          <SplashView
            onLoginClick={() => setActiveTab('login')}
            onRegisterClick={() => setActiveTab('selectType')}
            onQuickSim={(role) => handleRoleSwitch(role as UserType)}
          />
        );
      case 'selectType':
        return (
          <UserTypeSelectionView
            onSelect={(type) => {
              setSelectedRegisterType(type);
              setActiveTab('register');
            }}
            onBack={() => setActiveTab('splash')}
          />
        );
      case 'register':
        return (
          <RegisterView
            userType={selectedRegisterType || UserType.ELDERLY}
            onRegisterSuccess={(newUser) => {
              setCurrentUser(newUser);
              addLog(`ยินดีต้อนรับสมาชิกใหม่! ลงทะเบียนสำเร็จ: คุณ ${newUser.name}`);
              setActiveTab(newUser.userType === UserType.ADMIN ? 'admin' : 'home');
            }}
            onBack={() => setActiveTab('selectType')}
          />
        );
      case 'login':
        return (
          <LoginView
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              addLog(`เข้าสู่ระบบสำเร็จ: คุณ ${user.name} (${user.userType === 'elderly' ? 'ผู้สูงอายุ' : user.userType === 'volunteer' ? 'อาสาสมัคร' : 'ผู้ดูแลระบบ'})`);
              setActiveTab(user.userType === UserType.ADMIN ? 'admin' : 'home');
            }}
            onRegisterClick={() => setActiveTab('selectType')}
            onBack={() => setActiveTab('splash')}
          />
        );
      case 'home':
        if (currentUser?.userType === UserType.ELDERLY && currentElderlyProfile) {
          return (
            <ElderlyHomeView
              user={currentUser}
              profile={currentElderlyProfile}
              latestHealth={latestHealthRecord}
              notifications={currentNotifications}
              onNavigate={(tab) => {
                if (tab === 'home') setActiveTab('home');
                if (tab === 'health') setActiveTab('health');
                if (tab === 'sos') setActiveTab('sos');
                if (tab === 'maps') setActiveTab('maps');
              }}
              onLogout={() => {
                setCurrentUser(null);
                setActiveTab('splash');
              }}
            />
          );
        } else if (currentUser?.userType === UserType.VOLUNTEER && currentVolunteerProfile) {
          return (
            <VolunteerHomeView
              user={currentUser}
              profile={currentVolunteerProfile}
              incomingSos={incomingSosForVolunteer}
              activeRescue={activeRescue}
              rescueHistory={currentRescueHistory}
              chatMessages={currentChatMessages}
              onAcceptCase={(sosId) => handleAcceptCase(sosId)}
              onDeclineCase={(sosId) => handleDeclineCase(sosId)}
              onCompleteCase={(sosId) => handleCompleteCase(sosId)}
              onSendChatMessage={(txt) => handleSendChatMessage(txt)}
              onLogout={() => {
                setCurrentUser(null);
                setActiveTab('splash');
              }}
            />
          );
        }
        return <p className="p-10">เกิดข้อผิดพลาดในการดึงโปรไฟล์ผู้ใช้งาน</p>;
      case 'health':
        if (currentElderlyProfile) {
          // Get specific health, pills, apps
          const elderlyHealth = db.health.filter(h => h.elderlyId === currentElderlyProfile.id);
          const elderlyPills = db.pills.filter(p => p.elderlyId === currentElderlyProfile.id);
          const elderlyApps = db.appointments.filter(ap => ap.elderlyId === currentElderlyProfile.id);

          return (
            <HealthView
              profile={currentElderlyProfile}
              healthRecords={elderlyHealth}
              pills={elderlyPills}
              appointments={elderlyApps}
              onAddRecord={(rec) => handleAddHealthRecord(rec)}
              onTogglePill={(pid) => handleTogglePill(pid)}
              onAddPill={(p) => handleAddPill(p)}
              onAddAppointment={(ap) => handleAddAppointment(ap)}
              onBack={() => setActiveTab('home')}
            />
          );
        }
        return null;
      case 'sos':
        if (currentElderlyProfile) {
          return (
            <SosView
              profile={currentElderlyProfile}
              activeSos={activeSos}
              assignedVolunteer={
                activeSos?.volunteerId ? db.volunteers.find(v => v.id === activeSos.volunteerId) || null : null
              }
              chatMessages={currentChatMessages}
              onTriggerSos={handleTriggerSos}
              onCancelSos={handleCancelSos}
              onSendChatMessage={(txt) => handleSendChatMessage(txt)}
              onSubmitReview={(stars, comm) => {
                handleReviewSubmit(stars, comm);
                // After submitting, clear the active SOS request so the view returns to standard
                const checkDb = getDB();
                checkDb.sosRequests = checkDb.sosRequests.filter(s => s.id !== activeSos?.id);
                saveDB(checkDb);
                setDb(checkDb);
              }}
              onBack={() => setActiveTab('home')}
            />
          );
        }
        return null;
      case 'maps':
        if (currentElderlyProfile) {
          return (
            <VolunteersNearMeView
              profile={currentElderlyProfile}
              volunteers={db.volunteers}
              onBack={() => setActiveTab('home')}
            />
          );
        }
        return null;
      case 'admin':
        return (
          <AdminDashboardView
            users={db.users}
            elderly={db.elderly}
            volunteers={db.volunteers}
            sosRequests={db.sosRequests}
            onBack={() => setActiveTab('splash')}
            onLogout={() => {
              setCurrentUser(null);
              setActiveTab('splash');
            }}
          />
        );
      default:
        return <p className="p-8">ไม่พบพิกัดหน้าตาที่กำหนด</p>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 md:gap-8 font-sans">
      
      {/* --- LEFT HAND: APP INTRO & MANUAL CONFIG --- */}
      <div className="hidden lg:flex flex-col max-w-[280px] text-left space-y-5 select-none">
        <div className="space-y-2">
          <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-widest block">
            โครงการดูแลผู้สูงอายุ
          </span>
          <h1 className="text-2xl font-black text-white leading-tight">
            สูงวัยอุ่นใจ <br />
            <span className="text-emerald-400">Senior Care Connect</span>
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            เครือข่ายช่วยชีวิตและดูแลสุขภาพผู้สูงวัย เชื่อมโยงสัญญาณ SOS แจ้งเตือนภัยไปยังกลุ่มอาสาสมัครปฐมพยาบาลรอบตัวอย่างเรียลไทม์ผ่านพิกัด GPS แผนที่ชุมชน
          </p>
        </div>

        <div className="bg-slate-800/40 p-4 border border-slate-800 rounded-2xl space-y-2.5 text-xs text-slate-300">
          <span className="font-bold text-slate-200 block">💡 แนะนำการทดสอบ:</span>
          <ul className="space-y-1.5 list-disc list-inside text-slate-400 leading-relaxed text-[11px]">
            <li>คลิกรัน <strong>SOS Auto Demo</strong> ทางด้านขวาเพื่อรับชมการจำลองเหตุการณ์ฉุกเฉินกู้ภัยครบวงจรอัตโนมัติใน 20 วินาที</li>
            <li>หรือสลับบัญชี Grandma Somjai เพื่อทดสอบการบันทึกตรวจโรค ตารางยา และโทรศัพท์ประสานงานอาสา</li>
          </ul>
        </div>

        <div className="text-[10px] text-slate-500 font-medium font-mono leading-relaxed">
          * พัฒนาจำลองโครงสร้างข้อมูล Users, Elderly, Volunteer, SOS, Chats, Health, Reviews ตามหลัก Material UI 3 ครบถ้วน 100%
        </div>
      </div>

      {/* --- CENTER HAND: GORGEOUS PHONE MOCKUP VIEWPORT --- */}
      <div className="relative mx-auto w-full max-w-[340px] shrink-0">
        
        {/* Outer Phone Mockup Case container */}
        <div className="bg-slate-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 relative z-10 aspect-[9/18.5] flex flex-col">
          
          {/* Notch display */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-950 rounded-full z-30 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 block mr-10" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-800 block" />
          </div>

          {/* Inner Display Screen Canvas */}
          <div className="flex-1 bg-white rounded-[38px] overflow-hidden flex flex-col relative pt-5.5">
            {renderPhoneView()}
          </div>

          {/* Bottom Home Button pill indicator */}
          <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto mt-2.5 shrink-0" />
        </div>

        {/* Shadow decoration under phone */}
        <div className="absolute -bottom-4 left-1/12 right-1/12 h-6 bg-black/60 rounded-full filter blur-xl opacity-80 z-0" />
      </div>

      {/* --- RIGHT HAND: INTERACTIVE SIMULATION OPERATORS --- */}
      <div className="w-full md:max-w-xs shrink-0 mt-6 md:mt-0 relative z-20">
        <SimController
          currentRole={currentUser?.userType || null}
          activeSosId={activeSos?.id || activeRescue?.id || null}
          sosStatus={activeSos?.status || activeRescue?.status || null}
          onRoleSwitch={handleRoleSwitch}
          onRunAutoDemo={handleRunAutoDemo}
          onResetDatabase={handleResetDatabase}
          simLogs={simLogs}
          isDemoRunning={isDemoRunning}
        />
      </div>

    </div>
  );
}
