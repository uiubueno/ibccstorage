import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth"; // Importe a sua sessão do NextAuth ✨

// 1. LISTAR USUÁRIOS
export async function GET() {
  try {
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
        image: true, // ✨ AGORA A API DEVOLVE A FOTO PARA A TABELA
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

// 2. CADASTRAR NOVO USUÁRIO (Blindado)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const quemEstaLogado = session.user?.role; // Pega o cargo de quem tá mandando o POST

    const body = await request.json();
    const { name, email, password, role, image } = body; // ✨ RECEBE A FOTO DO FRONT

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // --- TRAVA DO COFRE 1: ADMIN NÃO CRIA DEV ✨ ---
    if (role === "DESENVOLVEDOR" && quemEstaLogado !== "DESENVOLVEDOR") {
      return NextResponse.json(
        {
          error:
            "Hack detectado: Apenas Desenvolvedores podem criar contas de Desenvolvedor.",
        },
        { status: 403 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const novoUsuario = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "VENDEDOR",
        ativo: true,
        image, // ✨ SALVA A FOTO NO BANCO DE DADOS
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

// 3. ATUALIZAR (COM TRAVAS MÚLTIPLAS E CORREÇÃO PRO MESTRE)
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const quemEstaLogado = session.user?.role;
    const emailDeQuemEstaLogado = session.user?.email; // ✨ NOVO: Pega o seu e-mail da sessão

    const body = await request.json();
    const { id, role, ativo, image } = body;

    const usuarioAlvo = await prisma.user.findUnique({ where: { id } });

    // --- TRAVA DO COFRE 2 CORRIGIDA: O MESTRE É INTOCÁVEL (A NÃO SER POR ELE MESMO) ✨ ---
    if (
      usuarioAlvo?.email === "willbueno_@adegaeneas.com" &&
      emailDeQuemEstaLogado !== "willbueno_@adegaeneas.com" // Se não for você mexendo em você mesmo, bloqueia!
    ) {
      return NextResponse.json(
        {
          error:
            "Acesso Negado: O Desenvolvedor Mestre é vitalício e intocável.",
        },
        { status: 403 },
      );
    }

    // --- TRAVA DO COFRE 3: ADMIN NÃO PODE EDITAR OUTRO DEV ✨ ---
    if (
      usuarioAlvo?.role === "DESENVOLVEDOR" &&
      quemEstaLogado !== "DESENVOLVEDOR"
    ) {
      return NextResponse.json(
        {
          error:
            "Acesso Negado: Você não tem permissão para alterar ou inativar um Desenvolvedor.",
        },
        { status: 403 },
      );
    }

    // --- TRAVA DO COFRE 4: ADMIN NÃO PODE PROMOVER ALGUÉM A DEV ✨ ---
    if (role === "DESENVOLVEDOR" && quemEstaLogado !== "DESENVOLVEDOR") {
      return NextResponse.json(
        {
          error:
            "Acesso Negado: Você não pode promover um funcionário a Desenvolvedor.",
        },
        { status: 403 },
      );
    }

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: {
        role,
        ativo,
        ...(image !== undefined && { image }), // ✨ Só atualiza a imagem se ela for enviada no PATCH
      },
    });

    return NextResponse.json(usuarioAtualizado);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
