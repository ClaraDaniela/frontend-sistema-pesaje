import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function ChoferModal({ onClose, onSaved }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const guardar = async () => {
    if (!nombre.trim() || !apellido.trim()) return;

    const res = await api.post("/personal", {
      nombre,
      apellido,
      tipo: "CHOFER"
    });

    onSaved(res.data);
    onClose();
  };

  return (
    <Modal title="Nuevo chofer" onClose={onClose}>
      <div className="field-group">
        <label>Nombre</label>

        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre"
        />
      </div>

      <div className="field-group">
        <label>Apellido</label>

        <input
          value={apellido}
          onChange={e => setApellido(e.target.value)}
          placeholder="Apellido"
        />
      </div>

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

export default ChoferModal;