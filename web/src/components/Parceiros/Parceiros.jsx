import { useState } from "react";
import { parceiros } from "../../data/parceiros.js";
import "./parceiros.css";

const porPagina = 4;

function Parceiros() {
  const [pagina, setPagina] = useState(0);

  const totalPaginas = Math.ceil(parceiros.length / porPagina);

  const inicio = pagina * porPagina;

  const parceirosVisiveis = parceiros.slice(
    inicio,
    inicio + porPagina
  );

  return (
    <section className="secao" id="parceiros">
      <div className="container">

        <h2 className="titulo-secao">
          Patrocinadores
        </h2>

        <p className="parceiros-intro">
          Empresas e instituições que apoiam a formação dos nossos alunos.
        </p>

        <div className="parceiros-grade">
          {parceirosVisiveis.map((parceiro) => (
            <div
              className="parceiros-item"
              key={parceiro.id}
            >
              <img
                className="parceiros-logo"
                src={parceiro.logo}
                alt={`Logo ${parceiro.nome}`}
                loading="lazy"
                width="512"
                height="512"
              />

              <span className="parceiros-nome">
                {parceiro.nome}
              </span>
            </div>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div className="parceiros-pontos">
            {Array.from({ length: totalPaginas }).map(
              (_, posicao) => (
                <button
                  type="button"
                  key={posicao}
                  aria-label={`Ver grupo ${
                    posicao + 1
                  } de parceiros`}
                  className={
                    posicao === pagina
                      ? "parceiros-ponto ativo"
                      : "parceiros-ponto"
                  }
                  onClick={() => setPagina(posicao)}
                />
              )
            )}
          </div>
        )}

      </div>
    </section>
  );
}

export default Parceiros;