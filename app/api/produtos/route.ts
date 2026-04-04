import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nome,
      categoria,
      tamanho,
      precoCusto,
      precoVenda,
      quantidade,
      estoqueMinimo,
      controlaEstoque,
    } = body;

    const produto = await prisma.produto.create({
      data: {
        nome,
        categoria: categoria || "OUTRO",
        tamanho: tamanho || "UNIDADE",
        precoCusto: Number(precoCusto),
        precoVenda: Number(precoVenda),
        quantidade: Number(quantidade),
        estoqueMinimo: Number(estoqueMinimo || 5),
        controlaEstoque:
          controlaEstoque === undefined ? true : Boolean(controlaEstoque),
      },
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error("Erro no POST:", error);
    return NextResponse.json({ error: "Erro ao cadastrar" }, { status: 500 });
  }
}

export async function GET() {
  const produtos = await prisma.produto.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(produtos);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      nome,
      precoVenda,
      quantidade,
      precoCusto,
      categoria,
      tamanho,
      estoqueMinimo,
      controlaEstoque,
    } = body;

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome,
        precoVenda: Number(precoVenda),
        quantidade: Number(quantidade),
        precoCusto: Number(precoCusto),
        categoria,
        tamanho,
        estoqueMinimo: Number(estoqueMinimo),
        controlaEstoque: Boolean(controlaEstoque), // Força a gravação como Booleano ✨
      },
    });

    return NextResponse.json(produtoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar no banco" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    await prisma.produto.delete({ where: { id } });
    return NextResponse.json({ message: "Produto excluído" });
  } catch (error: any) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
