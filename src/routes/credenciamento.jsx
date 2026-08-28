import { createFileRoute } from "@tanstack/react-router";
import Credenciamento from "../pages/Credenciamento";

export const Route = createFileRoute("/credenciamento")({
  head: () => ({
    meta: [
      { title: "Credenciamento | Feira de Profissões 2026" },
      {
        name: "description",
        content:
          "Área restrita da equipe: credenciamento, leitor de QR Code e impressão de crachás da feira.",
      },
      {
        property: "og:title",
        content: "Credenciamento | Feira de Profissões 2026",
      },
      {
        property: "og:description",
        content:
          "Área restrita para credenciamento e leitura de QR Code da Feira de Profissões.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Credenciamento,
});