import { useState } from "react";
import { depoimentos } from "../../data/depoimentos";
import "./depoimentos.css";

function Depoimentos() {
  const [indice, setIndice] = useState(0);
  const depoimento = depoimentos[indice];

  return (
    <section className="secao-depoimentos" id="depoimentos">
      <div className="container-depoimentos">
        <h2 className="titulo-secao">Depoimentos</h2>
        <p className="depoimentos-intro">
          Quem passou pelo Instituto conta como a formação mudou a sua trajetória.
        </p>

        <div className="depoimentos-card" key={depoimento.id}>
          <div className="depoimentos-foto-area">
            <img
              className="depoimentos-foto"
              src={depoimento.foto}
              alt={`Foto de ${depoimento.nome}`}
              loading="lazy"
            />
          </div>
          <div className="depoimentos-conteudo">
            <span className="depoimentos-aspas">“</span>
            <p className="depoimentos-texto">{depoimento.texto}</p>
            <p className="depoimentos-nome">{depoimento.nome}</p>
            <p className="depoimentos-cargo">{depoimento.cargo}</p>
          </div>
        </div>

        <div className="depoimentos-pontos">
          {depoimentos.map((item, posicao) => (
            <button
              key={item.id}
              aria-label={`Ver depoimento de ${item.nome}`}
              className={posicao === indice ? "depoimentos-ponto ativo" : "depoimentos-ponto"}
              onClick={() => setIndice(posicao)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Depoimentos;
