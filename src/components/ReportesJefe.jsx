import { useEffect, useState } from "react";
import api from "../services/api";
import PesadasChart from "./PesadasChart";

export default function ReportesJefe() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);

  const nombreMaterial = (item) =>
    `${item.categoria} / ${item.material_base}${
      item.forma ? " / " + item.forma : ""
    }`;

  const loadStock = async () => {
    try {
      setLoading(true);
      const res = await api.get("/materiales_descarga/stock");
      setStock(res.data || []);
    } catch (error) {
      console.error("Error cargando stock:", error);
      setStock([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const descargarExcel = async () => {
    try {
      const res = await api.get("/export/stock", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "stock.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error descargando Excel:", error);
      alert("No se pudo descargar el archivo");
    }
  };

  return (
    <div>
      {/* 📊 GRAFICO */}
      <section className="chart-card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Resumen de materiales</h2>

          <button className="btn-verde" onClick={descargarExcel}>
            📥 Descargar Excel
          </button>
        </div>

        <PesadasChart stock={stock} />
      </section>

      {/* 📋 TABLA */}
      <section className="table-card">
        <h2>Stock actual</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : stock.length === 0 ? (
          <p>No hay datos</p>
        ) : (
          <table className="pesadas-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Stock sistema</th>
              </tr>
            </thead>

            <tbody>
              {stock.map((item) => (
                <tr key={item.material_id}>
                  <td>{nombreMaterial(item)}</td>
                  <td>{Number(item.stock_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}