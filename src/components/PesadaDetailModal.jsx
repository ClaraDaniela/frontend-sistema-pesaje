export default function PesadaDetailModal({ pesada, onClose }) {
  if (!pesada) return null;

  const formatKg = (n) =>
    n != null ? `${Number(n).toLocaleString("es-AR")} kg` : "-";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Detalle de pesada</h3>

        {/* ===== DATOS GENERALES ===== */}
        <p><b>Fecha:</b> {new Date(pesada.fecha).toLocaleString("es-AR")}</p>
        <p><b>Tipo:</b> {pesada.tipo_movimiento}</p>
        <p><b>Origen:</b> {pesada.origen}</p>

        {pesada.origen === "MANUAL" && pesada.motivo_manual && (
          <p><b>Motivo carga manual:</b> {pesada.motivo_manual}</p>
        )}

        <hr />

        {/* ===== DATOS DEL VIAJE ===== */}
        <p><b>Empresa:</b> {pesada.empresa}</p>
        <p>
          <b>Chofer:</b> {pesada.personal_nombre} {pesada.personal_apellido}
        </p>
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

        {/* ===== PESOS ===== */}
        <p><b>Peso bruto:</b> {formatKg(pesada.peso_bruto_kg)}</p>

        <p>
          <b>Tara camión:</b> {formatKg(pesada.tara_camion)}
        </p>

        <p>
          <b>Tara caja:</b> {formatKg(pesada.tara_caja)}
        </p>

        <p>
          <b>Peso de ingreso del camión:</b> {formatKg(pesada.tara_real_kg)}
        </p>

        <hr />

        {/* ===== VALIDACIÓN CONTRA DECLARADO ===== */}
        {pesada.peso_declarado_kg != null && (
          <>
            <p><b>Peso declarado:</b> {formatKg(pesada.peso_declarado_kg)}</p>

            <p>
              <b>Diferencia:</b>{" "}
              {formatKg(pesada.diferencia_kg)}
            </p>

            <p>
              <b>Tolerancia:</b>{" "}
              <span
                style={{
                  color: pesada.dentro_tolerancia ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {pesada.dentro_tolerancia ? "✔ Dentro de tolerancia" : "✖ Fuera de tolerancia"}
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