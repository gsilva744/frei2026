import { useState } from "react";
import { Link } from "@tanstack/react-router";
import logoFeira from "../../assets/logoFrei.png";
import { guardarAutorizacaoDoBanco, removerAutorizacaoDoBanco } from "../../services/apiFeira";
import "./acesso.css";

function AreaRestrita({ titulo, descricao, children }) {
  const [liberado, setLiberado] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErro("");

    try {
      const credenciais = window.btoa(`${usuario.trim()}:${senha}`);
      const resposta = await fetch(window.location.pathname, {
        headers: {
          Authorization: `Basic ${credenciais}`,
          "X-Restricted-Area-Check": "1",
        },
        cache: "no-store",
      });

      if (!resposta.ok) {
        setErro(
          resposta.status === 503
            ? "O acesso restrito ainda não foi configurado no servidor."
            : "Usuário ou senha inválidos.",
        );
        return;
      }

      // A mesma autorização é enviada apenas às rotas protegidas da API do banco
      // durante esta sessão. Ela é apagada ao sair e ao fechar o navegador.
      guardarAutorizacaoDoBanco(usuario.trim(), senha);
      setSenha("");
      setLiberado(true);
    } catch {
      setErro("Não foi possível validar o acesso. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function sair() {
    removerAutorizacaoDoBanco();
    setUsuario("");
    setSenha("");
    setLiberado(false);
  }

  if (!liberado) {
    return (
      <div className="acesso-pagina">
        <form className="acesso-cartao" onSubmit={entrar}>
          <img src={logoFeira} alt="Logo da 6ª Feira das Profissões" />
          <h1>{titulo}</h1>
          <p>{descricao}</p>

          <div className="formulario-campo">
            <label htmlFor="acesso-usuario">Usuário</label>
            <input
              id="acesso-usuario"
              value={usuario}
              onChange={(evento) => setUsuario(evento.target.value)}
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
          <Link to="/" className="acesso-voltar">
            Voltar ao site
          </Link>
        </form>
      </div>
    );
  }

  return children({ sair });
}

export default AreaRestrita;
