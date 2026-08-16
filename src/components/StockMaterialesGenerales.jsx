import { useEffect, useState } from "react";
import api from "../services/api";
import PesadasChart from "./PesadasChart";
import {
  Download,
  ChartNoAxesCombined,
  Filter,
  X,
} from "lucide-react";

const FILTROS_INICIALES = {
  fechaDesde: "",
  fechaHasta: "",
  clienteId: "",
  materialId: "",
};

const KPIS_INICIALES = {
  total_ingreso: 0,
  total_egreso: 0,
};

export default function StockMaterialesGenerales() {
  // =========================================================
  // ESTADOS
  // =========================================================

  const [stock, setStock] = useState([]);

  const [empresas, setEmpresas] = useState([]);
  const [materiales, setMateriales] = useState([]);

  const [loading, setLoading] = useState(false);

  /*
   * IMPORTANTE:
   * Intentamos recuperar los últimos totales guardados.
   * Esto evita que, si el componente se vuelve a montar,
   * las tarjetas vuelvan a mostrar 0.
   */
  const [kpis, setKpis] = useState(() => {
    try {
      const guardados = localStorage.getItem(
        "stock_materiales_generales_kpis"
      );

      if (guardados) {
        const datos = JSON.parse(guardados);

        return {
          total_ingreso:
            Number(datos.total_ingreso) || 0,

          total_egreso:
            Number(datos.total_egreso) || 0,
        };
      }
    } catch (error) {
      console.error(
        "Error leyendo KPIs guardados:",
        error
      );
    }

    return KPIS_INICIALES;
  });

  const [filtros, setFiltros] = useState(
    FILTROS_INICIALES
  );

  // =========================================================
  // PARAMETROS
  // =========================================================

  const buildParams = (filtrosActuales) => {
    const params = {};

    if (filtrosActuales.fechaDesde) {
      params.fechaDesde =
        filtrosActuales.fechaDesde;
    }

    if (filtrosActuales.fechaHasta) {
      params.fechaHasta =
        filtrosActuales.fechaHasta;
    }

    if (filtrosActuales.clienteId) {
      params.clienteId =
        filtrosActuales.clienteId;
    }

    if (filtrosActuales.materialId) {
      params.materialId =
        filtrosActuales.materialId;
    }

    return params;
  };

  // =========================================================
  // CATALOGOS
  // =========================================================

  const cargarCatalogos = async () => {
    try {
      const [
        responseEmpresas,
        responseMateriales,
      ] = await Promise.all([
        api.get("/empresas"),
        api.get("/materiales"),
      ]);

      setEmpresas(
        Array.isArray(responseEmpresas.data)
          ? responseEmpresas.data
          : []
      );

      setMateriales(
        Array.isArray(responseMateriales.data)
          ? responseMateriales.data
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando catálogos:",
        error
      );
    }
  };

  // =========================================================
  // STOCK
  // =========================================================

  const cargarStock = async (filtrosActuales) => {
    try {
      const response = await api.get(
        "/stock/generales",
        {
          params:
            buildParams(filtrosActuales),
        }
      );

      const datos = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      setStock(datos);
    } catch (error) {
      console.error(
        "Error cargando stock:",
        error
      );

      setStock([]);
    }
  };

  // =========================================================
  // TOTALES
  // =========================================================

  const cargarKpis = async (filtrosActuales) => {
    try {
      const response = await api.get(
        "/stock/totales",
        {
          params:
            buildParams(filtrosActuales),
        }
      );

      const data = response.data || {};

      console.log(
        "========== STOCK TOTALES =========="
      );

      console.log(
        "Respuesta API:",
        data
      );

      const nuevoKpis = {
        total_ingreso:
          Number(data.total_ingreso) || 0,

        total_egreso:
          Number(data.total_egreso) || 0,
      };

      console.log(
        "KPIs que van a mostrarse:",
        nuevoKpis
      );

      /*
       * GUARDAMOS LOS DATOS.
       *
       * Esto hace que si el componente se desmonta
       * y vuelve a montarse, pueda recuperar los
       * últimos valores correctos.
       */
      localStorage.setItem(
        "stock_materiales_generales_kpis",
        JSON.stringify(nuevoKpis)
      );

      /*
       * Actualizamos React.
       */
      setKpis(nuevoKpis);
    } catch (error) {
      console.error(
        "Error cargando KPIs:",
        error
      );

      /*
       * MUY IMPORTANTE:
       * No hacemos setKpis(0).
       *
       * Si falla la petición, conservamos el último
       * valor correcto que teníamos.
       */
    }
  };

  // =========================================================
  // CARGAR TODO
  // =========================================================

  const cargarTodo = async (filtrosActuales) => {
    setLoading(true);

    try {
      /*
       * Son consultas independientes.
       * Una no puede borrar el resultado de la otra.
       */
      await Promise.all([
        cargarStock(filtrosActuales),
        cargarKpis(filtrosActuales),
      ]);
    } catch (error) {
      console.error(
        "Error general:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INICIO
  // =========================================================

  useEffect(() => {
    const iniciar = async () => {
      await cargarCatalogos();

      await cargarTodo(
        FILTROS_INICIALES
      );
    };

    iniciar();
  }, []);

  // =========================================================
  // FILTROS
  // =========================================================

  const aplicarFiltros = async () => {
    await cargarTodo(filtros);
  };

  const limpiarFiltros = async () => {
    const filtrosLimpios = {
      ...FILTROS_INICIALES,
    };

    setFiltros(filtrosLimpios);

    await cargarTodo(
      filtrosLimpios
    );
  };

  // =========================================================
  // ACTUALIZAR
  // =========================================================

  const actualizar = async () => {
    await cargarTodo(filtros);
  };

  // =========================================================
  // EXCEL
  // =========================================================

  const descargarExcel = async () => {
    try {
      const response = await api.get(
        "/export/stock-generales",
        {
          params:
            buildParams(filtros),

          responseType: "blob",
        }
      );

      const blob = new Blob([
        response.data,
      ]);

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "stock_generales.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Error descargando Excel:",
        error
      );

      alert(
        "No se pudo descargar"
      );
    }
  };

  // =========================================================
  // TOTALES STOCK
  // =========================================================

  const totalKg = stock.reduce(
    (total, item) => {
      return (
        total +
        (Number(
          item.stock_total
        ) || 0)
      );
    },
    0
  );

  const filtrosActivos =
    Object.values(filtros).some(
      (valor) => valor !== ""
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>

      {/* =====================================================
          FILTROS
      ====================================================== */}

      <section
        className="filter-card"
        style={{
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}
        >
          <Filter size={18} />

          <h3 style={{ margin: 0 }}>
            Filtros
          </h3>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >

          {/* DESDE */}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              Desde
            </label>

            <input
              type="date"
              value={
                filtros.fechaDesde
              }
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  fechaDesde:
                    e.target.value,
                })
              }
            />
          </div>

          {/* HASTA */}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              Hasta
            </label>

            <input
              type="date"
              value={
                filtros.fechaHasta
              }
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  fechaHasta:
                    e.target.value,
                })
              }
            />
          </div>

          {/* CLIENTE */}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              Cliente
            </label>

            <select
              value={
                filtros.clienteId
              }
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  clienteId:
                    e.target.value,
                })
              }
            >
              <option value="">
                Todos
              </option>

              {empresas.map(
                (empresa) => (
                  <option
                    key={empresa.id}
                    value={
                      empresa.id
                    }
                  >
                    {
                      empresa.nombre
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* MATERIAL */}

          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                marginBottom: "4px",
              }}
            >
              Material
            </label>

            <select
              value={
                filtros.materialId
              }
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  materialId:
                    e.target.value,
                })
              }
            >
              <option value="">
                Todos
              </option>

              {materiales.map(
                (material) => (
                  <option
                    key={material.id}
                    value={
                      material.id
                    }
                  >
                    {
                      material.nombre
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* APLICAR */}

          <button
            className="btn-verde"
            onClick={
              aplicarFiltros
            }
            disabled={loading}
          >
            {loading
              ? "Cargando..."
              : "Aplicar filtros"}
          </button>

          {/* LIMPIAR */}

          {filtrosActivos && (
            <button
              className="btn-secundario"
              onClick={
                limpiarFiltros
              }
              disabled={loading}
            >
              <X size={16} />

              Limpiar
            </button>
          )}

        </div>
      </section>

      {/* =====================================================
          TARJETAS
      ====================================================== */}

      <div className="stats-grid">

        {/* TOTAL SISTEMA */}

        <div className="stat-box">
          <span className="stat-label">
            Total sistema
          </span>

          <span className="stat-value">
            {totalKg.toLocaleString(
              "es-AR"
            )}{" "}
            kg
          </span>
        </div>

        {/* MATERIALES */}

        <div className="stat-box">
          <span className="stat-label">
            Materiales
          </span>

          <span className="stat-value">
            {stock.length}
          </span>
        </div>

        {/* INGRESADO */}

        <div className="stat-box stat-ok">
          <span className="stat-label">
            Total ingresado
          </span>

          <span
            className="stat-value"
            key={kpis.total_ingreso}
          >
            {kpis.total_ingreso.toLocaleString(
              "es-AR"
            )}{" "}
            kg
          </span>
        </div>

        {/* EGRESADO */}

        <div className="stat-box stat-bad">
          <span className="stat-label">
            Total egresado
          </span>

          <span
            className="stat-value"
            key={kpis.total_egreso}
          >
            {kpis.total_egreso.toLocaleString(
              "es-AR"
            )}{" "}
            kg
          </span>
        </div>

      </div>

      {/* =====================================================
          GRAFICO
      ====================================================== */}

      <section className="chart-card">

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
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
                alignItems:
                  "center",
                gap: "8px",
              }}
            >
              <ChartNoAxesCombined
                size={20}
              />

              Resumen materiales
              generales
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
                {totalKg.toLocaleString(
                  "es-AR"
                )}{" "}
                kg
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
              onClick={
                actualizar
              }
              disabled={loading}
            >
              {loading
                ? "Actualizando..."
                : "Actualizar"}
            </button>

            <button
              className="btn-verde"
              onClick={
                descargarExcel
              }
            >
              <Download />

              Descargar Excel
            </button>

          </div>

        </div>

        <PesadasChart
          stock={stock}
        />

      </section>

      {/* =====================================================
          TABLA
      ====================================================== */}

      <section className="table-card">

        <h2>
          Stock actual
        </h2>

        {loading ? (
          <p>
            Cargando...
          </p>
        ) : stock.length === 0 ? (
          <p>
            No hay datos
          </p>
        ) : (
          <table className="pesadas-table">

            <thead>
              <tr>
                <th>
                  Material
                </th>

                <th>
                  Stock sistema (kg)
                </th>
              </tr>
            </thead>

            <tbody>

              {stock.map(
                (item) => {
                  const valor =
                    Number(
                      item.stock_total
                    ) || 0;

                  return (
                    <tr
                      key={
                        item.material_id
                      }
                    >
                      <td>
                        {
                          item.material ||
                          "N/A"
                        }
                      </td>

                      <td>
                        <span
                          className={`stock-badge ${
                            valor > 0
                              ? "badge-ok"
                              : valor < 0
                              ? "badge-bad"
                              : "badge-neutral"
                          }`}
                        >
                          {valor.toLocaleString(
                            "es-AR"
                          )}{" "}
                          kg
                        </span>
                      </td>
                    </tr>
                  );
                }
              )}

            </tbody>

            <tfoot>
              <tr>

                <td>
                  <strong>
                    TOTAL
                  </strong>
                </td>

                <td>
                  <strong>
                    {totalKg.toLocaleString(
                      "es-AR"
                    )}{" "}
                    kg
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