import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Users, KeyRound } from "lucide-react";

import api from "../services/api";

import Logo from "../components/Logo";

import "../styles/AdminUsuariosPanel.css";

const FORM_INICIAL = {
  nombreusuario: "",
  password: "",
  confirmar: "",
  email: "",
  rol_id: "",
};

export default function AdminUsuariosPanel() {

  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);

  const [tab, setTab] = useState("lista");

  const [form, setForm] = useState(FORM_INICIAL);

  const [formError, setFormError] = useState("");
  const [formOk, setFormOk] = useState("");

  const [guardando, setGuardando] = useState(false);

  const [cambioId, setCambioId] = useState(null);

  const [passActual, setPassActual] = useState("");
  const [nuevaPass, setNuevaPass] = useState("");

  const [cambioError, setCambioError] = useState("");
  const [cambioOk, setCambioOk] = useState("");

  const [cambiando, setCambiando] = useState(false);

  const cargarUsuarios = async () => {

    setLoadingUsuarios(true);

    try {

      const { data } = await api.get("/login/listar");

      setUsuarios(data || []);

    } catch (err) {

      console.error(err);

      setUsuarios([]);

    } finally {

      setLoadingUsuarios(false);

    }
  };

  const cargarRoles = async () => {

    setLoadingRoles(true);

    try {

      const { data } = await api.get("/roles");

      setRoles(data || []);

    } catch (err) {

      console.error(err);

      setRoles([]);

    } finally {

      setLoadingRoles(false);

    }
  };

  useEffect(() => {

    cargarUsuarios();
    cargarRoles();

  }, []);

  const limpiarMensajes = () => {

    setFormError("");
    setFormOk("");

  };

  const handleCrear = async () => {

    limpiarMensajes();

    if (!form.nombreusuario.trim()) {
      return setFormError("El nombre de usuario es obligatorio.");
    }

    if (!form.password.trim()) {
      return setFormError("La contraseña es obligatoria.");
    }

    if (form.password.length < 6) {
      return setFormError("La contraseña debe tener al menos 6 caracteres.");
    }

    if (form.password !== form.confirmar) {
      return setFormError("Las contraseñas no coinciden.");
    }

    if (!form.rol_id) {
      return setFormError("Seleccioná un rol.");
    }

    setGuardando(true);

    try {

      await api.post("/login/crear", {
        nombreusuario: form.nombreusuario.trim(),
        password: form.password,
        email: form.email.trim() || null,
        rol_id: Number(form.rol_id),
      });

      setFormOk(
        `Usuario "${form.nombreusuario}" creado correctamente.`
      );

      setForm(FORM_INICIAL);

      await cargarUsuarios();

    } catch (err) {

      console.error(err);

      setFormError(
        err.response?.data?.error ||
        "Error al crear usuario."
      );

    } finally {

      setGuardando(false);

    }
  };

  const handleCambioPass = async () => {

    setCambioError("");
    setCambioOk("");

    if (!passActual.trim()) {
      return setCambioError("Ingresá la contraseña actual.");
    }

    if (!nuevaPass.trim()) {
      return setCambioError("Ingresá la nueva contraseña.");
    }

    if (nuevaPass.length < 6) {
      return setCambioError(
        "La contraseña debe tener al menos 6 caracteres."
      );
    }

    setCambiando(true);

    try {

      await api.patch(
        `/login/${cambioId}/password`,
        {
          password_actual: passActual,
          password_nueva: nuevaPass,
        }
      );

      setCambioOk("Contraseña actualizada correctamente.");

      setPassActual("");
      setNuevaPass("");

    } catch (err) {

      console.error(err);

      setCambioError(
        err.response?.data?.error ||
        "Error al cambiar contraseña."
      );

    } finally {

      setCambiando(false);

    }
  };

  const abrirCambioPass = (id) => {

    if (cambioId === id) {

      setCambioId(null);

      return;
    }

    setCambioId(id);

    setPassActual("");
    setNuevaPass("");

    setCambioError("");
    setCambioOk("");
  };

  const loading = loadingUsuarios || loadingRoles;

  return (
    <div className="admin-usuarios-wrapper">

      <div className="admin-usuarios-panel">

        {/* TOPBAR */}
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

        {/* HEADER */}
        <div className="admin-header">

          <div className="admin-header-left">

            <div className="admin-icon">
              <Users size={22} />
            </div>

            <div>

              <h2>Gestión de usuarios</h2>

              <p>
                Administrá accesos y contraseñas del sistema
              </p>

            </div>

          </div>

        </div>

        {/* TABS */}
        <div className="admin-tabs">

          <button
            className={`admin-tab ${
              tab === "lista" ? "active" : ""
            }`}
            onClick={() => {
              setTab("lista");
              limpiarMensajes();
            }}
          >
            <Users size={15} />
            Usuarios
          </button>

          <button
            className={`admin-tab ${
              tab === "nuevo" ? "active" : ""
            }`}
            onClick={() => {
              setTab("nuevo");
              limpiarMensajes();
            }}
          >
            <UserPlus size={15} />
            Nuevo usuario
          </button>

        </div>

        {/* BODY */}
        <div className="admin-body">

          {/* =========================
              LISTA
          ========================= */}
          {tab === "lista" && (
            <>
              {loading ? (

                <div className="admin-empty">
                  Cargando...
                </div>

              ) : usuarios.length === 0 ? (

                <div className="admin-empty">
                  No hay usuarios registrados.
                </div>

              ) : (

                <div className="usuarios-lista">

                  {usuarios.map((u) => (

                    <div
                      key={u.id}
                      className="usuario-card"
                    >

                      <div className="usuario-top">

                        <div className="usuario-left">

                          <div className="usuario-avatar">
                            {u.nombreusuario?.[0]?.toUpperCase()}
                          </div>

                          <div className="usuario-data">

                            <span className="usuario-nombre">
                              {u.nombreusuario}
                            </span>

                            <span className="usuario-email">
                              {u.email || "Sin email"}
                            </span>

                          </div>

                        </div>

                        <div className="usuario-right">

                          <span className="usuario-rol">
                            {u.rol?.nombre || "Sin rol"}
                          </span>

                          <span
                            className={`usuario-estado ${
                              u.activo
                                ? "activo"
                                : "inactivo"
                            }`}
                          >
                            {u.activo
                              ? "Activo"
                              : "Inactivo"}
                          </span>

                          <button
                            className="btn-pass"
                            onClick={() =>
                              abrirCambioPass(u.id)
                            }
                          >
                            <KeyRound size={15} />
                            Contraseña
                          </button>

                        </div>

                      </div>

                      {/* CAMBIO PASS */}
                      {cambioId === u.id && (

                        <div className="cambio-pass-box">

                          <div className="field-group">

                            <label>
                              Contraseña actual
                            </label>

                            <input
                              type="password"
                              value={passActual}
                              onChange={(e) =>
                                setPassActual(
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          <div className="field-group">

                            <label>
                              Nueva contraseña
                            </label>

                            <input
                              type="password"
                              value={nuevaPass}
                              onChange={(e) =>
                                setNuevaPass(
                                  e.target.value
                                )
                              }
                            />

                          </div>

                          {cambioError && (
                            <div className="form-error">
                              {cambioError}
                            </div>
                          )}

                          {cambioOk && (
                            <div className="form-ok">
                              {cambioOk}
                            </div>
                          )}

                          <div className="cambio-footer">

                            <button
                              className="btn-secondary"
                              onClick={() =>
                                setCambioId(null)
                              }
                            >
                              Cancelar
                            </button>

                            <button
                              className="btn-primary"
                              onClick={handleCambioPass}
                              disabled={cambiando}
                            >
                              {cambiando
                                ? "Guardando..."
                                : "Guardar contraseña"}
                            </button>

                          </div>

                        </div>
                      )}

                    </div>
                  ))}

                </div>
              )}
            </>
          )}

          {/* =========================
              NUEVO USUARIO
          ========================= */}
          {tab === "nuevo" && (

            <div className="nuevo-usuario-box">

              <div className="field-group">

                <label>
                  Nombre de usuario
                </label>

                <input
                  type="text"
                  placeholder="ej: operador_juan"
                  value={form.nombreusuario}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombreusuario: e.target.value,
                    })
                  }
                />

              </div>

              <div className="field-group">

                <label>
                  Email (opcional)
                </label>

                <input
                  type="email"
                  placeholder="juan@empresa.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

              </div>

              <div className="field-group">

                <label>Rol</label>

                <select
                  value={form.rol_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      rol_id: e.target.value,
                    })
                  }
                >

                  <option value="">
                    Seleccioná un rol
                  </option>

                  {roles.map((rol) => (

                    <option
                      key={rol.id}
                      value={rol.id}
                    >
                      {rol.nombre}
                    </option>

                  ))}

                </select>

              </div>

              <div className="field-grid">

                <div className="field-group">

                  <label>
                    Contraseña
                  </label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field-group">

                  <label>
                    Confirmar contraseña
                  </label>

                  <input
                    type="password"
                    value={form.confirmar}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        confirmar: e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              {formOk && (
                <div className="form-ok">
                  {formOk}
                </div>
              )}

              <div className="nuevo-footer">

                <button
                  className="btn-primary"
                  onClick={handleCrear}
                  disabled={guardando}
                >
                  {guardando
                    ? "Creando usuario..."
                    : "✔ Crear usuario"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}