import "./styles/servieco.css";
import PesadasOperador from "./pages/PesadasOperador";
import PesadasJefe from "./pages/PesadasJefe";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<PesadasOperador />} />
        <Route path="/jefe" element={<PesadasJefe />} />
      </Routes>
    </div>
  );
}

export default App;
