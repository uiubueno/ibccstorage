import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalVendas,
      somaVendas,
      produtosBaixoEstoque,
      ultimasVendas,
      statsPagamento,
    ] = await Promise.all([
      prisma.venda.count(),
      prisma.venda.aggregate({ _sum: { valorTotal: true } }),
      prisma.produto.count({ where: { quantidade: { lte: 5 } } }),
      prisma.venda.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { produto: true },
      }),
      prisma.venda.groupBy({
        by: ["metodoPagamento"],
        _count: true,
      }),
    ]);

    const revenue = Number(somaVendas._sum.valorTotal || 0);
    const count = totalVendas;

    // Cálculo do Ticket Médio (evitando divisão por zero)
    const averageTicket = count > 0 ? revenue / count : 0;

    const chartData = statsPagamento.map((item) => ({
      name: item.metodoPagamento,
      value: item._count,
    }));

    return NextResponse.json({
      count,
      revenue,
      averageTicket, // Enviando o novo dado
      lowStock: produtosBaixoEstoque,
      recent: ultimasVendas,
      chartData,
    });
  } catch (error) {
    console.error("Erro no Stats:", error);
    return NextResponse.json(
      { error: "Erro ao buscar stats" },
      { status: 500 },
    );
  }
}
