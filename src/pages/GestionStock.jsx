import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import StockMaterialesGenerales from "../components/StockMaterialesGenerales";
import Inventario from "../components/Inventario";
import "../styles/GestionStock.css";
import {ChartNoAxesCombined, PackageOpen, Boxes} from "lucide-react";

export default function GestionStock({ user }) {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("reportes");

  return (
    <div className="layout">

      <aside className="sidebar">

        <Logo />

        <nav>
          <button
            className={activeTab === "reportes" ? "active" : ""}
            onClick={() => setActiveTab("reportes")}
          >
            <ChartNoAxesCombined />
            Materiales de ingreso/egreso
          </button>

          <button
            className={activeTab === "inventario" ? "active" : ""}
            onClick={() => setActiveTab("inventario")}
          >
            <PackageOpen />
            Inventario
          </button>

        </nav>
      </aside>

      <main className="content">

        <div className="topbar-right">
          <button
            className="btn-secundario"
            onClick={() => navigate("/")}
          >
            ← Inicio
          </button>
        </div>

        {activeTab === "reportes" && (
          <>
            <h1>Materiales de las pesadas</h1>

            <section className="table-card">
              <StockMaterialesGenerales />
            </section>
          </>
        )}

        {activeTab === "inventario" && (
          <>
            <h1>Inventario</h1>

            <Inventario user={user} />
          </>
        )}

      </main>
    </div>
  );
}