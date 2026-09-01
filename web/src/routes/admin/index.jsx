import { createFileRoute } from "@tanstack/react-router";
import Hub from "../../pages/admin/Hub";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo | Feira de Profissões 2026" },
      {
        name: "description",
        content: "Painel administrativo da Feira de Profissões: dashboard, credenciamento e leitor de presença.",
      },
      { property: "og:title", content: "Painel Administrativo | Feira de Profissões 2026" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Hub,
});
