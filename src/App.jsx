import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Porteria from "./pages/Porteria";
import PlayaMateriales from "./pages/PlayaMateriales";
import GestionStock from "./pages/GestionStock";
import PaginaPrincipal from "./pages/PaginaPrincipal";
import Registros from "./pages/Registros";
import AdminUsuariosPanel from "./pages/AdminUsuariosPanel";
import Login from "./components/Login";
import "./styles/servieco.css"

function PrivateRoute({ isLogged, allowedRoles, user, children }) {
  if (!isLogged) return <Navigate to="/login" />;

  const rol = user?.rol?.trim();

  if (allowedRoles && !allowedRoles.includes(rol)) {
    return <Navigate to="/" />;
  }

  return children;
}

function readStoredUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}

function App() {
  const [isLogged, setIsLogged] = useState(Boolean(readStoredUser()));
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = readStoredUser();

    if (savedUser) {
      setUser(savedUser);
      setIsLogged(true);
    }

    setLoading(false);
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container">
      <Routes>

        <Route
          path="/login"
          element={
            isLogged
              ? <Navigate to="/" />
              : <Login setIsLogged={setIsLogged} setUser={setUser} />
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute isLogged={isLogged} user={user}>
              <PaginaPrincipal user={user} />
            </PrivateRoute>
          }
        />

        <Route
          path="/pesadas"
          element={
            <PrivateRoute
              isLogged={isLogged}
              user={user}
              allowedRoles={["ADMIN", "PORTERIA"]}
            >
              <Porteria />
            </PrivateRoute>
          }
        />
        <Route
          path="/registros"
          element={
            <PrivateRoute
              isLogged={isLogged}
              user={user}
              allowedRoles={["ADMIN", "OPERADOR", "PORTERIA"]}
            >
              <Registros />
            </PrivateRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <PrivateRoute
              isLogged={isLogged}
              user={user}
              allowedRoles={["ADMIN", "OPERADOR"]}
            >
              <GestionStock user={user} />
            </PrivateRoute>
          }
        />

        <Route
          path="/playa"
          element={
            <PrivateRoute
              isLogged={isLogged}
              user={user}
              allowedRoles={['ADMIN', 'OPERADOR']}
            >
              <PlayaMateriales />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />


        <Route
          path="/admin-usuarios"
          element={
            <PrivateRoute
              isLogged={isLogged}
              user={user}
              allowedRoles={["ADMIN"]}
            >
              <AdminUsuariosPanel />
            </PrivateRoute>
          }
        />

      </Routes>
    </div>
  );
}

export default App;