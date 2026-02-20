export default function PesadasTable({ pesadas = [], onView, onEdit }) {
  return (
    <table className="pesadas-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Empresa</th>
          <th>Chofer</th>
          <th>Tipo Vehículo</th>
          <th>Material</th>
          <th>KG Neto</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {pesadas.map((p) => (
          <tr key={p.id}>
            <td data-label="Fecha">
              {new Date(p.fecha).toLocaleString("es-AR")}
            </td>

            <td data-label="Empresa">{p.empresa}</td>

            <td data-label="Chofer">
              {p.chofer_nombre} {p.chofer_apellido}
            </td>

            <td data-label="Tipo Vehículo">{p.tipo_vehiculo}</td>

            <td data-label="Material">{p.material}</td>

            <td data-label="KG Neto">
              {Number(p.peso_neto).toLocaleString("es-AR")}
            </td>

            <td data-label="Acciones">
              <button onClick={() => onView(p)}>👁 Ver</button>
              {onEdit && (
                <button onClick={() => onEdit(p)}>✏️ Editar</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
