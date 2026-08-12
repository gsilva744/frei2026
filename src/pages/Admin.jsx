import { Link } from "@tanstack/react-router";
import AreaRestrita from "../components/Acesso/Acesso";
import Dashboard from "../components/Dashboard/Dashboard";
import logoFeira from "../assets/logoFrei.png";
import { useVisitantes } from "../utils/VisitantesContext";
import "../css/admin.css";

function PainelAdmin({ sair }) {
  const { visitantes, presencas } = useVisitantes();
  const totalCursos = new Set(visitantes.map((visitante) => visitante.cursoInteresse)).size;

  return (
    <div className="admin-pagina">
      <header className="admin-topo">
        <div className="container admin-topo-conteudo">
          <div className="admin-topo-marca">
            <img src={logoFeira} alt="Logo da 6ª Feira das Profissões" />
            <div>
              <strong>Instituto Social Nossa Senhora de Fátima</strong>
              <span className="admin-topo-legenda">
                Painel administrativo · 6ª Feira das Profissões 2026
              </span>
            </div>
          </div>
          <div className="admin-topo-acoes">
            <Link to="/credenciamento" className="botao-amarelo">
              Área de credenciamento
            </Link>
            <button className="acesso-sair" onClick={sair}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="admin-resumo">
          <div className="admin-resumo-card">
            <span className="admin-resumo-numero">{visitantes.length}</span>
            <span className="admin-resumo-rotulo">Visitantes inscritos</span>
          </div>
          <div className="admin-resumo-card">
            <span className="admin-resumo-numero">{presencas.length}</span>
            <span className="admin-resumo-rotulo">Presenças registradas</span>
          </div>
          <div className="admin-resumo-card">
            <span className="admin-resumo-numero">{totalCursos}</span>
            <span className="admin-resumo-rotulo">Cursos procurados</span>
          </div>
        </div>

        <div className="admin-painel">
          <div className="admin-painel-topo">
            <h2>Visão geral da feira</h2>
          </div>
          <Dashboard />
        </div>
      </div>
    </div>
  );
}

function Admin() {
  return (
    <AreaRestrita
      titulo="Painel Administrativo"
      descricao="Acesso exclusivo da administração. Faça login para continuar."
    >
      {({ sair }) => <PainelAdmin sair={sair} />}
    </AreaRestrita>
  );
}

export default Admin;
