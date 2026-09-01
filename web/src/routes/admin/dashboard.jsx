import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "../../pages/admin/Dashboard";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Feira de Profissões 2026" },
      {
        name: "description",
        content: "Dashboard analítico de inscritos e presenças da Feira de Profissões.",
      },
      { property: "og:title", content: "Dashboard | Feira de Profissões 2026" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});
