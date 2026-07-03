export enum UserType {
  ELDERLY = 'elderly',
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  userType: UserType;
  name: string;
  lastname: string;
  avatar?: string;
}

export interface ElderlyProfile {
  id: string;
  userId: string;
  name: string;
  lastname: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  gps: {
    lat: number;
    lng: number;
    addressName: string;
  };
  chronicDiseases: string;
  regularMedicines: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface VolunteerProfile {
  id: string;
  userId: string;
  name: string;
  lastname: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  gps: {
    lat: number;
    lng: number;
    addressName: string;
  };
  organization: string;
  abilities: string[];
  convenientTime: string;
  volunteerCardUrl?: string;
  avatarUrl?: string;
  rating: number;
  completedCasesCount: number;
  isOnline: boolean;
}

export interface HealthRecord {
  id: string;
  elderlyId: string;
  date: string; // ISO String
  time: string; // HH:MM
  bloodPressureSys: number; // e.g. 120
  bloodPressureDia: number; // e.g. 80
  heartRate: number; // bpm
  bloodSugar?: number; // mg/dL
  weight?: number; // kg
  status: 'normal' | 'warning' | 'danger';
  note?: string;
}

export interface PillReminder {
  id: string;
  elderlyId: string;
  medicineName: string;
  dosage: string;
  time: string; // HH:MM
  frequency: string; // e.g. "ทุกวัน", "เช้า-เย็น"
  isActive: boolean;
  takenToday?: boolean;
}

export interface AppointmentReminder {
  id: string;
  elderlyId: string;
  doctorName: string;
  hospital: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  purpose: string;
}

export enum SOSStatus {
  SEARCHING = 'searching',       // กำลังค้นหาอาสาสมัคร
  ACCEPTED = 'accepted',         // อาสาสมัครตอบรับแล้ว
  ON_THE_WAY = 'on_the_way',     // กำลังเดินทาง
  COMPLETED = 'completed',       // ช่วยเหลือเสร็จสิ้น
  CANCELLED = 'cancelled',
}

export interface SOSRequest {
  id: string;
  elderlyId: string;
  elderlyName: string;
  elderlyPhone: string;
  gps: {
    lat: number;
    lng: number;
    addressName: string;
  };
  timestamp: string; // ISO String
  status: SOSStatus;
  volunteerId?: string; // assigned volunteer
  volunteerName?: string;
  volunteerPhone?: string;
  volunteerGps?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  reviewComment?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string; // userId
  title: string;
  body: string;
  timestamp: string; // ISO string
  isRead: boolean;
  type: 'sos' | 'pill' | 'appointment' | 'system' | 'review' | 'accept';
  referenceId?: string; // SOS request id, etc.
}

export interface Review {
  id: string;
  sosRequestId: string;
  volunteerId: string;
  elderlyId: string;
  elderlyName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  sosRequestId: string;
  senderId: string; // userId
  senderName: string;
  text: string;
  timestamp: string; // ISO string
}
