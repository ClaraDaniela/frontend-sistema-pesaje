import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function EmpresaModal({ onClose, onSaved }) {
  const [nombre, setNombre] = useState("");

  const guardar = async () => {
    if (!nombre.trim()) return;

    const res = await api.post("/empresas", { nombre });
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
      <div className="modal-footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={guardar}
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}

export default EmpresaModal;

