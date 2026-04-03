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

// Adicione esta função PATCH no final do seu app/api/produtos/route.ts

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
