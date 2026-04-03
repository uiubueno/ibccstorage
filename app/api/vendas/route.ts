import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { produtoId, quantidade, valorTotal, vendedorId, metodoPagamento } =
      body;

    // Verificação de segurança: Venda precisa de um dono
    if (!vendedorId) {
      return NextResponse.json(
        { error: "ID do vendedor é obrigatório" },
        { status: 400 },
      );
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Cria o registro da venda com o método de pagamento
      const venda = await tx.venda.create({
        data: {
          produtoId,
          vendedorId,
          quantidade: Number(quantidade),
          valorTotal: Number(valorTotal),
          metodoPagamento: metodoPagamento || "PIX", // Valor padrão caso venha vazio
        },
      });

      // 2. Atualiza o estoque automaticamente
      await tx.produto.update({
        where: { id: produtoId },
        data: {
          quantidade: { decrement: Number(quantidade) },
        },
      });

      return venda;
    });

    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    console.error("Erro na venda:", error);
    return NextResponse.json(
      { error: "Erro ao processar venda no banco de dados" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        produto: true,
        vendedor: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(vendas);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar histórico de vendas" },
      { status: 500 },
    );
  }
}
