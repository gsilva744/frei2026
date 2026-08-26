import "./hero.css";

function Hero() {
  function irParaSecao(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="hero" id="inicio">
      <div className="container hero-conteudo">
        <span className="hero-selo">19 de setembro de 2026 · 10h às 16h</span>
        <h1>
          Descubra sua profissão do futuro na <span>6ª Feira das Profissões!!</span>
        </h1>
        <p>
          Um dia para você conhecer todo o Instituto, conversar com professores, alunos e
          dar o primeiro passo para a sua carreira.
        </p>
        <div className="hero-botoes">
          <button className="botao-amarelo" onClick={() => irParaSecao("inscricao")}>
            Quero participar
          </button>
          <button className="hero-botao-claro" onClick={() => irParaSecao("sobre")}>
            Saiba mais
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
