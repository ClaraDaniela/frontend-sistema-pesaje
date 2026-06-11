import { useEffect, useState } from "react";
import api from "../services/api";
import PesadasChart from "./PesadasChart";
import {Download} from "lucide-react";

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

  return (
    <div>

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
              }}
            >
              Resumen materiales generales
            </h2>

            <p
              style={{
                margin: 0,
                color: "#666",
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
              onClick={loadStock}
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

                  <td
                    style={{
                      fontWeight: "bold",
                      color:
                        Number(item.stock_total) > 0
                          ? "green"
                          : Number(item.stock_total) < 0
                          ? "red"
                          : "gray",
                    }}
                  >
                    {Number(
                      item.stock_total || 0
                    ).toLocaleString()}
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