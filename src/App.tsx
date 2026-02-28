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
