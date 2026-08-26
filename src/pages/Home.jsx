import { useNavigate } from "@tanstack/react-router";

import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Sobre from "../components/Sobre/Sobre";
import Atracoes from "../components/Atracoes/Atracoes";
import Localizacao from "../components/Localizacao/Localizacao";
import Cursos from "../components/Cursos/Cursos";
import Formulario from "../components/Formulario/Formulario";
import Contador from "../components/Contador/Contador";
import Depoimentos from "../components/Depoimentos/Depoimentos";
import LivroDourado from "../components/LivroDourado/LivroDourado";
import Parceiros from "../components/Parceiros/Parceiros";

import Footer from "../components/Footer/Footer";
import { useVisitantes } from "../utils/VisitantesContext";
import predio from "../assets/escola.png";
import "../components/Formulario/formulario.css";

function Home() {
  const navegar = useNavigate();
  const { adicionarVisitante } = useVisitantes();

  return (
    <div>
      <Header onAbrirAreaRestrita={() => navegar({ to: "/admin" })} />

      <Hero />
      <Sobre />
      <LivroDourado />
      <Atracoes />

      
      <Cursos />

      <Depoimentos />

      <section className="secao secao-cinza" id="inscricao">
        <div className="container">
          <h2 className="titulo-secao">Venha se divertir com a gente! Inscreva-se já!</h2>
          <div className="formulario-area">
            <Formulario onCadastrar={adicionarVisitante} />
            <div className="formulario-lateral">
              <Contador />
              <img
                className="formulario-imagem"
                src={predio}
                alt="Prédio do instituto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      
      <Localizacao />
      <Footer />

    </div>
  );
}

export default Home;
