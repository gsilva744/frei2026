import "./localizacao.css";

function Localizacao() {
  return (
    <section className="secao" id="local">
      <div className="container-localizacao">
        <div className="localizacao-card">
          <iframe 
          className="localizacao-mapa"
          title="Mapa do instituto"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3653.8776429360246!2d-46.7105058256726!3d-23.680333278718212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce502d2289a843%3A0x14406b17b30d0174!2sInstituto%20Social%20Nossa%20Senhora%20de%20F%C3%A1tima!5e0!3m2!1spt-BR!2sbr!4v1786289850467!5m2!1spt-BR!2sbr" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" />
          <div className="localizacao-info">
            <h3>Localização do Instituto</h3>
            <h4>Endereço</h4>
            <p>Av. Coronel Octaviano de Freitas Costa, 463 - Veleiros, São Paulo - SP, 04773-000</p>
            <h4>Ponto de Referência</h4>
            <p>Próximo à estação Socorro da CPTM.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Localizacao;
