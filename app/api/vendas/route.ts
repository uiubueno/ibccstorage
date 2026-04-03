import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// --- BUSCAR VENDAS (Para o Dashboard e Relatórios) ---
export async function GET() {
  try {
    const vendas = await prisma.venda.findMany({
      include: {
        vendedor: { select: { name: true } },
        devedor: { select: { nome: true } },
        itens: {
          include: {
            produto: { select: { nome: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // As mais recentes primeiro
      },
      take: 20, // Puxa as últimas 20 para não pesar o Dashboard
    });

    return NextResponse.json(vendas);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json(
      { error: "Erro ao carregar vendas" },
      { status: 500 },
    );
  }
}

// --- GRAVAR NOVA VENDA (O que a gente já tinha feito) ---
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itens, metodoPagamento, valorTotal, vendedorId, devedorId } = body;

    if (!itens || itens.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Criar a Venda
      const venda = await tx.venda.create({
        data: {
          vendedorId,
          metodoPagamento,
          valorTotal,
          devedorId: metodoPagamento === "FIADO" ? devedorId : null,
          produtoId: itens[0].produtoId, // Compatibilidade com schema antigo
          quantidade: itens[0].quantidade, // Compatibilidade com schema antigo
          itens: {
            create: itens.map((item: any) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnit: item.precoUnitario,
              subtotal: Number(item.precoUnitario) * item.quantidade,
            })),
          },
        },
      });

      // 2. Baixa no estoque
      for (const item of itens) {
        const produto = await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            quantidade: { decrement: item.quantidade },
          },
        });

        if (produto.quantidade < 0) {
          throw new Error(`Estoque insuficiente: ${produto.nome}`);
        }
      }

      // 3. Se for Fiado, aumenta a dívida
      if (metodoPagamento === "FIADO" && devedorId) {
        await tx.devedor.update({
          where: { id: devedorId },
          data: {
            saldoDevedor: { increment: valorTotal },
          },
        });
      }

      return venda;
    });

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error("Erro ao processar venda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
