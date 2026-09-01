import { useState } from "react";
import { toast } from "sonner";
import AreaRestrita from "../../components/Acesso/Acesso";
import AdminTopo from "../../components/AdminTopo/AdminTopo";
import Modal from "../../components/Modal/Modal";
import Formulario from "../../components/Formulario/Formulario";
import QRCodeVisitante from "../../components/QRCode/QRCodeVisitante";
import { useVisitantes } from "../../utils/VisitantesContext";
import { abrirJanelaImpressao, compartilharCredencial } from "../../utils/impressao";
import "../../css/admin.css";
import "../../css/credenciamento.css";

function PainelCredenciamento({ sair, administrador }) {
  const {
    visitantes,
    presencas,
    bancoConectado,
    adicionarVisitante,
    atualizarVisitante,
    removerVisitante,
    fazerCheckin,
  } = useVisitantes();
  const podeExcluir = administrador?.papel === "admin";

  const [busca, setBusca] = useState("");
  const [modalNovo, setModalNovo] = useState(false);
  const [visitanteQrCode, setVisitanteQrCode] = useState(null);
  const [visitanteEdicao, setVisitanteEdicao] = useState(null);
  const [visitanteExclusao, setVisitanteExclusao] = useState(null);
  const [visitanteCheckin, setVisitanteCheckin] = useState(null);
  const [codigoCheckin, setCodigoCheckin] = useState("");
  const [erroCheckin, setErroCheckin] = useState("");
  const [enviandoCheckin, setEnviandoCheckin] = useState(false);
  const [erroOperacao, setErroOperacao] = useState("");

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

  async function salvarEdicao(evento) {
    evento.preventDefault();
    try {
      await atualizarVisitante(visitanteEdicao.id, visitanteEdicao);
      setVisitanteEdicao(null);
    } catch (erro) {
      setErroOperacao(erro.message || "Não foi possível atualizar o visitante no banco.");
    }
  }

  function alterarCampoEdicao(evento) {
    const { name, value } = evento.target;

    if (name === "vinculo") {
      setVisitanteEdicao((anterior) => ({
        ...anterior,
        vinculo: value,
        participaComoColaborador:
          value === "Aluno atual" ? Boolean(anterior.participaComoColaborador) : false,
      }));
      return;
    }

    setVisitanteEdicao((anterior) => ({ ...anterior, [name]: value }));
  }

  async function confirmarExclusao() {
    try {
      await removerVisitante(visitanteExclusao.id);
      setVisitanteExclusao(null);
    } catch (erro) {
      setErroOperacao(erro.message || "Não foi possível excluir o visitante do banco.");
    }
  }

  function abrirCheckin(visitante) {
    setVisitanteCheckin(visitante);
    setCodigoCheckin("");
    setErroCheckin("");
  }

  async function confirmarCheckin(evento) {
    evento.preventDefault();
    const codigo = codigoCheckin.trim();
    if (!codigo) {
      setErroCheckin("Informe o código do QR Code.");
      return;
    }

    setErroCheckin("");
    setEnviandoCheckin(true);
    try {
      await fazerCheckin(visitanteCheckin.id, codigo);
      toast.success(`Check-in confirmado para ${visitanteCheckin.nome}.`);
      setVisitanteCheckin(null);
    } catch (erro) {
      const mensagem = erro.message || "Não foi possível confirmar o check-in.";
      setErroCheckin(mensagem);
      toast.error(mensagem);
    } finally {
      setEnviandoCheckin(false);
    }
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
      <AdminTopo legenda="Credenciamento · 6ª Feira das Profissões 2026" sair={sair} />

      <div className="container">
        <p className={bancoConectado ? "admin-banco-status conectado" : "admin-banco-status"}>
          {bancoConectado
            ? "Banco de dados conectado: novos cadastros e presenças serão sincronizados."
            : "Banco de dados não confirmado: verifique a conexão com a API antes de iniciar o credenciamento."}
        </p>
        {erroOperacao && <p className="formulario-erro">{erroOperacao}</p>}

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

        <div className="admin-painel">
          <div className="admin-painel-topo">
            <h2>Lista de visitantes</h2>
            <div className="admin-painel-topo-acoes">
              <input
                className="admin-busca"
                placeholder="Buscar por nome, e-mail, CPF, telefone ou curso"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
              <button className="botao-azul" onClick={() => setModalNovo(true)}>
                + Novo
              </button>
            </div>
          </div>

          <div className="admin-tabela-area">
            {visitantesFiltrados.length === 0 ? (
              <p className="admin-vazio">
                {visitantes.length === 0
                  ? 'Nenhum visitante cadastrado ainda. Use o botão "Novo".'
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
                    <th>Colaborador</th>
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
                      <td>{visitante.participaComoColaborador ? "Sim" : "Não"}</td>
                      <td>
                        <div className="admin-acoes">
                          <button className="admin-acao admin-acao-checkin" onClick={() => abrirCheckin(visitante)}>
                            Checkin
                          </button>
                          {visitante.codigoQr && (
                            <button
                              className="admin-acao admin-acao-qr"
                              onClick={() => setVisitanteQrCode(visitante)}
                            >
                              QR Code
                            </button>
                          )}
                          <button className="admin-acao" onClick={() => setVisitanteEdicao(visitante)}>
                            Editar
                          </button>
                          {podeExcluir && (
                            <button
                              className="admin-acao admin-acao-excluir"
                              onClick={() => setVisitanteExclusao(visitante)}
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {modalNovo && (
        <Modal titulo="Novo credenciamento" largo onFechar={() => setModalNovo(false)}>
          <Formulario
            onCadastrar={adicionarVisitante}
            titulo="Credenciamento"
            descricao="Cadastre o visitante. O código do QR Code é vinculado depois, no check-in."
            mostrarQrCode={false}
          />
        </Modal>
      )}

      {visitanteCheckin && (
        <Modal titulo="Check-in do visitante" onFechar={() => setVisitanteCheckin(null)}>
          <p className="admin-modal-legenda">
            Informe o código do QR Code de <strong>{visitanteCheckin.nome}</strong> para
            vincular a credencial e registrar a chegada.
          </p>
          <form onSubmit={confirmarCheckin}>
            <div className="formulario-campo">
              <label htmlFor="checkin-codigo">Código do QR Code</label>
              <input
                id="checkin-codigo"
                value={codigoCheckin}
                onChange={(evento) => setCodigoCheckin(evento.target.value)}
                autoFocus
                required
              />
            </div>
            {erroCheckin && <p className="formulario-erro">{erroCheckin}</p>}
            <div className="admin-modal-botoes">
              <button type="submit" className="botao-azul" disabled={enviandoCheckin}>
                {enviandoCheckin ? "Confirmando..." : "Confirmar"}
              </button>
              <button type="button" className="admin-acao" onClick={() => setVisitanteCheckin(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

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
        <Modal titulo="Editar visitante" largo onFechar={() => setVisitanteEdicao(null)}>
          <form className="formulario-card" onSubmit={salvarEdicao}>
            <div className="formulario-grade">
              <div className="formulario-campo formulario-campo-largo">
                <label htmlFor="edicao-nome">Nome completo</label>
                <input
                  id="edicao-nome"
                  name="nome"
                  value={visitanteEdicao.nome}
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
                  value={visitanteEdicao.email}
                  onChange={alterarCampoEdicao}
                  required
                />
              </div>
              <div className="formulario-campo">
                <label htmlFor="edicao-telefone">Telefone</label>
                <input
                  id="edicao-telefone"
                  name="telefone"
                  value={visitanteEdicao.telefone}
                  onChange={alterarCampoEdicao}
                  required
                />
              </div>
              <div className="formulario-campo">
                <label htmlFor="edicao-cursoInteresse">Curso de interesse</label>
                <input
                  id="edicao-cursoInteresse"
                  name="cursoInteresse"
                  value={visitanteEdicao.cursoInteresse}
                  onChange={alterarCampoEdicao}
                  required
                />
              </div>
              <div className="formulario-campo">
                <label htmlFor="edicao-vinculo">Vínculo com o Instituto</label>
                <select
                  id="edicao-vinculo"
                  name="vinculo"
                  value={visitanteEdicao.vinculo}
                  onChange={alterarCampoEdicao}
                >
                  <option value="Aluno atual">Aluno atual</option>
                  <option value="Ex-aluno">Ex-aluno</option>
                  <option value="Nunca estudei">Nunca estudei</option>
                </select>
              </div>
              {visitanteEdicao.vinculo === "Aluno atual" && (
                <div className="formulario-campo">
                  <label htmlFor="edicao-colaborador">Participa como colaborador?</label>
                  <select
                    id="edicao-colaborador"
                    name="participaComoColaborador"
                    value={visitanteEdicao.participaComoColaborador ? "true" : "false"}
                    onChange={(evento) =>
                      setVisitanteEdicao((anterior) => ({
                        ...anterior,
                        participaComoColaborador: evento.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </div>
              )}
            </div>
            <div className="admin-modal-botoes">
              <button type="submit" className="botao-azul">
                Salvar
              </button>
              <button type="button" className="admin-acao" onClick={() => setVisitanteEdicao(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {visitanteExclusao && (
        <Modal titulo="Excluir visitante" onFechar={() => setVisitanteExclusao(null)}>
          <p className="admin-modal-legenda">
            Deseja realmente excluir <strong>{visitanteExclusao.nome}</strong>? As presenças registradas
            também serão removidas.
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

function CredenciamentoPage() {
  return (
    <AreaRestrita
      titulo="Credenciamento"
      descricao="Acesso restrito à equipe da feira. Faça login para continuar."
      papeisPermitidos={["admin", "credenciamento"]}
    >
      {({ sair, administrador }) => (
        <PainelCredenciamento sair={sair} administrador={administrador} />
      )}
    </AreaRestrita>
  );
}

export default CredenciamentoPage;
