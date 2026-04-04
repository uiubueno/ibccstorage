"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserPlus,
  X,
  Mail,
  Shield,
  Camera,
  Upload,
  User,
} from "lucide-react"; // ✨ ADICIONADO O "User" AQUI
import { cn } from "@/lib/utils";

export default function UsuariosPage() {
  const { data: session } = useSession();
  const isDevLogado = session?.user?.role === "DESENVOLVEDOR";

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Form de Cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("VENDEDOR");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const carregarUsuarios = () => {
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("A imagem é muito grande! Escolha uma foto com menos de 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function cadastrarUsuario(e: React.FormEvent) {
    e.preventDefault();

    if (cargo === "DESENVOLVEDOR" && !isDevLogado) {
      alert(
        "Acesso Negado: Apenas Desenvolvedores podem criar outros Desenvolvedores.",
      );
      return;
    }

    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nome,
        email,
        password: senha,
        role: cargo,
        image: fotoBase64,
      }),
    });

    if (res.ok) {
      alert("Usuário criado com sucesso! 🎉");
      setModalAberto(false);
      setNome("");
      setEmail("");
      setSenha("");
      setCargo("VENDEDOR");
      setFotoBase64(null);
      carregarUsuarios();
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao cadastrar.");
    }
  }

  async function alternarStatus(
    id: string,
    ativoAtual: boolean,
    roleAlvo: string,
  ) {
    if (roleAlvo === "DESENVOLVEDOR" && !isDevLogado) {
      alert(
        "Operação não permitida. Você não pode alterar o status do Desenvolvedor.",
      );
      return;
    }

    const res = await fetch("/api/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ativo: !ativoAtual }),
    });

    if (res.ok) {
      carregarUsuarios();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse font-black text-slate-500 uppercase tracking-widest">
        Carregando equipe... 🍺
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-2 md:p-4 antialiased pb-20 md:pb-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 px-2 md:px-0">
        <div>
          <h2 className="flex flex-col md:flex-row md:items-center items-start gap-2 md:gap-3 text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
              <Users className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <span className="leading-tight">
              Gestão dos <span className="text-amber-500">Mais Mais</span>
            </span>
          </h2>
        </div>
        <Button
          onClick={() => setModalAberto(true)}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-widest rounded-2xl h-12 md:h-14 px-8 shadow-xl shadow-amber-500/20 transition-all active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
          <UserPlus className="w-5 h-5 mr-2" /> Novo Usuário
        </Button>
      </div>

      {/* TABELA PC */}
      <Card className="hidden md:block bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/40 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/50">
              <tr>
                <th className="px-8 py-6">Perfil</th>
                <th className="px-8 py-6">E-mail</th>
                <th className="px-8 py-6 text-center">Cargo</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {usuarios.map((u) => {
                const podeEditar = isDevLogado || u.role !== "DESENVOLVEDOR";
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <span className="font-black text-slate-800 uppercase text-sm">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 font-bold text-xs">
                      {u.email}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest",
                          u.role === "DESENVOLVEDOR"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : u.role === "ADMIN"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200",
                        )}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button
                        onClick={() => alternarStatus(u.id, u.ativo, u.role)}
                        disabled={!podeEditar}
                        className={cn(
                          "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                          !podeEditar
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                            : u.ativo
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
                        )}
                      >
                        {!podeEditar
                          ? "Bloqueado"
                          : u.ativo
                            ? "Ativo"
                            : "Inativo"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* CARDS MOBILE */}
      <div className="md:hidden space-y-4 px-2 pt-2">
        {usuarios.map((u) => {
          const podeEditar = isDevLogado || u.role !== "DESENVOLVEDOR";
          return (
            <Card
              key={u.id}
              className="bg-white/70 backdrop-blur-md border-white/60 rounded-[2rem] shadow-md overflow-hidden transition-all"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 pr-2">
                    {u.image ? (
                      <img
                        src={u.image}
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-md flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-black text-slate-800 uppercase text-sm leading-tight">
                        {u.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 flex items-center gap-1.5 truncate">
                        <Mail size={12} className="text-amber-500 shrink-0" />{" "}
                        {u.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/40">
                  <button
                    onClick={() => alternarStatus(u.id, u.ativo, u.role)}
                    disabled={!podeEditar}
                    className={cn(
                      "w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border",
                      !podeEditar
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                        : u.ativo
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-rose-50 text-rose-600 border-rose-200",
                    )}
                  >
                    {!podeEditar
                      ? "Acesso Restrito"
                      : u.ativo
                        ? "Acesso Liberado"
                        : "Acesso Bloqueado"}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* MODAL NOVO USUÁRIO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-md border border-white/60 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-white/40 flex justify-between items-center bg-white/40 shrink-0">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-amber-500" /> Cadastrar
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-rose-500/10 rounded-full text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={cadastrarUsuario}
              className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar"
            >
              <div className="flex flex-col items-center justify-center mb-6">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFotoUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-xl flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden relative group"
                >
                  {fotoBase64 ? (
                    <>
                      <img
                        src={fotoBase64}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Foto
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Nome
                </Label>
                <Input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: William Bueno"
                  className="h-12 md:h-14 rounded-2xl bg-white/50 border-white/60 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  E-mail
                </Label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="willbueno@adegaeneas.com"
                  className="h-12 md:h-14 rounded-2xl bg-white/50 border-white/60 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Senha
                </Label>
                <Input
                  required
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 md:h-14 rounded-2xl bg-white/50 border-white/60 font-bold tracking-widest"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Cargo
                </Label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full h-12 md:h-14 rounded-2xl border border-white/60 bg-white/50 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                >
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="ADMIN">Administrador</option>
                  {isDevLogado && (
                    <option value="DESENVOLVEDOR">
                      Desenvolvedor (Dev Mode)
                    </option>
                  )}
                </select>
              </div>
              <Button
                type="submit"
                className="w-full h-14 md:h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest mt-6 shadow-xl transition-all active:scale-95 shrink-0"
              >
                Criar Usuário
              </Button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
