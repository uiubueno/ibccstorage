import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 1. BUSCAR A LISTA (O que faz a tela carregar) 📋
export async function GET() {
  try {
    const devedores = await prisma.devedor.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(devedores);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar devedores" },
      { status: 500 },
    );
  }
}

// 2. CADASTRAR NOVO (O botão de Novo Cliente) 👤
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome } = body;

    const novoDevedor = await prisma.devedor.create({
      data: {
        nome,
        saldoDevedor: 0,
      },
    });

    return NextResponse.json(novoDevedor, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao cadastrar cliente" },
      { status: 500 },
    );
  }
}

// 3. PAGAMENTO (O botão de Receber) 💰
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, valorPago } = body;

    const devedorAtualizado = await prisma.devedor.update({
      where: { id },
      data: {
        saldoDevedor: {
          decrement: Number(valorPago),
        },
      },
    });

    return NextResponse.json(devedorAtualizado);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao registrar pagamento" },
      { status: 500 },
    );
  }
}
