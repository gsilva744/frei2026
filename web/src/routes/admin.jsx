import { createFileRoute } from "@tanstack/react-router";
import Admin from "../pages/Admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Área Restrita | Feira de Profissões 2026" },
      {
        name: "description",
        content: "Painel administrativo para consulta de visitantes e credenciamento da feira.",
      },
      { property: "og:title", content: "Área Restrita | Feira de Profissões 2026" },
      {
        property: "og:description",
        content: "Gerencie visitantes e faça o credenciamento da Feira de Profissões 2026.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Admin,
});
