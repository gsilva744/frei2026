import "./modal.css";

/* Modal simples reutilizavel. `largo` amplia a caixa para conteúdo mais denso
 * (formulários, grades de crachás) sem afetar o tamanho padrão dos demais usos. */
function Modal({ titulo, onFechar, largo = false, children }) {
  return (
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className={largo ? "modal-caixa modal-caixa-larga" : "modal-caixa"}
        onClick={(evento) => evento.stopPropagation()}
      >
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
