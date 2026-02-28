import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import MainPage from "./pages/MainPage";
import DoctorsPage from "./pages/DoctorsPage";
import SlotsPage from "./pages/SlotsPage";
import ConfirmPage from "./pages/ConfirmPage";
import SuccessPage from "./pages/SuccessPage";
import MyRecordsPage from "./pages/MyRecordsPage";
import CancelPage from "./pages/CancelPage";

export default function App() {
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
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/slots/:doctorId" element={<SlotsPage />} />
          <Route path="/confirm" element={<ConfirmPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/records" element={<MyRecordsPage />} />
          <Route path="/cancel/:recordId" element={<CancelPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
