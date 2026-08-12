import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import logoFeira from "../../assets/logoFrei.png";
import "./acesso.css";

const contas = {
  admin: {
    rotulo: "Administração",
    usuarios: [{ usuario: "admin", senha: "123456" }],
  },
  credenciamento: {
    rotulo: "Credenciamento",
    usuarios: [
      { usuario: "credenciamento", senha: "feira2026" },
      { usuario: "admin", senha: "123456" },
    ],
  },
};

function chaveSessao(perfil) {
  return `feira-acesso-${perfil}`;
}

function AreaRestrita({ perfil, titulo, descricao, children }) {
  const [liberado, setLiberado] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    try {
      setLiberado(sessionStorage.getItem(chaveSessao(perfil)) === "1");
    } catch {
      setLiberado(false);
    }
    setPronto(true);
  }, [perfil]);

  function entrar(evento) {
    evento.preventDefault();
    const valido = contas[perfil].usuarios.some(
      (conta) => conta.usuario === usuario.trim() && conta.senha === senha,
    );
    if (!valido) {
      setErro("Usuário ou senha inválidos.");
      return;
    }
    try {
      sessionStorage.setItem(chaveSessao(perfil), "1");
    } catch {
      /* sessão não persistida */
    }
    setErro("");
    setSenha("");
    setLiberado(true);
  }

  function sair() {
    try {
      sessionStorage.removeItem(chaveSessao(perfil));
    } catch {
      /* nada a limpar */
    }
    setLiberado(false);
  }

  if (!pronto) return null;

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

          <button type="submit" className="botao-azul acesso-botao">
            Entrar
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
