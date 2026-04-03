import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // 1. Pegamos as datas que vêm da URL (?inicio=YYYY-MM-DD&fim=YYYY-MM-DD)
    const { searchParams } = new URL(request.url);
    const inicio = searchParams.get("inicio");
    const fim = searchParams.get("fim");

    // 2. Montamos o filtro dinâmico
    let where: any = {};

    if (inicio && fim) {
      where.createdAt = {
        gte: new Date(`${inicio}T00:00:00.000Z`), // Início do dia
        lte: new Date(`${fim}T23:59:59.999Z`), // Fim do dia
      };
    }

    // 3. Buscamos as vendas com o filtro
    const vendas = await prisma.venda.findMany({
      where,
      include: {
        produto: true,
        vendedor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 4. Calculamos as estatísticas que o seu frontend espera
    // Isso evita que o frontend tenha que fazer conta pesada
    const stats = vendas.reduce(
      (acc, venda) => {
        const totalVenda = Number(venda.valorTotal);
        const custoTotal = Number(venda.produto.precoCusto) * venda.quantidade;

        return {
          faturamentoTotal: acc.faturamentoTotal + totalVenda,
          lucroTotal: acc.lucroTotal + (totalVenda - custoTotal),
        };
      },
      { faturamentoTotal: 0, lucroTotal: 0 },
    );

    // 5. Retornamos o objeto completo
    return NextResponse.json({
      vendas,
      stats,
    });
  } catch (error) {
    console.error("Erro no relatório:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 },
    );
  }
}
