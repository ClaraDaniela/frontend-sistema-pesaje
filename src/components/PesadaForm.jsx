import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";

import EmpresaModal from "./EmpresaModal";
import ChoferModal from "./ChoferModal";
import MaterialModal from "./MaterialModal";
import VehiculoModal from "./VehiculoModal";
import CajaModal from "./CajaModal";

export default function PesadaForm({ balanzaDisponible = true, onCreated }) {

  const [empresas, setEmpresas] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cajas, setCajas] = useState([]);

  const [showEmpresa, setShowEmpresa] = useState(false);
  const [showChofer, setShowChofer] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);
  const [showVehiculo, setShowVehiculo] = useState(false);
  const [showCaja, setShowCaja] = useState(false);

  const [pesoBalanza, setPesoBalanza] = useState(null);
  const [balanzaOk, setBalanzaOk] = useState(false);
  const [passwordManual, setPasswordManual] = useState("");
  const [motivoManual, setMotivoManual] = useState("");

  const [form, setForm] = useState({
    tipo_movimiento: "INGRESO",
    origen: "BALANZA",
    empresa_id: "",
    personal_id: "",
    material_id: "",
    tipo_vehiculo_id: "",
    vehiculo_id: "",
    caja_id: "",
    peso: "",
  });

  // El tipo de vehículo seleccionado (objeto completo, para saber si tiene_caja)
  const tipoVehiculoSeleccionado = tiposVehiculo.find(
    t => t.id === Number(form.tipo_vehiculo_id)
  );

  const [tiposCaja, setTiposCaja] = useState([]);
  const [tipoCajaSeleccionado, setTipoCajaSeleccionado] = useState(null);

  useEffect(() => {
    api.get("/empresas").then(r => setEmpresas(r.data));
    api.get("/materiales").then(r => setMateriales(r.data));
    api.get("/tipos_vehiculo").then(r => setTiposVehiculo(r.data));
    api.get("/personal").then(r => {
      console.log("Personal:", r.data);
      setPersonal(r.data);
    });
  }, []);

  useEffect(() => {
    if (!form.tipo_vehiculo_id) {
      setVehiculos([]);
      return;
    }

    console.log("Tipo seleccionado:", form.tipo_vehiculo_id);

    api
      .get("/vehiculos", { params: { tipo_vehiculo_id: form.tipo_vehiculo_id } })
      .then(r => {
        console.log("Vehiculos:", r.data);
        setVehiculos(r.data);
      })
      .catch(() => setVehiculos([]));
  }, [form.tipo_vehiculo_id]);

  useEffect(() => {
    if (!form.vehiculo_id) {
      setCajas([]);
      return;
    }

    const vehiculoSeleccionado = vehiculos.find(v => v.id === Number(form.vehiculo_id));
    if (!vehiculoSeleccionado) {
      setCajas([]);
      return;
    }

    let params = { id: vehiculoSeleccionado.caja_id };

    if (tipoCajaSeleccionado) {
      params.tipo_caja_id = tipoCajaSeleccionado.id;
    }

    api.get("/cajas", { params })
      .then(r => setCajas(r.data))
      .catch(() => setCajas([]));
  }, [form.vehiculo_id, vehiculos, tipoCajaSeleccionado]);


  useEffect(() => {
    api.get("/tipos_caja").then(r => setTiposCaja(r.data));
  }, []);

  useEffect(() => {
    if (form.origen !== "BALANZA" || !balanzaDisponible) return;

    const timer = setInterval(async () => {
      try {
        const res = await api.get("/balanza/peso");
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


  const handleOrigenChange = valor => {
    setForm(f => ({ ...f, origen: valor, peso: "" }));
    setPesoBalanza(null);
    setBalanzaOk(false);
  };

  const handleTipoVehiculo = seleccionado => {
    setForm(f => ({
      ...f,
      tipo_vehiculo_id: seleccionado?.value || "",
      vehiculo_id: "",
      caja_id: "",
    }));
  };

  const submit = async e => {
    e.preventDefault();

    if (form.origen === "MANUAL") {
      if (!passwordManual.trim()) return alert("Debe ingresar contraseña de autorización.");
      if (!motivoManual.trim()) return alert("Debe ingresar el motivo.");
      if (!form.peso) return alert("Debe ingresar el peso.");
    }

    try {
      await api.post("/pesadas", {
        tipo_movimiento: form.tipo_movimiento,
        empresa_id: Number(form.empresa_id),
        personal_id: Number(form.personal_id),
        material_id: Number(form.material_id),
        vehiculo_id: Number(form.vehiculo_id),
        caja_id: form.caja_id ? Number(form.caja_id) : null,
        modo: form.origen === "BALANZA" ? "AUTOMATICO" : "MANUAL",
        peso_manual: form.origen === "MANUAL" ? Number(form.peso) : null,
        password_manual: form.origen === "MANUAL" ? passwordManual : null,
        motivo_manual: form.origen === "MANUAL" ? motivoManual : null,
      });

      onCreated?.();

      setForm({
        tipo_movimiento: "INGRESO",
        origen: "BALANZA",
        empresa_id: "",
        personal_id: "",
        material_id: "",
        tipo_vehiculo_id: "",
        vehiculo_id: "",
        caja_id: "",
        peso: "",
      });
      setPasswordManual("");
      setMotivoManual("");
      alert("Pesada guardada correctamente.");

    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar la pesada.");
    }
  };

  const empresaOptions = empresas.map(e => ({ value: e.id, label: e.nombre }));
  const personalOptions = personal.map(c => ({
    value: c.id,
    label: `${c.nombre} ${c.apellido}`,
  }));
  const materialOptions = materiales.map(m => ({ value: m.id, label: m.nombre }));
  const tipoVehiculoOptions = tiposVehiculo.map(t => ({ value: t.id, label: t.nombre }));
  const vehiculoOptions = vehiculos.map(v => ({ value: v.id, label: v.patente }));

  const cajaOptions = cajas.map(c => ({
    value: c.id,
    label: c.codigo,
  }));

  return (
    <form onSubmit={submit}>

      <div className="section-card">
        <div className="section-header">
          <div className="section-icon icon-blue">⚖️</div>
          <div></div>
        </div>

        <div className="field-grid-horizontal">

          {/* Movimiento */}
          <div className="field-group">
            <label>Movimiento</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${form.tipo_movimiento === "INGRESO" ? "active" : ""}`}
                onClick={() => setForm(f => ({ ...f, tipo_movimiento: "INGRESO" }))}
              >
                Ingreso
              </button>
              <button
                type="button"
                className={`toggle-btn ${form.tipo_movimiento === "EGRESO" ? "active" : ""}`}
                onClick={() => setForm(f => ({ ...f, tipo_movimiento: "EGRESO" }))}
              >
                Egreso
              </button>
            </div>
          </div>

          {/* Origen del peso */}
          <div className="field-group">
            <label>Origen del peso</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${form.origen === "BALANZA" ? "active" : ""}`}
                onClick={() => handleOrigenChange("BALANZA")}
              >
                Balanza
              </button>
              <button
                type="button"
                className={`toggle-btn ${form.origen === "MANUAL" ? "active" : ""}`}
                onClick={() => handleOrigenChange("MANUAL")}
              >
                Manual
              </button>
            </div>
          </div>

          {/* Peso balanza */}
          {form.origen === "BALANZA" && (
            <div className="field-group">
              <label>Peso leído</label>
              <div className="peso-display">
                <div className={`peso-dot ${!balanzaOk ? "off" : ""}`} />
                <span className="peso-value">
                  {balanzaOk && pesoBalanza != null
                    ? `${Number(pesoBalanza).toLocaleString("es-AR")} kg`
                    : "Sin conexión"}
                </span>
              </div>
            </div>
          )}

          {/* Peso manual */}
          {form.origen === "MANUAL" && (
            <>
              <div className="field-group">
                <label>Contraseña de autorización</label>
                <input
                  type="password"
                  value={passwordManual}
                  onChange={e => setPasswordManual(e.target.value)}
                  placeholder="Ingresá la contraseña"
                />
              </div>

              <div className="field-group">
                <label>Peso total (kg)</label>
                <input
                  type="number"
                  value={form.peso}
                  min="0"
                  step="1"
                  placeholder="Ej: 12500"
                  onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                />
              </div>

              <div className="manual-note">
                ⚠ La carga manual requiere contraseña de autorización y motivo escrito.
              </div>

              <div className="field-group">
                <label>Motivo</label>
                <textarea
                  value={motivoManual}
                  onChange={e => setMotivoManual(e.target.value)}
                  placeholder="Describí el motivo de la carga manual..."
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== DATOS DEL VIAJE ===== */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon icon-teal">👤</div>
          <div>
            <div className="section-title">Datos del viaje</div>
            <div className="section-subtitle">Empresa, chofer y material transportado</div>
          </div>
        </div>

        <div className="field-grid-horizontal">

          {/* Empresa */}
          <div className="field-group">
            <label>Empresa</label>
            <div className="select-with-btn">
              <Select
                options={empresaOptions}
                value={empresaOptions.find(o => o.value === Number(form.empresa_id)) || null}
                onChange={s => setForm(f => ({ ...f, empresa_id: s?.value || "" }))}
                isClearable
                placeholder="Seleccionar..."
              />
              <button type="button" className="btn-add" onClick={() => setShowEmpresa(true)}>+</button>
            </div>
          </div>

          {/* Personal/Chofer */}
          <div className="field-group">
            <label>Chofer</label>
            <div className="select-with-btn">
              <Select
                options={personalOptions}
                value={personalOptions.find(o => o.value === Number(form.personal_id)) || null}
                onChange={s => setForm(f => ({ ...f, personal_id: s?.value || "" }))}
                isClearable
                placeholder="Seleccionar..."
              />
              <button type="button" className="btn-add" onClick={() => setShowChofer(true)}>+</button>
            </div>
          </div>

          {/* Material */}
          <div className="field-group">
            <label>Material</label>
            <div className="select-with-btn">
              <Select
                options={materialOptions}
                value={materialOptions.find(o => o.value === Number(form.material_id)) || null}
                onChange={s => setForm(f => ({ ...f, material_id: s?.value || "" }))}
                isClearable
                placeholder="Seleccionar..."
              />
              <button type="button" className="btn-add" onClick={() => setShowMaterial(true)}>+</button>
            </div>
          </div>

        </div>
      </div>

      {/* ===== VEHÍCULO ===== */}
      <div className="section-card">
        <div className="section-header">
          <div className="section-icon icon-amber">🚛</div>
          <div>
            <div className="section-title">Vehículo</div>
            <div className="section-subtitle">Tipo, patente y caja</div>
          </div>
        </div>

        <div className="field-grid-horizontal">

          {/* Tipo de vehículo */}
          <div className="field-group">
            <label>Tipo de vehículo</label>
            <Select
              options={tipoVehiculoOptions}
              value={tipoVehiculoOptions.find(o => o.value === Number(form.tipo_vehiculo_id)) || null}
              onChange={handleTipoVehiculo}
              isClearable
              placeholder="Seleccionar..."
            />
          </div>

          {/* Patente */}
          <div className="field-group">
            <label>Patente</label>
            <div className="select-with-btn">
              <Select
                options={vehiculoOptions}
                value={vehiculoOptions.find(o => o.value === Number(form.vehiculo_id)) || null}
                onChange={s => setForm(f => ({ ...f, vehiculo_id: s?.value || "" }))}
                isDisabled={!form.tipo_vehiculo_id}
                isClearable
                placeholder={form.tipo_vehiculo_id ? "Seleccionar..." : "Elegí un tipo primero"}
              />
              <button
                type="button"
                className="btn-add"
                disabled={!form.tipo_vehiculo_id}
                onClick={() => setShowVehiculo(true)}
              >
                +
              </button>
            </div>
          </div>

          {/* Tipo de caja → solo Roll Off o Semi y si hay patente */}
          {["ROLL OFF", "CAMIÓN SEMIRREMOLQUE"].includes(tipoVehiculoSeleccionado?.nombre) && form.vehiculo_id && (
            <div className="field-group">
              <label>Tipo de caja</label>
              <Select
                options={tiposCaja.map(t => ({ value: t.id, label: t.nombre }))}
                value={tipoCajaSeleccionado ? { value: tipoCajaSeleccionado.id, label: tipoCajaSeleccionado.nombre } : null}
                onChange={s => {
                  const seleccionado = tiposCaja.find(t => t.id === s?.value);
                  setTipoCajaSeleccionado(seleccionado || null);
                  setForm(f => ({ ...f, caja_id: "" }));
                }}
                isClearable
                placeholder="Seleccionar tipo de caja..."
              />
            </div>
          )}

          {/* Caja / Semi → solo si se seleccionó tipo de caja */}
          {tipoCajaSeleccionado && (
            <div className="field-group">
              <label>Caja / Semi</label>
              <div className="select-with-btn">
                <Select
                  options={cajaOptions}
                  value={cajaOptions.find(o => o.value === Number(form.caja_id)) || null}
                  onChange={s => setForm(f => ({ ...f, caja_id: s?.value || "" }))}
                  isClearable
                  placeholder="Seleccionar caja..."
                />
                <button type="button" className="btn-add" onClick={() => setShowCaja(true)}>+</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="footer-row">
        <button type="button" className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary">💾 Guardar pesada</button>
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
            setPersonal(p => [...p, c]);
            setForm(f => ({ ...f, personal_id: c.id }));
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

      {showCaja && (
        <CajaModal
          onClose={() => setShowCaja(false)}
          onSaved={c => {
            setCajas(p => [...p, c]);
            setForm(f => ({ ...f, caja_id: c.id }));
          }}
        />
      )}

    </form>
  );
}