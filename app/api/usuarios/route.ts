import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 },
    );
  }
}

// Rota para atualizar cargo ou status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, role, ativo } = body;

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: { role, ativo },
    });

    return NextResponse.json(usuarioAtualizado);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 },
    );
  }
}
