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
          <span className="livro-selo">Exclusivo para ex-alunos</span>
          <h2>O Livro Dourado</h2>
          <p>
            É a memória viva do Instituto. Um livro onde cada ex-aluno escreve o que viveu por aqui:
            as aulas, os professores, as amizades e a virada de chave que a formação trouxe para a
            sua vida profissional.
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
