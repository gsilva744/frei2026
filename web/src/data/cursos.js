import { BookOpen, GraduationCap, Wrench } from "lucide-react";
import informatica from "../assets/INFORMATICA_2.webp";
import administracao from "../assets/ADMINISTRACAO.webp";
import comunicacao_visual from "../assets/COMUNICACAO_VISUAL.webp";
import eletromecanica from "../assets/ELETROMECANICA_DE_AUTOS_1.webp";
import robotica from "../assets/robotica.jpeg";
import informatica_basica from '../assets/INFORMATICA_BASICA_-_EXCEL_2.webp';
import teens1 from "../assets/ingles teens 1.jpg";
import teens2 from '../assets/ingles 4.jpg';
import basico from '../assets/ingles basico (noite).jpg';
import basico_intemediario from '../assets/INGLES_BASICO_-_PRE-INTERMEDIARIO_2.webp';
import pre_intermediario from "../assets/ingles basico pre intermediario.jpg";
import intermediario from '../assets/ingles intermediario (sábado).jpg';
import avancado from '../assets/ingles avançado1 (sábado).jpg';
import eletricista from '../assets/ELETRICISTA_INSTALADOR.webp';

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
      "Aprenda desde cedo, desenvolvendo habilidades de fala, escuta, escrita e muito mais. Jovens de 13 e 14 anos.",
    imagem: teens1,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 6,
    categoria: "Livres",
    nome: "Teens II",
    descricao:
      "Aprenda desde cedo, desenvolvendo habilidades de fala, escuta, escrita e muito mais. Jovens de 13 e 14 anos.",
    imagem: teens2,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 7,
    categoria: "Livres",
    nome: "Inglês Básico (noite)",
    descricao:
      "Aprenda inglês para se comunicar com confiança no dia a dia e no trabalho. Adultos a partir de 18 anos.",
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
    nome: "Inglês Pré-Intermediário (noite)",
    descricao:
      "Aprimore seu nível em inglês e tenha a oportunidade de aplicar suas habilidades no trabalho. Adultos apartir de 18 anos.",
    imagem: pre_intermediario,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 10,
    categoria: "Livres",
    nome: "Inglês Intermediário (sábado)",
    descricao:
      "Aprimore seu inglês e abra portas para viver o sonho de um intercânbio, e muito mais!. Jovens de 15 a 25 anos.",
    imagem: intermediario,
    link: "https://www.acaonsfatima.org.br/",
  },

  {
    id: 11,
    categoria: "Livres",
    nome: "Inglês Avançado (sábado)",
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