import { Eye, Printer, Pencil } from "lucide-react";
import Select from "react-select";
import "../styles/tablafiltros.css";

export default function PesadasTable({
  pesadas = [],
  filtros = {},
  onFiltrosChange,
  onSearch,
  empresas = [],
  vehiculos = [],
  tipoVehiculo = [],
  onView,
  onEdit,
}) {
  const empresaOptions = empresas.map(e => ({ value: e.id, label: e.nombre }));
  const tipoVehiculoOptions = tipoVehiculo.map(t => ({ value: t.id, label: t.nombre }));
  const vehiculoOptions = vehiculos.map(v => ({ value: v.id, label: v.patente }));

  return (
    <div className="pesadas-table-container">

      <div className="pesadas-filtros-card">
        <div className="section-header">
          <div className="section-icon icon-blue">🔎</div>
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
              onChange={e => onFiltrosChange({ ...filtros, desde: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label>Fecha Hasta</label>
            <input
              type="date"
              value={filtros.hasta || ""}
              onChange={e => onFiltrosChange({ ...filtros, hasta: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label>Empresa / Cliente</label>
            <Select
              placeholder="Todas"
              options={empresaOptions}
              value={empresaOptions.find(o => o.value === Number(filtros.empresa_id)) || null}
              onChange={selected =>
                onFiltrosChange({ ...filtros, empresa_id: selected ? selected.value : "" })
              }
              isClearable
            />
          </div>

          <div className="field-group">
            <label>Tipo de vehículo</label>
            <Select
              placeholder="Todos"
              options={tipoVehiculoOptions}
              value={tipoVehiculoOptions.find(o => o.value === Number(filtros.tipo_vehiculo_id)) || null}
              onChange={selected =>
                onFiltrosChange({
                  ...filtros,
                  tipo_vehiculo_id: selected ? selected.value : "",
                  vehiculo_id: "",
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
              value={vehiculoOptions.find(o => o.value === Number(filtros.vehiculo_id)) || null}
              onChange={selected =>
                onFiltrosChange({ ...filtros, vehiculo_id: selected ? selected.value : "" })
              }
              isClearable
              isDisabled={!filtros.tipo_vehiculo_id}
            />
          </div>
        </div>

        <div className="footer-row">
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              onFiltrosChange({ desde: "", hasta: "", empresa_id: "", tipo_vehiculo_id: "", vehiculo_id: "" })
            }
          >
            Filtrar
          </button>
          {onSearch && (
            <button type="button" className="btn-primary" onClick={onSearch}>
              🔍 Buscar
            </button>
          )}
        </div>
      </div>

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
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pesadas.map(p => (
            <tr key={p.id}>
              <td data-label="Fecha">{new Date(p.fecha).toLocaleString("es-AR")}</td>
              <td data-label="Empresa">{p.empresa}</td>
              <td data-label="Chofer">{p.personal_nombre} {p.personal_apellido}</td>
              <td data-label="Tipo Vehículo">{p.tipo_vehiculo}</td>
              <td data-label="Material">{p.material}</td>
              <td data-label="KG Bruto">{Number(p.peso_bruto_kg).toLocaleString("es-AR")}</td>
              <td data-label="Acciones">
                <div className="acciones">
                  <button onClick={() => onView(p)} title="Ver"><Eye size={16} /></button>
                  <button
                    onClick={() => window.open(`/api/export/pesada/${p.id}`, "_blank")}
                    title="Imprimir"
                  >
                    <Printer size={16} />
                  </button>
                  {onEdit && <button onClick={() => onEdit(p)} title="Editar"><Pencil size={16} /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}