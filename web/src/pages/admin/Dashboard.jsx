import AreaRestrita from "../../components/Acesso/Acesso";
import AdminTopo from "../../components/AdminTopo/AdminTopo";
import Dashboard from "../../components/Dashboard/Dashboard";
import "../../css/admin.css";

function PainelDashboard({ sair }) {
  return (
    <div className="admin-pagina">
      <AdminTopo legenda="Dashboard · 6ª Feira das Profissões 2026" sair={sair} />

      <div className="container">
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

function DashboardPage() {
  return (
    <AreaRestrita
      titulo="Dashboard"
      descricao="Acesso exclusivo da administração. Faça login para continuar."
      papeisPermitidos={["admin"]}
    >
      {({ sair }) => <PainelDashboard sair={sair} />}
    </AreaRestrita>
  );
}

export default DashboardPage;
