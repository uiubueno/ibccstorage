"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Form de Cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("VENDEDOR");

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

  async function cadastrarUsuario(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nome, email, password: senha, role: cargo }),
    });

    if (res.ok) {
      alert("Usuário criado com sucesso! 🎉");
      setModalAberto(false);
      setNome("");
      setEmail("");
      setSenha("");
      setCargo("VENDEDOR");
      carregarUsuarios();
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao cadastrar.");
    }
  }

  async function alternarStatus(id: string, ativoAtual: boolean) {
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
      <div className="p-10 text-center animate-pulse font-bold text-slate-500 uppercase tracking-widest">
        Carregando equipe... 🍺
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 antialiased">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
              <Users className="h-8 w-8" />
            </div>
            Gestão de <span className="text-amber-500">Equipe</span>
          </h2>
        </div>
        <Button
          onClick={() => setModalAberto(true)}
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl h-12 px-6 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5 mr-2" /> Novo Usuário
        </Button>
      </div>

      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-white/40 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/50">
              <tr>
                <th className="px-6 py-5">Nome</th>
                <th className="px-6 py-5">E-mail</th>
                <th className="px-6 py-5 text-center">Cargo</th>
                <th className="px-6 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
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
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => alternarStatus(u.id, u.ativo)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all active:scale-95",
                        u.ativo
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100",
                      )}
                    >
                      {u.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MODAL NOVO USUÁRIO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/60 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/40">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter">
                Cadastrar Acesso
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-rose-500/10 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={cadastrarUsuario} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Nome
                </Label>
                <Input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: William Bueno"
                  className="h-12 rounded-xl bg-white/50 border-white/60 font-bold"
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
                  placeholder="Ex: willbueno_@adegaeneas.com"
                  className="h-12 rounded-xl bg-white/50 border-white/60 font-bold"
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
                  className="h-12 rounded-xl bg-white/50 border-white/60 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Cargo
                </Label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="w-full h-12 rounded-xl border border-white/60 bg-white/50 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="VENDEDOR">VENDEDOR</option>
                  <option value="ADMIN">ADMINISTRADOR</option>
                  <option value="DESENVOLVEDOR">DESENVOLVEDOR</option>
                </select>
              </div>
              <Button
                type="submit"
                className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl transition-all active:scale-95"
              >
                Criar Usuário
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
