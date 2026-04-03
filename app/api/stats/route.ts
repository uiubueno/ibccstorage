import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inicio = searchParams.get("inicio");
    const fim = searchParams.get("fim");

    // Datas padrão (Hoje)
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
      include: { produto: true },
    });

    // Cálculos
    const revenue = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);
    const count = vendas.length;
    const averageTicket = count > 0 ? revenue / count : 0;

    const lowStock = await prisma.produto.count({
      where: { quantidade: { lte: 5 }, ativo: true },
    });

    // Agrupar pagamentos (Se vazio, retorna array vazio para o gráfico não sumir)
    const pagamentosMap = vendas.reduce((acc: any, v) => {
      acc[v.metodoPagamento] =
        (acc[v.metodoPagamento] || 0) + Number(v.valorTotal);
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
      recent: vendas.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
