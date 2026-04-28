import { useState } from "react";
import api from "../services/api";
import Modal from "./Modal";

function VehiculoModal({ tipoVehiculoId, onClose, onSaved }) {
  const [patente, setPatente] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tara, setTara] = useState("");

  const guardar = async () => {
    if (!patente || !tara) return;

    const res = await api.post("/vehiculos", {
      patente,
      descripcion,
      tara_kg: tara,
      tipo_vehiculo_id: tipoVehiculoId,
    });

    onSaved(res.data);
    onClose();
  };

  return (
    <Modal title="Nuevo vehículo" onClose={onClose}>
      <input
        placeholder="Patente"
        value={patente}
        onChange={e => setPatente(e.target.value)}
      />

      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
      />

      <input
        type="number"
        placeholder="Tara (kg)"
        value={tara}
        onChange={e => setTara(e.target.value)}
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

export default VehiculoModal;
