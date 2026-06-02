import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import DoctorsPage from "./pages/DoctorsPage";
import SlotsPage from "./pages/SlotsPage";
import ConfirmPage from "./pages/ConfirmPage";
import SuccessPage from "./pages/SuccessPage";
import MyRecordsPage from "./pages/MyRecordsPage";
import CancelPage from "./pages/CancelPage";
import ProfilePage from "./pages/ProfilePage";
import BookingWizardPage from "./pages/BookingWizardPage";
import PatientSelectPage from "./pages/PatientSelectPage";
import { useAuthStore } from "./store/auth";
import { useBookingStore } from "./store/booking";
import { clearCache } from "./api/client";

export default function App() {
  // Reset booking + cache whenever the authenticated user changes (login,
  // logout, account switch). Otherwise booking data from user A leaks to
  // user B on a shared device or after a re-login.
  const maxUserId = useAuthStore((s) => s.maxUserId);
  const lastUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (lastUserIdRef.current === undefined) {
      lastUserIdRef.current = maxUserId;
      return;
    }
    if (lastUserIdRef.current !== maxUserId) {
      useBookingStore.getState().reset();
      clearCache();
      lastUserIdRef.current = maxUserId;
    }
  }, [maxUserId]);

  useEffect(() => {
    // Signal MAX that the mini-app is ready & expand to full height
    try {
      window.WebApp?.ready?.();
      window.WebApp?.expand?.();
      window.WebApp?.setHeaderColor?.("#ffffff");
      window.WebApp?.setBackgroundColor?.("#f9fafb");
    } catch {
      // Not inside MAX app — ignore
    }

    // Fallback: save userId from URL params (for direct bot links)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    if (userId) {
      localStorage.setItem("max_user_id", userId);
    }
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/booking" element={<BookingWizardPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/slots/:doctorId" element={<SlotsPage />} />
          <Route path="/select-patient" element={<PatientSelectPage />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/records" element={<MyRecordsPage />} />
          <Route path="/cancel/:recordId" element={<CancelPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
