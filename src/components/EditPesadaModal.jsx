import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/ModalEditar.css";

// Tipos que habilitan selector de caja
const TIPOS_CON_CAJA = ["ROLL OFF", "SEMI"];

export default function EditPesadaModal({
  pesada,
  empresas = [],
  personal = [],
  materiales = [],
  onClose,
  onSaved
}) {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [personalList, setPersonalList] = useState([]);

  const [form, setForm] = useState({
    tipo_movimiento: "INGRESO",
    empresa_id: "",
    personal_id: "",
    material_general_id: "",
    tipo_vehiculo_id: "",
    vehiculo_id: "",
    caja_id: "",
    peso: "",
    origen: "BALANZA",
  });

  // ─── Carga inicial de tipos de vehículo ───────────────────────────────────
  useEffect(() => {
    loadTiposVehiculo();
  }, []);

  // ─── Poblar form cuando llega la pesada a editar ──────────────────────────
  useEffect(() => {
    if (!pesada) return;

    setForm({
      tipo_movimiento: pesada.tipo_movimiento || "INGRESO",
      empresa_id: pesada.empresa_id || "",
      personal_id: pesada.personal_id || "",
      material_general_id: pesada.material_general_id || "",
      tipo_vehiculo_id: pesada.tipo_vehiculo_id || "",
      vehiculo_id: pesada.vehiculo_id || "",
      caja_id: pesada.caja_id || "",
      peso: pesada.peso_bruto_kg || "",
      origen: pesada.origen || "BALANZA",
    });

    // Si el chofer de la pesada no está en la lista, lo inyecta
    if (pesada.personal_id && pesada.chofer_nombre) {
      const yaEsta = personal.some(
        (p) => Number(p.id) === Number(pesada.personal_id)
      );
      if (!yaEsta) {
        const [nombre = "", apellido = ""] = pesada.chofer_nombre.split(" ");
        setPersonalList([...personal, { id: pesada.personal_id, nombre, apellido }]);
        return;
      }
    }
    setPersonalList(personal);
  }, [pesada, personal]);

  useEffect(() => {
    if (!form.tipo_vehiculo_id || tiposVehiculo.length === 0) return;
    loadVehiculosYCajas();
  }, [form.tipo_vehiculo_id, tiposVehiculo]);

  const loadTiposVehiculo = async () => {
    try {
      const res = await api.get("/tipos_vehiculo");
      setTiposVehiculo(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const tieneSeleccionCaja = (tipoVehiculoId) => {
    const tv = tiposVehiculo.find(
      (t) => Number(t.id) === Number(tipoVehiculoId)
    );
    return tv?.requiere_caja === 1 || tv?.requiere_caja === true;
  };

  const loadVehiculosYCajas = async () => {
    try {
      const vehRes = await api.get("/vehiculos", {
        params: { tipo_vehiculo_id: form.tipo_vehiculo_id },
      });
      setVehiculos(vehRes.data || []);

      if (tieneSeleccionCaja(form.tipo_vehiculo_id)) {
        const cajasRes = await api.get("/cajas");
        setCajas(cajasRes.data || []);
      } else {
        setCajas([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "tipo_vehiculo_id") {
        next.vehiculo_id = "";
        next.caja_id = "";
      }

      return next;
    });
  };

  const handleTipoMovimiento = (tipo) =>
    setForm((prev) => ({ ...prev, tipo_movimiento: tipo }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tipo_movimiento: form.tipo_movimiento,
        empresa_id: form.empresa_id ? Number(form.empresa_id) : null,
        personal_id: form.personal_id ? Number(form.personal_id) : null,
        material_general_id: form.material_general_id ? Number(form.material_general_id) : null,
        vehiculo_id: form.vehiculo_id ? Number(form.vehiculo_id) : null,
        caja_id: form.caja_id ? Number(form.caja_id) : null,
      };

      if (form.origen === "MANUAL") {
        payload.peso_manual = Number(form.peso);
      }

      await api.put(`/pesadas/${pesada.id}`, payload);
      if (onSaved) onSaved();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al actualizar la pesada");
    }
  };

  if (!pesada) return null;

  const puedeEditarPeso = form.origen === "MANUAL";
  const mostrarCaja = tieneSeleccionCaja(form.tipo_vehiculo_id);

  const personalActivo = personalList.filter(
    (p) => p.activo !== 0 || Number(p.id) === Number(pesada.personal_id)
  );

  const empresasActivas = empresas.filter(
    (e) => e.activo !== 0 || Number(e.id) === Number(pesada.empresa_id)
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Pesada #{pesada.id}</h3>

        <form onSubmit={handleSubmit}>

          <div className="tipo-movimiento-toggle">
            <button
              type="button"
              className={form.tipo_movimiento === "INGRESO" ? "active" : ""}
              onClick={() => handleTipoMovimiento("INGRESO")}
            >
              Ingreso
            </button>
            <button
              type="button"
              className={form.tipo_movimiento === "EGRESO" ? "active" : ""}
              onClick={() => handleTipoMovimiento("EGRESO")}
            >
              Egreso
            </button>
          </div>

          <select
            name="empresa_id"
            value={String(form.empresa_id || "")}
            onChange={handleChange}
          >
            <option value="" disabled hidden>Empresa</option>
            {empresasActivas.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.nombre}
              </option>
            ))}
          </select>

          <select
            name="personal_id"
            value={String(form.personal_id || "")}
            onChange={handleChange}
          >
            <option value="" disabled hidden>Chofer</option>
            {personalActivo.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </select>

          <select
            name="material_general_id"
            value={form.material_general_id}
            onChange={handleChange}
          >
            <option value="" disabled hidden>Material</option>
            {materiales.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>

          <select
            name="tipo_vehiculo_id"
            value={form.tipo_vehiculo_id}
            onChange={handleChange}
          >
            <option value="" disabled hidden>Tipo vehículo</option>
            {tiposVehiculo.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>

          <select
            name="vehiculo_id"
            value={form.vehiculo_id}
            onChange={handleChange}
            disabled={!form.tipo_vehiculo_id}
          >
            <option value="" disabled hidden>
              {form.tipo_vehiculo_id ? "Vehículo" : "Seleccioná un tipo primero"}
            </option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.patente}
              </option>
            ))}
          </select>

          {mostrarCaja && (
            <select
              name="caja_id"
              value={form.caja_id}
              onChange={handleChange}
            >
              <option value="" disabled hidden>Caja</option>
              {cajas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo}
                </option>
              ))}
            </select>
          )}

          <input
            type="number"
            name="peso"
            value={form.peso}
            onChange={handleChange}
            disabled={!puedeEditarPeso}
            placeholder="Peso"
          />

          <div className="modal-footer">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Guardar</button>
          </div>

        </form>
      </div>
    </div>
  );
}