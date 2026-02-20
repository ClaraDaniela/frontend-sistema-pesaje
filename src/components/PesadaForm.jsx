import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";

import EmpresaModal from "./EmpresaModal";
import ChoferModal from "./ChoferModal";
import MaterialModal from "./MaterialModal";
import VehiculoModal from "./VehiculoModal";

const ROLL_OFF_ID = 1;

export default function PesadaForm({ balanzaDisponible = true, onCreated }) {

  /* ================= LISTAS ================= */
  const [empresas, setEmpresas] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cajas, setCajas] = useState([]);

  /* ================= MODALES ================= */
  const [showEmpresa, setShowEmpresa] = useState(false);
  const [showChofer, setShowChofer] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showVehiculo, setShowVehiculo] = useState(false);

  /* ================= BALANZA ================= */
  const [pesoBalanza, setPesoBalanza] = useState(null);
  const [balanzaOk, setBalanzaOk] = useState(false);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    tipo_movimiento: "INGRESO",
    origen: "BALANZA",

    empresa_id: "",
    chofer_id: "",
    material_id: "",

    tipo_vehiculo_id: "",
    vehiculo_id: "",
    caja_id: "",

    peso: "",
  });

  /* ================= CARGA INICIAL ================= */
  useEffect(() => {
    api.get("/api/empresas").then(r => setEmpresas(r.data));
    api.get("/api/choferes").then(r => setChoferes(r.data));
    api.get("/api/materiales").then(r => setMateriales(r.data));
    api.get("/api/tipos_vehiculo").then(r => setTiposVehiculo(r.data));
  }, []);

  /* ================= VEHÍCULOS / CAJAS ================= */
  useEffect(() => {
    if (!form.tipo_vehiculo_id) {
      setVehiculos([]);
      setCajas([]);
      return;
    }

    api.get("/api/vehiculos", {
      params: { tipo_vehiculo_id: form.tipo_vehiculo_id },
    }).then(r => setVehiculos(r.data));

    if (Number(form.tipo_vehiculo_id) === ROLL_OFF_ID) {
      api.get("/api/cajas").then(r => setCajas(r.data));
    } else {
      setCajas([]);
    }

    setForm(f => ({
      ...f,
      vehiculo_id: "",
      caja_id: "",
    }));
  }, [form.tipo_vehiculo_id]);

  /* ================= LECTURA BALANZA ================= */
  useEffect(() => {
    if (form.origen !== "BALANZA" || !balanzaDisponible) return;

    const timer = setInterval(async () => {
      try {
        const res = await api.get("/api/balanza/peso");

        if (res.data?.disponible) {
          setPesoBalanza(res.data.peso_kg);
          setBalanzaOk(true);
        } else {
          setPesoBalanza(null);
          setBalanzaOk(false);
        }
      } catch {
        setPesoBalanza(null);
        setBalanzaOk(false);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [form.origen, balanzaDisponible]);

  /* ================= HANDLERS ================= */
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleOrigenChange = e => {
    const origen = e.target.value;

    setForm(f => ({
      ...f,
      origen,
      peso: "",
    }));

    setPesoBalanza(null);
    setBalanzaOk(false);
  };

  /* ================= SUBMIT ================= */
  const submit = async e => {
    e.preventDefault();

    try {
      await api.post("/api/pesadas", {
        tipo_movimiento: form.tipo_movimiento,
        empresa_id: Number(form.empresa_id),
        chofer_id: Number(form.chofer_id),
        material_id: Number(form.material_id),
        tipo_vehiculo_id: Number(form.tipo_vehiculo_id),
        vehiculo_id: Number(form.vehiculo_id),
        caja_id:
          Number(form.tipo_vehiculo_id) === ROLL_OFF_ID
            ? Number(form.caja_id)
            : null,
        modo: form.origen === "BALANZA" ? "AUTOMATICO" : "MANUAL",
        peso_manual:
          form.origen === "MANUAL" ? Number(form.peso) : null,
      });

      onCreated?.();

      setForm(f => ({
        ...f,
        empresa_id: "",
        chofer_id: "",
        material_id: "",
        tipo_vehiculo_id: "",
        vehiculo_id: "",
        caja_id: "",
        peso: "",
      }));

    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar la pesada");
    }
  };
  /* ================= OPTIONS ================= */

  const empresaOptions = empresas.map(e => ({
    value: e.id,
    label: e.nombre,
  }));

  const choferOptions = choferes.map(c => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido}`,
  }));

  const materialOptions = materiales.map(m => ({
    value: m.id,
    label: m.nombre,
  }));

  const tipoVehiculoOptions = tiposVehiculo.map(t => ({
    value: t.id,
    label: t.nombre,
  }));

  const vehiculoOptions = vehiculos.map(v => ({
    value: v.id,
    label: v.patente,
  }));

  const cajaOptions = cajas.map(c => ({
    value: c.id,
    label: c.codigo,
  }));


  /* ================= RENDER ================= */
  return (
    <form onSubmit={submit}>

      {/* ===== CONTROLES ===== */}
      <div className="form-card">
        <div className="form-grid">

          <select
            name="tipo_movimiento"
            value={form.tipo_movimiento}
            onChange={handleChange}
          >
            <option value="INGRESO">Ingreso</option>
            <option value="EGRESO">Egreso</option>
          </select>

          <select value={form.origen} onChange={handleOrigenChange}>
            <option value="BALANZA">Balanza</option>
            <option value="MANUAL">Manual</option>
          </select>

          {form.origen === "BALANZA" && (
            <div>
              <label>Peso balanza</label>
              <input
                disabled
                value={
                  balanzaOk && pesoBalanza != null
                    ? `${Number(pesoBalanza).toLocaleString("es-AR")} kg`
                    : "Balanza no disponible"
                }
              />
            </div>
          )}

          {form.origen === "MANUAL" && (
            <div>
              <label>Peso manual</label>
              <input
                type="number"
                name="peso"
                value={form.peso}
                onChange={(e) => {
                  const value = e.target.value;

                  // Permitir borrar el campo
                  if (value === "") {
                    setForm(f => ({ ...f, peso: "" }));
                    return;
                  }

                  const numero = Number(value);

                  // No permitir negativos
                  if (numero < 0) return;

                  setForm(f => ({ ...f, peso: value }));
                }}
                required
                min="0"
                step="1"
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== DATOS ===== */}
      <div className="form-card">
        <div className="form-grid">

          {/* EMPRESA */}
          <div className="select-add">
            <div style={{ flex: 1 }}>
              <Select
                placeholder="Buscar empresa..."
                options={empresas.map(e => ({
                  value: e.id,
                  label: e.nombre,
                }))}
                value={
                  empresas
                    .map(e => ({ value: e.id, label: e.nombre }))
                    .find(option => option.value === Number(form.empresa_id)) || null
                }
                onChange={(selected) =>
                  setForm(f => ({
                    ...f,
                    empresa_id: selected ? selected.value : "",
                  }))
                }
                isClearable
              />
            </div>

            <button
              type="button"
              onClick={() => setShowEmpresa(true)}
            >
              ➕
            </button>
          </div>

          {/* CHOFER */}
          <div className="select-add">
            <div style={{ flex: 1 }}>
              <Select
                placeholder="Chofer"
                options={choferOptions}
                value={choferOptions.find(o => o.value === Number(form.chofer_id)) || null}
                onChange={(selected) =>
                  setForm(f => ({
                    ...f,
                    chofer_id: selected ? selected.value : "",
                  }))
                }
                isClearable
              />
            </div>

            <button type="button" onClick={() => setShowChofer(true)}>
              ➕
            </button>
          </div>


          {/* MATERIAL */}
          <div className="select-add">
            <div style={{ flex: 1 }}>
              <Select
                placeholder="Material"
                options={materialOptions}
                value={materialOptions.find(o => o.value === Number(form.material_id)) || null}
                onChange={(selected) =>
                  setForm(f => ({
                    ...f,
                    material_id: selected ? selected.value : "",
                  }))
                }
                isClearable
              />
            </div>

            <button type="button" onClick={() => setShowMaterial(true)}>
              ➕
            </button>
          </div>


          {/* TIPO VEHÍCULO */}
          <Select
            placeholder="Tipo de vehículo"
            options={tipoVehiculoOptions}
            value={tipoVehiculoOptions.find(o => o.value === Number(form.tipo_vehiculo_id)) || null}
            onChange={(selected) =>
              setForm(f => ({
                ...f,
                tipo_vehiculo_id: selected ? selected.value : "",
                vehiculo_id: "",
                caja_id: "",
              }))
            }
            isClearable
          />


          {/* VEHÍCULO */}
          <div className="select-add">
            <div style={{ flex: 1 }}>
              <Select
                placeholder="Patente"
                options={vehiculoOptions}
                value={vehiculoOptions.find(o => o.value === Number(form.vehiculo_id)) || null}
                onChange={(selected) =>
                  setForm(f => ({
                    ...f,
                    vehiculo_id: selected ? selected.value : "",
                  }))
                }
                isClearable
                isDisabled={!form.tipo_vehiculo_id}
              />
            </div>

            <button
              type="button"
              disabled={!form.tipo_vehiculo_id}
              onClick={() => setShowVehiculo(true)}
            >
              ➕
            </button>
          </div>


          {/* CAJA */}
          {Number(form.tipo_vehiculo_id) === ROLL_OFF_ID && (
            <Select
              placeholder="Caja"
              options={cajaOptions}
              value={cajaOptions.find(o => o.value === Number(form.caja_id)) || null}
              onChange={(selected) =>
                setForm(f => ({
                  ...f,
                  caja_id: selected ? selected.value : "",
                }))
              }
              isClearable
            />
          )}

        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <button className="btn-verde">💾 Guardar pesada</button>
      </div>

      {/* ===== MODALES ===== */}
      {showEmpresa && (
        <EmpresaModal
          onClose={() => setShowEmpresa(false)}
          onSaved={e => {
            setEmpresas(p => [...p, e]);
            setForm(f => ({ ...f, empresa_id: e.id }));
          }}
        />
      )}

      {showChofer && (
        <ChoferModal
          onClose={() => setShowChofer(false)}
          onSaved={c => {
            setChoferes(p => [...p, c]);
            setForm(f => ({ ...f, chofer_id: c.id }));
          }}
        />
      )}

      {showMaterial && (
        <MaterialModal
          onClose={() => setShowMaterial(false)}
          onSaved={m => {
            setMateriales(p => [...p, m]);
            setForm(f => ({ ...f, material_id: m.id }));
          }}
        />
      )}

      {showVehiculo && (
        <VehiculoModal
          tipoVehiculoId={form.tipo_vehiculo_id}
          onClose={() => setShowVehiculo(false)}
          onSaved={v => {
            setVehiculos(p => [...p, v]);
            setForm(f => ({ ...f, vehiculo_id: v.id }));
          }}
        />
      )}
    </form>
  );
}
