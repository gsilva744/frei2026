import livroDourado from "../../assets/freiEPessoas.webp";
import "./livro-dourado.css";

const passos = [
  {
    id: 1,
    titulo: "Venha à feira",
    texto: "Ex-alunos têm entrada especial no dia 19 de setembro, das 10h às 16h.",
  },
  {
    id: 2,
    titulo: "Conte sua história",
    texto: "Registre uma lembrança do tempo de curso e o caminho que você trilhou depois.",
  },
  {
    id: 3,
    titulo: "Deixe seu legado",
    texto: "Seu depoimento fica guardado no Livro Dourado e inspira as próximas turmas.",
  },
];

function LivroDourado() {
  function irParaInscricao() {
    document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="livro" id="livro-dourado">
      <div className="container livro-conteudo">
        <div className="livro-imagem-area">
          <img
            className="livro-imagem"
            src={livroDourado}
            alt="Livro Dourado do Instituto, com capa dourada e detalhes em relevo"
            loading="lazy"
            width={1024}
            height={768}
          />
        </div>

        <div className="livro-texto">
          <span className="livro-selo">Exclusivo para:</span>
          <h2>EX-FREIANOS</h2>
          <p>
            Você não é apenas um ex-aluno, é parte da nossa história. Volte para reencontrar amigos, professores e memórias especiais. Compartilhe sua trajetória e deixe sua lembrança registrada. Faça parte do nosso Livro de Ouro dos Ex-Freianos. Sua história continua aqui.
          </p>

          <ul className="livro-passos">
            {passos.map((passo) => (
              <li key={passo.id}>
                <div>
                  <strong>{passo.titulo}</strong>
                  <p>{passo.texto}</p>
                </div>
              </li>
            ))}
          </ul>

          <button className="botao-amarelo" onClick={irParaInscricao}>
            Quero deixar meu depoimento
          </button>
        </div>
      </div>
    </section>
  );
}

export default LivroDourado;
