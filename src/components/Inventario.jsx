import { useEffect, useState } from "react";
import api from "../services/api";
import {Download} from "lucide-react";

export default function Inventario({ user }) {

  const [inventario, setInventario] = useState([]);

  const [inputs, setInputs] = useState({});

  const [loading, setLoading] = useState(false);

  const loadInventario = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        "/inventario"
      );

      setInventario(res.data || []);

    } catch (error) {

      console.error(error);

      setInventario([]);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadInventario();

  }, []);

  const handleChange = (
    materialId,
    value
  ) => {

    setInputs({
      ...inputs,
      [materialId]: value
    });

  };

  const guardar = async (
    materialId
  ) => {

    try {

      const cantidad = Number(
        inputs[materialId]
      );

      if (isNaN(cantidad)) {

        alert("Cantidad inválida");

        return;

      }

      await api.post(
        "/inventario",
        {
          material_id: materialId,
          cantidad,
          usuario_id: user?.id
        }
      );

      await loadInventario();

      alert("Inventario actualizado");

    } catch (error) {

      console.error(error);

      alert("Error guardando");

    }

  };

  const descargarExcel = async () => {

    try {

      const res = await api.get(
        "/export/inventario",
        {
          responseType: "blob"
        }
      );

      const url =
        window.URL.createObjectURL(
          new Blob([res.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "inventario.xlsx"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (error) {

      console.error(error);

      alert("No se pudo descargar");

    }

  };

  return (
    <section className="table-card">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between"
        }}
      >

        <h2>
          Inventario físico vs sistema
        </h2>

        <button
          className="btn-verde"
          onClick={descargarExcel}
        >
          <Download />
         Descargar Excel
        </button>

      </div>

      {loading ? (

        <p>Cargando...</p>

      ) : (

        <table className="pesadas-table">

          <thead>

            <tr>
              <th>Material</th>
              <th>Stock sistema</th>
              <th>Stock físico</th>
              <th>Diferencia</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {inventario.map(item => {

              const valorInput =
                inputs[item.material_id]
                ?? item.stock_fisico
                ?? "";

              const diferencia =
                (Number(valorInput) || 0)
                -
                (Number(item.stock_sistema) || 0);

              return (

                <tr key={item.material_id}>

                  <td>
                    {item.material}
                  </td>

                  <td>
                    {Number(
                      item.stock_sistema || 0
                    ).toFixed(2)}
                  </td>

                  <td>

                    <input
                      type="number"
                      value={valorInput}
                      onChange={(e) =>
                        handleChange(
                          item.material_id,
                          e.target.value
                        )
                      }
                    />

                  </td>

                  <td
                    style={{
                      fontWeight: "bold",
                      color:
                        diferencia > 0
                          ? "green"
                          : diferencia < 0
                          ? "red"
                          : "gray"
                    }}
                  >
                    {diferencia.toFixed(2)}
                  </td>

                  <td>

                    {item.fecha_actualizacion
                      ? new Date(
                          item.fecha_actualizacion
                        ).toLocaleString("es-AR")
                      : "-"}

                  </td>

                  <td>
                    {item.usuario || "-"}
                  </td>

                  <td>

                    <button
                      className="btn-verde"
                      onClick={() =>
                        guardar(
                          item.material_id
                        )
                      }
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