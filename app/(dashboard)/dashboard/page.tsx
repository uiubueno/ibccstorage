import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, ShoppingCart, DollarSign } from "lucide-react";
import { startOfDay, startOfMonth, endOfDay, endOfMonth } from "date-fns";

async function getDashboardData() {
  const hoje = new Date();
  const inicioDia = startOfDay(hoje);
  const fimDia = endOfDay(hoje);
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const [vendasHoje, vendasMes, totalProdutos, estoqueBaixo] = await Promise.all([
    prisma.venda.aggregate({
      where: { createdAt: { gte: inicioDia, lte: fimDia } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.venda.aggregate({
      where: { createdAt: { gte: inicioMes, lte: fimMes } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.produto.count({ where: { ativo: true } }),
    prisma.produto.count({ where: { ativo: true, quantidade: { lte: 5 } } }),
  ]);

  return { vendasHoje, vendasMes, totalProdutos, estoqueBaixo };
}

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/estoque");

  const { vendasHoje, vendasMes, totalProdutos, estoqueBaixo } = await getDashboardData();

  const fmt = (v: any) =>
    Number(v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const cards = [
    {
      title: "Vendas Hoje",
      value: fmt(vendasHoje._sum.total),
      sub: `${vendasHoje._count} transação(ões)`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Vendas do Mês",
      value: fmt(vendasMes._sum.total),
      sub: `${vendasMes._count} transação(ões)`,
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Produtos Ativos",
      value: String(totalProdutos),
      sub: "no catálogo",
      icon: Package,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Estoque Baixo",
      value: String(estoqueBaixo),
      sub: "≤ 5 unidades",
      icon: ShoppingCart,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral do negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}