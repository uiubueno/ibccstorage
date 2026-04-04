import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inicio = searchParams.get("inicio");
    const fim = searchParams.get("fim");

    let dInicio = startOfDay(new Date());
    let dFim = endOfDay(new Date());

    if (inicio && fim) {
      dInicio = startOfDay(new Date(inicio + "T00:00:00"));
      dFim = endOfDay(new Date(fim + "T23:59:59"));
    }

    const vendas = await prisma.venda.findMany({
      where: {
        createdAt: { gte: dInicio, lte: dFim },
      },
      include: {
        devedor: { select: { nome: true } },
        itens: {
          include: {
            produto: { select: { nome: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const revenue = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);
    const count = vendas.length;
    const averageTicket = count > 0 ? revenue / count : 0;

    // --- LÓGICA DE BAIXO ESTOQUE REFINADA ✨ ---
    const todosProdutos = await prisma.produto.findMany({
      where: { ativo: true },
      select: { quantidade: true, estoqueMinimo: true, controlaEstoque: true },
    });

    // Só conta como baixo estoque se controlar estoque E estiver abaixo do mínimo
    const lowStock = todosProdutos.filter(
      (p) => p.controlaEstoque === true && p.quantidade <= p.estoqueMinimo,
    ).length;

    const pagamentosMap = vendas.reduce((acc: any, v) => {
      const metodo = v.metodoPagamento.replace("_", " ");
      acc[metodo] = (acc[metodo] || 0) + Number(v.valorTotal);
      return acc;
    }, {});

    const chartData =
      Object.keys(pagamentosMap).length > 0
        ? Object.keys(pagamentosMap).map((key) => ({
            name: key,
            value: pagamentosMap[key],
          }))
        : [{ name: "Sem vendas", value: 0 }];

    return NextResponse.json({
      revenue,
      count,
      averageTicket,
      lowStock,
      chartData,
      recent: vendas.slice(0, 10),
    });
  } catch (error) {
    console.error("Erro na API de Stats:", error);
    return NextResponse.json(
      { error: "Erro interno no Dashboard" },
      { status: 500 },
    );
  }
}
