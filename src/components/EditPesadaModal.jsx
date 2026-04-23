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

  useEffect(() => {
    api.get("/tipos_vehiculo")
      .then(res => setTiposVehiculo(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!pesada) return;

    setForm(prev => ({
      ...prev,
      tipo_movimiento: pesada.tipo_movimiento || "INGRESO",
      empresa_id: pesada.empresa_id || "",
      chofer_id: pesada.chofer_id || "",
      material_id: pesada.material_id || "",
      tipo_vehiculo_id: pesada.tipo_vehiculo_id || "",
      peso: pesada.peso_bruto_kg || "",
      origen: pesada.origen || "BALANZA",
    }));
  }, [pesada]);

  useEffect(() => {
    if (!form.tipo_vehiculo_id) return;

    const loadData = async () => {
      try {
        const vehRes = await api.get("/vehiculos", {
          params: { tipo_vehiculo_id: form.tipo_vehiculo_id },
        });

        setVehiculos(vehRes.data);

        if (pesada?.vehiculo_id) {
          setForm(prev => ({
            ...prev,
            vehiculo_id: String(pesada.vehiculo_id),
          }));
        }

        if (Number(form.tipo_vehiculo_id) === ROLL_OFF_ID) {
          const cajasRes = await api.get("/cajas");
          setCajas(cajasRes.data);

          if (pesada?.caja_id) {
            setForm(prev => ({
              ...prev,
              caja_id: String(pesada.caja_id),
            }));
          }
        } else {
          setCajas([]);
        }

      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [form.tipo_vehiculo_id, pesada]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tipo_movimiento: form.tipo_movimiento,
        empresa_id: Number(form.empresa_id),
        chofer_id: Number(form.chofer_id),
        material_id: Number(form.material_id),
        vehiculo_id: Number(form.vehiculo_id),
        caja_id: form.caja_id ? Number(form.caja_id) : null,
      };

      // ✅ SOLO agregar peso si corresponde
      if (form.origen === "MANUAL") {
        payload.peso_manual = Number(form.peso);
      }

      await api.put(`/pesadas/${pesada.id}`, payload);

      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error al actualizar la pesada");
    }
  };

  if (!pesada) return null;

  const puedeEditarPeso = form.origen === "MANUAL";
  console.log("cajas:", cajas, "caja_id en form:", form.caja_id);
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
            {empresas.map(e => <option key={e.id} value={String(e.id)}>{e.nombre}</option>)}
          </select>

          <select name="chofer_id" value={form.chofer_id} onChange={handleChange} required>
            <option value="">Chofer</option>
            {choferes.map(c => <option key={c.id} value={String(c.id)}>{c.nombre} {c.apellido}</option>)}
          </select>

          <select name="material_id" value={form.material_id} onChange={handleChange} required>
            <option value="">Material</option>
            {materiales.map(m => <option key={m.id} value={String(m.id)}>{m.nombre}</option>)}
          </select>

          {/* Tipo de vehículo, Vehículo y Caja */}
          <select
            name="tipo_vehiculo_id"
            value={form.tipo_vehiculo_id}
            onChange={handleChange}
            required
          >
            <option value="">Tipo de vehículo</option>
            {tiposVehiculo.map(tv => <option key={tv.id} value={String(tv.id)}>{tv.nombre}</option>)}
          </select>

          <select
            name="vehiculo_id"
            value={form.vehiculo_id}
            onChange={handleChange}
            required
          >
            <option value="">Vehículo</option>
            {vehiculos.map(v => <option key={v.id} value={String(v.id)}>{v.patente}</option>)}
          </select>

          {Number(form.tipo_vehiculo_id) === ROLL_OFF_ID && (
            <select
              name="caja_id"
              value={form.caja_id || ""}
              onChange={handleChange}
            >
              <option value="">Caja</option>
              {cajas.map(c => <option key={c.id} value={String(c.id)}>{c.codigo}</option>)})
            </select>
          )}

          {/* Peso */}
          <input
            type="number"
            name="peso"
            value={form.peso}
            onChange={handleChange}
            disabled={!puedeEditarPeso}
            placeholder="Peso"
          />
          {!puedeEditarPeso && (
            <small style={{ color: "gray" }}>
              El peso no se puede modificar porque proviene de la balanza
            </small>
          )}

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

