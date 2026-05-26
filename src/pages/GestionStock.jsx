import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../components/Logo";

import StockMaterialesGenerales from "../components/StockMaterialesGenerales";
import StockMaterialesDescargas from "../components/StockMaterialesDescarga";

import Inventario from "../components/Inventario";

import "../styles/GestionStock.css";

import {
  ChartNoAxesCombined,
  PackageOpen,
  Boxes
} from "lucide-react";

export default function GestionStock({ user }) {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("reportes");

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <Logo />

        <nav>

          {/* STOCK GENERALES */}
          <button
            className={activeTab === "reportes" ? "active" : ""}
            onClick={() => setActiveTab("reportes")}
          >
            <ChartNoAxesCombined />
            Materiales generales
          </button>

          {/* STOCK DESCARGA */}
          <button
            className={activeTab === "descarga" ? "active" : ""}
            onClick={() => setActiveTab("descarga")}
          >
            <Boxes />
            Materiales descarga
          </button>

          {/* INVENTARIO */}
          <button
            className={activeTab === "inventario" ? "active" : ""}
            onClick={() => setActiveTab("inventario")}
          >
            <PackageOpen />
            Inventario
          </button>

        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="content">

        {/* BOTÓN VOLVER */}
        <div className="topbar-right">
          <button
            className="btn-secundario"
            onClick={() => navigate("/")}
          >
            ← Inicio
          </button>
        </div>

        {/* STOCK GENERALES */}
        {activeTab === "reportes" && (
          <>
            <h1>Materiales de las pesadas</h1>

            <section className="table-card">
              <StockMaterialesGenerales />
            </section>
          </>
        )}

        {/* STOCK DESCARGA */}
        {activeTab === "descarga" && (
          <>
            <h1>Materiales de descarga</h1>

            <section className="table-card">
              <StockMaterialesDescargas />
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