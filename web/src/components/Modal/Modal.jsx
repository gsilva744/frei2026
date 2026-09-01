import "./modal.css";

/* Modal simples reutilizavel */
function Modal({ titulo, onFechar, children }) {
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div className="modal-caixa" onClick={(evento) => evento.stopPropagation()}>
        <button className="modal-fechar" onClick={onFechar} aria-label="Fechar">
          ✕
        </button>
        <h3 className="modal-titulo">{titulo}</h3>
        {children}
      </div>
    </div>
  );
}

export default Modal;
