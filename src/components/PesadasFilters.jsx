import Select from "react-select";

export default function PesadasFilters({
  filters,
  onChange,
  onSearch,
  empresas,
  vehiculos,
  tipoVehiculo,
}) {

  /* ========= OPTIONS ========= */

  const empresaOptions = empresas.map(e => ({
    value: e.id,
    label: e.nombre,
  }));

  const tipoVehiculoOptions = (tipoVehiculo || []).map(t => ({
    value: t.id,
    label: t.nombre,
  }));

  const vehiculoOptions = vehiculos.map(v => ({
    value: v.id,
    label: v.patente,
  }));


  return (
    <div>
      <div className="form-grid">

        {/* FECHA DESDE */}
        <div className="floating-field">
          <input
            type="date"
            value={filters.desde}
            onChange={e =>
              onChange({ ...filters, desde: e.target.value })
            }
            required
          />
          <label>Fecha Desde</label>
        </div>

        {/* FECHA HASTA */}
        <div className="floating-field">
          <input
            type="date"
            value={filters.hasta}
            onChange={e =>
              onChange({ ...filters, hasta: e.target.value })
            }
            required
          />
          <label>Fecha Hasta</label>
        </div>

        {/* EMPRESA */}
        <Select
          placeholder="Empresa/Cliente"
          options={empresaOptions}
          value={
            empresaOptions.find(
              o => o.value === Number(filters.empresa_id)
            ) || null
          }
          onChange={(selected) =>
            onChange({
              ...filters,
              empresa_id: selected ? selected.value : "",
            })
          }
          isClearable
        />

        {/* TIPO VEHÍCULO */}
        {tipoVehiculo && tipoVehiculo.length > 0 && (
          <Select
            placeholder="Tipo de Vehículo"
            options={tipoVehiculoOptions}
            value={
              tipoVehiculoOptions.find(
                o => o.value === Number(filters.tipo_vehiculo_id)
              ) || null
            }
            onChange={(selected) =>
              onChange({
                ...filters,
                tipo_vehiculo_id: selected ? selected.value : "",
                vehiculo_id: "", // limpia vehículo al cambiar tipo
              })
            }
            isClearable
          />
        )}

        {/* VEHÍCULO */}
        <Select
          placeholder="Patente del Vehículo"
          options={vehiculoOptions}
          value={
            vehiculoOptions.find(
              o => o.value === Number(filters.vehiculo_id)
            ) || null
          }
          onChange={(selected) =>
            onChange({
              ...filters,
              vehiculo_id: selected ? selected.value : "",
            })
          }
          isClearable
        />

      </div>

      {/* BOTÓN BUSCAR */}
      {onSearch && (
        <button
          onClick={onSearch}
          style={{ marginTop: "10px" }}
          className="btn-primary"
        >
          Buscar
        </button>
      )}
    </div>
  );
}
