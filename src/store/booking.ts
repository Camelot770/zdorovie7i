import { create } from "zustand";

interface BookingState {
  isChild: boolean;
  clinicId: string;
  specializationId: string;
  doctorId: string;
  appointmentAt: string;
  patientId: string;
  price: number;

  clinicName: string;
  doctorName: string;
  specializationName: string;

  setIsChild: (v: boolean) => void;
  setClinicId: (id: string, name?: string) => void;
  setSpecializationId: (id: string, name?: string) => void;
  setDoctorId: (id: string, name?: string) => void;
  setAppointmentAt: (dt: string) => void;
  setPatientId: (id: string) => void;
  setPrice: (p: number) => void;
  reset: () => void;
}

const initial = {
  isChild: false,
  clinicId: "",
  specializationId: "",
  doctorId: "",
  appointmentAt: "",
  patientId: "",
  price: 0,
  clinicName: "",
  doctorName: "",
  specializationName: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initial,
  setIsChild: (v) => set({ isChild: v }),
  setClinicId: (id, name) => set({ clinicId: id, clinicName: name || "" }),
  setSpecializationId: (id, name) => set({ specializationId: id, specializationName: name || "" }),
  setDoctorId: (id, name) => set({ doctorId: id, doctorName: name || "" }),
  setAppointmentAt: (dt) => set({ appointmentAt: dt }),
  setPatientId: (id) => set({ patientId: id }),
  setPrice: (p) => set({ price: p }),
  reset: () => set(initial),
}));
