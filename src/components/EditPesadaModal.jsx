import { useEffect, useState } from "react";
import api from "../services/api";

const ROLL_OFF_ID = 1;

export default function EditPesadaModal({ pesada, empresas, choferes, materiales, onClose, onSaved }) {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cajas, setCajas] = useState([]);

  const [form, setForm] = useState({
    tipo_movimiento: "INGRESO",
    empresa_id: "",
    chofer_id: "",
    material_id: "",
    tipo_vehiculo_id: "",
    vehiculo_id: "",
    caja_id: "",
    peso: "",
    origen: "BALANZA",
  });

  /* ================= CARGA INICIAL ================= */
  useEffect(() => {
    api.get("/api/tipos_vehiculo")
      .then(res => setTiposVehiculo(res.data))
      .catch(console.error);
  }, []);

  /* ================= CARGAR PESADA ================= */
  useEffect(() => {
    if (!pesada) return;

    setForm({
      tipo_movimiento: pesada.tipo_movimiento || "INGRESO",
      empresa_id: pesada.empresa_id || "",
      chofer_id: pesada.chofer_id || "",
      material_id: pesada.material_id || "",
      tipo_vehiculo_id: pesada.tipo_vehiculo_id || "",
      vehiculo_id: pesada.vehiculo_id || "",
      caja_id: pesada.caja_id || "",
      peso: pesada.peso_bruto_kg || "",
      origen: pesada.origen || "BALANZA",
    });
  }, [pesada]);

  /* ================= VEHÍCULOS + CAJAS ================= */
  useEffect(() => {
    if (!form.tipo_vehiculo_id) return;

    api.get("/api/vehiculos", { params: { tipo_vehiculo_id: form.tipo_vehiculo_id } })
      .then(res => setVehiculos(res.data))
      .catch(console.error);

    if (Number(form.tipo_vehiculo_id) === ROLL_OFF_ID) {
      api.get("/api/cajas")
        .then(res => setCajas(res.data))
        .catch(console.error);
    } else {
      setCajas([]);
    }
  }, [form.tipo_vehiculo_id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/pesadas/${pesada.id}`, {
        tipo_movimiento: form.tipo_movimiento,
        empresa_id: Number(form.empresa_id),
        chofer_id: Number(form.chofer_id),
        material_id: Number(form.material_id),
        vehiculo_id: Number(form.vehiculo_id),
        caja_id: Number(form.caja_id) || null,
        peso_manual: form.origen === "MANUAL" ? Number(form.peso) : null,
        modo: form.origen === "BALANZA" ? "AUTOMATICO" : "MANUAL",
      });

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al actualizar la pesada");
    }
  };

  if (!pesada) return null;

  const editable = form.origen === "MANUAL";

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Pesada #{pesada.id}</h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Tipo de movimiento */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className={`btn ${form.tipo_movimiento === "INGRESO" ? "btn-verde" : ""}`}
              onClick={() => setForm(f => ({ ...f, tipo_movimiento: "INGRESO" }))}
            >
              ⬆️ Ingreso
            </button>
            <button
              type="button"
              className={`btn ${form.tipo_movimiento === "EGRESO" ? "btn-violeta" : ""}`}
              onClick={() => setForm(f => ({ ...f, tipo_movimiento: "EGRESO" }))}
            >
              ⬇️ Egreso
            </button>
          </div>

          {/* Empresa, Chofer, Material */}
          <select name="empresa_id" value={form.empresa_id} onChange={handleChange} required>
            <option value="">Empresa</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>

          <select name="chofer_id" value={form.chofer_id} onChange={handleChange} required>
            <option value="">Chofer</option>
            {choferes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
            ))}
          </select>

          <select name="material_id" value={form.material_id} onChange={handleChange} required>
            <option value="">Material</option>
            {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>

          {/* Tipo de vehículo, Vehículo y Caja */}
          <select
            name="tipo_vehiculo_id"
            value={form.tipo_vehiculo_id}
            onChange={handleChange}
            disabled={!editable}
            required
          >
            <option value="">Tipo de vehículo</option>
            {tiposVehiculo.map(tv => <option key={tv.id} value={tv.id}>{tv.nombre}</option>)}
          </select>

          <select
            name="vehiculo_id"
            value={form.vehiculo_id}
            onChange={handleChange}
            disabled={!editable}
            required
          >
            <option value="">Vehículo</option>
            {vehiculos.map(v => <option key={v.id} value={v.id}>{v.patente}</option>)}
          </select>

          {Number(form.tipo_vehiculo_id) === ROLL_OFF_ID && (
            <select
              name="caja_id"
              value={form.caja_id || ""}
              onChange={handleChange}
              disabled={!editable}
            >
              <option value="">Caja</option>
              {cajas.map(c => <option key={c.id} value={c.id}>{c.codigo}</option>)}
            </select>
          )}

          {/* Peso */}
          <input
            type="number"
            name="peso"
            value={form.peso}
            onChange={handleChange}
            disabled={!editable}
            placeholder="Peso"
          />

          {/* Botones */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button type="button" className="btn btn-gris" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-verde">💾 Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}

