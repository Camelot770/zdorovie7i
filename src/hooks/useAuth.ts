import { useState, useEffect } from "react";
import { apiGet } from "../api/client";

interface AuthState {
  loading: boolean;
  patientId: string | null;
  maxUserId: string | null;
}

/**
 * Resolve MAX user id:
 *  1. WebApp.initDataUnsafe.user.id (MAX mini-app bridge)
 *  2. ?userId= query param (legacy / fallback)
 *  3. localStorage cache
 */
function getMaxUserId(): string | null {
  // 1️⃣ MAX Bridge
  const webAppUserId = window.WebApp?.initDataUnsafe?.user?.id;
  if (webAppUserId) {
    const id = String(webAppUserId);
    localStorage.setItem("max_user_id", id);
    return id;
  }

  // 2️⃣ URL param (fallback for direct links from bot)
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("userId");
  if (fromUrl) {
    localStorage.setItem("max_user_id", fromUrl);
    return fromUrl;
  }

  // 3️⃣ Cached
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
