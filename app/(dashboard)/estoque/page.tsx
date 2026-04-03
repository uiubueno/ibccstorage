"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Beer,
  AlertTriangle,
  Plus,
  Search,
  Edit2,
  X,
  Check,
  PackageSearch,
  Trash2,
  Download,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EstoquePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filtroAtivo = searchParams.get("filtro") || "todos";

  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
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
    const bateFiltro = filtroAtivo === "baixo" ? p.quantidade <= 5 : true;
    return bateBusca && bateFiltro;
  });

  // --- FUNÇÕES DE EXPORTAÇÃO ---

  const exportarExcel = () => {
    if (produtosFiltrados.length === 0)
      return alert("Não há itens para exportar.");

    const dados = produtosFiltrados.map((p) => ({
      Produto: p.nome,
      Categoria: p.categoria || "N/A",
      Tamanho: p.tamanho || "N/A",
      Estoque_Atual: p.quantidade,
      Preco_Venda: Number(p.precoVenda).toFixed(2),
      Status: p.quantidade <= 5 ? "REPOR" : "OK",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");

    const dataAtual = new Date()
      .toLocaleDateString("pt-BR")
      .replaceAll("/", "-");
    const nomeArquivo = `Lista_Compra_Adega_${filtroAtivo}_${dataAtual}.xlsx`;

    XLSX.writeFile(workbook, nomeArquivo);
  };

  const imprimirPDF = () => {
    window.print();
  };

  // --- FUNÇÕES DE EDIÇÃO/EXCLUSÃO ---

  async function confirmarEdicao() {
    const res = await fetch("/api/produtos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produtoEditando),
    });

    if (res.ok) {
      setProdutoEditando(null);
      carregarProdutos();
    } else {
      alert("Erro ao atualizar produto.");
    }
  }

  async function excluirProduto(id: string) {
    const confirmar = confirm(
      "Atenção: Tem certeza que deseja excluir este produto?",
    );
    if (!confirmar) return;

    const res = await fetch(`/api/produtos?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Produto removido! 🗑️");
      setProdutoEditando(null);
      carregarProdutos();
    } else {
      const data = await res.json();
      alert(data.error || "Erro ao excluir.");
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
        Abrindo a geladeira... 🍻
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 font-sans antialiased relative">
      {/* HEADER E AÇÕES (LIQUID GLASS) */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 no-print">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
              <Beer className="h-8 w-8" />
            </div>
            Inventário
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Botão Imprimir/PDF (Glass Blue) */}
          <Button
            onClick={imprimirPDF}
            variant="outline"
            className="h-12 bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white text-slate-600 font-bold uppercase tracking-widest rounded-2xl px-5 shadow-sm"
          >
            <Printer className="h-4 w-4 mr-2" /> PDF
          </Button>

          {/* Botão Excel (Glass Emerald) */}
          <Button
            onClick={exportarExcel}
            variant="outline"
            className="h-12 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 hover:bg-emerald-500/20 text-emerald-700 font-bold uppercase tracking-widest rounded-2xl px-5 shadow-sm"
          >
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>

          {/* Botão Nova Entrada (Amber) */}
          <Button
            onClick={() => router.push("/produtos")}
            className="h-12 bg-amber-500/90 backdrop-blur-md border border-amber-400/50 hover:bg-amber-500 text-slate-950 font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 rounded-2xl px-6 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" /> Nova Entrada
          </Button>
        </div>
      </div>

      {/* BARRA DE BUSCA E FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/40 shadow-xl no-print">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Procurar bebida..."
            className="pl-12 h-14 bg-white/50 border-white/60 rounded-2xl font-bold text-lg"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900/5 p-1.5 rounded-2xl border border-white/60">
          <Button
            variant="ghost"
            onClick={() => router.push("/estoque")}
            className={cn(
              "h-11 rounded-xl px-6 font-bold uppercase tracking-widest text-[10px]",
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
              "h-11 rounded-xl px-6 font-bold uppercase tracking-widest text-[10px]",
              filtroAtivo === "baixo"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                : "text-slate-500",
            )}
          >
            Baixo Estoque
          </Button>
        </div>
      </div>

      {/* TABELA DE PRODUTOS */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/40 border-b border-white/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-6 py-5">Produto</th>
                <th className="px-6 py-5 text-center">Qtd</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Preço</th>
                <th className="px-6 py-5 text-center no-print">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {produtosFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800 text-sm uppercase">
                      {p.nome}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-slate-700 text-lg">
                    {p.quantidade}
                  </td>
                  <td className="px-6 py-4">
                    {p.quantidade <= 5 ? (
                      <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-700 text-[9px] font-black uppercase tracking-widest">
                        Repor
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                        Ok
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg">
                    R$ {Number(p.precoVenda).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center no-print">
                    <Button
                      variant="ghost"
                      onClick={() => setProdutoEditando(p)}
                      className="bg-amber-500/10 text-amber-700 border border-amber-400/30 rounded-xl h-10 w-10 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* MODAL DE EDIÇÃO (COM BOTÃO EXCLUIR) */}
      {produtoEditando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          onClick={() => setProdutoEditando(null)}
        >
          <div
            className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/60 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/40 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase text-xl">
                Editar Item
              </h3>
              <button onClick={() => setProdutoEditando(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  Nome
                </Label>
                <Input
                  value={produtoEditando.nome}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      nome: e.target.value,
                    })
                  }
                  className="h-14 rounded-2xl font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                    Preço Venda
                  </Label>
                  <Input
                    type="number"
                    value={produtoEditando.precoVenda}
                    onChange={(e) =>
                      setProdutoEditando({
                        ...produtoEditando,
                        precoVenda: e.target.value,
                      })
                    }
                    className="h-14 rounded-2xl font-black text-emerald-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                    Estoque
                  </Label>
                  <Input
                    type="number"
                    value={produtoEditando.quantidade}
                    onChange={(e) =>
                      setProdutoEditando({
                        ...produtoEditando,
                        quantidade: e.target.value,
                      })
                    }
                    className="h-14 rounded-2xl font-black text-center"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 h-14 bg-emerald-500 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg"
                  onClick={confirmarEdicao}
                >
                  <Check className="mr-2 h-5 w-5" /> Salvar
                </Button>
                <Button
                  variant="outline"
                  className="w-14 h-14 bg-rose-500/10 border-rose-400 text-rose-600 rounded-2xl"
                  onClick={() => excluirProduto(produtoEditando.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTILO PARA IMPRESSÃO LIMPA */}
      <style jsx global>{`
        @media print {
          .no-print,
          button,
          input,
          .flex-wrap,
          .md\\:flex-row {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .max-w-7xl {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .shadow-xl,
          .shadow-2xl {
            box-shadow: none !important;
          }
          .rounded-[2.5rem],
          .rounded-[2rem] {
            border-radius: 0 !important;
          }
          table {
            border: 1px solid #eee !important;
          }
          th {
            background: #f8fafc !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
