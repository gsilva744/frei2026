import sobre1 from "../../assets/sobre-1.webp";
import sobre2 from "../../assets/sobre2.jpg";
import "./sobre.css";

function Sobre() {
  function irParaInscricao() {
    document.getElementById("inscricao").scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="secao" id="sobre">
      <div className="container">
        <h2 className="titulo-secao">Sobre a Feira das Profissões</h2>

        <div className="sobre-linha">
          <img
            className="sobre-imagem"
            src={sobre1}
            alt="Equipe do instituto reunida no pátio"
            loading="lazy"
          />
          <div className="texto-sobre">
            <p className="sobre-texto">
              Nossa equipe está pronta para receber você e mostrar que o conhecimento, o trabalho em
              equipe e o compromisso com as pessoas fazem a diferença na formação de cada estudante.
            </p>
            <a href="https://www.acaonsfatima.org.br/escola-prof-nossa-senhora-de-f%C3%A1tima" target="_blank" >FASDFW</a>
          </div>
        </div>

        <div className="sobre-linha sobre-linha-invertida">
          <p className="sobre-texto">
           A Feira das Profissões é o momento ideal para você conhecer nossa escola, descobrir nossos cursos e viver experiências que inspiram, reunindo aprendizado, diversão e novas possibilidades para quem quer começar a construir o futuro!
          </p>
          <img
            className="sobre-imagem"
            src={sobre2}
            alt="Professora cumprimentando um estudante"
            loading="lazy"
          />
        </div>

        <div className="sobre-acao">
          <button className="botao-azul" onClick={irParaInscricao}>
            Quero participar da feira 2026
          </button>
        </div>
      </div>
    </section>
  );
}

export default Sobre;
