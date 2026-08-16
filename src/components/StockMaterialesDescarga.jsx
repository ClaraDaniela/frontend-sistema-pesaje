import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import PesadasChart from "./PesadasChart";
import { Download, Filter, X } from "lucide-react";

export default function StockMaterialesDescarga() {

  const [stock, setStock] = useState([]);

  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [materialesDescarga, setMaterialesDescarga] = useState([]);

  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    clienteId: "",
    materialDescargaId: "",
  });

  const buildParams = () => {
    const params = {};

    if (filtros.fechaDesde)
      params.fechaDesde = filtros.fechaDesde;

    if (filtros.fechaHasta)
      params.fechaHasta = filtros.fechaHasta;

    if (filtros.clienteId)
      params.clienteId = filtros.clienteId;

    if (filtros.materialDescargaId)
      params.materialDescargaId = filtros.materialDescargaId;

    return params;
  };

  const loadCatalogos = async () => {
    try {

      const [resEmpresas, resMaterialesDescarga] = await Promise.all([
        api.get("/empresas"),
        api.get("/materiales_descarga"),
      ]);

      setEmpresas(resEmpresas.data || []);
      setMaterialesDescarga(resMaterialesDescarga.data || []);

    } catch (error) {

      console.error(error);

    }
  };

  const filtrosActivos = Object.values(filtros).some(v => v !== "");

  const nombreMaterial = (item) => {
    const categoria = item.categoria || 'N/A';
    const materialBase = item.material_base || 'N/A';
    let name = `${categoria} / ${materialBase}`;
    if (item.forma) {
      name += ` / ${item.forma}`;
    }
    return name;
  };

  const requestIdRef = useRef(0);

  const loadStock = async () => {
    const currentRequestId = ++requestIdRef.current;
    try {
      setLoading(true);
      const res = await api.get("/stock/descarga", { params: buildParams() });
      if (currentRequestId === requestIdRef.current) {
        setStock(res.data || []);
      }
    } catch (error) {
      console.error("Error cargando stock descarga:", error);
      if (currentRequestId === requestIdRef.current) {
        setStock([]);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };
  const isFirstRender = useRef(true);

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      await loadCatalogos();
      if (!ignore) await loadStock();
    };
    init();

    return () => { ignore = true; };
  }, []); 



  const descargarExcel = async () => {
    try {

      const res = await api.get(
        "/export/stock-descarga",
        {
          params: buildParams(),
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
        "stock_descarga.xlsx"
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {

      console.error(error);
      alert("No se pudo descargar el Excel");

    }
  };

  const totalKg = stock.reduce(
    (acc, item) =>
      acc + Number(item.stock_total || 0),
    0
  );
  const aplicarFiltros = () => {
    loadStock();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: "",
      fechaHasta: "",
      clienteId: "",
      materialDescargaId: "",
    });
  };

  return (
    <div>
      <section className="pesadas-filtros-card">

        <div className="section-header">
          <Filter size={16} />
          <div>
            <div className="section-title">
              Filtros
            </div>
            <div className="section-subtitle">
              Filtrar stock de materiales
            </div>
          </div>
        </div>

        <div className="form-grid">

          <div className="field-group">
            <label>Desde</label>
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  fechaDesde: e.target.value
                })
              }
            />
          </div>

          <div className="field-group">
            <label>Hasta</label>
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  fechaHasta: e.target.value
                })
              }
            />
          </div>

          <div className="field-group">
            <label>Cliente</label>
            <select
              value={filtros.clienteId}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  clienteId: e.target.value
                })
              }
            >
              <option value="">Todos</option>

              {empresas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Material</label>
            <select
              value={filtros.materialDescargaId}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  materialDescargaId: e.target.value,
                })
              }
            >
              <option value="">Todos</option>

              {materialesDescarga.map((material) => (
                <option
                  key={material.id_materiales_descarga}
                  value={material.id_materiales_descarga}
                >
                  {[
                    material.tipo_material?.nombre,
                    material.material_base?.nombre,
                    material.forma_material?.nombre,
                  ]
                    .filter(Boolean)
                    .join(" / ")}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="footer-row">

          <button
            className="btn-verde btn-primary"
            onClick={aplicarFiltros}
          >
            Aplicar filtros
          </button>

          {filtrosActivos && (
            <button
              className="btn-secundario btn-secondary"
              onClick={limpiarFiltros}
            >
              <X size={14} />
              Limpiar
            </button>
          )}

        </div>

      </section>
      {/* ================= GRAFICO ================= */}

      <section className="chart-card">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >


          <div>

            <h2>
              Stock materiales descarga
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
              gap: "10px"
            }}
          >

            <button
              className="btn-verde"
              onClick={descargarExcel}
            >
              <Download />
              Descargar Excel
            </button>

            <button
              className="btn-secundario"
              onClick={loadStock}
            >
              Actualizar
            </button>

          </div>

        </div>

        <PesadasChart stock={stock.map(item => ({
          ...item,
          nombre: nombreMaterial(item)
        }))} />

      </section>

      {/* ================= TABLA ================= */}

      <section className="table-card">

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
                    {nombreMaterial(item)}
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
                    ).toLocaleString(
                      "es-AR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }
                    )}

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

                    {totalKg.toLocaleString(
                      "es-AR",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }
                    )} kg

                  </strong>

                </td>

              </tr>

            </tfoot>

          </table>

        )}

      </section>

    </div >
  );

}