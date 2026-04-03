"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  { href: "/estoque", label: "Estoque", icon: Package, adminOnly: false },
  {
    href: "/vendas",
    label: "Vendas (PDV)",
    icon: ShoppingCart,
    adminOnly: false,
  },
  { href: "/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: BarChart3,
    adminOnly: true,
  },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    // SIDEBAR LIQUID GLASS: Fundo branco translúcido com muito desfoque
    <aside className="w-64 bg-white/70 backdrop-blur-2xl border-r border-white/50 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      {/* Header com o Logo (Estilo Glass Card) */}
      <div className="p-6">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
          <div className="relative h-10 w-10 flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="Logo Adega Eneas"
              fill
              className="object-contain rounded-lg"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-black text-slate-900 text-sm tracking-tight truncate uppercase leading-none">
              Adega <span className="text-amber-500">Eneas</span>
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate mt-1">
              Gestão de Bebidas
            </p>
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-4 space-y-1.5 mt-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" // Item Ativo: Amarelo Sólido com brilho
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/80 hover:shadow-sm",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-amber-500",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Perfil / Role Badge no Rodapé (Efeito Vidro Adicional) */}
      <div className="p-4 mt-auto">
        <div className="relative overflow-hidden px-4 py-4 rounded-2xl bg-white/40 border border-white/60 shadow-inner">
          {/* Brilho âmbar sutil escondido no vidro */}
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-amber-500/5 blur-2xl rounded-full" />

          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
            Acesso
          </p>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                isAdmin ? "bg-amber-500" : "bg-emerald-500",
              )}
            />
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-tighter",
                isAdmin ? "text-slate-800" : "text-slate-600",
              )}
            >
              {isAdmin ? "Administrador" : "Vendedor"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
