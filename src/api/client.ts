import type { Clinic, Specialization, Doctor, Schedule, Appointment } from "../types";

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
  getClinics: (params?: Record<string, string>) => apiGet<Clinic[]>("/clinics", params),
  getClinic: (id: string) => apiGet<Clinic>(`/clinics/${id}`),
  getSpecializations: (params?: Record<string, string>) => apiGet<Specialization[]>("/specializations", params),
  getDoctors: (params?: Record<string, string>) => apiGet<Doctor[]>("/doctors", params),
  getDoctor: (id: string) => apiGet<Doctor>(`/doctors/${id}`),
  getSchedules: (params?: Record<string, string>) => apiGet<Schedule[]>("/schedules", params),
  getRecords: (params: Record<string, string>) => apiGet<Appointment[]>("/records", params),
  createRecord: (body: unknown) => apiPost<Appointment>("/records", body),
  confirmRecord: (id: string) => apiPost<Appointment>(`/records/${id}/confirm`),
  cancelRecord: (id: string) => apiPost<Appointment>(`/records/${id}/cancel`),
  getPatientByUser: (maxUserId: string) => apiGet<{ patientId: string }>(`/auth/patient/${maxUserId}`),
};
