{/*Aca es el componente de la pagina principal, se muestra luego del login, es el menu de seleccion*/}

import { useNavigate } from "react-router-dom";
import { FaWeightHanging, FaBoxes, FaIndustry, FaSignOutAlt, FaFileAlt, FaUserFriends } from "react-icons/fa";
import Logo from "../components/Logo";
import "../styles/PaginaPrincipal.css";

export default function PaginaPrincipal({ user }) {
  const navigate = useNavigate();
  const rol = user?.rol?.trim();

  const permisos = {
    pesadas: ["ADMIN", "PORTERIA"].includes(rol),
    reportes: ["ADMIN", "OPERADOR"].includes(rol),
    inventario: ["ADMIN", "OPERADOR"].includes(rol),
    registros: ["ADMIN", "PORTERIA", "OPERADOR"].includes(rol),
    adminusuarios: ["ADMIN"].includes(rol),
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
      label: "Creación de registros de entrada/salida",
      to: "/pesadas",
    },
    {
      permiso: permisos.reportes,
      icon: <FaBoxes />,
      label: "Stock de pesadas e inventario",
      to: "/stock",
    },
    {
      permiso: permisos.inventario,
      icon: <FaIndustry />,
      label: "Reciclabilidad",
      to: "/playa",
    },
    {
      permiso: permisos.registros,
      icon: <FaFileAlt />,
      label: "Registros Históricos de Pesadas",
      to: "/registros",
    },
    {
      permiso: permisos.adminusuarios,
      icon: <FaUserFriends />,
      label: "Administración de Usuarios",
      to: "/admin-usuarios",
    },
  ];

  return (
    <div className="pagina-principal">

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