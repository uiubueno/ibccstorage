import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inicio = searchParams.get("inicio");
    const fim = searchParams.get("fim");

    // Monta o filtro de data se elas existirem
    const whereClause: any = {};
    if (inicio && fim) {
      whereClause.createdAt = {
        gte: new Date(inicio),
        lte: new Date(new Date(fim).setHours(23, 59, 59, 999)), // Garante que pegue o dia todo
      };
    }

    const vendas = await prisma.venda.findMany({
      where: whereClause,
      include: {
        produto: true,
        vendedor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = vendas.reduce(
      (acc, venda) => {
        const precoVenda = Number(venda.valorTotal);
        const precoCustoTotal =
          Number(venda.produto.precoCusto) * venda.quantidade;

        acc.faturamentoTotal += precoVenda;
        acc.custoTotal += precoCustoTotal;
        acc.lucroTotal += precoVenda - precoCustoTotal;

        return acc;
      },
      { faturamentoTotal: 0, custoTotal: 0, lucroTotal: 0 },
    );

    return NextResponse.json({ vendas, stats });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao filtrar relatório" },
      { status: 500 },
    );
  }
}
