import { useState, useEffect } from "react";
import { apiGet } from "../api/client";

interface AuthState {
  loading: boolean;
  patientId: string | null;
  maxUserId: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    patientId: null,
    maxUserId: null,
  });

  useEffect(() => {
    async function init() {
      try {
        const maxUserId = localStorage.getItem("max_user_id") || "anonymous";

        const result = await apiGet<{ patientId: string }>(
          `/auth/patient/${maxUserId}`
        );

        setState({
          loading: false,
          patientId: result.patientId,
          maxUserId,
        });
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }

    init();
  }, []);

  return state;
}
