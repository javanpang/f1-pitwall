import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Seasons from "./pages/Seasons";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/seasons" element={<Seasons />} />
    </Routes>
  );
}
