import { createFileRoute } from "@tanstack/react-router";
import CredenciamentoPage from "../../pages/admin/Credenciamento";

export const Route = createFileRoute("/admin/credenciamento")({
  head: () => ({
    meta: [
      { title: "Credenciamento | Feira de Profissões 2026" },
      {
        name: "description",
        content: "Cadastro, edição e credenciamento de visitantes da Feira de Profissões.",
      },
      { property: "og:title", content: "Credenciamento | Feira de Profissões 2026" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CredenciamentoPage,
});
