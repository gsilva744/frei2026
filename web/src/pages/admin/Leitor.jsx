import AreaRestrita from "../../components/Acesso/Acesso";
import AdminTopo from "../../components/AdminTopo/AdminTopo";
import LeitorQr from "../../components/LeitorQr/LeitorQr";
import "../../css/admin.css";

function PainelLeitor({ sair }) {
  return (
    <div className="admin-pagina">
      <AdminTopo legenda="Leitor de Presença · 6ª Feira das Profissões 2026" sair={sair} />

      <div className="container">
        <div className="admin-painel">
          <div className="admin-painel-topo">
            <h2>Leitor de QR Code por turma</h2>
          </div>
          <LeitorQr />
        </div>
      </div>
    </div>
  );
}

function LeitorPage() {
  return (
    <AreaRestrita
      titulo="Leitor de Presença"
      descricao="Acesso restrito à equipe da feira. Faça login para continuar."
      papeisPermitidos={["admin", "leitor"]}
    >
      {({ sair }) => <PainelLeitor sair={sair} />}
    </AreaRestrita>
  );
}

export default LeitorPage;
