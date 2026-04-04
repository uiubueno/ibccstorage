"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  PackageCheck,
  Loader2,
  AlertTriangle,
  Pencil,
  X,
  Infinity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Estados do Formulário
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [custo, setCusto] = useState("");
  const [venda, setVenda] = useState("");
  const [qtd, setQtd] = useState("");
  const [estoqueMinimo, setEstoqueMinimo] = useState("5");
  const [controlaEstoque, setControlaEstoque] = useState(true);

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

  const abrirEdicao = (p: any) => {
    setIdEditando(p.id);
    setNome(p.nome);
    setCusto(p.precoCusto.toString());
    setVenda(p.precoVenda.toString());
    setQtd(p.quantidade.toString());
    setEstoqueMinimo(p.estoqueMinimo.toString());
    setControlaEstoque(p.controlaEstoque);
    setModalAberto(true);
  };

  const limparEFechar = () => {
    setIdEditando(null);
    setNome("");
    setCusto("");
    setVenda("");
    setQtd("");
    setEstoqueMinimo("5");
    setControlaEstoque(true);
    setModalAberto(false);
  };

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/produtos", {
      method: idEditando ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: idEditando,
        nome,
        precoCusto: custo,
        precoVenda: venda,
        quantidade: Number(qtd),
        estoqueMinimo: Number(estoqueMinimo),
        controlaEstoque,
        categoria: "OUTRO",
        tamanho: "UNIDADE",
      }),
    });

    if (res.ok) {
      carregar();
      limparEFechar();
    } else {
      alert("Erro ao salvar.");
    }
    setLoading(false);
  }

  if (loadingPage)
    return (
      <div className="p-10 text-center font-bold animate-pulse text-slate-500 uppercase tracking-widest">
        Carregando prateleiras... 🍺
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-2 md:p-4 font-sans antialiased pb-20 md:pb-0">
      {/* HEADER RESPONSIVO ✨ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
              <PackageCheck className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            Gestão<span className="text-amber-500">Estoque</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Cadastro de Produtos e Serviços
          </p>
        </div>
        <Button
          onClick={() => setModalAberto(true)}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-widest rounded-2xl h-12 md:h-14 px-8 shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Novo Item
        </Button>
      </div>

      {/* GRID RESPONSIVA ✨ (1 Col no Mobile, 2 no Tablet, 4 no PC) */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pt-4 px-2 md:px-0">
        {produtos.map((p) => (
          <Card
            key={p.id}
            className="bg-white/60 backdrop-blur-xl border-white/40 shadow-lg rounded-[2rem] hover:bg-white/80 transition-all group overflow-hidden active:scale-[0.98]"
          >
            <CardContent className="p-6 flex flex-col gap-4 relative">
              <button
                onClick={() => abrirEdicao(p)}
                className="absolute top-4 right-4 p-2.5 bg-slate-900/5 hover:bg-amber-500 hover:text-white rounded-full transition-all text-slate-400 md:opacity-0 group-hover:opacity-100 shadow-sm border border-white/50"
              >
                <Pencil className="w-4 h-4" />
              </button>

              <div>
                <p className="font-black text-slate-800 uppercase text-sm leading-tight pr-8">
                  {p.nome}
                </p>
                <span
                  className={cn(
                    "inline-block mt-2 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border",
                    !p.controlaEstoque
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : p.quantidade <= p.estoqueMinimo
                        ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                        : "bg-slate-50 text-slate-500 border-slate-100",
                  )}
                >
                  {!p.controlaEstoque
                    ? "Dose / Serviço"
                    : p.quantidade <= p.estoqueMinimo
                      ? "Estoque Crítico"
                      : "Em Estoque"}
                </span>
              </div>

              <div className="flex justify-between items-end border-t border-white/60 pt-4 mt-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                  {p.controlaEstoque ? (
                    <>
                      Qtd:{" "}
                      <span className="text-slate-800 font-black">
                        {p.quantidade}
                      </span>
                      <br />
                      Mín:{" "}
                      <span className="text-amber-600 font-black">
                        {p.estoqueMinimo}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1 font-black">
                      <Infinity className="w-3.5 h-3.5" /> Infinito
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black text-emerald-600 tracking-tighter">
                  <span className="text-xs mr-0.5 opacity-50 italic">R$</span>
                  {Number(p.precoVenda).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL RESPONSIVO ✨ */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-white/60 overflow-hidden animate-in zoom-in-95 max-h-[95vh] flex flex-col">
            <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/40 shrink-0">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter">
                {idEditando ? "Editar Item" : "Novo Cadastro"}
              </h3>
              <button
                onClick={limparEFechar}
                className="p-2 hover:bg-rose-500/10 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={salvar}
              className="p-6 md:p-8 space-y-5 overflow-y-auto custom-scrollbar"
            >
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Nome do Produto
                </Label>
                <Input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dose de Jack Daniels"
                  className="h-14 rounded-2xl bg-white/50 border-white/60 font-bold text-lg"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/5 rounded-2xl border border-white/60">
                <div className="space-y-0.5">
                  <Label className="text-[10px] font-black uppercase text-slate-700">
                    Controlar Estoque?
                  </Label>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">
                    Desative para doses ou cigarros soltos
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={controlaEstoque}
                  onChange={(e) => setControlaEstoque(e.target.checked)}
                  className="w-7 h-7 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                    Custo (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={custo}
                    onChange={(e) => setCusto(e.target.value)}
                    required
                    className="h-14 rounded-2xl text-rose-600 font-black text-xl bg-white/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                    Venda (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={venda}
                    onChange={(e) => setVenda(e.target.value)}
                    required
                    className="h-14 rounded-2xl text-emerald-600 font-black text-xl bg-white/50"
                  />
                </div>
              </div>

              {controlaEstoque && (
                <div className="grid grid-cols-2 gap-4 md:gap-6 animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                      Em Estoque
                    </Label>
                    <Input
                      type="number"
                      value={qtd}
                      onChange={(e) => setQtd(e.target.value)}
                      required
                      className="h-14 rounded-2xl font-black text-xl text-center bg-white/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-amber-600 ml-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Alerta
                    </Label>
                    <Input
                      type="number"
                      value={estoqueMinimo}
                      onChange={(e) => setEstoqueMinimo(e.target.value)}
                      required
                      className="h-14 rounded-2xl bg-amber-50/50 border-amber-200/50 text-amber-700 font-black text-xl text-center"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl mt-4 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <PlusCircle size={20} />
                    {idEditando ? "Salvar Alterações" : "Cadastrar Item"}
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
