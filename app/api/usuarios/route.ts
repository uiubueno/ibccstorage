import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 1. LISTAR USUÁRIOS
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

// 2. CADASTRAR NOVO USUÁRIO (Incluindo Desenvolvedor)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const novoUsuario = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "VENDEDOR",
        ativo: true,
      },
    });

    return NextResponse.json(novoUsuario, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 },
    );
  }
}

// 3. ATUALIZAR (COM TRAVA PARA O DESENVOLVEDOR MESTRE)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, role, ativo } = body;

    const usuarioAlvo = await prisma.user.findUnique({ where: { id } });

    // --- TRAVA DE SEGURANÇA ELITE ---
    if (usuarioAlvo?.email === "willbueno_@adegaeneas.com") {
      return NextResponse.json(
        {
          error:
            "Acesso Negado: O Desenvolvedor Mestre é vitalício e intocável.",
        },
        { status: 403 },
      );
    }

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: { role, ativo },
    });

    return NextResponse.json(usuarioAtualizado);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
