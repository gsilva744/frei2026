import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import logoFeira from "../../assets/logoFrei.png";
import { entrar, sair as sairDaApi, sessaoAtual } from "../../services/apiFeira";
import "./acesso.css";

const EVENTO_SESSAO = "feira2026-sessao";

/* Área restrita da feira: exige um administrador logado (JWT) com um dos papéis em
 * `papeisPermitidos`. A sessão é lida do localStorage a cada carregamento — por isso o
 * login persiste entre recarregamentos da página, ao contrário do antigo Basic Auth por
 * sessionStorage, que exigia login a cada visita. */
function AreaRestrita({ titulo, descricao, papeisPermitidos = ["admin", "credenciamento"], children }) {
  const [sessao, setSessao] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    function atualizar() {
      setSessao(sessaoAtual());
      setCarregandoSessao(false);
    }
    atualizar();
    window.addEventListener(EVENTO_SESSAO, atualizar);
    return () => window.removeEventListener(EVENTO_SESSAO, atualizar);
  }, []);

  async function entrarNaArea(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErro("");

    try {
      await entrar(email.trim(), senha);
      setSenha("");
    } catch {
      setErro("E-mail ou senha inválidos.");
    } finally {
      setEnviando(false);
    }
  }

  function sair() {
    sairDaApi();
  }

  if (carregandoSessao) return null;

  const autorizado = sessao && papeisPermitidos.includes(sessao.administrador?.papel);

  if (!autorizado) {
    const semPermissao = sessao && !papeisPermitidos.includes(sessao.administrador?.papel);

    return (
      <div className="acesso-pagina">
        <form className="acesso-cartao" onSubmit={entrarNaArea}>
          <img src={logoFeira} alt="Logo da 6ª Feira das Profissões" />
          <h1>{titulo}</h1>
          <p>{descricao}</p>

          {semPermissao && (
            <p className="acesso-erro">
              Sua conta ({sessao.administrador.email}) não tem permissão para esta área.
            </p>
          )}

          <div className="formulario-campo">
            <label htmlFor="acesso-email">E-mail</label>
            <input
              id="acesso-email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="formulario-campo">
            <label htmlFor="acesso-senha">Senha</label>
            <input
              id="acesso-senha"
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {erro && <p className="acesso-erro">{erro}</p>}

          <button type="submit" className="botao-azul acesso-botao" disabled={enviando}>
            {enviando ? "Verificando..." : "Entrar"}
          </button>
          {semPermissao && (
            <button type="button" className="acesso-voltar" onClick={sair}>
              Sair desta conta
            </button>
          )}
          <Link to="/" className="acesso-voltar">
            Voltar ao site
          </Link>
        </form>
      </div>
    );
  }

  return children({ sair, administrador: sessao.administrador });
}

export default AreaRestrita;
