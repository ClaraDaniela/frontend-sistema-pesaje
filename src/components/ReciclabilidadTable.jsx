import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import "../styles/ReciclabilidadTable.css";

function fmtKg(val) {
  if (val == null || val === "") return "—";
  return `${Number(val).toLocaleString("es-AR", { minimumFractionDigits: 2 })} kg`;
}

const FILTROS_INICIALES = {
  desde: "",
  hasta: "",
  empresa: "",
  chofer: "",
  patente: "",
  material: "",
};

function ReciclabilidadTable() {
  const [reciclabilidadData, setReciclabilidadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [filtrosActivos, setFiltrosActivos] = useState(FILTROS_INICIALES);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/descargas/reciclabilidad");
        setReciclabilidadData(response.data);
      } catch (err) {
        console.error("Error fetching reciclabilidad data:", err);
        setError("Error al cargar los datos de reciclabilidad.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Opciones únicas para los selects
  const opcionesEmpresas = useMemo(() => {
    const set = new Set(reciclabilidadData.map((d) => d.empresa).filter(Boolean));
    return [...set].sort();
  }, [reciclabilidadData]);

  const opcionesChoferes = useMemo(() => {
    const set = new Set(
      reciclabilidadData
        .map((d) => `${d.personal_nombre} ${d.personal_apellido}`)
        .filter(Boolean)
    );
    return [...set].sort();
  }, [reciclabilidadData]);

  const opcionesPatentes = useMemo(() => {
    const set = new Set(reciclabilidadData.map((d) => d.patente).filter(Boolean));
    return [...set].sort();
  }, [reciclabilidadData]);

  const opcionesMateriales = useMemo(() => {
    const set = new Set(
      reciclabilidadData.map((d) => d.material_general_pesada).filter(Boolean)
    );
    return [...set].sort();
  }, [reciclabilidadData]);

  // Filtrado
  const datosFiltrados = useMemo(() => {
    return reciclabilidadData.filter((d) => {
      const fechaDescarga = new Date(d.fecha_descarga);

      if (filtrosActivos.desde) {
        const desde = new Date(filtrosActivos.desde);
        desde.setHours(0, 0, 0, 0);
        if (fechaDescarga < desde) return false;
      }

      if (filtrosActivos.hasta) {
        const hasta = new Date(filtrosActivos.hasta);
        hasta.setHours(23, 59, 59, 999);
        if (fechaDescarga > hasta) return false;
      }

      if (filtrosActivos.empresa && d.empresa !== filtrosActivos.empresa) return false;

      const nombreChofer = `${d.personal_nombre} ${d.personal_apellido}`;
      if (filtrosActivos.chofer && nombreChofer !== filtrosActivos.chofer) return false;

      if (filtrosActivos.patente && d.patente !== filtrosActivos.patente) return false;

      if (
        filtrosActivos.material &&
        d.material_general_pesada !== filtrosActivos.material
      )
        return false;

      return true;
    });
  }, [reciclabilidadData, filtrosActivos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = () => {
    setFiltrosActivos(filtros);
  };

  const handleLimpiar = () => {
    setFiltros(FILTROS_INICIALES);
    setFiltrosActivos(FILTROS_INICIALES);
  };

  if (loading) return <div className="loading-message">Cargando datos de reciclabilidad...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="reciclabilidad-container pesadas-table-container">

      {/* FILTROS */}
      <div className="pesadas-filtros-card">
        <div className="section-header">
          <span className="section-title">Filtros</span>
          <span className="section-subtitle">
            {datosFiltrados.length} resultado{datosFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="form-grid">
          <div className="field-group">
            <label>Desde</label>
            <input
              type="date"
              name="desde"
              value={filtros.desde}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>Hasta</label>
            <input
              type="date"
              name="hasta"
              value={filtros.hasta}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>Empresa</label>
            <select name="empresa" value={filtros.empresa} onChange={handleChange}>
              <option value="">Todas</option>
              {opcionesEmpresas.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Chofer</label>
            <select name="chofer" value={filtros.chofer} onChange={handleChange}>
              <option value="">Todos</option>
              {opcionesChoferes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Patente</label>
            <select name="patente" value={filtros.patente} onChange={handleChange}>
              <option value="">Todas</option>
              {opcionesPatentes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Material</label>
            <select name="material" value={filtros.material} onChange={handleChange}>
              <option value="">Todos</option>
              {opcionesMateriales.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="footer-row">
          <button className="btn-secondary" onClick={handleLimpiar}>
            Limpiar
          </button>
          <button className="btn-primary" onClick={handleBuscar}>
            Buscar
          </button>
        </div>
      </div>

      {/* TABLA */}
      {datosFiltrados.length === 0 ? (
        <div className="no-data-message">No hay datos para los filtros seleccionados.</div>
      ) : (
        <table className="reciclabilidad-table pesadas-table">
          <thead>
            <tr>
              <th>Fecha Descarga</th>
              <th>Empresa</th>
              <th>Chofer</th>
              <th>Patente</th>
              <th>Material Pesada</th>
              <th>Peso Neto Pesada</th>
              <th>Materiales de Descarga (%)</th>
              <th>Comentarios</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((descarga) => (
              <tr key={descarga.id_descarga_detalles}>
                <td>{new Date(descarga.fecha_descarga).toLocaleString("es-AR")}</td>
                <td>{descarga.empresa}</td>
                <td>{`${descarga.personal_nombre} ${descarga.personal_apellido}`}</td>
                <td>{descarga.patente}</td>
                <td>{descarga.material_general_pesada}</td>
                <td>{fmtKg(descarga.peso_neto_pesada)}</td>
                <td>
                  <ul className="materiales-list">
                    {descarga.materiales_descarga.map((mat, idx) => (
                      <li key={idx}>
                        {mat.tipo_material_descarga}
                        {mat.material_base_descarga ? ` - ${mat.material_base_descarga}` : ""}
                        {mat.forma_material_descarga ? ` (${mat.forma_material_descarga})` : ""}
                        : {mat.porcentaje}%
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{descarga.comentarios || "—"}</td>
                <td>{descarga.usuario_descarga || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReciclabilidadTable;