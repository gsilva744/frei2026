import { createFileRoute } from "@tanstack/react-router";
import Home from "../pages/Home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "6ª Feira das Profissões 2026 | Instituto Social N. S. de Fátima" },
      {
        name: "description",
        content:
          "Participe da 6ª Feira de Profissões 2026: cursos técnicos, livres e de qualificação, atrações por andar e inscrição gratuita.",
      },
      { property: "og:title", content: "6ª Feira de Profissões 2026" },
      {
        property: "og:description",
        content: "Descubra sua profissão do futuro na Feira de Profissões 2026 do Instituto Social.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
