export default function SelectWithAdd({
  label,
  value,
  onChange,
  options = [],
  getLabel,
  onAdd,
  required = false,
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <div className="select-add">
        <select value={value || ""} onChange={onChange} required={required}>
          <option value="">Seleccionar</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>
              {getLabel(o)}
            </option>
          ))}
        </select>

        {onAdd && (
          <button
            type="button"
            className="btn-add"
            onClick={onAdd}
            title={`Agregar ${label}`}
          >
            ➕
          </button>
        )}
      </div>
    </div>
  );
}
