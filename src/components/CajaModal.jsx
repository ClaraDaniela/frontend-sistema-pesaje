import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "./Modal";

function CajaModal({ onClose, onSaved }) {

  const [tipo, setTipo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tara, setTara] = useState("");

  const [tiposCaja, setTiposCaja] = useState([]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // CARGAR TIPOS DE CAJA
  // =========================
  useEffect(() => {

    const cargarTipos = async () => {
      try {

        const res = await api.get("/tipos_caja");
        setTiposCaja(res.data);

      } catch (err) {

        console.error("Error cargando tipos de caja", err);

      }
    };

    cargarTipos();

  }, []);

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {

    setError(null);

    // VALIDACIONES
    if (!tipo) {
      return setError("Debe seleccionar un tipo.");
    }

    if (!codigo.trim()) {
      return setError("El código es obligatorio.");
    }

    if (!tara || isNaN(tara) || Number(tara) < 0) {
      return setError("Ingresá una tara válida.");
    }

    try {

      setLoading(true);

      const res = await api.post("/cajas", {
        tipo_caja_id: Number(tipo),
        codigo: codigo.trim(),
        tara_kg: Number(tara),
      });

      onSaved(res.data);
      onClose();

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.error ||
        "Error al guardar la caja."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <Modal title="Nueva caja" onClose={onClose}>

      {/* =========================
          TIPO
      ========================= */}
      <div className="field-group">

        <label>
          Tipo de caja <span style={{ color: "#E24B4A" }}>*</span>
        </label>

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="">
            Seleccionar tipo
          </option>

          {tiposCaja.map((t) => (

            <option
              key={t.id}
              value={t.id}
            >
              {t.nombre}
            </option>

          ))}
        </select>

      </div>

      {/* =========================
          CÓDIGO
      ========================= */}
      <div
        className="field-group"
        style={{ marginTop: "14px" }}
      >

        <label>
          Código <span style={{ color: "#E24B4A" }}>*</span>
        </label>

        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ej: CAJ-001"
        />

      </div>

      {/* =========================
          TARA
      ========================= */}
      <div
        className="field-group"
        style={{ marginTop: "14px" }}
      >

        <label>
          Tara (kg) <span style={{ color: "#E24B4A" }}>*</span>
        </label>

        <input
          type="number"
          value={tara}
          onChange={(e) => setTara(e.target.value)}
          placeholder="Ej: 1200"
          min="0"
          step="1"
        />

      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (

        <div
          style={{
            marginTop: "14px",
            color: "#dc2626",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {error}
        </div>

      )}

      {/* =========================
          FOOTER
      ========================= */}
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

export default CajaModal;