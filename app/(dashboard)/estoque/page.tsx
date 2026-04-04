"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Beer,
  AlertTriangle,
  Plus,
  Search,
  Pencil,
  X,
  Check,
  Trash2,
  Download,
  Printer,
  Loader2,
  Infinity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EstoquePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filtroAtivo = searchParams.get("filtro") || "todos";

  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<any>(null);

  const carregarProdutos = () => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((p) => {
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const bateFiltro =
      filtroAtivo === "baixo"
        ? p.controlaEstoque === true && p.quantidade <= p.estoqueMinimo
        : true;
    return bateBusca && bateFiltro;
  });

  const exportarExcel = () => {
    const dados = produtosFiltrados.map((p) => ({
      Produto: p.nome,
      Estoque_Atual: p.controlaEstoque ? p.quantidade : "INFINITO (DOSE)",
      Preco_Venda: Number(p.precoVenda).toFixed(2),
      Status:
        p.controlaEstoque && p.quantidade <= p.estoqueMinimo ? "REPOR" : "OK",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");
    XLSX.writeFile(
      workbook,
      `Estoque_Adega_${new Date().toLocaleDateString().replaceAll("/", "-")}.xlsx`,
    );
  };

  async function confirmarEdicao(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const res = await fetch("/api/produtos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produtoEditando),
    });
    if (res.ok) {
      setProdutoEditando(null);
      carregarProdutos();
    }
    setSalvando(false);
  }

  async function excluirProduto(id: string) {
    if (!confirm("Atenção: Tem certeza que deseja excluir este produto?"))
      return;
    const res = await fetch(`/api/produtos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setProdutoEditando(null);
      carregarProdutos();
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center font-black animate-pulse text-slate-500 uppercase tracking-widest">
        Sincronizando adega... 🍻
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-2 md:p-4 font-sans antialiased pb-20 md:pb-0">
      {/* HEADER ✨ */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 md:gap-6 no-print px-2 md:px-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
              <Beer className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            Gestão<span className="text-amber-500">Estoque</span>
          </h2>
          <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1 ml-1">
            Controle de Produtos e Doses
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1 md:flex-none h-12 rounded-2xl px-6 bg-white/60 font-bold uppercase text-[10px] border-white/40"
          >
            <Printer className="h-4 w-4 mr-2" /> PDF
          </Button>

          {/* BOTÃO EXCEL COPIADO DO RELATÓRIO (COM SHIMMER) ✨ */}
          <Button
            onClick={exportarExcel}
            className="flex-1 md:flex-none h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 rounded-2xl px-6 transition-all active:scale-95 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>

          <Button
            onClick={() => router.push("/produtos")}
            className="w-full md:w-auto h-12 bg-slate-900 text-white rounded-2xl px-8 shadow-xl font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="h-5 w-5 mr-2" /> Novo Item
          </Button>
        </div>
      </div>

      {/* FILTROS ✨ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-3 md:p-4 px-4 md:px-6 rounded-[1.8rem] md:rounded-[2.5rem] border border-white/40 shadow-xl no-print">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Procurar bebida..."
            className="pl-12 md:pl-14 h-12 md:h-14 bg-white/40 border-white/60 rounded-xl md:rounded-2xl font-bold text-base md:text-lg focus:bg-white/70"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-900/5 p-1 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/60 w-full md:w-auto">
          <Button
            variant="ghost"
            onClick={() => router.push("/estoque")}
            className={cn(
              "flex-1 md:flex-none h-10 md:h-11 rounded-xl px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] transition-all",
              filtroAtivo === "todos"
                ? "bg-white shadow-md text-slate-900"
                : "text-slate-500",
            )}
          >
            Todos
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/estoque?filtro=baixo")}
            className={cn(
              "flex-1 md:flex-none h-10 md:h-11 rounded-xl px-6 md:px-8 font-black uppercase text-[9px] md:text-[10px] transition-all",
              filtroAtivo === "baixo"
                ? "bg-rose-500 text-white shadow-lg"
                : "text-slate-500",
            )}
          >
            Reposição
          </Button>
        </div>
      </div>

      {/* TABELA (PC) */}
      <Card className="hidden md:block bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-white/40 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/50">
              <tr>
                <th className="px-8 py-6">Produto</th>
                <th className="px-8 py-6 text-center">Quantidade</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Preço</th>
                <th className="px-8 py-6 text-center no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {produtosFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 uppercase text-sm">
                      {p.nome}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {p.controlaEstoque
                        ? `Aviso em: ${p.estoqueMinimo} un`
                        : "Serviço (Dose)"}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-center font-black text-slate-800 text-lg">
                    {p.controlaEstoque ? (
                      p.quantidade
                    ) : (
                      <Infinity className="h-5 w-5 mx-auto text-amber-500" />
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {!p.controlaEstoque ? (
                      <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-600 text-[9px] font-black uppercase border border-amber-200">
                        Livre
                      </span>
                    ) : p.quantidade <= p.estoqueMinimo ? (
                      <span className="px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black uppercase border border-rose-200 animate-pulse">
                        Repor
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase border border-emerald-200">
                        Ok
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right font-black text-emerald-600 text-lg tracking-tighter">
                    R$ {Number(p.precoVenda).toFixed(2)}
                  </td>
                  <td className="px-8 py-5 text-center no-print">
                    <button
                      onClick={() => setProdutoEditando(p)}
                      className="p-2 bg-slate-900/5 hover:bg-amber-500 hover:text-white rounded-xl transition-all text-slate-400 shadow-sm"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* CARDS (MOBILE) */}
      <div className="md:hidden space-y-4 px-2">
        {produtosFiltrados.map((p) => (
          <Card
            key={p.id}
            className="bg-white/70 backdrop-blur-md border-white/60 rounded-[2rem] shadow-md overflow-hidden active:scale-[0.98] transition-all"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-slate-800 uppercase text-sm leading-tight">
                    {p.nome}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                    {p.controlaEstoque
                      ? `Aviso: ${p.estoqueMinimo} un`
                      : "Serviço (Dose)"}
                  </p>
                </div>
                <button
                  onClick={() => setProdutoEditando(p)}
                  className="p-3 bg-slate-900/5 text-amber-600 rounded-2xl border border-white/60 shadow-inner"
                >
                  <Pencil size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/40">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Estoque
                  </span>
                  <span className="font-black text-slate-800 text-xl">
                    {p.controlaEstoque ? (
                      p.quantidade
                    ) : (
                      <Infinity className="h-6 w-6 text-amber-500" />
                    )}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Preço
                  </span>
                  <span className="font-black text-emerald-600 text-xl tracking-tighter">
                    R$ {Number(p.precoVenda).toFixed(2)}
                  </span>
                </div>
              </div>

              {!p.controlaEstoque ? (
                <div className="w-full py-2 bg-amber-50 text-amber-600 rounded-xl text-center text-[10px] font-black uppercase border border-amber-100">
                  Item Livre
                </div>
              ) : p.quantidade <= p.estoqueMinimo ? (
                <div className="w-full py-2 bg-rose-50 text-rose-600 rounded-xl text-center text-[10px] font-black uppercase border border-rose-100 animate-pulse">
                  Reposição Urgente
                </div>
              ) : (
                <div className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-center text-[10px] font-black uppercase border border-emerald-100">
                  Estoque OK
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {produtoEditando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setProdutoEditando(null)}
        >
          <div
            className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-white/60 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8 border-b border-white/40 flex justify-between items-center bg-white/40">
              <h3 className="font-black text-slate-900 uppercase flex items-center gap-3">
                <Pencil className="w-5 h-5 text-amber-500" /> Editar Item
              </h3>
              <button
                onClick={() => setProdutoEditando(null)}
                className="p-2 text-slate-400 hover:text-rose-500"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={confirmarEdicao} className="p-6 md:p-10 space-y-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Nome do Produto
                </Label>
                <Input
                  value={produtoEditando.nome}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      nome: e.target.value,
                    })
                  }
                  className="h-14 rounded-2xl bg-white/50 border-white/60 font-bold"
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
                  checked={produtoEditando.controlaEstoque}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      controlaEstoque: e.target.checked,
                    })
                  }
                  className="w-6 h-6 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                    Venda (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={produtoEditando.precoVenda}
                    onChange={(e) =>
                      setProdutoEditando({
                        ...produtoEditando,
                        precoVenda: e.target.value,
                      })
                    }
                    className="h-14 rounded-2xl bg-white/50 border-white/60 font-black text-emerald-600 text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                    Quantidade
                  </Label>
                  <Input
                    type="number"
                    disabled={!produtoEditando.controlaEstoque}
                    value={produtoEditando.quantidade}
                    onChange={(e) =>
                      setProdutoEditando({
                        ...produtoEditando,
                        quantidade: e.target.value,
                      })
                    }
                    className="h-14 rounded-2xl bg-white/50 disabled:bg-slate-100 font-black text-slate-900 text-xl text-center"
                  />
                </div>
              </div>

              <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] space-y-2">
                <Label className="text-[10px] font-black uppercase text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Limite de Alerta
                </Label>
                <Input
                  type="number"
                  value={produtoEditando.estoqueMinimo}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      estoqueMinimo: e.target.value,
                    })
                  }
                  className="h-12 rounded-xl bg-white/80 border-amber-200 font-black text-amber-700 text-lg text-center"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => excluirProduto(produtoEditando.id)}
                  className="h-16 w-20 rounded-2xl bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
                <Button
                  type="submit"
                  disabled={salvando}
                  className="h-16 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  {salvando ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" /> Salvar
                    </>
                  )}
                </Button>
              </div>
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
        @media print {
          .no-print,
          button,
          input,
          .flex-wrap,
          .relative {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .rounded-[3rem],
          .rounded-[2.5rem] {
            border-radius: 0 !important;
          }
          table {
            border: 1px solid #eee !important;
            width: 100% !important;
          }
          th {
            background: #f8fafc !important;
            color: black !important;
            padding: 10px !important;
          }
          td {
            padding: 10px !important;
            border-bottom: 1px solid #f1f5f9 !important;
          }
        }
      `}</style>
    </div>
  );
}
