export default function PesadaDetailModal({ pesada, onClose }) {
  if (!pesada) return null;

  const formatKg = (n) =>
    n != null ? `${Number(n).toLocaleString("es-AR")} kg` : "-";

  const fecha = new Date(pesada.fecha);

  // 🔥 EGRESO correcto
  const egreso =
    pesada.tara_real_kg != null
      ? pesada.tara_real_kg
      : (pesada.tara_camion + pesada.tara_caja);

  // 🔥 MATERIAL (NETO)
  const material =
    pesada.peso_bruto_kg != null ? pesada.peso_bruto_kg - egreso : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Detalle de pesada</h3>

        {/* ===== DATOS GENERALES ===== */}
        <p><b>Fecha:</b> {fecha.toLocaleDateString("es-AR")} {fecha.toLocaleTimeString("es-AR")}</p>
        <p><b>Tipo:</b> {pesada.tipo_movimiento}</p>
        <p><b>Origen:</b> {pesada.origen}</p>

        {pesada.origen === "MANUAL" && pesada.motivo_manual && (
          <p><b>Motivo carga manual:</b> {pesada.motivo_manual}</p>
        )}

        <hr />

        {/* ===== DATOS DEL VIAJE ===== */}
        <p><b>Empresa:</b> {pesada.empresa}</p>
        <p><b>Chofer:</b> {pesada.personal_nombre} {pesada.personal_apellido}</p>
        <p><b>Material:</b> {pesada.material}</p>

        <hr />

        {/* ===== VEHÍCULO ===== */}
        <p><b>Patente:</b> {pesada.patente}</p>
        <p><b>Tipo vehículo:</b> {pesada.tipo_vehiculo}</p>

        {pesada.id_caja && (
          <>
            <p><b>Caja:</b> {pesada.id_caja}</p>
            <p><b>Tipo caja:</b> {pesada.tipo_caja}</p>
          </>
        )}

        <hr />

        {/* ===== DOCUMENTACIÓN ===== */}
        <p><b>N° Manifiesto:</b> {pesada.nro_manifiesto || "-"}</p>
        <p><b>N° Remito:</b> {pesada.nro_remito || "-"}</p>

        <hr />

        {/* ===== PESOS PRINCIPALES ===== */}
        <p><b>Ingreso (Bruto):</b> {formatKg(pesada.peso_bruto_kg)}</p>

        <p><b>Egreso:</b> {formatKg(egreso)}</p>

        <p style={{ fontSize: "12px", color: "#666" }}>
          {pesada.tara_real_kg != null
            ? "Egreso real (camión vacío)"
            : "Egreso estimado (tara vehículo + caja)"}
        </p>

        <p style={{ fontSize: "16px", fontWeight: "bold" }}>
          Material (Neto): {formatKg(material)}
        </p>

        <hr />

        {/* ===== VALIDACIÓN ===== */}
        {pesada.peso_declarado_kg != null && (
          <>
            <p><b>Peso declarado:</b> {formatKg(pesada.peso_declarado_kg)}</p>

            <p>
              <b>Diferencia:</b> {formatKg(pesada.diferencia_kg)}
            </p>

            <p>
              <b>Tolerancia:</b>{" "}
              <span
                style={{
                  color: pesada.dentro_tolerancia ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {pesada.dentro_tolerancia
                  ? "✔ Dentro de tolerancia"
                  : "✖ Fuera de tolerancia"}
              </span>
            </p>
          </>
        )}

        <hr />

        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}