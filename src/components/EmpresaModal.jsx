import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function EmpresaModal({ onClose, onSaved }) {
  const [nombre, setNombre] = useState("");

  const guardar = async () => {
    if (!nombre.trim()) return;

    const res = await api.post("/api/empresas", { nombre });
    onSaved(res.data);
    onClose();
  };

  return (
    <Modal title="Nueva empresa" onClose={onClose}>
      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre de la empresa"
      />
      <button onClick={guardar}>Guardar</button>
    </Modal>
  );
}

export default EmpresaModal;

