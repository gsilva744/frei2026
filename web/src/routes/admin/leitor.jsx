import { createFileRoute } from "@tanstack/react-router";
import LeitorPage from "../../pages/admin/Leitor";

export const Route = createFileRoute("/admin/leitor")({
  head: () => ({
    meta: [
      { title: "Leitor de Presença | Feira de Profissões 2026" },
      {
        name: "description",
        content: "Leitor de QR Code para registrar presença de visitantes por turma/setor.",
      },
      { property: "og:title", content: "Leitor de Presença | Feira de Profissões 2026" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeitorPage,
});
