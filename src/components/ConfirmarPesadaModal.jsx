export default function ConfirmarPesadaModal({ resumen, onConfirmar, onCancelar }) {
  if (!resumen) return null;

  const Fila = ({ label, valor }) => {
    if (valor === null || valor === undefined || valor === "") return null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "8px 0",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
        <span style={{ fontSize: 14, color: "#111827", fontWeight: 500, textAlign: "right" }}>
          {valor}
        </span>
      </div>
    );
  };

  return (
    <div
      className="modal-overlay"
      onClick={onCancelar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "24px 28px",
          width: "90%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: 6, fontSize: 18, fontWeight: 600, color: "#111827" }}>
          ¿Confirmás guardar esta pesada?
        </h3>
        <p style={{ marginBottom: 16, color: "#6b7280", fontSize: 13 }}>
          Revisá los datos antes de continuar.
        </p>

        <div style={{ marginBottom: 8 }}>
          <Fila label="Movimiento" valor={resumen.tipo_movimiento} />
          <Fila label="Origen del peso" valor={resumen.origen} />
          <Fila label="Empresa" valor={resumen.empresa} />
          <Fila label="Chofer" valor={resumen.chofer} />
          <Fila label="Material" valor={resumen.material} />
          <Fila label="Tipo de vehículo" valor={resumen.tipoVehiculo} />
          <Fila label="Patente" valor={resumen.patente} />
          <Fila label="Caja / Semi" valor={resumen.caja} />
          <Fila label="Peso ingresado" valor={resumen.peso ? `${resumen.peso} kg` : null} />
          <Fila label="Tara real (camión vacío)" valor={resumen.taraReal ? `${resumen.taraReal} kg` : null} />
          <Fila label="Peso declarado por cliente" valor={resumen.pesoDeclarado ? `${resumen.pesoDeclarado} kg` : null} />
          <Fila label="N° Manifiesto" valor={resumen.manifiesto} />
          <Fila label="N° Remito" valor={resumen.remito} />
          <Fila label="Motivo (carga manual)" valor={resumen.motivoManual} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <button
            type="button"
            onClick={onCancelar}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Volver a revisar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#1d4ed8",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Confirmar y guardar
          </button>
        </div>
      </div>
    </div>
  );
}