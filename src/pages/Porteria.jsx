import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import PesadaForm from "../components/PesadaForm";
import PesadasTable from "../components/PesadasTable";
import PesadaDetailModal from "../components/PesadaDetailModal";
import EditPesadaModal from "../components/EditPesadaModal";
import Logo from "../components/Logo";

export default function Porteria() {
  const navigate = useNavigate();
  // Listas
  const [pesadas, setPesadas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tipoVehiculo, setTipoVehiculo] = useState([]);
  const [loading, setLoading] = useState(true);


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
      const { data } = await api.get("/pesadas", {
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
        api.get("/empresas"),
        api.get("/personal"),
        api.get("/materiales"),
        api.get("/vehiculos"),
        api.get("/tipos_vehiculo"),
      ]);

      setEmpresas(e.data || []);
      setPersonal(c.data || []);
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
      <h1>Sistema de Pesaje</h1>

      {/* =========================
           SECCIÓN DE NUEVA PESADA
           ========================= */}
      <section className="section-card">
        <div className="section-header">
          <div className="section-icon icon-blue">⚖️</div>
          <div>
            <div className="section-title">Ingreso de pesada</div>
            <div className="section-subtitle">Registrar nueva operación</div>
          </div>
        </div>
        <PesadaForm
          empresas={empresas}
          personal={personal}
          materiales={materiales}
          vehiculos={vehiculos}
          tipoVehiculo={tipoVehiculo}
          onCreated={loadPesadas}
        />
      </section>

    </div>
  );
}
