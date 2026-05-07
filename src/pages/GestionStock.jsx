import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import ReportesJefe from "../components/ReportesJefe";
import Inventario from "../components/Inventario";
import "../styles/GestionStock.css";

export default function GestionStock({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("reportes");

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <Logo />

        <nav>
          <button
            className={activeTab === "reportes" ? "active" : ""}
            onClick={() => setActiveTab("reportes")}
          >
            <span className="nav-icon">📊</span>
            Gestión de stock e informes
          </button>

          <button
            className={activeTab === "inventario" ? "active" : ""}
            onClick={() => setActiveTab("inventario")}
          >
            <span className="nav-icon">📦</span>
            Inventario
          </button>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="content">

        {/* botón volver */}
        <div className="topbar-right">
          <button
            className="btn-secundario"
            onClick={() => navigate("/")}
          >
            ← Inicio
          </button>
        </div>

        {/* REPORTES */}
        {activeTab === "reportes" && (
          <>
            <h1>Reportes</h1>
            <section className="table-card">
              <ReportesJefe />
            </section>
          </>
        )}

        {/* INVENTARIO */}
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