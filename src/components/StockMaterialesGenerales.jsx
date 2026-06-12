import { useEffect, useState } from "react";
import api from "../services/api";
import PesadasChart from "./PesadasChart";
import { Download, ChartNoAxesCombined } from "lucide-react";

export default function StockMaterialesGenerales() {

  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadStock = async () => {
    try {

      setLoading(true);

      const res = await api.get("/stock/generales");

      setStock(res.data || []);

    } catch (error) {

      console.error(
        "Error cargando stock generales:",
        error
      );

      setStock([]);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const [kpis, setKpis] = useState({ total_ingreso: 0, total_egreso: 0 });

  const loadKpis = async () => {
    try {
      const res = await api.get("/stock/totales");
      setKpis(res.data || { total_ingreso: 0, total_egreso: 0 });
    } catch (error) {
      console.error("Error cargando KPIs:", error);
      setKpis({ total_ingreso: 0, total_egreso: 0 });
    }
  };

  useEffect(() => {
    loadStock();
    loadKpis();
  }, []);

  const descargarExcel = async () => {
    try {

      const res = await api.get(
        "/export/stock-generales",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "stock_generales.xlsx"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (error) {

      console.error(error);

      alert("No se pudo descargar");

    }
  };

  const totalKg = stock.reduce(
    (acc, item) =>
      acc + Number(item.stock_total || 0),
    0
  );

  const positivos = stock.filter(
    (i) => Number(i.stock_total) > 0
  ).length;

  const negativos = stock.filter(
    (i) => Number(i.stock_total) < 0
  ).length;

  return (
    <div>

      {/* TARJETAS RESUMEN */}
      <div className="stats-grid">

        <div className="stat-box">
          <span className="stat-label">Total sistema</span>
          <span className="stat-value">
            {totalKg.toLocaleString()} kg
          </span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Materiales</span>
          <span className="stat-value">{stock.length}</span>
        </div>
        <div className="stat-box stat-ok">
          <span className="stat-label">Total ingresado</span>
          <span className="stat-value">
            {Number(kpis.total_ingreso).toLocaleString()} kg
          </span>
        </div>

        <div className="stat-box stat-bad">
          <span className="stat-label">Total egresado</span>
          <span className="stat-value">
            {Number(kpis.total_egreso).toLocaleString()} kg
          </span>
        </div>

      </div>

      {/* GRAFICO */}
      <section className="chart-card">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ChartNoAxesCombined size={20} />
              Resumen materiales generales
            </h2>

            <p
              style={{
                margin: 0,
                color: "#666",
                marginTop: "4px",
              }}
            >
              Total sistema:{" "}
              <strong>
                {totalKg.toLocaleString()} kg
              </strong>
            </p>

          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >

            <button
              className="btn-secundario"
              onClick={() => { loadStock(); loadKpis(); }}
            >
              Actualizar
            </button>

            <button
              className="btn-verde"
              onClick={descargarExcel}
            >
              <Download />
              Descargar Excel
            </button>

          </div>

        </div>

        <PesadasChart stock={stock} />

      </section>

      {/* TABLA */}
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
                <th>Stock sistema (kg)</th>
              </tr>
            </thead>

            <tbody>

              {stock.map((item) => (

                <tr key={item.material_id}>

                  <td>
                    {item.material || "N/A"}
                  </td>

                  <td>
                    <span
                      className={`stock-badge ${Number(item.stock_total) > 0
                        ? "badge-ok"
                        : Number(item.stock_total) < 0
                          ? "badge-bad"
                          : "badge-neutral"
                        }`}
                    >
                      {Number(
                        item.stock_total || 0
                      ).toLocaleString()} kg
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

            <tfoot>

              <tr>

                <td>
                  <strong>TOTAL</strong>
                </td>

                <td>
                  <strong>
                    {totalKg.toLocaleString()} kg
                  </strong>
                </td>

              </tr>

            </tfoot>

          </table>
        )}

      </section>

    </div>
  );
}