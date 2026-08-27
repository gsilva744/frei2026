import { useState } from "react";
import { categorias, cursos } from "../../data/cursos";
import "./cursos.css";

function Cursos() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Tecnicos");
  const cursosFiltrados = cursos.filter((curso) => curso.categoria === categoriaSelecionada);

  return (
    <section className="secao" id="cursos">
      <div className="container">
        <h2 className="titulo-secao">Descubra nossos cursos!</h2>
        <p className="cursos-descricao">
          Conheça nossos cursos de qualificação, livres e técnicos e descubra novas possibilidades
          para o seu futuro profissional.
        </p>

        <div className="cursos-categorias">
          {categorias.map((categoria) => {
            const Icone = categoria.Icone;
            const ativa = categoria.id === categoriaSelecionada;
            const total = cursos.filter((curso) => curso.categoria === categoria.id).length;

            return (
              <button
                key={categoria.id}
                className={ativa ? "cursos-categoria cursos-categoria-ativa" : "cursos-categoria"}
                onClick={() => setCategoriaSelecionada(categoria.id)}
              >
                <span className="cursos-icone">
                  <Icone size={40} strokeWidth={2.2} />
                </span>
                <span className="cursos-categoria-nome">{categoria.nome}</span>
                <span className="cursos-categoria-total">{total} cursos</span>
              </button>
            );
          })}
        </div>

        <div className="cursos-grade" key={categoriaSelecionada}>
          {cursosFiltrados.map((curso) => (
            <a href="https://www.acaonsfatima.org.br/escola-prof-nossa-senhora-de-f%C3%A1tima" target="_blank" >
              <article className="cursos-item" key={curso.id}>
                <div className="cursos-item-imagem">
                  <img src={curso.imagem} alt={curso.nome} loading="lazy" />
                  <span className="cursos-item-tag">{categoriaSelecionada}</span>
                </div>
                <div className="cursos-item-texto">
                  <h3>{curso.nome}</h3>
                  <p>{curso.descricao}</p>
                </div>
              </article>
            </a>
          ))}
        </div>

        <div className="cursos-acao">
          <button
            className="botao-azul"
            onClick={() =>
              document.getElementById("inscricao").scrollIntoView({ behavior: "smooth" })
            }
          >
            Quero saber mais!
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cursos;
