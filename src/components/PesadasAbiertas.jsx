import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import CerrarPesadaModal from "./CerrarPesadaModal";

/**
 * PesadasAbiertas
 * Lista todas las pesadas que aún no tienen tara_real_kg (peso de salida).
 * Permite cerrarlas desde esta vista.
 *
 * Props:
 *   balanzaDisponible – bool (default true)
 */
export default function PesadasAbiertas({ balanzaDisponible = true }) {
  const [pesadas, setPesadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pesadaACerrar, setPesadaACerrar] = useState(null);
  const [exito, setExito] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/pesadas", { params: { abiertas: true } });
      setPesadas(res.data);
    } catch {
      setPesadas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const handleCerrada = (pesadaActualizada) => {
    // Quitar de la lista de abiertas
    setPesadas(prev => prev.filter(p => p.id !== pesadaActualizada.id));
    setPesadaACerrar(null);
    setExito(`Pesada #${pesadaActualizada.id} cerrada correctamente.`);
    setTimeout(() => setExito(null), 4000);
  };

  // Filtro por patente, empresa, material o ID
  const pesadasFiltradas = pesadas.filter(p => {
    const q = busqueda.toLowerCase();
    if (!q) return true;
    return (
      String(p.id).includes(q) ||
      p.vehiculo?.patente?.toLowerCase().includes(q) ||
      p.empresa?.nombre?.toLowerCase().includes(q) ||
      p.material_general?.nombre?.toLowerCase().includes(q)
    );
  });

  const formatFecha = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="pesadas-abiertas-view">

      {/* Header de la vista */}
      <div className="view-header">
        <div className="view-header-left">
          <div className="section-icon icon-amber">⏳</div>
          <div>
            <div className="view-title">Pesadas abiertas</div>
            <div className="view-subtitle">
              {loading
                ? "Cargando..."
                : `${pesadas.length} pesada${pesadas.length !== 1 ? "s" : ""} pendiente${pesadas.length !== 1 ? "s" : ""} de peso de salida`}
            </div>
          </div>
        </div>
        <button className="btn-secondary" onClick={cargar} disabled={loading}>
          🔄 Actualizar
        </button>
      </div>

      {/* Aviso éxito */}
      {exito && (
        <div className="alert-success">{exito}</div>
      )}

      {/* Búsqueda */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por ID, patente, empresa o material..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <button className="search-clear" onClick={() => setBusqueda("")}>✕</button>
        )}
      </div>

      {/* Tabla / estado vacío */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div>Cargando pesadas...</div>
        </div>
      ) : pesadasFiltradas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{busqueda ? "🔍" : "✅"}</div>
          <div>
            {busqueda
              ? "No hay resultados para esa búsqueda."
              : "No hay pesadas abiertas pendientes."}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="pesadas-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha entrada</th>
                <th>Empresa</th>
                <th>Material</th>
                <th>Patente</th>
                <th>Caja</th>
                <th>Peso entrada</th>
                <th>Movimiento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pesadasFiltradas.map(p => (
                <tr key={p.id}>
                  <td className="td-id">#{p.id}</td>
                  <td className="td-fecha">{formatFecha(p.created_at ?? p.fecha)}</td>
                  <td>{p.empresa?.nombre ?? <span className="td-empty">—</span>}</td>
                  <td>{p.material_general?.nombre ?? <span className="td-empty">—</span>}</td>
                  <td className="td-patente">
                    {p.vehiculo?.patente ?? <span className="td-empty">—</span>}
                  </td>
                  <td>
                    {p.caja?.codigo ?? <span className="td-empty">—</span>}
                  </td>
                  <td className="td-peso">
                    {p.peso_bruto_kg != null
                      ? `${Number(p.peso_bruto_kg).toLocaleString("es-AR")} kg`
                      : p.peso_entrada_kg != null
                        ? `${Number(p.peso_entrada_kg).toLocaleString("es-AR")} kg`
                        : <span className="td-empty">—</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${p.tipo_movimiento?.toLowerCase()}`}>
                      {p.tipo_movimiento}
                    </span>
                  </td>
                  <td className="td-actions">
                    <button
                      className="btn-cerrar"
                      onClick={() => setPesadaACerrar(p)}
                    >
                      🏁 Cerrar pesada
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cierre */}
      {pesadaACerrar && (
        <CerrarPesadaModal
          pesada={pesadaACerrar}
          balanzaDisponible={balanzaDisponible}
          onClose={() => setPesadaACerrar(null)}
          onCerrada={handleCerrada}
        />
      )}
    </div>
  );
}