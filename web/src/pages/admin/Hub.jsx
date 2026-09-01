import { Link } from "@tanstack/react-router";
import AreaRestrita from "../../components/Acesso/Acesso";
import AdminTopo from "../../components/AdminTopo/AdminTopo";
import { useVisitantes } from "../../utils/VisitantesContext";
import "../../css/admin.css";

const cartoes = [
  {
    id: "dashboard",
    to: "/admin/dashboard",
    titulo: "Dashboard",
    descricao: "Visão geral analítica: inscritos, presenças por setor, rankings de cursos e canais.",
    papeis: ["admin"],
  },
  {
    id: "credenciamento",
    to: "/admin/credenciamento",
    titulo: "Credenciamento",
    descricao: "Liste, cadastre, edite e credencie visitantes no local, com crachá e QR Code.",
    papeis: ["admin", "credenciamento"],
  },
  {
    id: "leitor",
    to: "/admin/leitor",
    titulo: "Leitor de Presença",
    descricao: "Leia o QR Code dos visitantes para registrar presença por turma/setor.",
    papeis: ["admin", "leitor"],
  },
];

const nomeDoPapel = {
  admin: "administrador",
  credenciamento: "credenciamento",
  leitor: "leitor",
};

function PainelHub({ sair, administrador }) {
  const { visitantes, presencas } = useVisitantes();
  const cartoesVisiveis = cartoes.filter((cartao) => cartao.papeis.includes(administrador.papel));
  // Quem é só "leitor" não tem permissão para listar visitantes (nem precisa) —
  // mostrar "0 inscritos" seria enganoso, então o card nem aparece para esse papel.
  const podeVerInscritos = administrador.papel !== "leitor";

  return (
    <div className="admin-pagina">
      <AdminTopo legenda="Painel administrativo · 6ª Feira das Profissões 2026" sair={sair} mostrarVoltar={false} />

      <div className="container">
        <div className="admin-resumo">
          {podeVerInscritos && (
            <div className="admin-resumo-card">
              <span className="admin-resumo-numero">{visitantes.length}</span>
              <span className="admin-resumo-rotulo">Visitantes inscritos</span>
            </div>
          )}
          <div className="admin-resumo-card">
            <span className="admin-resumo-numero">{presencas.length}</span>
            <span className="admin-resumo-rotulo">Presenças registradas</span>
          </div>
          <div className="admin-resumo-card">
            <span className="admin-resumo-numero">{administrador.nome}</span>
            <span className="admin-resumo-rotulo">
              Logado como {nomeDoPapel[administrador.papel] ?? administrador.papel}
            </span>
          </div>
        </div>

        <div className="admin-hub-grade">
          {cartoesVisiveis.map((cartao) => (
            <Link key={cartao.id} to={cartao.to} className="admin-hub-card">
              <h3>{cartao.titulo}</h3>
              <p>{cartao.descricao}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hub() {
  return (
    <AreaRestrita
      titulo="Painel Administrativo"
      descricao="Acesso restrito à equipe da feira. Faça login para continuar."
      papeisPermitidos={["admin", "credenciamento", "leitor"]}
    >
      {({ sair, administrador }) => <PainelHub sair={sair} administrador={administrador} />}
    </AreaRestrita>
  );
}

export default Hub;
