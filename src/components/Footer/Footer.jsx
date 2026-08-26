import "./footer.css";

function Footer() {
  return (
    <footer className="footer" id="contato">
      <div className="container">
        <p className="footer-titulo">Instituto Social Nossa Senhora de Fátima</p>

        <div className="footer-colunas">
          <div>
            <h4>Contatos</h4>
            <p>(11) 5666-4322</p>
            <p>(11) 4762-0021</p>
            <p>contato@isf.org.br</p>
          </div>
          <div>
            <h4>Endereço</h4>
            <p>Av. Coronel Octaviano de Freitas Costa, 463</p>
            <p>Veleiros, São Paulo - SP</p>
          </div>
          <div>
            <h4>Data e horário</h4>
            <p>19 de setembro de 2026</p>
            <p>Das 10h às 16h</p>
          </div>
          <div>
            <h4>Links rápidos</h4>
            <ul>
              <li>
                <a href="#inicio">Início</a>
              </li>
              <li>
                <a href="#programacao">Programação</a>
              </li>
              <li>
                <a href="#cursos">Cursos</a>
              </li>
              <li>
                <a href="#inscricao">Inscrição</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
