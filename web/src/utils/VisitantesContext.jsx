import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  administradorAtual,
  carregarPresencas,
  carregarSetores,
  carregarTodosVisitantes,
  checkinVisitanteNoBanco,
  criarVisitanteNoBanco,
  atualizarVisitanteNoBanco,
  ErroDeConexao,
  registrarPresencaNoBanco,
  removerVisitanteNoBanco,
} from "../services/apiFeira";

// "leitor" não tem permissão na API para listar visitantes (não precisa: só lê QR Code
// e registra presença) — pedir mesmo assim só geraria um 403 previsível.
const PAPEIS_COM_ACESSO_A_VISITANTES = ["admin", "credenciamento"];

/*
 * Estado compartilhado da feira.
 * A API (projeto `api/`) é a fonte oficial. localStorage é mantido somente como
 * contingência para continuar o credenciamento caso a conexão caia durante o evento —
 * não deve ser confundido com a sessão JWT, guardada separadamente por
 * services/apiFeira.js.
 */
const VisitantesContext = createContext(null);
const CHAVE_VISITANTES = "feira2026-visitantes";
const CHAVE_PRESENCAS = "feira2026-presencas";
const EVENTO_SESSAO = "feira2026-sessao";

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
  const [setores, setSetores] = useState([]);
  const [hidratado, setHidratado] = useState(false);
  const [bancoConectado, setBancoConectado] = useState(false);
  const [administrador, setAdministrador] = useState(null);

  const carregarDoBanco = useCallback(async () => {
    const sessao = administradorAtual();
    const podeVerVisitantes = PAPEIS_COM_ACESSO_A_VISITANTES.includes(sessao?.papel);

    const [novosVisitantes, novasPresencas, novosSetores] = await Promise.all([
      podeVerVisitantes ? carregarTodosVisitantes() : Promise.resolve([]),
      carregarPresencas(),
      carregarSetores(),
    ]);

    setVisitantes(novosVisitantes);
    setPresencas(novasPresencas);
    setSetores(novosSetores);
    setBancoConectado(true);
    return { visitantes: novosVisitantes, presencas: novasPresencas, setores: novosSetores };
  }, []);

  useEffect(() => {
    const sessaoInicial = administradorAtual();

    setVisitantes(lerLocal(CHAVE_VISITANTES));
    setPresencas(lerLocal(CHAVE_PRESENCAS));
    setHidratado(true);
    setAdministrador(sessaoInicial);

    // Setores são públicos: carrega mesmo sem sessão, para alimentar formulário/leitor.
    carregarSetores()
      .then(setSetores)
      .catch(() => undefined);

    // A lista completa de visitantes/presenças requer login; falhar aqui é normal na
    // página pública, sem sessão. Se já existir sessão neste primeiro carregamento
    // (localStorage persiste entre recarregamentos), busca os dados imediatamente.
    if (sessaoInicial) {
      carregarDoBanco().catch(() => setBancoConectado(false));
    }

    // O evento só é disparado por login/logout/renovação (nunca no carregamento
    // inicial da página) — por isso é seguro tratar "sem sessão" aqui como uma saída
    // de fato, e não como "nunca houve sessão".
    const aoMudarSessao = () => {
      const sessao = administradorAtual();
      setAdministrador(sessao);

      if (!sessao) {
        // Logout (ou sessão expirada e renovação falhou): não mantém dados sensíveis
        // de visitantes em memória nem na contingência local do dispositivo.
        setVisitantes([]);
        setPresencas([]);
        setBancoConectado(false);
        window.localStorage.removeItem(CHAVE_VISITANTES);
        window.localStorage.removeItem(CHAVE_PRESENCAS);
        return;
      }

      carregarDoBanco().catch(() => setBancoConectado(false));
    };

    window.addEventListener(EVENTO_SESSAO, aoMudarSessao);
    return () => window.removeEventListener(EVENTO_SESSAO, aoMudarSessao);
  }, [carregarDoBanco]);

  useEffect(() => {
    if (hidratado) window.localStorage.setItem(CHAVE_VISITANTES, JSON.stringify(visitantes));
  }, [visitantes, hidratado]);

  useEffect(() => {
    if (hidratado) window.localStorage.setItem(CHAVE_PRESENCAS, JSON.stringify(presencas));
  }, [presencas, hidratado]);

  async function adicionarVisitante(dados) {
    try {
      const salvo = await criarVisitanteNoBanco(dados);
      setVisitantes((lista) => [salvo, ...lista.filter((item) => item.id !== salvo.id)]);
      setBancoConectado(true);
      return salvo;
    } catch (erro) {
      // A API respondeu (CPF inválido, duplicado, etc.): não é caso de contingência —
      // a pessoa precisa corrigir o dado e tentar de novo, então o erro sobe para o
      // formulário mostrar a mensagem real em vez de fingir que deu certo.
      if (!(erro instanceof ErroDeConexao)) throw erro;

      // Erro de conexão de verdade: mantém a inscrição só no dispositivo.
      // A mensagem permite à equipe saber que precisa sincronizá-la depois. O código do
      // QR Code só é vinculado no check-in (não é gerado por este app), então fica nulo
      // aqui também, igual ao que a API faria.
      const novoVisitante = {
        id: `vis-${crypto.randomUUID()}`,
        ...dados,
        codigoQr: null,
        dataChegada: null,
        criadoEm: new Date().toISOString(),
      };
      setVisitantes((lista) => [novoVisitante, ...lista]);
      setBancoConectado(false);
      return { ...novoVisitante, salvoSomenteNesteDispositivo: true, avisoBanco: erro.message };
    }
  }

  async function atualizarVisitante(id, dados) {
    const salvo = await atualizarVisitanteNoBanco(id, dados);
    setVisitantes((lista) => lista.map((visitante) => (visitante.id === id ? salvo : visitante)));
    return salvo;
  }

  async function removerVisitante(id) {
    await removerVisitanteNoBanco(id);
    setVisitantes((lista) => lista.filter((visitante) => visitante.id !== id));
    setPresencas((lista) => lista.filter((presenca) => presenca.visitanteId !== id));
  }

  async function fazerCheckin(id, codigoQr) {
    const salvo = await checkinVisitanteNoBanco(id, codigoQr);
    setVisitantes((lista) => lista.map((visitante) => (visitante.id === id ? salvo : visitante)));
    return salvo;
  }

  function buscarPorCodigo(codigo) {
    return visitantes.find((visitante) => visitante.codigoQr === codigo) || null;
  }

  async function registrarPresenca(codigoQr, setorId) {
    const retorno = await registrarPresencaNoBanco(codigoQr, setorId);
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
        setores,
        administrador,
        bancoConectado,
        adicionarVisitante,
        atualizarVisitante,
        removerVisitante,
        fazerCheckin,
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
