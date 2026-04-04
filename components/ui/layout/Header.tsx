"use client";

import { useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user: {
    id?: string; // Trazemos o ID para saber quem estamos atualizando
    name?: string | null;
    email?: string | null;
    role: string;
    image?: string | null;
  };
}

export default function Header({ user }: HeaderProps) {
  const { data: session, update } = useSession(); // Usamos update para forçar a sessão a recarregar
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [fotoLocal, setFotoLocal] = useState<string | null>(null); // Mostra a foto na hora, sem esperar recarregar a página

  // Identifica o ID de quem está logado
  const userId = (session?.user as any)?.id || user.id;

  // TRUQUE MÁGICO ✨: Prioriza a foto que acabou de subir -> depois a da sessão -> depois a do banco -> depois as iniciais
  const avatarUrl =
    fotoLocal ||
    session?.user?.image ||
    user?.image ||
    (user?.name
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=fff&bold=true&rounded=true`
      : null);

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert(
        "Essa imagem é muito grande! Escolha uma foto menor que 1MB para não pesar o banco.",
      );
      return;
    }

    if (!userId) {
      alert("Erro: ID do usuário não encontrado. Tente fazer login novamente.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        // Manda o PATCH para a API que a gente blindou
        const res = await fetch("/api/usuarios", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId, image: base64String }),
        });

        if (res.ok) {
          setFotoLocal(base64String); // Muda a foto no Header instantaneamente
          await update(); // Força o NextAuth a atualizar os cookies em segundo plano
        } else {
          const err = await res.json();
          alert(err.error || "Erro ao salvar a foto.");
        }
      } catch (error) {
        alert("Erro de conexão ao tentar salvar a foto.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="h-20 bg-white/60 backdrop-blur-xl border-b border-white/40 flex items-center justify-end px-6 md:px-8 shadow-sm z-10 sticky top-0 no-print transition-all">
      <div className="flex items-center gap-4 md:gap-6">
        {/* PERFIL DO USUÁRIO ✨ */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="font-black text-slate-800 text-xs md:text-sm uppercase tracking-tight leading-tight">
              {user?.name || "Usuário"}
            </p>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {user?.email}
            </p>
          </div>

          {/* FOTO / AVATAR COM UPLOAD */}
          <div className="relative group">
            {/* Input escondido */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFotoUpload}
              className="hidden"
            />

            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={cn(
                "h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden border-[3px] border-white shadow-md bg-slate-100 flex items-center justify-center relative",
                !isUploading && "cursor-pointer",
              )}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name || "Avatar"}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}

              {/* Efeito Hover com Câmera */}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-300/50 hidden md:block"></div>

        {/* BOTÃO DE SAIR PREMIUM */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-all font-black text-[10px] uppercase tracking-widest bg-white/50 hover:bg-rose-50 px-4 py-2.5 rounded-xl border border-white/60 shadow-sm active:scale-95"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
