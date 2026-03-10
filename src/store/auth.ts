import { create } from "zustand";
import { apiGetFresh, apiPost } from "../api/client";

interface ValidateResponse {
  valid: boolean;
  userId: string;
  firstName: string;
  lastName: string;
  patientId: string | null;
}

interface PatientInfoResponse {
  patientId: string;
  fullName: string;
  phone: string;
}

function getFallbackUserId(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("userId");
  if (fromUrl) {
    localStorage.setItem("max_user_id", fromUrl);
    return fromUrl;
  }
  return localStorage.getItem("max_user_id");
}

interface AuthState {
  loading: boolean;
  patientId: string | null;
  patientName: string | null;
  maxUserId: string | null;
  _initialized: boolean;
  _initializing: boolean;
  init: () => Promise<void>;
  setPatientId: (id: string, name?: string) => void;
  resetPatient: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  loading: true,
  patientId: null,
  patientName: null,
  maxUserId: null,
  _initialized: false,
  _initializing: false,

  init: async () => {
    // Prevent concurrent calls but allow retry after failure
    const state = get();
    if (state._initialized || state._initializing) return;
    set({ _initializing: true });

    try {
      // 1. Validate initData via backend (secure — HMAC-SHA256)
      const initData = window.WebApp?.initData;
      if (initData) {
        try {
          const result = await apiPost<ValidateResponse>(
            "/auth/validate-init-data",
            { init_data: initData }
          );
          if (result.valid && result.userId) {
            localStorage.setItem("max_user_id", result.userId);
            let patientName: string | null = null;
            if (result.patientId) {
              try {
                const pInfo = await apiGetFresh<PatientInfoResponse>(
                  `/auth/patient/${result.userId}`
                );
                patientName = pInfo.fullName || null;
              } catch {
                // name unavailable — not critical
              }
            }
            set({
              loading: false,
              patientId: result.patientId,
              patientName,
              maxUserId: result.userId,
              _initialized: true,
              _initializing: false,
            });
            return;
          }
        } catch {
          // Validation failed — fall through to legacy methods
        }
      }

      // 2. Fallback: URL param or localStorage
      const maxUserId = getFallbackUserId();
      if (!maxUserId) {
        set({ loading: false, patientId: null, patientName: null, maxUserId: null, _initialized: true, _initializing: false });
        return;
      }

      try {
        const result = await apiGetFresh<PatientInfoResponse>(
          `/auth/patient/${maxUserId}`
        );
        set({
          loading: false,
          patientId: result.patientId,
          patientName: result.fullName || null,
          maxUserId,
          _initialized: true,
          _initializing: false,
        });
      } catch {
        set({ loading: false, patientId: null, patientName: null, maxUserId, _initialized: true, _initializing: false });
      }
    } catch {
      // Unexpected error — allow retry on next mount
      set({ loading: false, _initializing: false });
    }
  },

  setPatientId: (id, name) =>
    set((s) => ({ patientId: id, patientName: name || s.patientName })),

  resetPatient: () =>
    set({ patientId: null, patientName: null }),
}));
