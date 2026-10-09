import { Route, Routes } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import SeasonsPage from "./features/seasons/SeasonsPage";
import SessionsPage from "./features/sessions/SessionsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/seasons" element={<SeasonsPage />} />
      <Route path="/sessions/:sessionkey" element={<SessionsPage />} />
    </Routes>
  );
}
