export default function ResultadoModal({ resultado, onClose }) {
  if (!resultado) return null;

  const esOk = resultado.tipo === "ok";

  const pesadaId =
    resultado.id ||
    resultado.pesada_id ||
    resultado?.pesada?.id ||
    null;

  const imprimirTicket = () => {
    if (!pesadaId) return;

    window.open(`/api/export/pesada/${pesadaId}`, "_blank");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "380px",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
          color: "white",
          background: esOk
            ? "linear-gradient(135deg, #2e7d32, #43a047)"
            : "linear-gradient(135deg, #b71c1c, #d32f2f)",
          boxShadow: esOk
            ? "0 10px 30px rgba(46,125,50,0.4)"
            : "0 10px 30px rgba(211,47,47,0.5)",
        }}
      >

        <div style={{ fontSize: "42px", marginBottom: "10px" }}>
          {esOk ? "✔" : "❌"}
        </div>

        <h2 style={{ marginBottom: "10px" }}>
          {esOk ? "Operación exitosa" : "⚠ Fuera de tolerancia"}
        </h2>

        <p style={{ marginBottom: "10px" }}>
          {resultado.mensaje}
        </p>
        {pesadaId && (
          <p style={{ fontSize: "14px", opacity: 0.8 }}>
            N° de pesada: <b>{pesadaId}</b>
          </p>
        )}

        <div style={{ marginTop: "20px" }} />

        <button
          onClick={imprimirTicket}
          disabled={!pesadaId}
          style={{
            background: pesadaId ? "#fff" : "#ccc",
            color: "#000",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: pesadaId ? "pointer" : "not-allowed",
            fontWeight: "bold",
            marginBottom: "10px",
            width: "100%",
            opacity: pesadaId ? 1 : 0.6,
          }}
        >
          🖨 Imprimir ticket
        </button>

        <button
          onClick={onClose}
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid white",
            padding: "8px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}