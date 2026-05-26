import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import PesadasTable from "../components/PesadasTable";
import PesadaDetailModal from "../components/PesadaDetailModal";
import EditPesadaModal from "../components/EditPesadaModal";

import Logo from "../components/Logo";

export default function Registros() {

  const navigate = useNavigate();

  const FILTROS_INICIALES = {
    desde: "",
    hasta: "",
    empresa_id: "",
    tipo_vehiculo_id: "",
    vehiculo_id: "",
  };

  const mountedRef = useRef(false);

  const [loading, setLoading] = useState(true);

  const [pesadas, setPesadas] = useState([]);

  const [empresas, setEmpresas] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tipoVehiculo, setTipoVehiculo] = useState([]);

  const [filters, setFilters] = useState(FILTROS_INICIALES);

  const [pesadaView, setPesadaView] = useState(null);
  const [pesadaEdit, setPesadaEdit] = useState(null);

  // =========================
  // CARGAR PESADAS
  // =========================

  const loadPesadas = async (customFilters = filters) => {

    setLoading(true);

    try {

      const params = Object.fromEntries(
        Object.entries(customFilters).filter(
          ([, value]) => value !== ""
        )
      );

      const { data } = await api.get("/pesadas", {
        params,
      });

      setPesadas(data || []);

    } catch (error) {

      console.error("Error cargando pesadas:", error);

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // CARGAR DATOS INICIALES
  // =========================

  const loadAll = async () => {

    try {

      const [
        empresasRes,
        personalRes,
        materialesRes,
        vehiculosRes,
        tiposVehiculoRes,
      ] = await Promise.all([
        api.get("/empresas"),
        api.get("/personal"),
        api.get("/materiales"),
        api.get("/vehiculos"),
        api.get("/tipos_vehiculo"),
      ]);

      setEmpresas(empresasRes.data || []);
      setPersonal(personalRes.data || []);
      setMateriales(materialesRes.data || []);
      setVehiculos(vehiculosRes.data || []);
      setTipoVehiculo(tiposVehiculoRes.data || []);

      await loadPesadas(FILTROS_INICIALES);

    } catch (error) {

      console.error("Error cargando datos:", error);

    } finally {

      mountedRef.current = true;

    }
  };

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    loadAll();
  }, []);

  // =========================
  // FILTROS
  // =========================

  useEffect(() => {

    if (!mountedRef.current) return;

    loadPesadas(filters);

  }, [filters]);

  // =========================
  // CERRAR PESADA
  // =========================

  const handlePesadaCerrada = (pesadaActualizada) => {

    setPesadas((prev) =>
      prev.map((p) =>
        p.id === pesadaActualizada.id
          ? {
              ...p,
              ...pesadaActualizada,
            }
          : p
      )
    );
  };

  return (
    <div className="container">

      {/* =========================
           TOPBAR
      ========================= */}

      <div className="topbar">

        <div className="topbar-left">
          <Logo />
        </div>

        <div className="topbar-right">

          <button
            className="btn-secundario"
            onClick={() => navigate("/")}
          >
            ← Inicio
          </button>

        </div>

      </div>

      {/* =========================
           TABLA
      ========================= */}

      <section className="section-card">

        <h2>Pesadas registradas</h2>

        {loading ? (

          <p>Cargando...</p>

        ) : (

          <PesadasTable
            pesadas={pesadas}

            filtros={filters}
            onFiltrosChange={setFilters}
            onSearch={() => loadPesadas(filters)}

            empresas={empresas}
            vehiculos={vehiculos}
            tipoVehiculo={tipoVehiculo}

            onView={setPesadaView}
            onEdit={setPesadaEdit}

            onPesadaCerrada={handlePesadaCerrada}
          />

        )}

      </section>

      {/* =========================
           MODAL VER
      ========================= */}

      {pesadaView && (

        <PesadaDetailModal
          pesada={pesadaView}
          onClose={() => setPesadaView(null)}
        />

      )}

      {/* =========================
           MODAL EDITAR
      ========================= */}

      {pesadaEdit && (

        <EditPesadaModal
          pesada={pesadaEdit}
          empresas={empresas}
          personal={personal}
          materiales={materiales}
          onClose={() => setPesadaEdit(null)}
          onSaved={() => {
            loadPesadas();
            setPesadaEdit(null);
          }}
        />

      )}

    </div>
  );
}