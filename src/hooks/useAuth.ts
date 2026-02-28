import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api/client";

interface AuthState {
  loading: boolean;
  patientId: string | null;
  maxUserId: string | null;
}

interface ValidateResponse {
  valid: boolean;
  userId: string;
  firstName: string;
  lastName: string;
  patientId: string | null;
}

/**
 * Fallback: resolve MAX user id from URL params or cache.
 * Used when WebApp.initData is unavailable (e.g. direct browser access).
 */
function getFallbackUserId(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("userId");
  if (fromUrl) {
    localStorage.setItem("max_user_id", fromUrl);
    return fromUrl;
  }
  return localStorage.getItem("max_user_id");
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    patientId: null,
    maxUserId: null,
  });

  useEffect(() => {
    async function init() {
      // 1️⃣ Validate initData via backend (secure — HMAC-SHA256)
      const initData = window.WebApp?.initData;
      if (initData) {
        try {
          const result = await apiPost<ValidateResponse>(
            "/auth/validate-init-data",
            { init_data: initData }
          );
          if (result.valid && result.userId) {
            localStorage.setItem("max_user_id", result.userId);
            setState({
              loading: false,
              patientId: result.patientId,
              maxUserId: result.userId,
            });
            return;
          }
        } catch {
          // Validation failed — fall through to legacy methods
        }
      }

      // 2️⃣ Fallback: URL param or localStorage
      const maxUserId = getFallbackUserId();
      if (!maxUserId) {
        setState({ loading: false, patientId: null, maxUserId: null });
        return;
      }

      try {
        const result = await apiGet<{ patientId: string }>(
          `/auth/patient/${maxUserId}`
        );
        setState({
          loading: false,
          patientId: result.patientId,
          maxUserId,
        });
      } catch {
        setState({ loading: false, patientId: null, maxUserId });
      }
    }

    init();
  }, []);

  return state;
}
