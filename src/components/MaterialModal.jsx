import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function MaterialModal({ onClose, onSaved }) {
  const [nombre, setNombre] = useState("");

  const guardar = async () => {
    if (!nombre.trim()) return;

    const res = await api.post("/api/materiales", { nombre });
    onSaved(res.data);
    onClose();
  };

  return (
    <Modal title="Nuevo material" onClose={onClose}>
      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre del material"
      />
      <button onClick={guardar}>Guardar</button>
    </Modal>
  );
}

export default MaterialModal;
