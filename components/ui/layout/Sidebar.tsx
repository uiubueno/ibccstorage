"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  BookOpen,
  Menu,
  X,
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
  { href: "/devedores", label: "Devedores", icon: BookOpen, adminOnly: false },
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
  const [isOpen, setIsOpen] = useState(false); // Estado para abrir/fechar no mobile

  const hasFullAccess = role === "ADMIN" || role === "DESENVOLVEDOR";
  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || hasFullAccess,
  );

  return (
    <>
      {/* BOTÃO HAMBÚRGUER (SÓ APARECE NO MOBILE) ✨ */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-3 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl text-slate-600 md:hidden active:scale-90 transition-all"
      >
        <Menu size={24} />
      </button>

      {/* BACKDROP (Fundo escuro quando o menu abre no mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR PRINCIPAL */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-2xl border-r border-white/50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 md:shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header com o Logo e Botão de Fechar */}
        <div className="p-6">
          <div className="flex items-center justify-between md:block">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 border border-white/60 shadow-sm w-full">
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

            {/* Botão de fechar (SÓ NO MOBILE) */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-rose-500 md:hidden"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Fecha ao clicar no mobile
                className={cn(
                  "group flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/40"
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

        {/* Rodapé / Role Badge */}
        <div className="p-6 mt-auto">
          <div
            className={cn(
              "relative overflow-hidden px-4 py-5 rounded-[2rem] border shadow-inner transition-all duration-500",
              role === "DESENVOLVEDOR"
                ? "bg-purple-500/5 border-purple-500/20"
                : "bg-slate-50 border-slate-200",
            )}
          >
            <div
              className={cn(
                "absolute -right-4 -top-4 w-12 h-12 blur-2xl rounded-full",
                role === "DESENVOLVEDOR"
                  ? "bg-purple-500/20"
                  : "bg-amber-500/10",
              )}
            />

            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1.5">
              Acesso Liberado
            </p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  role === "DESENVOLVEDOR"
                    ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    : "bg-amber-500",
                )}
              />
              <p
                className={cn(
                  "text-[11px] font-black uppercase tracking-tighter",
                  role === "DESENVOLVEDOR"
                    ? "text-purple-700"
                    : "text-slate-700",
                )}
              >
                {role === "DESENVOLVEDOR"
                  ? "Dev Mode"
                  : role === "ADMIN"
                    ? "Admin"
                    : "Vendedor"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
