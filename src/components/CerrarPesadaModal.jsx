import { useEffect, useState } from "react";
import api from "../services/api";

import "../styles/ModalCierre.css";

import { CircleX } from "lucide-react";

/**
 * Modal para cerrar pesada
 */
export default function CerrarPesadaModal({
  pesada,
  balanzaDisponible = true,
  onClose,
  onCerrada,
}) {

  const [origen, setOrigen] = useState("BALANZA");

  const [pesoBalanza, setPesoBalanza] = useState(null);
  const [balanzaOk, setBalanzaOk] = useState(false);

  const [pesoManual, setPesoManual] = useState("");
  const [passwordManual, setPasswordManual] = useState("");
  const [motivoManual, setMotivoManual] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // DATOS
  // =========================

  const pesoEntrada =
    pesada?.peso_bruto_kg ??
    pesada?.peso_entrada_kg ??
    null;

  const pesoSalida =
    origen === "BALANZA"
      ? pesoBalanza
      : pesoManual
      ? Number(pesoManual)
      : null;

  const pesoNeto =
    pesoEntrada != null && pesoSalida != null
      ? pesoEntrada - pesoSalida
      : null;

  // Compatibilidad con distintos formatos de backend
  const empresaNombre =
    pesada?.empresa?.nombre ||
    pesada?.empresa_nombre ||
    pesada?.empresa ||
    "—";

  const materialNombre =
    pesada?.material?.nombre ||
    pesada?.material_nombre ||
    pesada?.material ||
    "—";

  const patente =
    pesada?.vehiculo?.patente ||
    pesada?.patente ||
    "—";

  // =========================
  // POLLING BALANZA
  // =========================

  useEffect(() => {

    if (origen !== "BALANZA") return;

    if (!balanzaDisponible) return;

    const timer = setInterval(async () => {

      try {

        const res = await api.get("/balanza/peso");

        if (res.data?.disponible) {

          setPesoBalanza(res.data.peso_kg);
          setBalanzaOk(true);

        } else {

          setPesoBalanza(null);
          setBalanzaOk(false);

        }

      } catch {

        setPesoBalanza(null);
        setBalanzaOk(false);

      }

    }, 1500);

    return () => clearInterval(timer);

  }, [origen, balanzaDisponible]);

  // =========================
  // CAMBIAR ORIGEN
  // =========================

  const handleOrigenChange = (nuevoOrigen) => {

    setOrigen(nuevoOrigen);

    setPesoBalanza(null);
    setBalanzaOk(false);

    setPesoManual("");
    setPasswordManual("");
    setMotivoManual("");

    setError("");
  };

  // =========================
  // SUBMIT
  // =========================

  const submit = async () => {

    setError("");

    if (origen === "BALANZA" && !balanzaOk) {
      return setError("La balanza no está disponible.");
    }

    if (origen === "MANUAL") {

      if (!passwordManual.trim()) {
        return setError("Debe ingresar contraseña.");
      }

      if (!pesoManual) {
        return setError("Debe ingresar el peso.");
      }

      if (!motivoManual.trim()) {
        return setError("Debe ingresar un motivo.");
      }
    }

    setLoading(true);

    try {

      const res = await api.patch(
        `/pesadas/${pesada.id}/cerrar`,
        {
          tara_real_kg: pesoSalida,

          modo_salida:
            origen === "BALANZA"
              ? "AUTOMATICO"
              : "MANUAL",

          password_manual:
            origen === "MANUAL"
              ? passwordManual
              : null,

          motivo_manual:
            origen === "MANUAL"
              ? motivoManual
              : null,
        }
      );

      if (onCerrada) {
        onCerrada(res.data);
      }

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Error al cerrar pesada."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) =>
        e.target === e.currentTarget && onClose()
      }
    >

      <div className="modal-card cerrar-pesada-modal">

        {/* =========================
             HEADER
        ========================= */}

        <div className="modal-header">

          <div className="modal-header-left">

            <CircleX />

            <div>

              <div className="modal-title">
                Cerrar pesada
              </div>

              <div className="modal-subtitle">
                Pesada #{pesada.id} · {patente}
              </div>

            </div>

          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* =========================
             RESUMEN
        ========================= */}

        <div className="pesada-resumen">

          <div className="resumen-item">

            <span className="resumen-label">
              Empresa
            </span>

            <span className="resumen-value">
              {empresaNombre}
            </span>

          </div>

          <div className="resumen-item">

            <span className="resumen-label">
              Material
            </span>

            <span className="resumen-value">
              {materialNombre}
            </span>

          </div>

          <div className="resumen-item">

            <span className="resumen-label">
              Peso entrada
            </span>

            <span className="resumen-value resumen-peso">

              {pesoEntrada != null
                ? `${Number(pesoEntrada).toLocaleString("es-AR")} kg`
                : "—"}

            </span>

          </div>

        </div>

        {/* =========================
             ORIGEN
        ========================= */}

        <div className="field-group">

          <label>
            Origen del peso de salida
          </label>

          <div className="toggle-group">

            <button
              type="button"
              className={`toggle-btn ${
                origen === "BALANZA" ? "active" : ""
              }`}
              onClick={() =>
                handleOrigenChange("BALANZA")
              }
            >
              Balanza
            </button>

            <button
              type="button"
              className={`toggle-btn ${
                origen === "MANUAL" ? "active" : ""
              }`}
              onClick={() =>
                handleOrigenChange("MANUAL")
              }
            >
              Manual
            </button>

          </div>

        </div>

        {/* =========================
             BALANZA
        ========================= */}

        {origen === "BALANZA" && (

          <div className="field-group">

            <label>
              Peso leído (salida)
            </label>

            <div className="peso-display">

              <div
                className={`peso-dot ${
                  !balanzaOk ? "off" : ""
                }`}
              />

              <span className="peso-value">

                {balanzaOk && pesoBalanza != null
                  ? `${Number(pesoBalanza).toLocaleString("es-AR")} kg`
                  : "Sin conexión"}

              </span>

            </div>

          </div>

        )}

        {/* =========================
             MANUAL
        ========================= */}

        {origen === "MANUAL" && (
          <>

            <div className="manual-note">
              ⚠ La carga manual requiere autorización.
            </div>

            <div className="field-group">

              <label>
                Contraseña
              </label>

              <input
                type="password"
                value={passwordManual}
                onChange={(e) =>
                  setPasswordManual(e.target.value)
                }
              />

            </div>

            <div className="field-group">

              <label>
                Peso egreso (peso del camión sin carga)
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={pesoManual}
                onChange={(e) =>
                  setPesoManual(e.target.value)
                }
              />

            </div>

            <div className="field-group">

              <label>
                Motivo
              </label>

              <textarea
                value={motivoManual}
                onChange={(e) =>
                  setMotivoManual(e.target.value)
                }
              />

            </div>

          </>
        )}

        {/* =========================
             PESO NETO
        ========================= */}

        {pesoNeto != null && (

          <div
            className={`peso-neto-preview ${
              pesoNeto < 0 ? "negativo" : ""
            }`}
          >

            <span className="peso-neto-label">
              Peso neto estimado
            </span>

            <span className="peso-neto-value">

              {pesoNeto < 0 ? "⚠ " : ""}

              {Number(pesoNeto).toLocaleString("es-AR")} kg

            </span>

          </div>

        )}

        {/* ERROR */}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* =========================
             FOOTER
        ========================= */}

        <div className="footer-row">

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={submit}
            disabled={
              loading ||
              (origen === "BALANZA" && !balanzaOk)
            }
          >

            {loading
              ? "Guardando..."
              : "✔ Confirmar salida"}

          </button>

        </div>

      </div>

    </div>
  );
}