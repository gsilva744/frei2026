import { useState } from "react";
import { toast } from "sonner";
import { cursos } from "../../data/cursos";
import { canaisDivulgacao, generos, vinculos } from "../../data/setores";
import QRCodeVisitante from "../QRCode/QRCodeVisitante";
import "./formulario.css";

const camposVazios = {
  nome: "",
  email: "",
  cpf: "",
  telefone: "",
  vinculo: "",
  comoSoube: "",
  genero: "",
  cursoInteresse: "",
  participaComoColaborador: false,
};

/* Formata o CPF enquanto a pessoa digita: 000.000.000-00 */
function formatarCpf(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

/* Formata o telefone: (00) 00000-0000 */
function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  if (numeros.length <= 10) {
    return numeros.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").replace(/[-\s()]*$/, "");
  }
  return numeros.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
}

const nomesDeCursos = Array.from(new Set(cursos.map((curso) => curso.nome)));

function Formulario({ onCadastrar, mostrarQrCode = true, titulo, descricao }) {
  const [campos, setCampos] = useState(camposVazios);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [visitanteCadastrado, setVisitanteCadastrado] = useState(null);

function alterarCampo(evento) {
  const { name, value } = evento.target;

  if (name === "vinculo") {
    setCampos((anterior) => ({
      ...anterior,
      vinculo: value,
      participaComoColaborador:
        value === "Aluno atual"
          ? anterior.participaComoColaborador
          : false,
    }));

    return;
  }

  const tratado =
    name === "cpf"
      ? formatarCpf(value)
      : name === "telefone"
        ? formatarTelefone(value)
        : value;

  setCampos((anterior) => ({
    ...anterior,
    [name]: tratado,
  }));
}

  
  function baixarQrCode() {
    const svg = document.querySelector("#qr-code-visitante svg");

    if (!svg || !visitanteCadastrado?.codigoQr) {
      setErro("Não foi possível gerar o arquivo do QR Code.");
      return;
    }

    const svgClone = svg.cloneNode(true);

    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgClone.setAttribute("width", "500");
    svgClone.setAttribute("height", "500");

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    const imagem = new Image();

    imagem.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = 500;

      const contexto = canvas.getContext("2d");

      if (!contexto) {
        URL.revokeObjectURL(url);
        setErro("Não foi possível criar a imagem do QR Code.");
        return;
      }

      contexto.fillStyle = "#FFFFFF";
      contexto.fillRect(0, 0, 500, 500);

      contexto.drawImage(imagem, 0, 0, 500, 500);

      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          setErro("Não foi possível baixar o QR Code.");
          return;
        }

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = `qrcode-${visitanteCadastrado.codigoQr}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
      }, "image/png");
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(url);
      setErro("Não foi possível gerar o QR Code.");
    };

    imagem.src = url;
  }


  async function enviarFormulario(evento) {
    evento.preventDefault();
    const nome = campos.nome.trim();
    if (nome.length < 3 || nome.length > 100) {
      setErro("Informe o nome completo (3 a 100 caracteres).");
      return; 
    }
    if (campos.cpf.replace(/\D/g, "").length !== 11) {
      setErro("Informe um CPF com 11 dígitos.");
      return;
    }
    if (campos.telefone.replace(/\D/g, "").length < 10) {
      setErro("Informe um telefone com DDD.");
      return;
    }

    setErro("");
    setEnviando(true);
    try {
      const novoVisitante = await onCadastrar({
        ...campos,
        nome,
        email: campos.email.trim().slice(0, 255),
      });
      setVisitanteCadastrado(novoVisitante);
      setCampos(camposVazios);

      if (novoVisitante.salvoSomenteNesteDispositivo) {
        toast.warning("Sem conexão com o servidor", {
          description: "A inscrição ficou salva só neste dispositivo. Sincronize assim que possível.",
        });
      } else {
        toast.success("Inscrição confirmada!");
      }
    } catch (erroCadastro) {
      const mensagem = erroCadastro.message || "Não foi possível concluir a inscrição.";
      setErro(mensagem);
      toast.error(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario-card" onSubmit={enviarFormulario}>
      <h3>{titulo || "Formulário de Inscrição"}</h3>
      <p>{descricao || "Preencha seus dados para participar da feira"}</p>

      <div className="formulario-grade">
        <div className="formulario-campo formulario-campo-largo">
          <label htmlFor="nome">Nome completo</label>
          <input
            id="nome"
            name="nome"
            maxLength={100}
            value={campos.nome}
            onChange={alterarCampo}
            required
            placeholder="Digite seu nome"
          />
        </div>

        <div className="formulario-campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            maxLength={255}
            value={campos.email}
            onChange={alterarCampo}
            required
            placeholder="Digite seu email"
          />
        </div>

        <div className="formulario-campo">
          <label htmlFor="cpf">CPF</label>
          <input
            id="cpf"
            name="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={campos.cpf}
            onChange={alterarCampo}
            required
          />
        </div>

        <div className="formulario-campo">
          <label htmlFor="telefone">Número de telefone</label>
          <input
            id="telefone"
            name="telefone"
            inputMode="tel"
            placeholder="(11) 90000-0000"
            value={campos.telefone}
            onChange={alterarCampo}
            required
          />
        </div>

        <div className="formulario-campo">
          <label htmlFor="genero">Gênero</label>
          <select id="genero" name="genero" value={campos.genero} onChange={alterarCampo} required>
            <option value="">Selecione</option>
            {generos.map((genero) => (
              <option key={genero} value={genero}>
                {genero === "Outro" ? "Outro / prefiro não informar" : genero}
              </option>
            ))}
          </select>
        </div>

        <div className="formulario-campo">
          <label htmlFor="vinculo">Já foi aluno do Instituto?</label>
          <select
            id="vinculo"
            name="vinculo"
            value={campos.vinculo}
            onChange={alterarCampo}
            required
          >
            <option value="">Selecione</option>
            {vinculos.map((vinculo) => (
              <option key={vinculo} value={vinculo}>
                {vinculo}
              </option>
            ))}
          </select>
        </div>

        

        <div className="formulario-campo">
          <label htmlFor="cursoInteresse">Curso de interesse</label>
          <select
            id="cursoInteresse"
            name="cursoInteresse"
            value={campos.cursoInteresse}
            onChange={alterarCampo}
            required
          >
            <option value="">Selecione um curso</option>
            {nomesDeCursos.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
          </select>
        </div>

        {campos.vinculo === "Aluno atual" && (
          <div className="formulario-campo">
            <label htmlFor="participaComoColaborador">
              Vai participar como colaborador da feira?
            </label>

            <select
              id="participaComoColaborador"
              name="participaComoColaborador"
              value={
                campos.participaComoColaborador === true
                  ? "true"
                  : campos.participaComoColaborador === false
                    ? "false"
                    : ""
              }
              onChange={(evento) =>
                setCampos((anterior) => ({
                  ...anterior,
                  participaComoColaborador:
                    evento.target.value === "true",
                }))
              }
              required
            >
              <option value="">Selecione</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
        )}

        <div className="formulario-campo formulario-campo-largo">
          <label htmlFor="comoSoube">Como ficou sabendo da feira?</label>
          <select
            id="comoSoube"
            name="comoSoube"
            value={campos.comoSoube}
            onChange={alterarCampo}
            required
          >
            <option value="">Selecione</option>
            {canaisDivulgacao.map((canal) => (
              <option key={canal} value={canal}>
                {canal}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erro && <p className="formulario-erro">{erro}</p>}

      <button type="submit" className="botao-azul formulario-enviar" disabled={enviando}>
        {enviando ? "Salvando..." : "Confirmar inscrição"}
      </button>

      {visitanteCadastrado && ( 
        <div className="formulario-mensagem"> 
        <p> Inscrição confirmada, 
          <strong>{visitanteCadastrado.nome}</strong>! 
        </p> 
        
        {visitanteCadastrado.salvoSomenteNesteDispositivo && ( 
          
          <p className="formulario-erro"> O banco não respondeu: esta inscrição ficou salva somente neste dispositivo. </p>
          )} 
          
          {mostrarQrCode && ( 
            <> <div id="qr-code-visitante"> <QRCodeVisitante codigo={visitanteCadastrado.codigoQr} tamanho={180} /> 
            
            </div>
            
            <p className="formulario-codigo"> {visitanteCadastrado.codigoQr} </p> 
            
            <button type="button" className="botao-azul formulario-baixar-qr" onClick={baixarQrCode} > Baixar meu QR Code </button> 
            <br />
            <p className="formulario-instrucao">
              Guarde este QR Code. Ele será utilizado para registrar sua presença na feira.
            </p>
            
            </> )} 
            </div> 
          )}

            </form>
          );
        }

export default Formulario;