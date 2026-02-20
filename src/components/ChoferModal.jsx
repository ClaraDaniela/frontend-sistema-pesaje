import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function ChoferModal({ onClose, onSaved }) {
  const [nombre, setNombre] = useState("");

  const guardar = async () => {
    if (!nombre.trim()) return;

    const res = await api.post("/api/choferes", { nombre });
    onSaved(res.data);
    onClose();
  };

  return (
    <Modal title="Nuevo chofer" onClose={onClose}>
      <input
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre del chofer"
      />
      <button onClick={guardar}>Guardar</button>
    </Modal>
  );
}

export default ChoferModal;
