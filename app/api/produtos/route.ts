import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, categoria, tamanho, precoCusto, precoVenda, quantidade } =
      body;

    const produto = await prisma.produto.create({
      data: {
        nome,
        categoria,
        tamanho,
        precoCusto: Number(precoCusto),
        precoVenda: Number(precoVenda),
        quantidade: Number(quantidade),
      },
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar bebida" },
      { status: 500 },
    );
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
    const { id, nome, precoVenda, quantidade, precoCusto, categoria, tamanho } =
      body;

    const produtoAtualizado = await prisma.produto.update({
      where: { id },
      data: {
        nome,
        precoVenda: Number(precoVenda),
        quantidade: Number(quantidade),
        precoCusto: Number(precoCusto),
        categoria,
        tamanho,
      },
    });

    return NextResponse.json(produtoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar dados no banco" },
      { status: 500 },
    );
  }
}

// NOVA FUNÇÃO: Excluir Produto
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    await prisma.produto.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produto excluído com sucesso" });
  } catch (error: any) {
    console.error("Erro ao excluir:", error);

    // Se der erro de chave estrangeira (já tem venda com esse produto)
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir um produto que já possui histórico de vendas. Altere o estoque para zero em vez de excluir.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 },
    );
  }
}
