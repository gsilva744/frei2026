import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { gerarCodigoUnico } from "./gerarCodigo";
import {
  atualizarVisitanteNoBanco,
  carregarDadosDaFeira,
  criarVisitanteNoBanco,
  registrarPresencaNoBanco,
  removerVisitanteNoBanco,
} from "../services/apiFeira";

/*
 * Estado compartilhado da feira.
 * O banco D1 é a fonte oficial. localStorage é mantido somente como contingência
 * para continuar o credenciamento caso a conexão caia durante o evento.
 */
const VisitantesContext = createContext(null);
const CHAVE_VISITANTES = "feira2026-visitantes";
const CHAVE_PRESENCAS = "feira2026-presencas";

function lerLocal(chave) {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : [];
  } catch {
    return [];
  }
}

export function VisitantesProvider({ children }) {
  const [visitantes, setVisitantes] = useState([]);
  const [presencas, setPresencas] = useState([]);
  const [hidratado, setHidratado] = useState(false);
  const [bancoConectado, setBancoConectado] = useState(false);

  const carregarDoBanco = useCallback(async () => {
    const dados = await carregarDadosDaFeira();
    setVisitantes(dados.visitantes || []);
    setPresencas(dados.presencas || []);
    setBancoConectado(true);
    return dados;
  }, []);

  useEffect(() => {
    setVisitantes(lerLocal(CHAVE_VISITANTES));
    setPresencas(lerLocal(CHAVE_PRESENCAS));
    setHidratado(true);

    // A lista completa requer login; falhar aqui é normal na página pública.
    carregarDoBanco().catch(() => setBancoConectado(false));
    const atualizarAoEntrar = () => carregarDoBanco().catch(() => setBancoConectado(false));
    window.addEventListener("feira2026-autorizacao", atualizarAoEntrar);
    return () => window.removeEventListener("feira2026-autorizacao", atualizarAoEntrar);
  }, [carregarDoBanco]);

  useEffect(() => {
    if (hidratado) window.localStorage.setItem(CHAVE_VISITANTES, JSON.stringify(visitantes));
  }, [visitantes, hidratado]);

  useEffect(() => {
    if (hidratado) window.localStorage.setItem(CHAVE_PRESENCAS, JSON.stringify(presencas));
  }, [presencas, hidratado]);

  async function adicionarVisitante(dados) {
    const novoVisitante = {
      id: `vis-${crypto.randomUUID()}`,
      ...dados,
      codigoQr: gerarCodigoUnico(),
      criadoEm: new Date().toISOString(),
    };
    try {
      const resposta = await criarVisitanteNoBanco(novoVisitante);
      const salvo = resposta.visitante || novoVisitante;
      setVisitantes((lista) => [salvo, ...lista.filter((item) => item.id !== salvo.id)]);
      setBancoConectado(true);
      return salvo;
    } catch (erro) {
      // Mantém a inscrição no dispositivo se o banco/rede estiver indisponível.
      // A mensagem permite à equipe saber que precisa sincronizá-la depois.
      setVisitantes((lista) => [novoVisitante, ...lista]);
      setBancoConectado(false);
      return { ...novoVisitante, salvoSomenteNesteDispositivo: true, avisoBanco: erro.message };
    }
  }

  async function atualizarVisitante(id, dados) {
    const resposta = await atualizarVisitanteNoBanco(id, dados);
    const salvo = resposta.visitante;
    setVisitantes((lista) => lista.map((visitante) => (visitante.id === id ? salvo : visitante)));
    return salvo;
  }

  async function removerVisitante(id) {
    await removerVisitanteNoBanco(id);
    setVisitantes((lista) => lista.filter((visitante) => visitante.id !== id));
    setPresencas((lista) => lista.filter((presenca) => presenca.visitanteId !== id));
  }

  function buscarPorCodigo(codigo) {
    return visitantes.find((visitante) => visitante.codigoQr === codigo) || null;
  }

  async function registrarPresenca(codigoQr, setor) {
    const retorno = await registrarPresencaNoBanco(codigoQr, setor);
    if (retorno.status === "registrado" && retorno.presenca) {
      setPresencas((lista) => [retorno.presenca, ...lista]);
    }
    return retorno;
  }

  return (
    <VisitantesContext.Provider
      value={{
        visitantes,
        presencas,
        bancoConectado,
        adicionarVisitante,
        atualizarVisitante,
        removerVisitante,
        buscarPorCodigo,
        registrarPresenca,
        carregarDoBanco,
      }}
    >
      {children}
    </VisitantesContext.Provider>
  );
}

export function useVisitantes() {
  return useContext(VisitantesContext);
}
