export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  location?: string;
  coordinates?: Coordinates;
  city?: string;
  street?: string;
  house?: string;
}

export interface Contact {
  type: string;
  value: string;
}

export interface OpeningHour {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Clinic {
  id: string;
  name: string;
  fullName?: string;
  shortAddress?: string;
  address?: Address;
  contacts?: Contact[];
  openingHours?: OpeningHour[];
}

export interface Specialization {
  id: string;
  name: string;
  ageFrom?: number;
  ageTo?: number;
}

export interface DoctorClinicService {
  serviceId: string;
  ageFrom?: number;
  ageTo?: number;
  duration?: number;
}

export interface DoctorClinicSpecialization {
  specializationId: string;
  ageFrom?: number;
  ageTo?: number;
  duration?: number;
  services?: DoctorClinicService[];
}

export interface DoctorClinic {
  clinicId: string;
  specializations?: DoctorClinicSpecialization[];
}

export interface Doctor {
  id: string;
  name?: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  gender?: string;
  description?: string;
  experience?: number;
  dms?: boolean;
  clinics?: DoctorClinic[];
}

export interface AppointmentSlot {
  startAt: string;
  endAt: string;
  isEmpty: boolean;
}

export interface Schedule {
  clinicId: string;
  doctorId: string;
  specializationId: string;
  scheduledFrom: string;
  scheduledTo: string;
  byQueue: boolean;
  isBusy: boolean;
  appointmentSlots?: AppointmentSlot[];
}

export interface RecordService {
  serviceId: string;
  price?: number;
  quantity?: number;
  amount?: number;
}

export interface Appointment {
  id: string;
  createdAt?: string;
  status?: string;
  confirmed?: boolean;
  canceled?: boolean;
  appointmentAt?: string;
  clinicId?: string;
  doctorId?: string;
  specializationId?: string;
  patientId?: string;
  services?: RecordService[];
}

export interface BookingData {
  clinicId: string;
  doctorId: string;
  specializationId: string;
  appointmentAt: string;
  patientId: string;
  isChild: boolean;
}
