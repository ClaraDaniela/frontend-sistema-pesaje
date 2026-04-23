import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/playamateriales.css";

export default function Descarga() {
  const { pesadaId } = useParams();
  const navigate = useNavigate();

  const [pesadas, setPesadas] = useState([]);
  const [pesadaSeleccionada, setPesadaSeleccionada] = useState(pesadaId || "");
  const [pesada, setPesada] = useState(null);

  const [materialesDB, setMaterialesDB] = useState([]);
  const [materiales, setMateriales] = useState([
    { id: "", porcentaje: "", kg: "" }
  ]);

  const [comentarios, setComentarios] = useState("");

  useEffect(() => {
    fetch("/api/pesadas/sin-descarga")
      .then(res => res.json())
      .then(data => setPesadas(data));
  }, []);

  useEffect(() => {
    if (!pesadaSeleccionada) return;

    fetch(`/api/pesadas/${pesadaSeleccionada}`)
      .then(res => res.json())
      .then(data => setPesada(data));
  }, [pesadaSeleccionada]);

  useEffect(() => {
    fetch("/api/materiales_descarga")
      .then(res => res.json())
      .then(data => setMaterialesDB(data));
  }, []);

  const calcularKg = (porcentaje) => {
    if (!pesada) return 0;
    return ((pesada.peso_neto || 0) * porcentaje) / 100;
  };

  const actualizar = (index, campo, valor) => {
    const nuevos = [...materiales];
    nuevos[index][campo] = valor;

    if (campo === "porcentaje") {
      nuevos[index].kg = calcularKg(valor);
    }

    setMateriales(nuevos);
  };

  const agregarFila = () => {
    setMateriales([...materiales, { id: "", porcentaje: "", kg: "" }]);
  };

  const eliminarFila = (index) => {
    setMateriales(materiales.filter((_, i) => i !== index));
  };

  const totalPorcentaje = materiales.reduce(
    (acc, m) => acc + Number(m.porcentaje || 0),
    0
  );

  const guardar = async () => {
    if (!pesadaSeleccionada) {
      alert("Seleccioná una pesada");
      return;
    }

    if (totalPorcentaje !== 100) {
      alert("Los porcentajes deben sumar 100%");
      return;
    }

    const res = await fetch("/api/descargas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pesada_id: pesadaSeleccionada,
        responsable: 1,
        comentarios,
        materiales
      })
    });

    if (res.ok) {
      alert("Descarga guardada");
      navigate("/");
    } else {
      alert("Error al guardar");
    }
  };

  return (
    <div className="descarga-container">
      <h2>Descarga de materiales</h2>

      {/* ================= SELECTOR ================= */}
      {!pesadaId && (
        <div className="selector">
          <label>Seleccionar pesada</label>
          <select
            value={pesadaSeleccionada}
            onChange={(e) => setPesadaSeleccionada(e.target.value)}
          >
            <option value="">-- Elegir --</option>
            {pesadas.map(p => (
              <option key={p.id} value={p.id}>
                {p.empresa} | {p.personal_nombre} {p.personal_apellido} | {p.patente} | {p.fecha}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ================= INFO ================= */}
      {pesada && (
        <div className="info">
          <p><b>Empresa:</b> {pesada.empresa}</p>
          <p><b>Chofer:</b> {pesada.personal_nombre} {pesada.personal_apellido}</p>
          <p><b>Vehículo:</b> {pesada.patente}</p>
          <p><b>Fecha:</b> {pesada.fecha}</p>
          <p><b>Peso neto:</b> {pesada.peso_neto} kg</p>
        </div>
      )}


      {/* ================= TABLA ================= */}
      {pesada && (
        <>
          {/* HEADER (solo una vez) */}
          <div className="fila-header">
            <span>Material</span>
            <span>Porcentaje %</span>
            <span>Kilos</span>
            <span></span>
          </div>

          {/* FILAS */}
          {materiales.map((m, index) => (
            <div key={index} className="fila">

              <select
                value={m.id}
                onChange={(e) => actualizar(index, "id", e.target.value)}
              >
                <option value="">Seleccione material</option>
                {materialesDB.map(mat => (
                  <option
                    key={mat.id_materiales_descarga}
                    value={mat.id_materiales_descarga}
                  >
                    {mat.nombre}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="%"
                value={m.porcentaje}
                onChange={(e) =>
                  actualizar(index, "porcentaje", Number(e.target.value))
                }
              />

              <input type="number" value={m.kg} disabled />

              <button onClick={() => eliminarFila(index)}>X</button>

            </div>
          ))}
        </>
      )}

      {pesada && (
        <>
          <div className="fila-add">
            <button className="btn-add" onClick={agregarFila}>
              + Agregar material
            </button>
          </div>

          <p><b>Total %:</b> {totalPorcentaje}</p>

          <textarea
            placeholder="Comentarios"
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
          />

          <button className="btn-save" onClick={guardar}>
            Guardar descarga
          </button>
        </>
      )
      }
    </div>
  );
}