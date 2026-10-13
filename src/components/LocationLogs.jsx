import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LocationLogs.css';

const API = `${import.meta.env.VITE_API_BASE_URL}/location-logs`;

// Distancia mínima (en metros) para considerar que el tracker se movió.
// Mantenerla igual a UMBRAL_METROS del reporte por email.
const UMBRAL_METROS = 100;

function authHeaders() {
  try {
    const u = JSON.parse(localStorage.getItem('user'));
    return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
  } catch {
    return {};
  }
}

async function api(path = '', options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  });
  let data = null;
  try { data = await res.json(); } catch { /* sin JSON */ }
  if (!res.ok) throw new Error(data?.error || data?.message || `Error ${res.status}`);
  return data;
}

// ---------- Cálculo de días quieto (misma lógica que el reporte por email) ----------

// Distancia en metros entre dos coordenadas (haversine)
function distanciaM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const normalizar = (s) => String(s ?? '').trim().toLowerCase();

// true = se movió | false = misma ubicación | null = no comparable
function cambioUbicacion(a, b) {
  const ambosConCoords = a.lat != null && a.lng != null && b.lat != null && b.lng != null;
  if (ambosConCoords) {
    return distanciaM(Number(a.lat), Number(a.lng), Number(b.lat), Number(b.lng)) > UMBRAL_METROS;
  }
  if (normalizar(a.place) || normalizar(b.place)) {
    return normalizar(a.place) !== normalizar(b.place);
  }
  return null;
}

// Recibe los logs del tracker de más nuevo a más viejo
function calcularQuieto(logsDesc) {
  const ultimo = logsDesc[0];
  if (!ultimo) return null;

  let desde = ultimo;
  for (const l of logsDesc.slice(1)) {
    if (cambioUbicacion(ultimo, l) !== false) break; // se movió o no es comparable
    desde = l;
  }
  const dias = Math.floor((Date.now() - new Date(desde.recordedAt).getTime()) / 86400000);
  return { dias, desde: desde.recordedAt };
}

const fmtDia = (d) => (d ? new Date(d).toLocaleDateString('es-AR') : '-');
const fmtFecha = (d) => (d ? new Date(d).toLocaleString('es-AR') : '-');

export default function LocationLogs() {
  const navigate = useNavigate();
  const [trackers, setTrackers] = useState([]);
  const [logs, setLogs] = useState([]);        // logs de la tabla de abajo (con filtro)
  const [todosLogs, setTodosLogs] = useState([]); // historial completo, para el resumen
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  // Alta y edición de trackers
  const [nuevo, setNuevo] = useState({ codigo: '', caja: '' });
  const [editId, setEditId] = useState(null);
  const [cajaEdit, setCajaEdit] = useState('');

  const cargarTrackers = async () => {
    try {
      const d = await api('/trackers');
      setTrackers(Array.isArray(d) ? d : []);
    } catch (e) { setError(e.message); }
  };

  const cargarTodosLogs = async () => {
    try {
      const d = await api();
      setTodosLogs(Array.isArray(d) ? d : []);
    } catch (e) { setError(e.message); }
  };

  const cargarLogs = async () => {
    try {
      const q = filter ? `?trackerId=${encodeURIComponent(filter)}` : '';
      const d = await api(q);
      setLogs(Array.isArray(d) ? d : []);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { cargarTrackers(); cargarTodosLogs(); }, []);
  useEffect(() => { cargarLogs(); }, [filter]);

  // Una fila por tracker: última ubicación y días quieto
  const resumen = useMemo(() => {
    const filas = trackers.map((t) => {
      const desde = t.cajaDesde ?? t.caja_desde;
      const desdeMs = desde ? new Date(desde).getTime() : null;

      // Solo cuenta el historial posterior a que se asoció la caja actual
      const logsT = todosLogs
        .filter((l) => l.trackerId === t.codigo)
        .filter((l) => desdeMs == null || new Date(l.recordedAt).getTime() >= desdeMs)
        .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));

      return { t, ultimo: logsT[0] ?? null, quieto: calcularQuieto(logsT) };
    });

    // Los que llevan más días parados primero; los sin datos al final
    return filas.sort((a, b) => (b.quieto?.dias ?? -1) - (a.quieto?.dias ?? -1));
  }, [trackers, todosLogs]);

  const borrar = async (id) => {
    if (!window.confirm('¿Borrar este registro?')) return;
    try {
      await api(`/${id}`, { method: 'DELETE' });
      cargarLogs();
      cargarTodosLogs();
    } catch (e) { setError(e.message); }
  };

  const crearTracker = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/trackers', {
        method: 'POST',
        body: JSON.stringify({ codigo: nuevo.codigo, patente: nuevo.caja }),
      });
      setNuevo({ codigo: '', caja: '' });
      cargarTrackers();
    } catch (err) { setError(err.message); }
  };

  const empezarEdicion = (t) => {
    setEditId(t.id);
    setCajaEdit(t.patente || '');
  };

  const guardarCaja = async (t) => {
    const nueva = cajaEdit.trim().toUpperCase();
    if (nueva === (t.patente || '')) { setEditId(null); return; }
    if (!window.confirm('Al cambiar la caja, el contador de días quieto del tracker arranca de cero. ¿Continuar?')) return;
    setError('');
    try {
      await api(`/trackers/${t.id}`, { method: 'PUT', body: JSON.stringify({ patente: nueva }) });
      setEditId(null);
      cargarTrackers();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="ub-page">
      <header className="ub-header">
        <button className="ub-btn ub-btn--ghost" onClick={() => navigate('/')}>← Menú</button>
        <h1>Historial de ubicaciones</h1>
      </header>

      {error && <div className="ub-error">{error}</div>}

      <section className="ub-card">
        <h2>Trackers</h2>

        <form className="ub-toolbar" onSubmit={crearTracker}>
          <div className="ub-field">
            <label>Código del tracker</label>
            <input
              value={nuevo.codigo}
              onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value })}
              placeholder="Ej: T05"
              required
            />
          </div>
          <div className="ub-field">
            <label>Caja</label>
            <input
              value={nuevo.caja}
              onChange={(e) => setNuevo({ ...nuevo, caja: e.target.value })}
              placeholder="Ej: C-12 (opcional)"
            />
          </div>
          <button className="ub-btn" type="submit">Agregar tracker</button>
        </form>

        <div className="ub-table-wrap">
          <table className="ub-table">
            <thead>
              <tr>
                <th>Tracker</th>
                <th>Caja</th>
                <th>Asociado desde</th>
                <th>Días quieto</th>
                <th>Última ubicación</th>
                <th>Última carga</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {resumen.length === 0 && (
                <tr><td colSpan={7} className="ub-vacio">Todavía no hay trackers cargados</td></tr>
              )}
              {resumen.map(({ t, ultimo, quieto }) => (
                <tr key={t.id}>
                  <td>{t.codigo}</td>
                  <td>
                    {editId === t.id ? (
                      <input
                        value={cajaEdit}
                        onChange={(e) => setCajaEdit(e.target.value)}
                        placeholder="Sin caja"
                        autoFocus
                      />
                    ) : (
                      t.patente || <span className="ub-vacio">Sin caja</span>
                    )}
                  </td>
                  <td>{fmtDia(t.cajaDesde ?? t.caja_desde)}</td>
                  <td>
                    {quieto ? (
                      quieto.dias > 0 ? (
                        <>
                          <b>{quieto.dias} día(s)</b>
                          <br />
                          <small className="ub-vacio">desde {fmtDia(quieto.desde)}</small>
                        </>
                      ) : (
                        'Reciente'
                      )
                    ) : (
                      <span className="ub-vacio">Sin datos</span>
                    )}
                  </td>
                  <td>
                    {ultimo ? (
                      <>
                        {ultimo.place || '-'}
                        {ultimo.lat != null && (
                          <>
                            {' · '}
                            <a
                              href={`https://www.google.com/maps?q=${ultimo.lat},${ultimo.lng}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {ultimo.plusCode || 'Ver mapa'}
                            </a>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="ub-vacio">Sin ubicaciones</span>
                    )}
                  </td>
                  <td>{ultimo ? fmtFecha(ultimo.recordedAt) : '-'}</td>
                  <td>
                    {editId === t.id ? (
                      <>
                        <button className="ub-btn" onClick={() => guardarCaja(t)}>Guardar</button>{' '}
                        <button className="ub-btn ub-btn--ghost" onClick={() => setEditId(null)}>Cancelar</button>
                      </>
                    ) : (
                      <button className="ub-btn--icon" onClick={() => empezarEdicion(t)} title="Cambiar caja">✏️</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ub-card">
        <div className="ub-toolbar">
          <div className="ub-field">
            <label>Tracker</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todos</option>
              {trackers.map((t) => <option key={t.id} value={t.codigo}>{t.codigo}</option>)}
            </select>
          </div>
        </div>
        <div className="ub-table-wrap">
          <table className="ub-table">
            <thead>
              <tr><th>Fecha</th><th>Tracker</th><th>Lugar</th><th>Mapa</th><th>Nota</th><th>Cargó</th><th /></tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={7} className="ub-vacio">Todavía no hay ubicaciones cargadas</td></tr>
              )}
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{fmtFecha(l.recordedAt)}</td>
                  <td>{l.trackerId}</td>
                  <td>{l.place}</td>
                  <td>
                    {l.lat != null && (
                      <a href={`https://www.google.com/maps?q=${l.lat},${l.lng}`} target="_blank" rel="noreferrer">
                        {l.plusCode || 'Ver'}
                      </a>
                    )}
                  </td>
                  <td>{l.note}</td>
                  <td>{l.createdBy}</td>
                  <td><button className="ub-btn--icon" onClick={() => borrar(l.id)} title="Borrar">🗑</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}