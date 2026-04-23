import { useEffect, useState } from "react";
import api from "../services/api";
import PesadasChart from "./PesadasChart";

export default function ReportesJefe() {
  const [stock, setStock] = useState([]);
  const [ajustes, setAjustes] = useState({});
  const [mostrarAjustes, setMostrarAjustes] = useState(false);

  const loadStock = async () => {
    try {
      const res = await api.get("/pesadas/stock");
      setStock(res.data || []);
    } catch (error) {
      console.error("Error cargando stock:", error);
      setStock([]);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const guardarAjuste = async (materialId) => {
    try {
      const cantidad = Number(ajustes[materialId] || 0);

      if (!cantidad) return;

      await api.post("/pesadas/ajustes", {
        material_id: materialId,
        cantidad,
      });

      // Limpiar input
      setAjustes({
        ...ajustes,
        [materialId]: "",
      });

      // Recargar stock real desde base
      await loadStock();

      alert("Ajuste guardado correctamente");
    } catch (error) {
      console.error("Error guardando ajuste:", error);
      alert("Error guardando ajuste");
    }
  };
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
      <section className="chart-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Resumen de materiales</h2>

          <button
            className="btn-verde"
            onClick={descargarExcel}
          >
            📥 Descargar Excel
          </button>
        </div>
        <PesadasChart stock={stock} />
      </section>
         {/* con esta parte no estoy de acuerdo, porque ya estamos ingresando stock fisico en inventario, pero para Marcelo 
          es importante que se pueda ingresar un "inicio de stock"
          y bueno, sigo sin entender por qué y si se ve sin lógica, es por eso, y si se preguntan por qué no lo refute, si lo hice*/}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn-ajuste"
          onClick={() => setMostrarAjustes(!mostrarAjustes)}
        >
          {mostrarAjustes ? "Ocultar ajustes de Stock" : "Mostrar ajustes de Stock"}
        </button>
      </div>

      <h2>Tabla de stock</h2>
      <table className="pesadas-table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Stock sistema</th>
            {mostrarAjustes && <th>Ajuste</th>}
            <th>Cantidad neta</th>
            {mostrarAjustes && <th></th>}
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => {
            const materialId = item.material_id;
            const stockSistema = Number(item.stock_total);
            const ajuste = Number(ajustes[materialId]) || 0;
            const neto = stockSistema + ajuste;

            return (
              <tr key={materialId}>
                <td>{item.nombre}</td>
                <td>{stockSistema}</td>

                {mostrarAjustes && (
                  <td>
                    <input
                      type="number"
                      value={ajustes[materialId] || ""}
                      onChange={(e) =>
                        setAjustes({
                          ...ajustes,
                          [materialId]: e.target.value,
                        })
                      }
                    />
                  </td>
                )}

                <td>{neto}</td>

                {mostrarAjustes && (
                  <td>
                    <button onClick={() => guardarAjuste(materialId)}>
                      Guardar
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div >
  );
}