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
        gte: new Date(`${inicio}T00:00:00.000Z`),
        lte: new Date(`${fim}T23:59:59.999Z`), // Garante que pegue o dia todo certinho no fuso UTC
      };
    }

    // A BUSCA: Agora incluindo os itens e os produtos dentro deles
    const vendas = await prisma.venda.findMany({
      where: whereClause,
      include: {
        produto: true, // Mantemos para não quebrar vendas antigas
        vendedor: true,
        itens: {
          include: {
            produto: true, // Precisamos do produto aqui para saber o precoCusto de cada item
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // A MATEMÁTICA: Ajustada para somar o custo do carrinho inteiro
    const stats = vendas.reduce(
      (acc, venda) => {
        const precoVenda = Number(venda.valorTotal);
        let precoCustoTotal = 0;

        // VERIFICAÇÃO: É uma venda nova (vários itens) ou antiga (só 1)?
        if (venda.itens && venda.itens.length > 0) {
          // Se tem itens, soma o custo de todos os itens do carrinho
          precoCustoTotal = venda.itens.reduce((soma, item) => {
            return (
              soma + Number(item.produto?.precoCusto || 0) * item.quantidade
            );
          }, 0);
        } else if (venda.produto) {
          // Se é venda antiga (legado), usa a regra anterior
          precoCustoTotal = Number(venda.produto.precoCusto) * venda.quantidade;
        }

        acc.faturamentoTotal += precoVenda;
        acc.custoTotal += precoCustoTotal;
        acc.lucroTotal += precoVenda - precoCustoTotal;

        return acc;
      },
      { faturamentoTotal: 0, custoTotal: 0, lucroTotal: 0 },
    );

    return NextResponse.json({ vendas, stats });
  } catch (error) {
    console.error("Erro no relatório:", error);
    return NextResponse.json(
      { error: "Erro ao filtrar relatório" },
      { status: 500 },
    );
  }
}
