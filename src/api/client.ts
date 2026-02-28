import type { Clinic, Specialization, Doctor, Schedule, Appointment, Service, Patient } from "../types";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}

export function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<T>(path + qs);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export const api = {
  // ---- Clinics ----
  getClinics: (params?: Record<string, string>) =>
    apiGet<Clinic[]>("/clinics", params),
  getClinic: (id: string, params?: Record<string, string>) =>
    apiGet<Clinic>(`/clinics/${id}`, params),

  // ---- Specializations ----
  getSpecializations: (params?: Record<string, string>) =>
    apiGet<Specialization[]>("/specializations", params),
  getSpecialization: (id: string) =>
    apiGet<Specialization>(`/specializations/${id}`),

  // ---- Services ----
  getServices: (params?: Record<string, string>) =>
    apiGet<Service[]>("/services", params),
  getService: (id: string, params?: Record<string, string>) =>
    apiGet<Service>(`/services/${id}`, params),

  // ---- Doctors ----
  getDoctors: (params?: Record<string, string>) =>
    apiGet<Doctor[]>("/doctors", params),
  getDoctor: (id: string, params?: Record<string, string>) =>
    apiGet<Doctor>(`/doctors/${id}`, params),

  // ---- Schedules ----
  getSchedules: (params?: Record<string, string>) =>
    apiGet<Schedule[]>("/schedules", params),

  // ---- Patients ----
  getPatients: (params: Record<string, string>) =>
    apiGet<Patient[]>("/patients", params),
  getPatient: (id: string) =>
    apiGet<Patient>(`/patients/${id}`),
  createPatient: (body: {
    lastName: string;
    firstName: string;
    middleName?: string;
    noMiddleName?: boolean;
    gender: string;
    birthDate: string;
    phone: string;
    email?: string;
  }) => apiPost<Patient>("/patients", body),

  // ---- Records (appointments) ----
  getRecords: (params: Record<string, string>) =>
    apiGet<Appointment[]>("/records", params),
  getRecord: (id: string) =>
    apiGet<Appointment>(`/records/${id}`),
  createRecord: (body: {
    appointmentAt: string;
    clinicId: string;
    doctorId: string;
    specializationId: string;
    patientId: string;
    serviceIds?: string;
    comment?: string;
  }) => apiPost<Appointment>("/records", body),
  confirmRecord: (id: string) =>
    apiPost<Appointment>(`/records/${id}/confirm`),
  cancelRecord: (id: string) =>
    apiPost<Appointment>(`/records/${id}/cancel`),
  restoreRecord: (id: string) =>
    apiPost<Appointment>(`/records/${id}/restore`),

  // ---- Auth ----
  validateInitData: (initData: string) =>
    apiPost<{
      valid: boolean;
      userId: string;
      firstName: string;
      lastName: string;
      patientId: string | null;
    }>("/auth/validate-init-data", { init_data: initData }),
  linkUser: (maxUserId: string, phone: string) =>
    apiPost<{
      status: string;
      patientId?: string;
      fullName?: string;
      patients?: Patient[];
    }>("/auth/link", { max_user_id: maxUserId, phone }),
  linkUserById: (patientId: string, maxUserId: string) =>
    apiPost<{
      status: string;
      patientId: string;
      fullName: string;
    }>(`/auth/link/${patientId}?max_user_id=${maxUserId}`),
  getPatientByUser: (maxUserId: string) =>
    apiGet<{ patientId: string }>(`/auth/patient/${maxUserId}`),

  // ---- Health ----
  health: () => apiGet<{ status: string }>("/health"),
};
