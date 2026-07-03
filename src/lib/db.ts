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
} from '../types';

const STORAGE_KEY = 'senior_care_connect_db';

// Initial Mock Data
const INITIAL_USERS: User[] = [
  {
    id: 'u-elderly-1',
    email: 'somjai@gmail.com',
    userType: UserType.ELDERLY,
    name: 'สมใจ',
    lastname: 'อุ่นใจ',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'u-volunteer-1',
    email: 'kittipong@gmail.com',
    userType: UserType.VOLUNTEER,
    name: 'กิตติพงษ์',
    lastname: 'รักดี',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'u-volunteer-2',
    email: 'jirapa@gmail.com',
    userType: UserType.VOLUNTEER,
    name: 'จิราภา',
    lastname: 'ใจกว้าง',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'u-admin-1',
    email: 'admin@seniorcare.org',
    userType: UserType.ADMIN,
    name: 'แอดมิน',
    lastname: 'อุ่นใจแอป'
  }
];

const INITIAL_ELDERLY: ElderlyProfile[] = [
  {
    id: 'e-1',
    userId: 'u-elderly-1',
    name: 'สมใจ',
    lastname: 'อุ่นใจ',
    age: 72,
    gender: 'หญิง',
    phone: '081-234-5678',
    address: '123 ซอยอ่อนนุช 17 แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ',
    gps: {
      lat: 13.7244,
      lng: 100.6015,
      addressName: 'ซอยอ่อนนุช 17, สวนหลวง'
    },
    chronicDiseases: 'ความดันโลหิตสูง, เบาหวาน',
    regularMedicines: 'ยาลดความดัน (Amlodipine 5mg) กินหลังอาหารเช้า, ยาเบาหวาน (Metformin 500mg) กินพร้อมอาหารเช้า-เย็น',
    bloodType: 'AB',
    emergencyContactName: 'คุณวีระ อุ่นใจ (ลูกชาย)',
    emergencyContactPhone: '089-987-6543'
  }
];

const INITIAL_VOLUNTEERS: VolunteerProfile[] = [
  {
    id: 'v-1',
    userId: 'u-volunteer-1',
    name: 'กิตติพงษ์',
    lastname: 'รักดี',
    age: 28,
    phone: '086-555-1234',
    email: 'kittipong@gmail.com',
    address: '45/1 แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ',
    gps: {
      lat: 13.7214, // 350 meters away
      lng: 100.5995,
      addressName: 'สวนหลวง, กรุงเทพฯ'
    },
    organization: 'กลุ่มอาสาใจดีมีสุข',
    abilities: ['ปฐมพยาบาลเบื้องต้น', 'ประคอง/ยกย้ายผู้ป่วย', 'ขับรถพาไปโรงพยาบาล', 'ทักษะ CPR'],
    convenientTime: 'จันทร์ - ศุกร์ (18.00 - 22.00 น.), เสาร์ - อาทิตย์ (ตลอด 24 ชม.)',
    rating: 4.9,
    completedCasesCount: 42,
    isOnline: true
  },
  {
    id: 'v-2',
    userId: 'u-volunteer-2',
    name: 'จิราภา',
    lastname: 'ใจกว้าง',
    age: 32,
    phone: '084-777-9876',
    email: 'jirapa@gmail.com',
    address: '88 ถนนสุขุมวิท 77 แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ',
    gps: {
      lat: 13.7275, // 450 meters away
      lng: 100.6045,
      addressName: 'สุขุมวิท 77, สวนหลวง'
    },
    organization: 'มูลนิธิร่วมเกื้อหนุน',
    abilities: ['ดูแลผู้สูงวัย', 'แนะนำการใช้ยา', 'พูดคุยบำบัดจิตใจ', 'วัดสัญญาณชีพ'],
    convenientTime: 'เสาร์ - อาทิตย์ (08.00 - 18.00 น.)',
    rating: 4.8,
    completedCasesCount: 29,
    isOnline: true
  }
];

const INITIAL_HEALTH: HealthRecord[] = [
  {
    id: 'h-1',
    elderlyId: 'e-1',
    date: '2026-06-28',
    time: '08:00',
    bloodPressureSys: 118,
    bloodPressureDia: 78,
    heartRate: 72,
    bloodSugar: 105,
    weight: 58.5,
    status: 'normal',
    note: 'หลังอาหารเช้า วัดด้วยเครื่องวัดดิจิทัล'
  },
  {
    id: 'h-2',
    elderlyId: 'e-1',
    date: '2026-06-29',
    time: '08:15',
    bloodPressureSys: 122,
    bloodPressureDia: 81,
    heartRate: 75,
    bloodSugar: 110,
    weight: 58.4,
    status: 'normal'
  },
  {
    id: 'h-3',
    elderlyId: 'e-1',
    date: '2026-06-30',
    time: '08:00',
    bloodPressureSys: 115,
    bloodPressureDia: 75,
    heartRate: 70,
    bloodSugar: 98,
    weight: 58.2,
    status: 'normal'
  },
  {
    id: 'h-4',
    elderlyId: 'e-1',
    date: '2026-07-01',
    time: '08:30',
    bloodPressureSys: 125,
    bloodPressureDia: 82,
    heartRate: 78,
    bloodSugar: 125,
    weight: 58.5,
    status: 'warning',
    note: 'ตื่นเต้นเล็กน้อย ทานกาแฟดำก่อนวัด'
  },
  {
    id: 'h-5',
    elderlyId: 'e-1',
    date: '2026-07-02',
    time: '08:30',
    bloodPressureSys: 120,
    bloodPressureDia: 80,
    heartRate: 72,
    bloodSugar: 112,
    weight: 58.3,
    status: 'normal',
    note: 'อาการปกติ ทานยาตรงเวลา'
  }
];

const INITIAL_PILLS: PillReminder[] = [
  {
    id: 'p-1',
    elderlyId: 'e-1',
    medicineName: 'ยาลดความดันโลหิต (Amlodipine)',
    dosage: '1 เม็ด (5mg)',
    time: '08:00',
    frequency: 'ทุกวันหลังอาหารเช้า',
    isActive: true,
    takenToday: true
  },
  {
    id: 'p-2',
    elderlyId: 'e-1',
    medicineName: 'ยาควบคุมระดับน้ำตาล (Metformin)',
    dosage: '1 เม็ด (500mg)',
    time: '08:00',
    frequency: 'ทุกวันพร้อมอาหารเช้า',
    isActive: true,
    takenToday: true
  },
  {
    id: 'p-3',
    elderlyId: 'e-1',
    medicineName: 'ยาควบคุมระดับน้ำตาล (Metformin)',
    dosage: '1 เม็ด (500mg)',
    time: '18:00',
    frequency: 'ทุกวันพร้อมอาหารเย็น',
    isActive: true,
    takenToday: false
  }
];

const INITIAL_APPOINTMENTS: AppointmentReminder[] = [
  {
    id: 'ap-1',
    elderlyId: 'e-1',
    doctorName: 'นพ. วิชัย ประสิทธิเวช',
    hospital: 'โรงพยาบาลสุขุมวิท',
    date: '2026-07-15',
    time: '09:30',
    purpose: 'นัดตรวจอาการโรคความดันโลหิตสูงและติดตามผลเลือดเบาหวาน'
  }
];

const INITIAL_SOS_REQUESTS: SOSRequest[] = [
  {
    id: 'sos-hist-1',
    elderlyId: 'e-1',
    elderlyName: 'สมใจ อุ่นใจ',
    elderlyPhone: '081-234-5678',
    gps: {
      lat: 13.7244,
      lng: 100.6015,
      addressName: 'ซอยอ่อนนุช 17, สวนหลวง'
    },
    timestamp: '2026-06-25T14:20:00Z',
    status: SOSStatus.COMPLETED,
    volunteerId: 'v-1',
    volunteerName: 'กิตติพงษ์ รักดี',
    volunteerPhone: '086-555-1234',
    rating: 5,
    reviewComment: 'คุณกิตติพงษ์มาเร็วมาก ช่วยปฐมพยาบาลเบื้องต้นอย่างนุ่มนวล สุภาพ น่ารักมากค่ะ'
  },
  {
    id: 'sos-hist-2',
    elderlyId: 'e-1',
    elderlyName: 'สมใจ อุ่นใจ',
    elderlyPhone: '081-234-5678',
    gps: {
      lat: 13.7244,
      lng: 100.6015,
      addressName: 'ซอยอ่อนนุช 17, สวนหลวง'
    },
    timestamp: '2026-06-29T10:15:00Z',
    status: SOSStatus.COMPLETED,
    volunteerId: 'v-2',
    volunteerName: 'จิราภา ใจกว้าง',
    volunteerPhone: '084-777-9876',
    rating: 4,
    reviewComment: 'ช่วยพยุงลุกขึ้นตอนหน้ามืด ประทับใจมากค่ะ'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    recipientId: 'u-elderly-1',
    title: '⏰ แจ้งเตือนกินยาหลังอาหารเช้า',
    body: 'กรุณาทานยาลดความดัน (Amlodipine) 1 เม็ด และยาเบาหวาน (Metformin) 1 เม็ด',
    timestamp: '2026-07-02T08:00:00.000Z',
    isRead: true,
    type: 'pill'
  },
  {
    id: 'n-2',
    recipientId: 'u-volunteer-1',
    title: '🌟 เคสช่วยเหลือเสร็จสิ้น',
    body: 'คุณสมใจให้คะแนนความพึงพอใจ 5 ดาว และกล่าวขอบคุณคุณสำหรับความช่วยเหลือที่รวดเร็ว',
    timestamp: '2026-06-25T15:00:00.000Z',
    isRead: true,
    type: 'review'
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r-1',
    sosRequestId: 'sos-hist-1',
    volunteerId: 'v-1',
    elderlyId: 'e-1',
    elderlyName: 'สมใจ อุ่นใจ',
    rating: 5,
    comment: 'คุณกิตติพงษ์มาเร็วมาก ช่วยปฐมพยาบาลเบื้องต้นอย่างนุ่มนวล สุภาพ น่ารักมากค่ะ',
    date: '2026-06-25'
  },
  {
    id: 'r-2',
    sosRequestId: 'sos-hist-2',
    volunteerId: 'v-2',
    elderlyId: 'e-1',
    elderlyName: 'สมใจ อุ่นใจ',
    rating: 4,
    comment: 'ช่วยพยุงลุกขึ้นตอนหน้ามืด ประทับใจมากค่ะ',
    date: '2026-06-29'
  }
];

const INITIAL_CHATS: ChatMessage[] = [];

export interface DatabaseState {
  users: User[];
  elderly: ElderlyProfile[];
  volunteers: VolunteerProfile[];
  health: HealthRecord[];
  pills: PillReminder[];
  appointments: AppointmentReminder[];
  sosRequests: SOSRequest[];
  notifications: AppNotification[];
  reviews: Review[];
  chats: ChatMessage[];
}

export function getDB(): DatabaseState {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const defaultState: DatabaseState = {
      users: INITIAL_USERS,
      elderly: INITIAL_ELDERLY,
      volunteers: INITIAL_VOLUNTEERS,
      health: INITIAL_HEALTH,
      pills: INITIAL_PILLS,
      appointments: INITIAL_APPOINTMENTS,
      sosRequests: INITIAL_SOS_REQUESTS,
      notifications: INITIAL_NOTIFICATIONS,
      reviews: INITIAL_REVIEWS,
      chats: INITIAL_CHATS
    };
    saveDB(defaultState);
    return defaultState;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse database state', e);
    return {
      users: INITIAL_USERS,
      elderly: INITIAL_ELDERLY,
      volunteers: INITIAL_VOLUNTEERS,
      health: INITIAL_HEALTH,
      pills: INITIAL_PILLS,
      appointments: INITIAL_APPOINTMENTS,
      sosRequests: INITIAL_SOS_REQUESTS,
      notifications: INITIAL_NOTIFICATIONS,
      reviews: INITIAL_REVIEWS,
      chats: INITIAL_CHATS
    };
  }
}

export function saveDB(state: DatabaseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Global actions helper to maintain reactive updates
export function resetDB() {
  localStorage.removeItem(STORAGE_KEY);
  return getDB();
}
