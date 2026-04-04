import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// FUNÇÃO PARA DELETAR USUÁRIO COM TRAVA MESTRE (Versão Next.js 15+)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // ✨ Mudança 1: Tipagem como Promise
) {
  try {
    // ✨ Mudança 2: Esperar o ID chegar (await)
    const { id } = await params;

    // 1. BUSCA O USUÁRIO QUE TENTARAM DELETAR
    const usuarioAlvo = await prisma.user.findUnique({
      where: { id },
    });

    // 2. TRAVA DE SEGURANÇA: Ninguém deleta o Administrador Mestre
    if (usuarioAlvo?.email === "willbueno_@adegaeneas.com") {
      return NextResponse.json(
        {
          error:
            "Acesso Negado: O Administrador Mestre não pode ser removido do sistema.",
        },
        { status: 403 },
      );
    }

    // 3. SE NÃO FOR VOCÊ, DELETA NORMALMENTE
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao tentar remover o usuário." },
      { status: 500 },
    );
  }
}
