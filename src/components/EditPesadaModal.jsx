import { useEffect, useState } from "react";
import api from "../services/api";

export default function EditPesadaModal({
  pesada,
  empresas,
  choferes,
  materiales,
  onClose,
  onSaved
}) {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cajas, setCajas] = useState([]);

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

  useEffect(() => {
    api.get("/tipos_vehiculo")
      .then(res => setTiposVehiculo(res.data))
      .catch(console.error);
  }, []);

  // cargar pesada
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
  }, [pesada]);

  const esRollOff = (tipoVehiculoId) => {
    const tv = tiposVehiculo.find(t => t.id === Number(tipoVehiculoId));
    return tv?.nombre === "ROLL OFF";
  };

  // vehículos + cajas
  useEffect(() => {
    if (!form.tipo_vehiculo_id) return;

    const load = async () => {
      try {
        const vehRes = await api.get("/vehiculos", {
          params: { tipo_vehiculo_id: form.tipo_vehiculo_id },
        });

        setVehiculos(vehRes.data);

        if (esRollOff(form.tipo_vehiculo_id)) {
          const cajasRes = await api.get("/cajas");
          setCajas(cajasRes.data);
        } else {
          setCajas([]);
          setForm(f => ({ ...f, caja_id: "" }));
        }

      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [form.tipo_vehiculo_id, tiposVehiculo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        tipo_movimiento: form.tipo_movimiento,
        empresa_id: Number(form.empresa_id),
        personal_id: Number(form.personal_id),
        material_general_id: Number(form.material_general_id),
        vehiculo_id: Number(form.vehiculo_id),
        caja_id: form.caja_id ? Number(form.caja_id) : null,
      };

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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Pesada #{pesada.id}</h3>

        <form onSubmit={handleSubmit}>

          {/* movimiento */}
          <button type="button" onClick={() => setForm(f => ({ ...f, tipo_movimiento: "INGRESO" }))}>
            Ingreso
          </button>

          <button type="button" onClick={() => setForm(f => ({ ...f, tipo_movimiento: "EGRESO" }))}>
            Egreso
          </button>

          {/* empresa */}
          <select name="empresa_id" value={form.empresa_id} onChange={handleChange}>
            <option value="">Empresa</option>
            {empresas.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>

          {/* chofer -> personal */}
          <select name="personal_id" value={form.personal_id} onChange={handleChange}>
            <option value="">Chofer</option>
            {choferes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.apellido}
              </option>
            ))}
          </select>

          {/* material */}
          <select name="material_general_id" value={form.material_general_id} onChange={handleChange}>
            <option value="">Material</option>
            {materiales.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>

          {/* tipo vehiculo */}
          <select name="tipo_vehiculo_id" value={form.tipo_vehiculo_id} onChange={handleChange}>
            <option value="">Tipo vehículo</option>
            {tiposVehiculo.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>

          {/* vehiculo */}
          <select name="vehiculo_id" value={form.vehiculo_id} onChange={handleChange}>
            <option value="">Vehículo</option>
            {vehiculos.map(v => (
              <option key={v.id} value={v.id}>{v.patente}</option>
            ))}
          </select>

          {/* caja solo roll off */}
          {esRollOff(form.tipo_vehiculo_id) && (
            <select name="caja_id" value={form.caja_id} onChange={handleChange}>
              <option value="">Caja</option>
              {cajas.map(c => (
                <option key={c.id} value={c.id}>{c.codigo}</option>
              ))}
            </select>
          )}

          {/* peso */}
          <input
            type="number"
            name="peso"
            value={form.peso}
            onChange={handleChange}
            disabled={!puedeEditarPeso}
          />

          {/* actions */}
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Guardar</button>

        </form>
      </div>
    </div>
  );
}