import { useState } from "react";
import { Eye, Printer, Pencil, CheckCircle, Clock, Zap, Search } from "lucide-react";
import Select from "react-select";
import "../styles/tablafiltros.css";
import "../styles/PesadaTable.css";
import CerrarPesadaModal from "./CerrarPesadaModal";

export default function PesadasTable({
  pesadas = [],
  filtros = {},
  onFiltrosChange,
  onSearch,
  empresas = [],
  vehiculos = [],
  tipoVehiculo = [],
  balanzaDisponible = true,
  onView,
  onEdit,
  onPesadaCerrada,
}) {
  const [pesadaACerrar, setPesadaACerrar] = useState(null);
  const [exito, setExito] = useState(null);

  // Opciones para los selects
  const empresaOptions = empresas.map((e) => ({ value: e.id, label: e.nombre }));
  const tipoVehiculoOptions = tipoVehiculo.map((t) => ({ value: t.id, label: t.nombre }));

  // Filtrar vehículos por tipo seleccionado
  const vehiculosFiltrados = filtros.tipo_vehiculo_id
    ? vehiculos.filter((v) => v.tipo_vehiculo_id === Number(filtros.tipo_vehiculo_id))
    : vehiculos;
  const vehiculoOptions = vehiculosFiltrados.map((v) => ({ value: v.id, label: v.patente }));

  const handleCerrada = (pesadaActualizada) => {
    setPesadaACerrar(null);
    setExito(`Pesada #${pesadaActualizada.id} cerrada correctamente.`);
    setTimeout(() => setExito(null), 4000);
    if (onPesadaCerrada) onPesadaCerrada(pesadaActualizada);
  };

  const estaAbierta = (p) => p.tara_real_kg == null;

  const handleLimpiar = () => {
    onFiltrosChange({
      desde: "",
      hasta: "",
      empresa_id: "",
      tipo_vehiculo_id: "",
      vehiculo_id: "",
    });
  };

  return (
    <div className="pesadas-table-container">

      {/* ===== FILTROS ===== */}
      <div className="pesadas-filtros-card">
        <div className="section-header">
          <Search />
          <div>
            <div className="section-title">Filtros</div>
            <div className="section-subtitle">Buscá pesadas por distintos criterios</div>
          </div>
        </div>

        <div className="form-grid">

          <div className="field-group">
            <label>Fecha Desde</label>
            <input
              type="date"
              value={filtros.desde || ""}
              onChange={(e) =>
                onFiltrosChange({ ...filtros, desde: e.target.value })
              }
            />
          </div>

          <div className="field-group">
            <label>Fecha Hasta</label>
            <input
              type="date"
              value={filtros.hasta || ""}
              onChange={(e) =>
                onFiltrosChange({ ...filtros, hasta: e.target.value })
              }
            />
          </div>

          <div className="field-group">
            <label>Empresa / Cliente</label>
            <Select
              placeholder="Todas"
              options={empresaOptions}
              value={
                empresaOptions.find((o) => o.value === Number(filtros.empresa_id)) || null
              }
              onChange={(selected) =>
                onFiltrosChange({
                  ...filtros,
                  empresa_id: selected ? selected.value : "",
                })
              }
              isClearable
            />
          </div>

          <div className="field-group">
            <label>Tipo de vehículo</label>
            <Select
              placeholder="Todos"
              options={tipoVehiculoOptions}
              value={
                tipoVehiculoOptions.find(
                  (o) => o.value === Number(filtros.tipo_vehiculo_id)
                ) || null
              }
              onChange={(selected) =>
                onFiltrosChange({
                  ...filtros,
                  tipo_vehiculo_id: selected ? selected.value : "",
                  vehiculo_id: "", // reset patente al cambiar tipo
                })
              }
              isClearable
            />
          </div>

          <div className="field-group">
            <label>Patente</label>
            <Select
              placeholder="Todas"
              options={vehiculoOptions}
              value={
                vehiculoOptions.find((o) => o.value === Number(filtros.vehiculo_id)) || null
              }
              onChange={(selected) =>
                onFiltrosChange({
                  ...filtros,
                  vehiculo_id: selected ? selected.value : "",
                })
              }
              isClearable
              isDisabled={!filtros.tipo_vehiculo_id}
            />
          </div>

        </div>

        <div className="footer-row">
          <button type="button" className="btn-secondary" onClick={handleLimpiar}>
            Limpiar
          </button>
          {onSearch && (
            <button type="button" className="btn-primary" onClick={onSearch}>
              🔍 Buscar
            </button>
          )}
        </div>
      </div>

      {/* ===== ALERTA ÉXITO ===== */}
      {exito && <div className="alert-success">{exito}</div>}

      {/* ===== TABLA ===== */}
      <table className="pesadas-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Empresa</th>
            <th>Chofer</th>
            <th>Tipo Vehículo</th>
            <th>Material</th>
            <th>KG Bruto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pesadas.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                No se encontraron pesadas.
              </td>
            </tr>
          ) : (
            pesadas.map((p) => (
              <tr
                key={p.id}
                className={
                  p.estado === "ABIERTA"
                    ? "row-abierta"
                    : p.estado === "CERRADA"
                    ? "row-cerrada"
                    : p.estado === "CERRADA_AUTOMATICA"
                    ? "row-auto"
                    : ""
                }
              >
                <td data-label="Fecha">{new Date(p.fecha).toLocaleString("es-AR")}</td>
                <td data-label="Empresa">{p.empresa}</td>
                <td data-label="Chofer">
                  {p.personal_nombre} {p.personal_apellido}
                </td>
                <td data-label="Tipo Vehículo">{p.tipo_vehiculo}</td>
                <td data-label="Material">{p.material}</td>
                <td data-label="KG Bruto">
                  {Number(p.peso_bruto_kg).toLocaleString("es-AR")}
                </td>
                <td data-label="Estado">
                  {p.estado === "ABIERTA" && (
                    <span className="estado-badge estado-abierta">
                      <Clock size={12} /> Abierta
                    </span>
                  )}
                  {p.estado === "CERRADA" && (
                    <span className="estado-badge estado-cerrada">
                      <CheckCircle size={12} /> Cerrada
                    </span>
                  )}
                  {p.estado === "CERRADA_AUTOMATICA" && (
                    <span className="estado-badge estado-auto">
                      <Zap size={12} /> Auto
                    </span>
                  )}
                </td>
                <td data-label="Acciones">
                  <div className="acciones">
                    <button onClick={() => onView(p)} title="Ver">
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => window.open(`/api/export/pesada/${p.id}`, "_blank")}
                      title="Imprimir"
                    >
                      <Printer size={16} />
                    </button>
                    {onEdit && (
                      <button onClick={() => onEdit(p)} title="Editar">
                        <Pencil size={16} />
                      </button>
                    )}
                    {estaAbierta(p) && (
                      <button
                        className="btn-accion-cerrar"
                        onClick={() => setPesadaACerrar(p)}
                        title="Cerrar pesada (registrar peso de salida)"
                      >
                        X
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ===== MODAL CIERRE ===== */}
      {pesadaACerrar && (
        <CerrarPesadaModal
          pesada={pesadaACerrar}
          balanzaDisponible={balanzaDisponible}
          onClose={() => setPesadaACerrar(null)}
          onCerrada={handleCerrada}
        />
      )}
    </div>
  );
}