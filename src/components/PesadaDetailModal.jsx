import "../styles/PesadaDetalle.css";

export default function PesadaDetailModal({ pesada, onClose }) {
  if (!pesada) return null;

  const formatKg = (n) =>
    n != null
      ? `${Number(n).toLocaleString("es-AR")} kg`
      : "-";

  const fecha = new Date(pesada.fecha);

  const egreso =
    pesada.tara_real_kg != null
      ? pesada.tara_real_kg
      : pesada.tara_camion + pesada.tara_caja;

  const material =
    pesada.peso_bruto_kg != null
      ? pesada.peso_bruto_kg - egreso
      : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Detalle de pesada #{pesada.id}</h3>

        <p>
          <b>Fecha:</b>{" "}
          {fecha.toLocaleDateString("es-AR")}{" "}
          {fecha.toLocaleTimeString("es-AR")}
        </p>

        <p>
          <b>Tipo:</b> {pesada.tipo_movimiento}
        </p>

        <p>
          <b>Origen:</b> {pesada.origen}
        </p>

        {pesada.origen === "MANUAL" &&
          pesada.motivo_manual && (
            <p>
              <b>Motivo carga manual:</b>{" "}
              {pesada.motivo_manual}
            </p>
          )}

        <hr />

        <p>
          <b>Empresa:</b> {pesada.empresa}
        </p>

        <p>
          <b>Chofer:</b>{" "}
          {pesada.personal_nombre}{" "}
          {pesada.personal_apellido}
        </p>

        <p>
          <b>Material:</b> {pesada.material}
        </p>

        <hr />

        <p>
          <b>Patente:</b> {pesada.patente}
        </p>

        <p>
          <b>Tipo vehículo:</b>{" "}
          {pesada.tipo_vehiculo}
        </p>

        {pesada.id_caja && (
          <>
            <p>
              <b>Caja:</b> {pesada.id_caja}
            </p>

            <p>
              <b>Tipo caja:</b> {pesada.tipo_caja}
            </p>
          </>
        )}

        <hr />

        <p>
          <b>N° Manifiesto:</b>{" "}
          {pesada.nro_manifiesto || "-"}
        </p>

        <p>
          <b>N° Remito:</b>{" "}
          {pesada.nro_remito || "-"}
        </p>

        <hr />

        <p>
          <b>Ingreso (bruto):</b>{" "}
          {formatKg(pesada.peso_bruto_kg)}
        </p>

        <p>
          <b>Tara camión:</b>{" "}
          {formatKg(pesada.tara_camion)}
        </p>

        {pesada.caja_id && (
          <p>
            <b>Tara caja:</b>{" "}
            {formatKg(pesada.tara_caja)}
          </p>
        )}

        {pesada.tara_real_kg != null ? (
          <>
            <p>
              <b>Egreso real:</b>{" "}
              {formatKg(pesada.tara_real_kg)}
            </p>

            <p className="modal-diferencia-tara">
              <b>Diferencia tara:</b>{" "}
              {formatKg(
                pesada.diferencia_tara_kg
              )}
            </p>

            <p className="modal-origen-nota">
              Diferencia entre tara teórica y
              peso real de salida
            </p>
          </>
        ) : (
          <p className="modal-origen-nota">
            Sin segunda pesada — usando tara
            fija del vehículo
          </p>
        )}

        <p className="modal-peso-neto">
          <b>Material (Neto)</b>

          <span>{formatKg(material)}</span>
        </p>

        {pesada.peso_declarado_kg != null && (
          <div
            className={
              pesada.dentro_tolerancia
                ? "modal-validacion-dentro"
                : "modal-validacion-fuera"
            }
          >
            <p>
              <b>Peso declarado:</b>{" "}
              {formatKg(
                pesada.peso_declarado_kg
              )}
            </p>

            <p>
              <b>Diferencia:</b>{" "}
              {formatKg(pesada.diferencia_kg)}
            </p>

            <p>
              <b>Estado:</b>

              <span
                className={`modal-tolerancia-badge ${
                  pesada.dentro_tolerancia
                    ? "modal-tolerancia-ok"
                    : "modal-tolerancia-error"
                }`}
              >
                {pesada.dentro_tolerancia
                  ? "✔ Dentro de tolerancia"
                  : "✖ Fuera de tolerancia"}
              </span>
            </p>
          </div>
        )}

        <button
          className="modal-btn-cerrar"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}