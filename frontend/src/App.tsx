import { Route, Routes } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import SeasonsPage from "./features/seasons/SeasonsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/seasons" element={<SeasonsPage />} />
    </Routes>
  );
}
