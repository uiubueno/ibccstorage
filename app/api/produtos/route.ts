import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota para BUSCAR todos os produtos (GET)
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        createdAt: "desc", // Mostra os mais recentes primeiro
      },
    });
    return NextResponse.json(produtos);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 },
    );
  }
}

// Rota para CRIAR um novo produto (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const produto = await prisma.produto.create({
      data: {
        nome: body.nome,
        categoria: body.categoria,
        tamanho: body.tamanho,
        cor: body.cor,
        precoCusto: body.precoCusto,
        precoVenda: body.precoVenda,
        quantidade: body.quantidade,
      },
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 },
    );
  }
}
