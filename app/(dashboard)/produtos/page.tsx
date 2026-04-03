"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, PackageCheck, Loader2 } from "lucide-react";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  // Estados simplificados (apenas o essencial)
  const [nome, setNome] = useState("");
  const [custo, setCusto] = useState("");
  const [venda, setVenda] = useState("");
  const [qtd, setQtd] = useState("");

  const carregar = () => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data);
        setLoadingPage(false);
      });
  };

  useEffect(() => {
    carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        // Mandamos valores padrão escondidos para o banco não reclamar
        categoria: "OUTRO",
        tamanho: "UNIDADE",
        precoCusto: custo,
        precoVenda: venda,
        quantidade: qtd,
      }),
    });
    if (res.ok) {
      alert("Sucesso! Item adicionado à adega. 🍻");
      carregar();
      setNome("");
      setCusto("");
      setVenda("");
      setQtd("");
    } else {
      alert("Erro ao salvar produto.");
    }
    setLoading(false);
  }

  if (loadingPage) {
    return (
      <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
        Carregando prateleiras... 🍺
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 font-sans antialiased relative">
      {/* HEADER (LIQUID GLASS PREMIUM) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
              <PackageCheck className="h-8 w-8" />
            </div>
            Entrada de <span className="text-amber-500">Produtos</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 ml-1">
            Cadastro Rápido de Itens
          </p>
        </div>
      </div>

      {/* FORMULÁRIO SIMPLIFICADO (LIQUID GLASS CARD) */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-white/40 border-b border-white/50 pb-6">
          <CardTitle className="text-xl font-black uppercase text-slate-800 tracking-tight">
            Detalhes do Novo Item
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form
            onSubmit={salvar}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* NOME (OCUPA AS DUAS COLUNAS) */}
            <div className="md:col-span-2 space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Nome do Produto (Seja Específico)
              </Label>
              <Input
                placeholder="Ex: Cerveja Heineken Lata 350ml"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="h-14 bg-white/50 border-white/60 rounded-2xl focus:bg-white/80 shadow-sm text-slate-900 font-bold placeholder:text-slate-400 text-lg"
              />
            </div>

            {/* CUSTO E VENDA */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Preço de Custo (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                required
                className="h-14 bg-white/50 border-white/60 rounded-2xl focus:bg-white/80 shadow-sm text-rose-600 font-black text-xl"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Preço Venda (R$)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={venda}
                onChange={(e) => setVenda(e.target.value)}
                required
                className="h-14 bg-white/50 border-white/60 rounded-2xl focus:bg-white/80 shadow-sm text-emerald-600 font-black text-xl"
              />
            </div>

            {/* QUANTIDADE E BOTÃO */}
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                Qtd Inicial no Estoque
              </Label>
              <Input
                type="number"
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                required
                className="h-14 bg-white/50 border-white/60 rounded-2xl focus:bg-white/80 shadow-sm text-slate-900 font-black text-xl text-center"
              />
            </div>

            {/* BOTÃO SUBMIT */}
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-amber-500/90 backdrop-blur-md border border-amber-400/50 hover:bg-amber-500 text-slate-950 font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 rounded-2xl transition-all active:scale-95 relative overflow-hidden group"
              >
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                )}
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <PlusCircle className="mr-2 h-5 w-5" />
                )}
                {loading ? "Registrando..." : "Cadastrar Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* LISTA DE PRODUTOS CADASTRADOS (LIQUID GLASS GRID) */}
      <div className="pt-4">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">
          Últimos Cadastrados
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {produtos.slice(0, 8).map((p) => (
            <Card
              key={p.id}
              className="bg-white/60 backdrop-blur-xl border-white/40 shadow-lg rounded-[2rem] hover:bg-white/80 hover:shadow-xl transition-all group"
            >
              <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
                <div>
                  <p className="font-black text-slate-800 uppercase text-sm leading-tight group-hover:text-amber-600 transition-colors">
                    {p.nome}
                  </p>
                </div>

                <div className="flex justify-between items-end border-t border-white/50 pt-4 mt-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                      Estoque:{" "}
                      <span className="text-slate-800 font-black">
                        {p.quantidade} un
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600 tracking-tighter">
                      R$ {Number(p.precoVenda).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
