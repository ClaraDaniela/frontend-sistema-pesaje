import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function EmpresaModal({ onClose, onSaved }) {
  const [nombre, setNombre] = useState("");
  const [cuit, setCuit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    try {
      setError("");

      if (!nombre.trim()) {
        setError("El nombre es obligatorio");
        return;
      }

      setLoading(true);

      const payload = {
        nombre: nombre.trim(),
        cuit: cuit.trim() || null,
      };

      const res = await api.post("/empresas", payload);

      onSaved(res.data);
      onClose();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.error ||
        "No se pudo guardar la empresa"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nueva empresa" onClose={onClose}>
      <div className="field-group">
        <label>Nombre</label>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la empresa"
        />
      </div>

      <div className="field-group">
        <label>CUIT</label>

        <input
          type="text"
          value={cuit}
          onChange={(e) => setCuit(e.target.value)}
          placeholder="20-12345678-9"
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="modal-footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="btn-primary"
          onClick={guardar}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}

export default EmpresaModal;
