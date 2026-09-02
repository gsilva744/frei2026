import { useEffect, useState } from "react";
import logo1 from "../../assets/logoFrei.png";
import logo2 from "../../assets/logo2.png";
import "./header.css";

const itensMenu = [
  { id: "inicio", nome: "Início" },
  { id: "programacao", nome: "Ver Programação" },
  { id: "local", nome: "Local" },
  { id: "cursos", nome: "Cursos" },
  { id: "inscricao", nome: "Inscrição" },
  { id: "contato", nome: "Contato" },
];

function Header({ onAbrirAreaRestrita }) {
  const [reduzido, setReduzido] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    function aoRolar() {
      setReduzido(window.scrollY > 60);
    }
    window.addEventListener("scroll", aoRolar);
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  function irParaSecao(id) {
    setMenuAberto(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className={reduzido ? "header header-reduzido" : "header"}>
      <div className="header-conteudo">
        <a className="header-logo" href="#inicio">
          <img src={logo1} alt="Logo da 6ª Feira das Profissões" className="logo1"/>
          <img src={logo2} alt="Logo da 6ª Feira das Profissões" className="logo2"/>
        </a>

        <nav className={menuAberto ? "header-menu header-menu-aberto" : "header-menu"}>
          {itensMenu.map((item) => (
            <button key={item.id} onClick={() => irParaSecao(item.id)}>
              {item.nome}
            </button>
          ))}
          <button
            className="header-menu-area-restrita"
            onClick={() => {
              setMenuAberto(false);
              onAbrirAreaRestrita();
            }}
          >
            Área Restrita
          </button>
        </nav>

        <div className="header-acao">
          <button className="botao-amarelo" onClick={onAbrirAreaRestrita}>
            Área Restrita
          </button>
        </div>

        <button
          className="header-botao-menu"
          aria-label="Abrir menu"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          ☰
        </button>
      </div>
    </header>
  );
}

export default Header;
