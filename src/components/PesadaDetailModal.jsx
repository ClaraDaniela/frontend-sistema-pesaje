export default function PesadaDetailModal({ pesada, onClose }) {
  if (!pesada) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Detalle de pesada</h3>

        <p><b>Fecha:</b> {new Date(pesada.fecha).toLocaleString("es-AR")}</p>
        <p><b>Tipo:</b> {pesada.tipo_movimiento}</p>
        <p><b>Origen:</b> {pesada.origen}</p>

        {pesada.origen === "MANUAL" && pesada.motivo_manual &&(
          <p>
            <b>Motivo carga manual:</b> {pesada.motivo_manual}
          </p>
        )}

        <hr />

        <p><b>Empresa:</b> {pesada.empresa}</p>
        <p><b>Chofer:</b> {pesada.chofer_nombre} {pesada.chofer_apellido}</p>
        <p><b>Material:</b> {pesada.material}</p>

        <hr />

        <p><b>Patente:</b> {pesada.patente}</p>
        <p><b>Tipo vehículo:</b> {pesada.tipo_vehiculo}</p>

        <hr />

        <p><b>Peso bruto:</b> {pesada.peso_bruto_kg} kg</p>
        <p><b>Tara camión:</b> {pesada.tara_camion} kg</p>
        <p><b>Tara caja:</b> {pesada.tara_caja} kg</p>
        <p><b>Tara total:</b> {pesada.tara_total} kg</p>
        <p><b>Peso neto:</b> {pesada.peso_neto} kg</p>

        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
