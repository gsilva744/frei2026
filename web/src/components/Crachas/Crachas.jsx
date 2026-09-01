import { useMemo, useRef, useState } from "react";
import QRCodeVisitante from "../QRCode/QRCodeVisitante";
import { useVisitantes } from "../../utils/VisitantesContext";
import { abrirJanelaImpressao } from "../../utils/impressao";
import "./crachas.css";

const LIMITE = 10;

/* Aba de impressao: permite selecionar até 10 visitantes e imprimir em uma única folha */
function Crachas() {
  const { visitantes } = useVisitantes();
  const [selecionados, setSelecionados] = useState([]);
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState("");
  const areaRef = useRef(null);

  const textoBusca = busca.trim().toLowerCase();
  const listaVisivel = visitantes.filter((visitante) =>
    [visitante.nome, visitante.email, visitante.cpf, visitante.cursoInteresse]
      .join(" ")
      .toLowerCase()
      .includes(textoBusca),
  );

  const listaParaImprimir = useMemo(
    () => visitantes.filter((visitante) => selecionados.includes(visitante.id)),
    [visitantes, selecionados],
  );

  function alternarSelecao(id) {
    setAviso("");
    setSelecionados((lista) => {
      if (lista.includes(id)) return lista.filter((item) => item !== id);
      if (lista.length >= LIMITE) {
        setAviso(`Você pode imprimir no máximo ${LIMITE} crachás por folha.`);
        return lista;
      }
      return [...lista, id];
    });
  }

  function selecionarPrimeiros() {
    setAviso("");
    setSelecionados(listaVisivel.slice(0, LIMITE).map((visitante) => visitante.id));
  }

  function imprimir() {
    if (!areaRef.current || listaParaImprimir.length === 0) return;
    const conteudo = `<div class="folha-grade">${areaRef.current.innerHTML}</div>`;
    const aberta = abrirJanelaImpressao({
      titulo: "Crachás · 6ª Feira das Profissões 2026",
      conteudo,
    });
    if (!aberta) setAviso("Libere as janelas pop-up do navegador para imprimir.");
  }

  return (
    <div className="crachas">
      <div className="crachas-barra">
        <input
          className="admin-busca"
          placeholder="Buscar visitante por nome, e-mail ou CPF"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
        <div className="crachas-barra-botoes">
          <button className="admin-acao" onClick={selecionarPrimeiros}>
            Selecionar {LIMITE} primeiros
          </button>
          <button className="admin-acao" onClick={() => setSelecionados([])}>
            Limpar seleção
          </button>
          <button
            className="botao-azul"
            onClick={imprimir}
            disabled={listaParaImprimir.length === 0}
          >
            Imprimir {listaParaImprimir.length || ""} crachá(s) em PDF
          </button>
        </div>
      </div>

      <p className="crachas-legenda">
        {selecionados.length}/{LIMITE} selecionados · todos os crachás selecionados são impressos em
        uma única folha A4.
      </p>
      {aviso && <p className="crachas-aviso">{aviso}</p>}

      {visitantes.length === 0 ? (
        <p className="admin-vazio">Cadastre visitantes para gerar crachás.</p>
      ) : (
        <>
          <div className="crachas-selecao">
            {listaVisivel.length === 0 ? (
              <p className="admin-vazio">Nenhum visitante encontrado para essa busca.</p>
            ) : (
              listaVisivel.map((visitante) => (
                <label key={visitante.id} className="crachas-checkbox">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(visitante.id)}
                    onChange={() => alternarSelecao(visitante.id)}
                  />
                  {visitante.nome}
                </label>
              ))
            )}
          </div>

          <h4 className="crachas-titulo-previa">Prévia da folha de impressão</h4>
          {listaParaImprimir.length === 0 ? (
            <p className="admin-vazio">Selecione visitantes para montar a folha.</p>
          ) : (
            <div className="crachas-grade" ref={areaRef}>
              {listaParaImprimir.map((visitante) => (
                <div key={visitante.id} className="cracha">
                  <div className="cracha-topo">
                    <strong>6ª Feira das Profissões 2026</strong>
                    <span>Instituto Social Nossa Senhora de Fátima</span>
                  </div>
                  <QRCodeVisitante codigo={visitante.codigoQr} tamanho={110} />
                  <p className="cracha-nome">{visitante.nome}</p>
                  <p className="cracha-linha">{visitante.cursoInteresse || "Curso não informado"}</p>
                  <p className="cracha-linha">{visitante.vinculo || "Visitante"}</p>
                  <p className="cracha-codigo">{visitante.codigoQr}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Crachas;
