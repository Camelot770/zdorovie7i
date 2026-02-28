import { useState, useEffect } from "react";
import { apiGet } from "../api/client";

interface AuthState {
  loading: boolean;
  patientId: string | null;
  maxUserId: string | null;
}

function getMaxUserId(): string | null {
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
      const maxUserId = getMaxUserId();

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
