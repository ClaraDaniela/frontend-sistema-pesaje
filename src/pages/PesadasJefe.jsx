import { useState, useEffect } from "react";
import api from "../services/api";
import PesadasTable from "../components/PesadasTable";
import PesadasFilters from "../components/PesadasFilters";
import PesadaDetailModal from "../components/PesadaDetailModal";
import Logo from "../components/Logo";

export default function PesadasJefe() {
  // Estados para las listas
  const [pesadas, setPesadas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tipoVehiculo, setTipoVehiculo] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    empresa_id: "",
    vehiculo_id: "",
    tipo_vehiculo_id: "", 
  });

  // Estado para el modal
  const [pesadaView, setPesadaView] = useState(null);

  // Cargar listas iniciales (empresas, vehículos, tipos)
  const loadListas = async () => {
    try {
      const [e, v, t] = await Promise.all([
        api.get("/api/empresas"),
        api.get("/api/vehiculos"),
        api.get("/api/tipos_vehiculo"),
      ]);
      setEmpresas(e.data || []);
      setVehiculos(v.data || []);
      setTipoVehiculo(t.data || []);
    } catch (err) {
      console.error("Error cargando listas:", err);
    }
  };

  // Buscar pesadas según filtros
  const loadPesadas = async (customFilters = filters) => {
    setLoading(true);
    try {
      const params = {};
      
      // Solo agregar parámetros que tengan valor
      if (customFilters.desde) params.desde = customFilters.desde;
      if (customFilters.hasta) params.hasta = customFilters.hasta;
      if (customFilters.empresa_id) params.empresa_id = customFilters.empresa_id;
      if (customFilters.vehiculo_id) params.vehiculo_id = customFilters.vehiculo_id;
      if (customFilters.tipo_vehiculo_id) params.tipo_vehiculo_id = customFilters.tipo_vehiculo_id;

      const res = await api.get("/api/pesadas", { params });
      setPesadas(res.data || []);
    } catch (err) {
      console.error("Error cargando pesadas:", err);
      setPesadas([]);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial: listas y primera búsqueda de pesadas
  useEffect(() => {
    const init = async () => {
      await loadListas();
      await loadPesadas();
    };
    init();
  }, []);

  // Recargar pesadas cuando cambien los filtros
  useEffect(() => {
    loadPesadas(filters);
  }, [filters]);

  return (
    <div className="container">
      <Logo />
      <h1>Pesadas</h1>

      {/* =========================
           SECCIÓN DE FILTROS
           ========================= */}
      <section className="form-card">
        <h2>Filtros</h2>
        <PesadasFilters
          filters={filters}
          onChange={setFilters}
          onSearch={() => loadPesadas(filters)}
          empresas={empresas}
          vehiculos={vehiculos}
          tipoVehiculo={tipoVehiculo}
        />
      </section>

      {/* =========================
           TABLA DE PESADAS
           ========================= */}
      <section className="table-card">
        <h2>Pesadas registradas</h2>
        {loading ? (
          <p>Cargando…</p>
        ) : pesadas.length === 0 ? (
          <p>No se encontraron pesadas con los filtros seleccionados.</p>
        ) : (
          <PesadasTable
            pesadas={pesadas}
            onView={setPesadaView}
            onEdit={null} // Nico no deberia poder editar sino ver
          />
        )}
      </section>

      {/* =========================
           MODAL DE DETALLE
           ========================= */}
      {pesadaView && (
        <PesadaDetailModal
          pesada={pesadaView}
          onClose={() => setPesadaView(null)}
        />
      )}
    </div>
  );
}
