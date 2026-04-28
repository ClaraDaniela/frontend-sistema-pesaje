import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Porteria from "./pages/Porteria";
import PlayaMateriales from "./pages/PlayaMateriales";
import GestionStock from "./pages/GestionStock";
import PaginaPrincipal from "./pages/PaginaPrincipal";
import Registros from "./pages/Registros";
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
function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
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
              allowedRoles={["ADMIN", "OPERADOR"]}
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
          element={<PlayaMateriales />}
        />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </div>
  );
}

export default App;