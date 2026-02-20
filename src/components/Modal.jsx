// components/Modal.jsx
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>

        {children}

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
