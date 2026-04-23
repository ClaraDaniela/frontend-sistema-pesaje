import { useNavigate } from "react-router-dom";
import { FaWeightHanging, FaBoxes, FaIndustry, FaSignOutAlt, FaFileAlt } from "react-icons/fa";
import Logo from "../components/Logo";
import "../styles/PaginaPrincipal.css";

export default function PaginaPrincipal({ user }) {
  const navigate = useNavigate();
  const rol = user?.rol?.trim();

  const permisos = {
    pesadas: ["ADMIN", "porteria"].includes(rol),
    reportes: ["ADMIN", "operario"].includes(rol),
    inventario: ["ADMIN", "operario"].includes(rol),
    registros: ["ADMIN", "operario"].includes(rol),
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  const menuItems = [
    {
      permiso: permisos.pesadas,
      icon: <FaWeightHanging />,
      label: "Módulo de Creacion de Registro de Pesadas",
      to: "/pesadas",
    },
    {
      permiso: permisos.reportes,
      icon: <FaBoxes />,
      label: "Módulo de Stock",
      to: "/stock",
    },
    {
      permiso: permisos.inventario,
      icon: <FaIndustry />,
      label: "Módulo de Reciclabilidad",
      to: "/playa",
    },
        {
      permiso: permisos.registros,
      icon: <FaFileAlt />,
      label: "Módulo de Registros Históricos de Pesadas",
      to: "/registros",
    },
  ];

  return (
    <div className="pagina-principal">

      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="logo-container">
          <Logo />
        </div>

        <div className="user-info">
          <div className="user-text">
            <span className="username">{user?.nombreusuario}</span>
            <span className="rol">{user?.rol}</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ===== MENU ===== */}
      <nav className="menu">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            className={`menu-btn ${!item.permiso ? "disabled" : ""}`}
            onClick={() => item.permiso && navigate(item.to)}
          >
            {item.icon}
            <span>{item.label}</span>
            {!item.permiso && <small className="error">Sin acceso</small>}
          </button>
        ))}
      </nav>
    </div>
  );
}