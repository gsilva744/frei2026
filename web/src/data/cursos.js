import { BookOpen, GraduationCap, Wrench } from "lucide-react";
import informatica from "../assets/informatica.jpg";
import administracao from "../assets/administracao.jpg";
import comunicacao_visual from "../assets/comunicacao_visual.jpg";
import eletromecanica from "../assets/mecanica.jpeg";
import robotica from "../assets/robotica.jpeg";
import informatica_basica from '../assets/informatica_basica.jpeg';
import teens1 from "../assets/teens1.png";
import teens2 from '../assets/teens2.png';
import basico from '../assets/basico.jpeg';
import basico_intemediario from '../assets/basico_intermediario.jpeg';
import pre_intermediario from "../assets/pre-intermediario.png";
import intermediario from '../assets/intermediario.png';
import avancado from '../assets/avancado.png';
import eletricista from '../assets/eletricista.png';

/* Categorias de cursos usadas nos botões da seção (icone = componente Lucide) */
export const categorias = [
  { id: "Tecnicos", nome: "Tecnicos", Icone: Wrench },
  { id: "Livres", nome: "Livres", Icone:  BookOpen},
  { id: "Qualificacoes", nome: "Qualificações", Icone: GraduationCap },
];

export const cursos = [
  {
    id: 1,
    categoria: "Tecnicos",
    nome: "Informática",
    descricao:
      "Aprenda lógica de programação, banco de dados e criação de aplicações web.",
    imagem: informatica,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 2,
    categoria: "Tecnicos",
    nome: "Administração",
    descricao:
      "Gestão de pessoas, processos e organização de rotinas empresariais.",
    imagem: administracao,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 3,
    categoria: "Tecnicos",
    nome: "Comunicação Visual",
    descricao:
      "Identidade visual, edição de imagens e criação de peças digitais.",
    imagem: comunicacao_visual,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 4,
    categoria: "Livres",
    nome: "Informática Básica",
    descricao:
      "Informática aplicada ao ambiente profissional, com Word, Excel, PowerPoint e ferramentas digitais.",
    imagem: informatica_basica,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 5,
    categoria: "Livres",
    nome: "Teens I",
    descricao:
      "Aprenda inglês de forma prática e imersiva, desenvolvendo conversação, escrita, leitura e compreensão auditiva.",
    imagem: teens1,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 6,
    categoria: "Livres",
    nome: "Teens II",
    descricao:
      "Aprofunde seus conhecimentos em inglês com foco em conversação, escrita, leitura e fluência.",
    imagem: teens2,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 7,
    categoria: "Livres",
    nome: "Inglês Básico",
    descricao:
      "Aprenda inglês em um formato intensivo, com foco em conversação, escrita, leitura e compreensão auditiva.",
    imagem: basico,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 8,
    categoria: "Livres",
    nome: "Inglês Básico ao Pré-Intermediario",
    descricao:
      "Aprenda inglês do básico ao pré-intermediário, desenvolvendo conversação, escrita, leitura e compreensão auditiva.",
    imagem: basico_intemediario,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 9,
    categoria: "Livres",
    nome: "Inglês Pré-Intermediário",
    descricao:
      "Aprimore suas habilidades em inglês e prepare-se para avançar ao nível intermediário.",
    imagem: pre_intermediario,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 10,
    categoria: "Livres",
    nome: "Inglês Intermediário",
    descricao:
      "Desenvolva sua fluência em inglês, aperfeiçoando conversação, escrita, leitura e compreensão auditiva.",
    imagem: intermediario,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 11,
    categoria: "Livres",
    nome: "Inglês Avançado",
    descricao:
      "Aperfeiçoe sua fluência em inglês com foco em comunicação avançada, interpretação e conversação.",
    imagem: avancado,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 12,
    categoria: "Livres",
    nome: "Eletricista Instalador",
    descricao:
      "Aprenda instalações elétricas, manutenção de redes de baixa e média tensão e automação residencial.",
    imagem: eletricista,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 13,
    categoria: "Qualificacoes",
    nome: "Eletromecânica de Autos",
    descricao:
      "Manutenção preventiva e corretiva de veículos, com foco em mecânica, elétrica e eletrônica automotiva.",
    imagem: eletromecanica,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 14,
    categoria: "Qualificacoes",
    nome: "Automação Residencial e Robótica",
    descricao:
      "Automação residencial, robótica e instalação de sistemas inteligentes para residências e indústrias.",
    imagem: robotica,
    link: "https://www.acaonsfatima.org.br/",
  },
];