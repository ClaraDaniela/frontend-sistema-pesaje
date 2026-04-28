import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtKg(val) {
  if (val == null || val === "") return "—";
  return `${Number(val).toLocaleString("es-AR", { minimumFractionDigits: 2 })} kg`;
}

function ToleranciaTag({ dentro, diferencia }) {
  if (dentro == null) return null;
  const ok = Number(dentro) === 1;
  const color = ok ? "#166534" : "#991b1b";
  const bg = ok ? "#dcfce7" : "#fee2e2";
  const label = ok ? "Dentro de tolerancia" : "Fuera de tolerancia";
  const dif = diferencia != null
    ? ` (${diferencia > 0 ? "+" : ""}${Number(diferencia).toFixed(2)} kg)`
    : "";
  return (
    <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500 }}>
      {label}{dif}
    </span>
  );
}

// ─── fila de material con selects en cascada ────────────────────────────────

function FilaMaterial({ fila, index, pesoNeto, catalogos, onActualizar, onEliminar }) {
  const { tipos, bases, formas, combinaciones } = catalogos;

  // bases filtradas por tipo elegido
  const basesFiltradas = fila.tipo_id
    ? [...new Map(
      combinaciones
        .filter(c => c.tipo_material_id === Number(fila.tipo_id) && c.material_base_id)
        .map(c => [c.material_base_id, { id: c.material_base_id, nombre: c.base_nombre }])
    ).values()]
    : [];

  // formas filtradas por tipo + base
  const formasFiltradas = fila.tipo_id && fila.base_id
    ? [...new Map(
      combinaciones
        .filter(c =>
          c.tipo_material_id === Number(fila.tipo_id) &&
          c.material_base_id === Number(fila.base_id) &&
          c.forma_material_id
        )
        .map(c => [c.forma_material_id, { id: c.forma_material_id, nombre: c.forma_nombre }])
    ).values()]
    : [];

  // id final de la combinación elegida
  const comboId = fila.tipo_id && fila.base_id
    ? (combinaciones.find(c =>
      c.tipo_material_id === Number(fila.tipo_id) &&
      c.material_base_id === (fila.base_id ? Number(fila.base_id) : null) &&
      c.forma_material_id === (fila.forma_id ? Number(fila.forma_id) : null)
    )?.id_materiales_descarga ?? null)
    : null;

  // sincronizar id combo hacia el padre
  useEffect(() => {
    if (fila.material_id !== comboId) {
      onActualizar(index, "material_id", comboId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comboId]);

  const kg = pesoNeto && fila.porcentaje
    ? ((pesoNeto * fila.porcentaje) / 100).toFixed(2)
    : "";

  const sel = {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 13,
    background: "#fff",
    minWidth: 0,
    flex: 1,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 90px 80px 32px", gap: 6, alignItems: "center", marginBottom: 6 }}>

      {/* Categoría */}
      <select
        style={sel}
        value={fila.tipo_id}
        onChange={e => {
          onActualizar(index, "tipo_id", e.target.value);
          onActualizar(index, "base_id", "");
          onActualizar(index, "forma_id", "");
        }}
      >
        <option value="">Categoría</option>
        {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
      </select>

      {/* Base */}
      <select
        style={sel}
        value={fila.base_id}
        disabled={!fila.tipo_id}
        onChange={e => {
          onActualizar(index, "base_id", e.target.value);
          onActualizar(index, "forma_id", "");
        }}
      >
        <option value="">Material</option>
        {basesFiltradas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
      </select>

      {/* Forma / variante */}
      <select
        style={sel}
        value={fila.forma_id}
        disabled={!fila.base_id || formasFiltradas.length === 0}
        onChange={e => onActualizar(index, "forma_id", e.target.value)}
      >
        <option value="">Variante</option>
        {formasFiltradas.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
      </select>

      {/* Porcentaje */}
      <input
        type="number"
        placeholder="%"
        min={0}
        max={100}
        style={{ ...sel, textAlign: "right" }}
        value={fila.porcentaje}
        onChange={e => onActualizar(index, "porcentaje", e.target.value)}
      />

      {/* Kg calculado */}
      <input
        type="text"
        readOnly
        value={kg ? `${kg} kg` : ""}
        style={{ ...sel, background: "#f9fafb", color: "#6b7280", textAlign: "right" }}
      />

      {/* Eliminar */}
      <button
        onClick={() => onEliminar(index)}
        style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 15, padding: "4px 0" }}
      >×</button>
    </div>
  );
}

// ─── componente principal ────────────────────────────────────────────────────

export default function Descarga() {
  const { pesadaId } = useParams();
  const navigate = useNavigate();

  const [pesadas, setPesadas] = useState([]);
  const [pesadaSeleccionada, setPesadaSeleccionada] = useState(pesadaId || "");
  const [pesada, setPesada] = useState(null);

  // catálogo combinado de materiales
  const [catalogos, setCatalogos] = useState({ tipos: [], bases: [], formas: [], combinaciones: [] });

  // filas de materiales
  const [filas, setFilas] = useState([{ tipo_id: "", base_id: "", forma_id: "", porcentaje: "", material_id: null }]);
  const [comentarios, setComentarios] = useState("");
  const [guardando, setGuardando] = useState(false);

  // ── cargar pesadas sin descarga ──
  useEffect(() => {
    fetch("/api/pesadas/sin-descarga")
      .then(r => r.json())
      .then(setPesadas);
  }, []);

  // ── cargar detalle de la pesada elegida ──
  useEffect(() => {
    if (!pesadaSeleccionada) { setPesada(null); return; }
    fetch(`/api/pesadas/${pesadaSeleccionada}`)
      .then(r => r.json())
      .then(setPesada);
  }, [pesadaSeleccionada]);

  // ── cargar catálogos de materiales ──
  useEffect(() => {
    Promise.all([
      fetch("/api/materiales_descarga/tipos").then(r => r.json()),
      fetch("/api/materiales_descarga/combinaciones").then(r => r.json())
    ]).then(([tipos, combinaciones]) => {

      const bases = [...new Map(
        combinaciones
          .filter(c => c.material_base_id)
          .map(c => [c.material_base_id, { id: c.material_base_id, nombre: c.base_nombre }])
      ).values()];

      const formas = [...new Map(
        combinaciones
          .filter(c => c.forma_material_id)
          .map(c => [c.forma_material_id, { id: c.forma_material_id, nombre: c.forma_nombre }])
      ).values()];

      setCatalogos({ tipos, bases, formas, combinaciones });
    });
  }, []);

  // ── actualizar campo de una fila ──
  const actualizarFila = useCallback((index, campo, valor) => {
    setFilas(prev => {
      const nuevas = [...prev];
      nuevas[index] = { ...nuevas[index], [campo]: valor };
      return nuevas;
    });
  }, []);

  const agregarFila = () => setFilas(f => [...f, { tipo_id: "", base_id: "", forma_id: "", porcentaje: "", material_id: null }]);
  const eliminarFila = i => setFilas(f => f.filter((_, idx) => idx !== i));

  const totalPorcentaje = filas.reduce((acc, f) => acc + Number(f.porcentaje || 0), 0);

  // ── guardar ──
  const guardar = async () => {
    if (!pesadaSeleccionada) return alert("Seleccioná una pesada");
    if (Math.round(totalPorcentaje) !== 100) return alert("Los porcentajes deben sumar 100%");
    const filasInvalidas = filas.filter(f => !f.material_id || !f.porcentaje);
    if (filasInvalidas.length) return alert("Completá todos los materiales y porcentajes");

    setGuardando(true);
    try {
      const res = await fetch("/api/descargas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pesada_id: pesadaSeleccionada,
          responsable: 1,
          comentarios,
          materiales: filas.map(f => ({ id: f.material_id, porcentaje: f.porcentaje })),
        }),
      });
      if (res.ok) { alert("Descarga guardada"); navigate("/"); }
      else { alert("Error al guardar"); }
    } finally {
      setGuardando(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const card = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "16px 20px",
    marginBottom: 16,
  };

  const label = { fontSize: 12, color: "#6b7280", marginBottom: 2 };
  const value = { fontSize: 14, color: "#111827", fontWeight: 500 };

  const InfoItem = ({ l, v, children }) => (
    <div style={{ minWidth: 140 }}>
      <div style={label}>{l}</div>
      <div style={value}>{children ?? v ?? "—"}</div>
    </div>
  );
  
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", fontFamily: "sans-serif" }}>
      <div className="topbar-right">
        <button
          className="btn-secundario"
          onClick={() => navigate("/")}
        >
          ← Inicio
        </button>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 20, color: "#111827" }}>Descarga de materiales</h2>

      {/* ── selector de pesada ── */}
      {!pesadaId && (
        <div style={card}>
          <label style={{ ...label, display: "block", marginBottom: 6 }}>Seleccionar pesada</label>
          <select
            value={pesadaSeleccionada}
            onChange={e => setPesadaSeleccionada(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14 }}
          >
            <option value="">— Elegir —</option>
            {pesadas.map(p => (
              <option key={p.id} value={p.id}>
                #{p.id} · {p.empresa} · {p.patente} · {p.personal_nombre} {p.personal_apellido} · {new Date(p.fecha).toLocaleString("es-AR")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── info de la pesada ── */}
      {pesada && (
        <div style={card}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 14 }}>
            <InfoItem l="Empresa" v={pesada.empresa} />
            <InfoItem l="Chofer" v={`${pesada.personal_nombre} ${pesada.personal_apellido}`} />
            <InfoItem l="Vehículo" v={pesada.patente} />
            <InfoItem l="Tipo" v={pesada.tipo_vehiculo} />
            <InfoItem l="Fecha" v={new Date(pesada.fecha).toLocaleString("es-AR")} />
            <InfoItem l="Movimiento" v={pesada.tipo_movimiento} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 14, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
            <InfoItem l="Peso bruto" v={fmtKg(pesada.peso_bruto_kg)} />
            <InfoItem l="Tara camión" v={fmtKg(pesada.tara_camion)} />
            {pesada.tara_caja > 0 && <InfoItem l="Tara caja" v={fmtKg(pesada.tara_caja)} />}
            <InfoItem l="Peso neto">{
              <span style={{ color: "#166534", fontWeight: 600 }}>{fmtKg(pesada.peso_neto)}</span>
            }</InfoItem>
          </div>

          {/* Documentación y tolerancia */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
            {pesada.nro_manifiesto && <InfoItem l="N° Manifiesto" v={pesada.nro_manifiesto} />}
            {pesada.nro_remito && <InfoItem l="N° Remito" v={pesada.nro_remito} />}
            {pesada.peso_declarado_kg && (
              <InfoItem l="Peso declarado" v={fmtKg(pesada.peso_declarado_kg)} />
            )}
            {pesada.dentro_tolerancia != null && (
              <InfoItem l="Tolerancia (5%)">
                <ToleranciaTag dentro={pesada.dentro_tolerancia} diferencia={pesada.diferencia_kg} />
              </InfoItem>
            )}
          </div>
        </div>
      )}

      {/* ── tabla de materiales ── */}
      {pesada && (
        <div style={card}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 90px 80px 32px",
            gap: 6,
            marginBottom: 8,
            fontSize: 11,
            fontWeight: 600,
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            <span>Categoría</span>
            <span>Material</span>
            <span>Variante</span>
            <span style={{ textAlign: "right" }}>%</span>
            <span style={{ textAlign: "right" }}>Kg</span>
            <span />
          </div>

          {filas.map((f, i) => (
            <FilaMaterial
              key={i}
              fila={f}
              index={i}
              pesoNeto={pesada.peso_neto}
              catalogos={catalogos}
              onActualizar={actualizarFila}
              onEliminar={eliminarFila}
            />
          ))}

          {/* total */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 8, paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Total:</span>
            <span style={{
              fontWeight: 700,
              fontSize: 14,
              color: Math.round(totalPorcentaje) === 100 ? "#166534" : "#991b1b",
            }}>
              {totalPorcentaje.toFixed(1)}%
            </span>
          </div>

          <button
            onClick={agregarFila}
            style={{ marginTop: 12, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
          >
            + Agregar material
          </button>
        </div>
      )}

      {/* ── comentarios y guardar ── */}
      {pesada && (
        <div style={card}>
          <label style={{ ...label, display: "block", marginBottom: 6 }}>Comentarios</label>
          <textarea
            value={comentarios}
            onChange={e => setComentarios(e.target.value)}
            rows={3}
            style={{ width: "100%", borderRadius: 6, border: "1px solid #d1d5db", padding: "8px 10px", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
            placeholder="Observaciones de la descarga..."
          />

          <button
            onClick={guardar}
            disabled={guardando}
            style={{
              marginTop: 14,
              background: guardando ? "#9ca3af" : "#1d4ed8",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: guardando ? "default" : "pointer",
              width: "100%",
            }}
          >
            {guardando ? "Guardando..." : "Guardar descarga"}
          </button>
        </div>
      )}
    </div>
  );
}