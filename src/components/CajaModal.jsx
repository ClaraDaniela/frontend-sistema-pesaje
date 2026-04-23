import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function CajaModal({ onClose, onSaved }) {
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tara, setTara] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const guardar = async () => {
    setError(null);

    if (!tipo.trim()) return setError("El tipo es obligatorio.");
    if (!tara || isNaN(tara) || Number(tara) < 0)
      return setError("Ingresá una tara válida en kg.");

    try {
      setLoading(true);
      const res = await api.post("/cajas", {
        tipo: tipo.trim(),
        descripcion: descripcion.trim() || null,
        tara_kg: Number(tara),
      });
      onSaved(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar la caja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nueva caja" onClose={onClose}>
      <div className="field-group">
        <label>Tipo <span style={{ color: "#E24B4A" }}>*</span></label>
        <input
          type="text"
          value={tipo}
          onChange={e => setTipo(e.target.value)}
          placeholder="Ej: Roll-off, Semi, Volcadora"
        />
      </div>

      <div className="field-group" style={{ marginTop: "0.75rem" }}>
        <label>Descripción</label>
        <input
          type="text"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          placeholder="Ej: Caja chica, Caja grande"
        />
      </div>

      <div className="field-group" style={{ marginTop: "0.75rem" }}>
        <label>Tara (kg) <span style={{ color: "#E24B4A" }}>*</span></label>
        <input
          type="number"
          value={tara}
          onChange={e => setTara(e.target.value)}
          placeholder="Ej: 1200"
          min="0"
          step="1"
        />
      </div>

      {error && (
        <p style={{ color: "#E24B4A", fontSize: "13px", marginTop: "0.5rem" }}>
          {error}
        </p>
      )}

      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onClose}>
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

export default CajaModal;