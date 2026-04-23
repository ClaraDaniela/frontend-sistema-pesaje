import "../styles/login.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Logo from "./Logo";
//el fondo lo uso en el css como background
import fondo from "../../public/fondooperarios.jpg";
function Login({ setIsLogged, setUser }) {

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const aviso = location.state?.aviso;

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/usuarios/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: usuario,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error("Usuario o contraseña incorrectos");
      }

      const data = await response.json();
      console.log("ROL EN FRONTEND:", JSON.stringify(data.rol)); 


      setIsLogged(true);
      setUser(data);

      localStorage.setItem("user", JSON.stringify(data));

      navigate("/");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="login-bg"></div>
      <div id="formulario-login">
        <div className="login-header">
          <Logo />
          <h2 className="titulo-login">
            Bienvenido/a al sistema .
          </h2>
        </div>
        {aviso && <p style={{ color: "red" }}>{aviso}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={manejarEnvio}>
          <div>
            <label> </label>
            <label>Usuario:</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div>
            <label> </label>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <label> </label>
          <button type="submit">Ingresar</button>
        </form>
      </div>
    </>
  );
}

export default Login;