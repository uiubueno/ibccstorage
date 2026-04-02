"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  ShoppingBag,
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
  {
    href: "/estoque",
    label: "Estoque",
    icon: Package,
    adminOnly: false,
  },
  {
    href: "/vendas",
    label: "Vendas (PDV)",
    icon: ShoppingCart,
    adminOnly: false,
  },
  {
    href: "/usuarios",
    label: "Usuários",
    icon: Users,
    adminOnly: true,
  },
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

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <ShoppingBag className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Minha Loja</p>
            <p className="text-xs text-slate-400">Gestão de Roupas</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-3 py-2 rounded-lg bg-slate-800 text-center">
          <p className="text-xs text-slate-400">Perfil</p>
          <p className={cn(
            "text-xs font-bold mt-0.5",
            isAdmin ? "text-amber-400" : "text-sky-400"
          )}>
            {isAdmin ? "Administrador" : "Vendedor"}
          </p>
        </div>
      </div>
    </aside>
  );
}