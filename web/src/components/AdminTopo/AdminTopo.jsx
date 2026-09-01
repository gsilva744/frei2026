import { Link } from "@tanstack/react-router";
import logoFeira from "../../assets/logoFrei.png";

/* Cabeçalho compartilhado pelas páginas da área restrita (hub, dashboard,
 * credenciamento, leitor). `mostrarVoltar` esconde o link "Painel" no próprio hub. */
function AdminTopo({ legenda, sair, mostrarVoltar = true }) {
  return (
    <header className="admin-topo">
      <div className="container admin-topo-conteudo">
        <div className="admin-topo-marca">
          <img src={logoFeira} alt="Logo da 6ª Feira das Profissões" />
          <div>
            <strong>Instituto Social Nossa Senhora de Fátima</strong>
            <span className="admin-topo-legenda">{legenda}</span>
          </div>
        </div>
        <div className="admin-topo-acoes">
          {mostrarVoltar && (
            <Link to="/admin" className="botao-amarelo">
              ← Painel
            </Link>
          )}
          <button className="acesso-sair" onClick={sair}>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminTopo;
