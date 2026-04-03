import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inicio = searchParams.get("inicio");
    const fim = searchParams.get("fim");

    // 1. Ajuste das Datas (Mantendo seu padrão date-fns)
    let dInicio = startOfDay(new Date());
    let dFim = endOfDay(new Date());

    if (inicio && fim) {
      dInicio = startOfDay(new Date(inicio + "T00:00:00"));
      dFim = endOfDay(new Date(fim + "T23:59:59"));
    }

    // 2. BUSCA TURBINADA: Agora incluímos os itens da venda e o devedor (fiado)
    const vendas = await prisma.venda.findMany({
      where: {
        createdAt: { gte: dInicio, lte: dFim },
      },
      include: {
        devedor: { select: { nome: true } }, // Para mostrar quem deve no Dashboard
        itens: {
          include: {
            produto: { select: { nome: true } }, // Pega o nome de cada produto dentro da venda
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Cálculos de Faturamento e Ticket Médio
    const revenue = vendas.reduce((acc, v) => acc + Number(v.valorTotal), 0);
    const count = vendas.length;
    const averageTicket = count > 0 ? revenue / count : 0;

    // 4. Contador de Baixo Estoque (Continua igual, está ok)
    const lowStock = await prisma.produto.count({
      where: { quantidade: { lte: 5 }, ativo: true },
    });

    // 5. Gráfico de Pagamentos (Ajustado para o novo método FIADO)
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

    // 6. Retorno dos Dados
    return NextResponse.json({
      revenue,
      count,
      averageTicket,
      lowStock,
      chartData,
      recent: vendas.slice(0, 10), // Aumentei para 10 para o Danilo ver mais movimento
    });
  } catch (error) {
    console.error("Erro na API de Stats:", error);
    return NextResponse.json(
      { error: "Erro interno no Dashboard" },
      { status: 500 },
    );
  }
}
