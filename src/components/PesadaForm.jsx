import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../services/api";
import { Truck, File, Building2, Scale, Info } from "lucide-react";

import EmpresaModal from "./EmpresaModal";
import ChoferModal from "./ChoferModal";
import VehiculoModal from "./VehiculoModal";
import CajaModal from "./CajaModal";
import ResultadoModal from "./ResultadoModal";
import ConfirmarPesadaModal from "./ConfirmarPesadaModal";

export default function PesadaForm({ balanzaDisponible = true, onCreated }) {

  const [empresas, setEmpresas] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cajas, setCajas] = useState([]);

  const [showEmpresa, setShowEmpresa] = useState(false);
  const [showChofer, setShowChofer] = useState(false);
  const [showVehiculo, setShowVehiculo] = useState(false);
  const [showCaja, setShowCaja] = useState(false);
  const [showReferenciaMateriales, setShowReferenciaMateriales] = useState(false);
  const [resumenConfirmacion, setResumenConfirmacion] = useState(null);

  const [pesoBalanza, setPesoBalanza] = useState(null);
  const [balanzaOk, setBalanzaOk] = useState(false);
  const [passwordManual, setPasswordManual] = useState("");
  const [motivoManual, setMotivoManual] = useState("");
  const [resultado, setResultado] = useState(null);

  const [form, setForm] = useState({
    tipo_movimiento: "INGRESO",
    origen: "BALANZA",
    empresa_id: "",
    personal_id: "",
    material_general_id: "",
    tipo_vehiculo_id: "",
    vehiculo_id: "",
    caja_id: "",
    peso: "",
    nro_manifiesto: "",
    nro_remito: "",
    peso_declarado_kg: "",
    tara_real_kg: "",
  });

  const tipoVehiculoSeleccionado = tiposVehiculo.find(
    t => t.id === Number(form.tipo_vehiculo_id)
  );

  const materialSeleccionado = materiales.find(
    m => m.id === Number(form.material_general_id)
  );

  const [tiposCaja, setTiposCaja] = useState([]);
  const [tipoCajaSeleccionado, setTipoCajaSeleccionado] = useState(null);

  // Límites de largo para los campos numéricos de documentación,
  // en línea con VARCHAR(10) / VARCHAR(14) en la base de datos.
  const MAX_LARGO_MANIFIESTO = 10;
  const MAX_LARGO_REMITO = 14;

  // Deja solo dígitos y corta al largo máximo. Se usa en el onChange
  // de los inputs de manifiesto y remito para que no se puedan escribir
  // letras ni caracteres raros (espacios, puntos, barras, etc.).
  const soloNumeros = (valor, maxLargo) => valor.replace(/\D/g, "").slice(0, maxLargo);

  useEffect(() => {
    api.get("/empresas").then(r => setEmpresas(r.data));
    api.get("/tipos_vehiculo").then(r => setTiposVehiculo(r.data));
    api.get("/personal/choferes").then(r => setPersonal(r.data));
  }, []);

  // Materiales habilitados: dependen del tipo de movimiento (INGRESO/EGRESO).
  // La lista de materiales ahora la administra el backend (aplica_ingreso /
  // aplica_egreso) — el usuario ya no puede crear materiales desde acá.
  useEffect(() => {
    api
      .get("/materiales", { params: { tipo_movimiento: form.tipo_movimiento } })
      .then(r => setMateriales(r.data))
      .catch(() => setMateriales([]));
  }, [form.tipo_movimiento]);

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

  const handleTipoMovimiento = valor => {
    // Al cambiar INGRESO/EGRESO cambia la lista de materiales válidos,
    // así que se limpia el material seleccionado.
    setForm(f => ({ ...f, tipo_movimiento: valor, material_general_id: "" }));
  };

  const handleTipoVehiculo = seleccionado => {
    setForm(f => ({
      ...f,
      tipo_vehiculo_id: seleccionado?.value || "",
      vehiculo_id: "",
      caja_id: "",
    }));
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

  // Paso 1: valida y arma el resumen para mostrar en el modal de confirmación
  const handlePrepararConfirmacion = e => {
    e.preventDefault();

    const esVacio = materialSeleccionado?.nombre === "VACIO";

    if (form.origen === "MANUAL") {
      if (!passwordManual.trim()) return alert("Debe ingresar contraseña.");
      if (!motivoManual.trim()) return alert("Debe ingresar el motivo.");
      if (!form.peso && !esVacio) return alert("Debe ingresar el peso.");
    }

    setResumenConfirmacion({
      tipo_movimiento: form.tipo_movimiento,
      origen: form.origen === "BALANZA" ? "Balanza" : "Manual",
      empresa: empresaOptions.find(o => o.value === Number(form.empresa_id))?.label,
      chofer: personalOptions.find(o => o.value === Number(form.personal_id))?.label,
      material: materialSeleccionado?.nombre,
      tipoVehiculo: tipoVehiculoOptions.find(o => o.value === Number(form.tipo_vehiculo_id))?.label,
      patente: vehiculoOptions.find(o => o.value === Number(form.vehiculo_id))?.label,
      caja: cajaOptions.find(o => o.value === Number(form.caja_id))?.label,
      peso: form.origen === "MANUAL" ? form.peso : null,
      taraReal: form.tara_real_kg,
      pesoDeclarado: form.peso_declarado_kg,
      manifiesto: form.nro_manifiesto,
      remito: form.nro_remito,
      motivoManual: form.origen === "MANUAL" ? motivoManual : null,
    });
  };

  // Paso 2: el usuario confirmó en el modal, recién acá se manda el POST real
  const confirmarYGuardar = async () => {
    setResumenConfirmacion(null);

    try {
      const res = await api.post("/pesadas", {
        tipo_movimiento: form.tipo_movimiento,
        empresa_id: form.empresa_id ? Number(form.empresa_id) : null,
        personal_id: form.personal_id ? Number(form.personal_id) : null,
        material_general_id: form.material_general_id ? Number(form.material_general_id) : null,
        vehiculo_id: form.vehiculo_id ? Number(form.vehiculo_id) : null,
        caja_id: form.caja_id ? Number(form.caja_id) : null,
        modo: form.origen === "BALANZA" ? "AUTOMATICO" : "MANUAL",
        peso_manual: form.origen === "MANUAL" ? Number(form.peso) : null,
        password_manual: form.origen === "MANUAL" ? passwordManual : null,
        motivo_manual: form.origen === "MANUAL" ? motivoManual : null,
        nro_manifiesto: form.nro_manifiesto || null,
        nro_remito: form.nro_remito || null,
        peso_declarado_kg: form.peso_declarado_kg ? Number(form.peso_declarado_kg) : null,
        tara_real_kg: form.tara_real_kg ? Number(form.tara_real_kg) : null
      });

      const id = res.data.id;
      const detalle = await api.get(`/pesadas/${id}`);
      const p = detalle.data;

      const tienePesoDeclarado = p.peso_declarado_kg != null && Number(p.peso_declarado_kg) > 0;
      const esVacioBackend = p.material === "VACIO" && Number(p.peso_bruto_kg) === 0;

      setResultado({
        tipo: esVacioBackend || !tienePesoDeclarado || p.dentro_tolerancia ? "ok" : "warning",
        mensaje: esVacioBackend
          ? "Vehículo vacío registrado y cerrado automáticamente"
          : tienePesoDeclarado
            ? (p.dentro_tolerancia
              ? "✔ Pesada guardada correctamente (dentro de tolerancia)"
              : "Pesada guardada, pero FUERA de tolerancia")
            : "Pesada guardada correctamente",
        id: p.id
      });

      setForm({
        tipo_movimiento: "INGRESO",
        origen: "BALANZA",
        empresa_id: "",
        personal_id: "",
        material_general_id: "",
        tipo_vehiculo_id: "",
        vehiculo_id: "",
        caja_id: "",
        peso: "",
        nro_manifiesto: "",
        nro_remito: "",
        peso_declarado_kg: "",
        tara_real_kg: ""
      });

      setTipoCajaSeleccionado(null);
      setPasswordManual("");
      setMotivoManual("");

    } catch (err) {
      alert(err.response?.data?.error || "Error al guardar la pesada.");
    }
  };

  return (
    <>
      <form onSubmit={handlePrepararConfirmacion}>
        <div className="section-card">
          <div className="section-header">
            <Scale />
            <div></div>
          </div>

          <div className="field-grid-horizontal">

            <div className="field-group">
              <label>Movimiento</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${form.tipo_movimiento === "INGRESO" ? "active" : ""}`}
                  onClick={() => handleTipoMovimiento("INGRESO")}
                >
                  Ingreso
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${form.tipo_movimiento === "EGRESO" ? "active" : ""}`}
                  onClick={() => handleTipoMovimiento("EGRESO")}
                >
                  Egreso
                </button>
              </div>
            </div>

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
                  <label>Peso de ingreso (kg)</label>
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

        <div className="section-card">
          <div className="section-header">
            <Building2 />
            <div>
              <div className="section-title">Datos del viaje</div>
              <div className="section-subtitle">Empresa, chofer y material transportado</div>
            </div>
          </div>

          <div className="field-grid-horizontal">

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

            <div className="field-group">
              <label>Chofer</label>
              <div className="select-with-btn">
                <Select
                  options={personalOptions}
                  value={personalOptions.find(o => o.value === Number(form.personal_id)) || null}
                  onChange={s => setForm(f => ({
                    ...f,
                    personal_id: s ? Number(s.value) : ""
                  }))}
                  isClearable
                  placeholder="Seleccionar..."
                />
                <button type="button" className="btn-add" onClick={() => setShowChofer(true)}>+</button>
              </div>
            </div>

            <div className="field-group">
              <div className="label-row">
                <label>Material</label>
                <button
                  type="button"
                  className="btn-link-info"
                  onClick={() => setShowReferenciaMateriales(true)}
                >
                  <Info size={14} /> ¿Qué se clasifica en cada uno?
                </button>
              </div>
              <Select
                options={materialOptions}
                value={materialOptions.find(o => o.value === Number(form.material_general_id)) || null}
                onChange={s => setForm(f => ({ ...f, material_general_id: s?.value || "" }))}
                isClearable
                placeholder="Seleccionar..."
              />
              {materialSeleccionado?.descripcion && (
                <div className="material-descripcion">
                  {materialSeleccionado.descripcion}
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <File />
            <div>
              <div className="section-title">Documentación</div>
            </div>
          </div>

          <div className="field-grid-horizontal">

            <div className="field-group">
              <label>N° Manifiesto</label>
              <input
                value={form.nro_manifiesto}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    nro_manifiesto: soloNumeros(e.target.value, MAX_LARGO_MANIFIESTO),
                  }))
                }
                onPaste={e => {
                  e.preventDefault();
                  const pegado = (e.clipboardData || window.clipboardData).getData("text");
                  setForm(f => ({
                    ...f,
                    nro_manifiesto: soloNumeros(f.nro_manifiesto + pegado, MAX_LARGO_MANIFIESTO),
                  }));
                }}
                inputMode="numeric"
                maxLength={MAX_LARGO_MANIFIESTO}
                placeholder="OPCIONAL — solo números"
              />
              {form.nro_manifiesto.length === MAX_LARGO_MANIFIESTO && (
                <div className="campo-hint">Máximo {MAX_LARGO_MANIFIESTO} dígitos.</div>
              )}
            </div>

            <div className="field-group">
              <label>N° Remito</label>
              <input
                value={form.nro_remito}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    nro_remito: soloNumeros(e.target.value, MAX_LARGO_REMITO),
                  }))
                }
                onPaste={e => {
                  e.preventDefault();
                  const pegado = (e.clipboardData || window.clipboardData).getData("text");
                  setForm(f => ({
                    ...f,
                    nro_remito: soloNumeros(f.nro_remito + pegado, MAX_LARGO_REMITO),
                  }));
                }}
                inputMode="numeric"
                maxLength={MAX_LARGO_REMITO}
                placeholder="OPCIONAL — solo números"
              />
              {form.nro_remito.length === MAX_LARGO_REMITO && (
                <div className="campo-hint">Máximo {MAX_LARGO_REMITO} dígitos.</div>
              )}
            </div>

            <div className="field-group">
              <label>Peso declarado por cliente</label>
              <input
                type="number"
                value={form.peso_declarado_kg}
                onChange={e => setForm(f => ({ ...f, peso_declarado_kg: e.target.value }))}
                placeholder="OPCIONAL"
              />
            </div>

            <div className="field-group">
              <label>Tara real (camión vacío)</label>
              <input
                type="number"
                value={form.tara_real_kg}
                onChange={e => setForm(f => ({ ...f, tara_real_kg: e.target.value }))}
                placeholder="OPCIONAL"
              />
            </div>
            <div className="manual-note">
              ⚠ Es importante la carga de documentación, por favor, si el viaje tiene manifiesto, remito o peso declarado, colocalos, sino, dejalos vacios.
            </div>

          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <Truck />
            <div>
              <div className="section-title">Vehículo</div>
              <div className="section-subtitle">Tipo, patente y caja</div>
            </div>
          </div>

          <div className="field-grid-horizontal">

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

        <div className="footer-row">
          <button type="button" className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">💾 Guardar pesada</button>
        </div>

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

      <ConfirmarPesadaModal
        resumen={resumenConfirmacion}
        onConfirmar={confirmarYGuardar}
        onCancelar={() => setResumenConfirmacion(null)}
      />

      <ResultadoModal
        resultado={resultado}
        onClose={() => setResultado(null)}
      />

      {showReferenciaMateriales && (
        <div className="modal-overlay" onClick={() => setShowReferenciaMateriales(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "14px" }}>¿Qué se clasifica en cada material?</h3>
            <ul className="material-referencia-list">
              {materiales.map(m => (
                <li key={m.id}>
                  <strong>{m.nombre}</strong>
                  {m.descripcion ? `: ${m.descripcion}` : ""}
                </li>
              ))}
            </ul>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowReferenciaMateriales(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>

  );
}