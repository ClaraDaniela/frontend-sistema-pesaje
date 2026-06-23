import React, { useEffect, useState } from "react";
import api from "../services/api"; 
import "../styles/ReciclabilidadTable.css"; 

function fmtKg(val) {
  if (val == null || val === "") return "—";
  return `${Number(val).toLocaleString("es-AR", { minimumFractionDigits: 2 })} kg`;
}

function ReciclabilidadTable() {
  const [reciclabilidadData, setReciclabilidadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReciclabilidadData = async () => {
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

    fetchReciclabilidadData();
  }, []);

  if (loading) {
    return <div className="loading-message">Cargando datos de reciclabilidad...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (reciclabilidadData.length === 0) {
    return <div className="no-data-message">No hay datos de reciclabilidad para mostrar.</div>;
  }

  return (
    <div className="reciclabilidad-container">
      <h3 className="reciclabilidad-title">Historial de Reciclabilidad por Descarga</h3>
      <table className="reciclabilidad-table">
        <thead>
          <tr>
            <th>ID Descarga</th>
            <th>Fecha Descarga</th>
            <th>Pesada ID</th>
            <th>Empresa</th>
            <th>Chofer</th>
            <th>Patente</th>
            <th>Material Pesada</th>
            <th>Peso Neto Pesada</th>
            <th>Materiales de Descarga (%)</th>
            <th>Comentarios</th>
          </tr>
        </thead>
        <tbody>
          {reciclabilidadData.map((descarga) => (
            <tr key={descarga.id_descarga_detalles}>
              <td>{descarga.id_descarga_detalles}</td>
              <td>{new Date(descarga.fecha_descarga).toLocaleString("es-AR")}</td>
              <td>{descarga.pesada_id}</td>
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
                      {mat.material_base_descarga ? ` - ${mat.material_base_descarga}` : ''}
                      {mat.forma_material_descarga ? ` (${mat.forma_material_descarga})` : ''}
                      : {mat.porcentaje}%
                    </li>
                  ))}
                </ul>
              </td>
              <td>{descarga.comentarios || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReciclabilidadTable;