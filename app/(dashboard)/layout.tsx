import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ui/layout/Sidebar";
import Header from "@/components/ui/layout/Header";
import { cn } from "@/lib/utils";
import { Metadata } from "next"; // Importação necessária para o TypeScript

// --- ESTE BLOCO MUDA O NOME NA ABA E O ÍCONE ---
export const metadata: Metadata = {
  title: "Adega Eneas | Gestão de Estoque",
  description:
    "Sistema profissional de gestão e PDV desenvolvido por Will Bueno.",
  icons: {
    icon: "/adegalogo.png", // Puxa o seu logo para ser o ícone da aba
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Se não tiver logado, manda pro login na hora
  if (!session) redirect("/login");

  const userRole = session.user?.role;
  const isDev = userRole === "DESENVOLVEDOR";

  return (
    <div
      className={cn(
        "flex h-screen transition-colors duration-700",
        // Fundo roxo bem sutil se for você, senão fundo padrão
        isDev ? "bg-purple-50/40" : "bg-slate-50",
      )}
    >
      {/* Sidebar recebendo o cargo (Admin ou Dev) */}
      <Sidebar role={userRole} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com as infos do usuário */}
        <Header user={session.user} />

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Frame de destaque sutil apenas para o Desenvolvedor */}
      {isDev && (
        <div className="fixed inset-0 pointer-events-none border-[8px] border-purple-500/5 z-50 rounded-[2.5rem]" />
      )}
    </div>
  );
}
