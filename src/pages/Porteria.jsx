import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import PesadaForm from "../components/PesadaForm";
import Logo from "../components/Logo";
import { Scale } from "lucide-react";

export default function Porteria() {

  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tipoVehiculo, setTipoVehiculo] = useState([]);

  const [loading, setLoading] = useState(true);

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

    } catch (error) {

      console.error("Error cargando datos:", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="container">

      <div className="topbar">

        <Logo />

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

      <section className="section-card">

        <div className="section-header">

          <Scale />

          <div>

            <div className="section-title">
              Ingreso de pesada
            </div>

            <div className="section-subtitle">
              Registrar nueva operación
            </div>

          </div>

        </div>

        {loading ? (

          <p>Cargando...</p>

        ) : (

          <PesadaForm
            empresas={empresas}
            personal={personal}
            materiales={materiales}
            vehiculos={vehiculos}
            tipoVehiculo={tipoVehiculo}
            onCreated={() => {
              console.log("Pesada creada");
            }}
          />

        )}

      </section>

    </div>
  );
}