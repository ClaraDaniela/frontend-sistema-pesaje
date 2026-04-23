import { useEffect, useState } from "react";
import api from "../services/api";

export default function Inventario({ user }) {
  const [inventario, setInventario] = useState([]);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);

  const loadInventario = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventario");
      console.log("DATA INVENTARIO:", res.data); 
      setInventario(res.data || []);
    } catch (err) {
      console.error("Error cargando inventario:", err);
      setInventario([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (materialId, value) => {
    setInputs({
      ...inputs,
      [materialId]: value,
    });
  };

  const guardar = async (materialId) => {
    try {
      const cantidad = Number(inputs[materialId]);

      if (isNaN(cantidad)) {
        alert("Ingresá un número válido");
        return;
      }

      await api.post("/inventario", {
        material_id: materialId,
        cantidad,
        usuario_id: user?.id
      });

      // limpiar input
      setInputs({
        ...inputs,
        [materialId]: "",
      });

      await loadInventario();
      alert("Inventario actualizado");
    } catch (err) {
      console.error("Error guardando:", err);
      alert("Error al guardar");
    }
  };
  const descargarExcel = async () => {
    try {
      const res = await api.get("/export/inventario", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "inventario.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Error descargando Excel:", error);
      alert("No se pudo descargar el archivo");
    }
  };

  useEffect(() => {
    loadInventario();
  }, []);

  return (
    <section className="table-card">
      <h2>Inventario físico vs sistema</h2>
                <button
            className="btn-verde"
            onClick={descargarExcel}
          >
            📥 Descargar Excel
          </button>

      {loading ? (
        <p>Cargando inventario...</p>
      ) : inventario.length === 0 ? (
        <p>No hay datos de inventario</p>
      ) : (
        <table className="pesadas-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Stock sistema</th>
              <th>Stock físico</th>
              <th>Diferencia</th>
              <th>Última actualización</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {inventario.map((item) => {
              const valorInput =
                inputs[item.material_id] ?? item.stock_fisico ?? "";

              const diferencia =
                (Number(valorInput) || 0) -
                (Number(item.stock_sistema) || 0);

              return (
                <tr key={item.material_id}>
                  <td>{item.nombre}</td>

                  <td>{item.stock_sistema ?? 0}</td>

                  <td>
                    <input
                      type="number"
                      value={valorInput}
                      onChange={(e) =>
                        handleChange(item.material_id, e.target.value)
                      }
                    />
                  </td>

                  <td
                    style={{
                      color:
                        diferencia > 0
                          ? "green"
                          : diferencia < 0
                          ? "red"
                          : "gray",
                      fontWeight: "bold",
                    }}
                  >
                    {diferencia}
                  </td>

                  <td>
                    {item.fecha_actualizacion
                      ? new Date(
                          item.fecha_actualizacion
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    <button
                      className="btn-verde"
                      onClick={() => guardar(item.material_id)}
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}