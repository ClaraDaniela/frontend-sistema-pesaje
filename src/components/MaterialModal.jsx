import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function MaterialModal({ onClose, onSaved }) {
  const [nombre, setNombre] = useState("");

  const guardar = async () => {
    if (!nombre.trim()) return;

    const res = await api.post("/materiales", { nombre });
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
      <div className="modal-footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="btn-primary"
          onClick={guardar}
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}

export default MaterialModal;
