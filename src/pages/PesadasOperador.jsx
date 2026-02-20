import { useEffect, useState } from "react";
import api from "../services/api";

import PesadaForm from "../components/PesadaForm";
import PesadasTable from "../components/PesadasTable";
import PesadaDetailModal from "../components/PesadaDetailModal";
import EditPesadaModal from "../components/EditPesadaModal";
import PesadasFilters from "../components/PesadasFilters";
import Logo from "../components/Logo";

export default function PesadasOperador() {
  // Listas
  const [pesadas, setPesadas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tipoVehiculo, setTipoVehiculo] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [pesadaView, setPesadaView] = useState(null);
  const [pesadaEdit, setPesadaEdit] = useState(null);

  // Filtros
  const [filters, setFilters] = useState({
    empresa_id: "",
    vehiculo_id: "",
    tipo_vehiculo: "",
    desde: "",
    hasta: "",
  });

  // Cargar pesadas según filtros
  const loadPesadas = async (customFilters = filters) => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/pesadas", {
        params: customFilters,
      });
      setPesadas(data);
    } catch (error) {
      console.error("Error cargando pesadas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar listas iniciales
  const loadAll = async () => {
    try {
      const [e, c, m, v, t] = await Promise.all([
        api.get("/api/empresas"),
        api.get("/api/choferes"),
        api.get("/api/materiales"),
        api.get("/api/vehiculos"),
        api.get("/api/tipos_vehiculo"),
      ]);

      setEmpresas(e.data || []);
      setChoferes(c.data || []);
      setMateriales(m.data || []);
      setVehiculos(v.data || []);
      setTipoVehiculo(t.data || []);

      loadPesadas(); // primera carga
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadPesadas(filters);
  }, [filters]);

  return (
    <div className="container">
      <Logo />
      <h1>Sistema de Pesaje</h1>

      {/* =========================
           SECCIÓN DE NUEVA PESADA
           ========================= */}
      <section className="form-card">
        <h2>Ingreso de nueva pesada</h2>
        <PesadaForm
          empresas={empresas}
          choferes={choferes}
          materiales={materiales}
          vehiculos={vehiculos}
          tipoVehiculo={tipoVehiculo}
          onCreated={loadPesadas}
        />
      </section>

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
        ) : (
          <PesadasTable
            pesadas={pesadas}
            onView={setPesadaView}
            onEdit={setPesadaEdit}
          />
        )}
      </section>

      {/* =========================
           MODALES
           ========================= */}
      {pesadaView && (
        <PesadaDetailModal
          pesada={pesadaView}
          onClose={() => setPesadaView(null)}
        />
      )}

      {pesadaEdit && (
        <EditPesadaModal
          pesada={pesadaEdit}
          empresas={empresas}
          choferes={choferes}
          materiales={materiales}
          onClose={() => setPesadaEdit(null)}
          onSaved={loadPesadas}
        />
      )}

    </div>
  );
}
