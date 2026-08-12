import { useState } from "react";
import { Link } from "@tanstack/react-router";
import AreaRestrita from "../components/Acesso/Acesso";
import Modal from "../components/Modal/Modal";
import Formulario from "../components/Formulario/Formulario";
import QRCodeVisitante from "../components/QRCode/QRCodeVisitante";
import LeitorQr from "../components/LeitorQr/LeitorQr";
import Crachas from "../components/Crachas/Crachas";
import logoFeira from "../assets/logoFrei.png";
import { useVisitantes } from "../utils/VisitantesContext";
import { canaisDivulgacao, generos, vinculos } from "../data/setores";
import { cursos } from "../data/cursos";
import { abrirJanelaImpressao, compartilharCredencial } from "../utils/impressao";
import "../css/admin.css";
import '../css/credenciamento.css'

const abas = [
  { id: "visitantes", nome: "Visitantes" },
  { id: "credenciamento", nome: "Credenciamento" },
  { id: "leitor", nome: "Leitor QR" },
  { id: "impressao", nome: "Impressão" },
];

const nomesDeCursos = Array.from(new Set(cursos.map((curso) => curso.nome)));

function PainelCredenciamento({ sair }) {
  const { visitantes, presencas, adicionarVisitante, atualizarVisitante, removerVisitante } =
    useVisitantes();
  const [abaAtiva, setAbaAtiva] = useState("visitantes");
  const [busca, setBusca] = useState("");
  const [visitanteQrCode, setVisitanteQrCode] = useState(null);
  const [visitanteEdicao, setVisitanteEdicao] = useState(null);
  const [visitanteExclusao, setVisitanteExclusao] = useState(null);

  const termos = busca.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visitantesFiltrados = visitantes.filter((visitante) => {
    const alvo = [
      visitante.nome,
      visitante.email,
      visitante.cpf,
      visitante.telefone,
      visitante.cursoInteresse,
      visitante.vinculo,
      visitante.genero,
      visitante.codigoQr,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return termos.every((termo) => alvo.includes(termo));
  });

  function salvarEdicao(evento) {
    evento.preventDefault();
    atualizarVisitante(visitanteEdicao.id, visitanteEdicao);
    setVisitanteEdicao(null);
  }

  function alterarCampoEdicao(evento) {
    const { name, value } = evento.target;
    setVisitanteEdicao((anterior) => ({ ...anterior, [name]: value }));
  }

  function confirmarExclusao() {
    removerVisitante(visitanteExclusao.id);
    setVisitanteExclusao(null);
  }

  function imprimirCracha(visitante) {
    const area = document.getElementById(`cracha-modal-${visitante.id}`);
    if (!area) return;
    abrirJanelaImpressao({
      titulo: `Crachá · ${visitante.nome}`,
      conteudo: `<div class="folha-grade">${area.innerHTML}</div>`,
    });
  }

  return (
    <div className="admin-pagina">
      <header className="admin-topo">
        <div className="container admin-topo-conteudo">
          <div className="admin-topo-marca">
            <img src={logoFeira} alt="Logo da 6ª Feira das Profissões" />
            <div>
              <strong>Instituto Social Nossa Senhora de Fátima</strong>
              <span className="admin-topo-legenda">
                Credenciamento · 6ª Feira das Profissões 2026
              </span>
            </div>
          </div>
          <div className="admin-topo-acoes">
            <Link to="/" className="botao-amarelo">
              Voltar ao site
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
            <span className="admin-resumo-numero">{visitantesFiltrados.length}</span>
            <span className="admin-resumo-rotulo">Resultados da busca</span>
          </div>
        </div>

        <nav className="admin-abas">
          {abas.map((aba) => (
            <button
              key={aba.id}
              className={abaAtiva === aba.id ? "admin-aba admin-aba-ativa" : "admin-aba"}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.nome}
            </button>
          ))}
        </nav>

        {abaAtiva === "visitantes" && (
          <div className="admin-painel">
            <div className="admin-painel-topo">
              <h2>Lista de visitantes</h2>
              <input
                className="admin-busca"
                placeholder="Buscar por nome, e-mail, CPF, telefone ou curso"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </div>

            <div className="admin-tabela-area">
              {visitantesFiltrados.length === 0 ? (
                <p className="admin-vazio">
                  {visitantes.length === 0
                    ? "Nenhum visitante cadastrado ainda. Use a aba Credenciamento."
                    : "Nenhum visitante encontrado para essa busca."}
                </p>
              ) : (
                <table className="admin-tabela">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Contato</th>
                      <th>CPF</th>
                      <th>Curso de interesse</th>
                      <th>Gênero</th>
                      <th>Vínculo</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitantesFiltrados.map((visitante) => (
                      <tr key={visitante.id}>
                        <td>
                          <strong>{visitante.nome}</strong>
                          <br />
                          <small>{visitante.comoSoube}</small>
                        </td>
                        <td>
                          {visitante.email}
                          <br />
                          <small>{visitante.telefone}</small>
                        </td>
                        <td>{visitante.cpf}</td>
                        <td>{visitante.cursoInteresse}</td>
                        <td>{visitante.genero}</td>
                        <td>{visitante.vinculo}</td>
                        <td>
                          <div className="admin-acoes">
                            <button
                              className="admin-acao admin-acao-qr"
                              onClick={() => setVisitanteQrCode(visitante)}
                            >
                              QR Code
                            </button>
                            <button
                              className="admin-acao"
                              onClick={() => setVisitanteEdicao(visitante)}
                            >
                              Editar
                            </button>
                            <button
                              className="admin-acao admin-acao-excluir"
                              onClick={() => setVisitanteExclusao(visitante)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {abaAtiva === "credenciamento" && (
          <div className="admin-painel">
            <div className="admin-painel-topo">
              <h2>Credenciamento no local</h2>
            </div>
            <div className="admin-credenciamento">
              <Formulario
                onCadastrar={adicionarVisitante}
                titulo="Credenciamento"
                descricao="Cadastre o visitante e gere a credencial com QR Code"
              />
            </div>
          </div>
        )}

        {abaAtiva === "leitor" && (
          <div className="admin-painel">
            <div className="admin-painel-topo">
              <h2>Leitor de QR Code por turma</h2>
            </div>
            <LeitorQr />
          </div>
        )}

        {abaAtiva === "impressao" && (
          <div className="admin-painel">
            <div className="admin-painel-topo">
              <h2>Impressão de crachás</h2>
            </div>
            <Crachas />
          </div>
        )}
      </div>

      {visitanteQrCode && (
        <Modal titulo="QR Code do visitante" onFechar={() => setVisitanteQrCode(null)}>
          <div id={`cracha-modal-${visitanteQrCode.id}`}>
            <div className="cracha">
              <div className="cracha-topo">
                <strong>6ª Feira das Profissões 2026</strong>
                <span>Instituto Social Nossa Senhora de Fátima</span>
              </div>
              <QRCodeVisitante codigo={visitanteQrCode.codigoQr} tamanho={150} />
              <p className="cracha-nome">{visitanteQrCode.nome}</p>
              <p className="cracha-linha">{visitanteQrCode.cursoInteresse}</p>
              <p className="cracha-codigo">{visitanteQrCode.codigoQr}</p>
            </div>
          </div>
          <div className="admin-modal-botoes">
            <button className="botao-azul" onClick={() => imprimirCracha(visitanteQrCode)}>
              Imprimir em PDF
            </button>
            <button
              className="admin-acao"
              onClick={() =>
                compartilharCredencial({
                  titulo: "Credencial Feira de Profissões 2026",
                  texto: `${visitanteQrCode.nome} · Código ${visitanteQrCode.codigoQr}`,
                })
              }
            >
              Compartilhar
            </button>
          </div>
        </Modal>
      )}

      {visitanteEdicao && (
        <Modal titulo="Editar visitante" onFechar={() => setVisitanteEdicao(null)}>
          <form onSubmit={salvarEdicao}>
            <div className="formulario-campo">
              <label htmlFor="edicao-nome">Nome</label>
              <input
                id="edicao-nome"
                name="nome"
                value={visitanteEdicao.nome || ""}
                onChange={alterarCampoEdicao}
                required
              />
            </div>
            <div className="formulario-campo">
              <label htmlFor="edicao-email">E-mail</label>
              <input
                id="edicao-email"
                name="email"
                type="email"
                value={visitanteEdicao.email || ""}
                onChange={alterarCampoEdicao}
              />
            </div>
            <div className="formulario-campo">
              <label htmlFor="edicao-telefone">Telefone</label>
              <input
                id="edicao-telefone"
                name="telefone"
                value={visitanteEdicao.telefone || ""}
                onChange={alterarCampoEdicao}
              />
            </div>
            <div className="formulario-campo">
              <label htmlFor="edicao-cpf">CPF</label>
              <input
                id="edicao-cpf"
                name="cpf"
                value={visitanteEdicao.cpf || ""}
                onChange={alterarCampoEdicao}
              />
            </div>
            <div className="formulario-campo">
              <label htmlFor="edicao-curso">Curso de interesse</label>
              <select
                id="edicao-curso"
                name="cursoInteresse"
                value={visitanteEdicao.cursoInteresse || ""}
                onChange={alterarCampoEdicao}
              >
                <option value="">Selecione</option>
                {nomesDeCursos.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="formulario-campo">
              <label htmlFor="edicao-genero">Gênero</label>
              <select
                id="edicao-genero"
                name="genero"
                value={visitanteEdicao.genero || ""}
                onChange={alterarCampoEdicao}
              >
                <option value="">Selecione</option>
                {generos.map((genero) => (
                  <option key={genero} value={genero}>
                    {genero}
                  </option>
                ))}
              </select>
            </div>
            <div className="formulario-campo">
              <label htmlFor="edicao-vinculo">Vínculo</label>
              <select
                id="edicao-vinculo"
                name="vinculo"
                value={visitanteEdicao.vinculo || ""}
                onChange={alterarCampoEdicao}
              >
                <option value="">Selecione</option>
                {vinculos.map((vinculo) => (
                  <option key={vinculo} value={vinculo}>
                    {vinculo}
                  </option>
                ))}
              </select>
            </div>
            <div className="formulario-campo">
              <label htmlFor="edicao-canal">Como soube da feira</label>
              <select
                id="edicao-canal"
                name="comoSoube"
                value={visitanteEdicao.comoSoube || ""}
                onChange={alterarCampoEdicao}
              >
                <option value="">Selecione</option>
                {canaisDivulgacao.map((canal) => (
                  <option key={canal} value={canal}>
                    {canal}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-modal-botoes">
              <button type="submit" className="botao-azul">
                Salvar alterações
              </button>
            </div>
          </form>
        </Modal>
      )}

      {visitanteExclusao && (
        <Modal titulo="Excluir visitante" onFechar={() => setVisitanteExclusao(null)}>
          <p className="admin-modal-legenda">
            Deseja realmente excluir <strong>{visitanteExclusao.nome}</strong>? As presenças
            registradas também serão removidas.
          </p>
          <div className="admin-modal-botoes">
            <button className="admin-botao-excluir" onClick={confirmarExclusao}>
              Excluir
            </button>
            <button className="admin-acao" onClick={() => setVisitanteExclusao(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Credenciamento() {
  return (
    <AreaRestrita
      perfil="credenciamento"
      titulo="Área de Credenciamento"
      descricao="Acesso restrito à equipe da feira. Informe suas credenciais."
    >
      {({ sair }) => <PainelCredenciamento sair={sair} />}
    </AreaRestrita>
  );
}

export default Credenciamento;
