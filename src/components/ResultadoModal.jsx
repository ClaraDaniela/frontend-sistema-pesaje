export default function ResultadoModal({ resultado, onClose }) {
  if (!resultado) return null;

  const esOk = resultado.tipo === "ok";

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
          animation: "pop 0.25s ease"
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "10px" }}>
          {esOk ? "✔" : "❌"}
        </div>

        <h2 style={{ marginBottom: "10px" }}>
          {esOk ? "Operación exitosa" : "⚠ Fuera de tolerancia"}
        </h2>

        <p style={{ marginBottom: "20px" }}>
          {resultado.mensaje}
        </p>

        <button
          onClick={onClose}
          style={{
            background: "white",
            color: "black",
            border: "none",
            padding: "8px 20px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}