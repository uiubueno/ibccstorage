"use client";

import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Printer,
  TrendingUp,
  Search,
  Download,
  Eye,
  X,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  // Estado para controlar o Modal de Detalhes da Venda
  const [vendaDetalhe, setVendaDetalhe] = useState<any>(null);

  const buscarRelatorio = useCallback(async () => {
    let url = "/api/relatorios";
    if (inicio && fim) {
      url += `?inicio=${inicio}&fim=${fim}`;
    }
    const res = await fetch(url);
    const result = await res.json();
    setData(result);
  }, [inicio, fim]);

  useEffect(() => {
    buscarRelatorio();
  }, [buscarRelatorio]);

  const exportarExcel = () => {
    if (!data?.vendas) return;

    const dadosFormatados = data.vendas.map((v: any) => {
      const dataObjeto = new Date(v.createdAt);

      // Lógica para listar todos os itens na planilha do Excel
      let produtosLista = v.produto?.nome || "Venda Vazia";
      if (v.itens && v.itens.length > 0) {
        produtosLista = v.itens
          .map((i: any) => `${i.quantidade}x ${i.produto?.nome}`)
          .join(" + ");
      }

      return {
        Data: dataObjeto.toLocaleDateString("pt-BR"),
        Horario: dataObjeto.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        Produtos: produtosLista,
        Vendedor: v.vendedor?.name || "N/A",
        Metodo_Pagamento: v.metodoPagamento,
        Total_Venda: Number(v.valorTotal).toFixed(2),
        Lucro_Estimado: (
          Number(v.valorTotal) -
          (v.itens?.length > 0
            ? v.itens.reduce(
                (acc: number, i: any) =>
                  acc + Number(i.produto?.precoCusto || 0) * i.quantidade,
                0,
              )
            : Number(v.produto?.precoCusto || 0) * v.quantidade)
        ).toFixed(2),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");

    const nomeArquivo = `Relatorio_Adega_Eneas_${inicio || "Geral"}_ate_${fim || "Hoje"}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
  };

  if (!data)
    return (
      <div className="p-8 text-center italic text-slate-500 font-bold uppercase tracking-widest animate-pulse">
        Gerando relatórios da Adega... 🍺
      </div>
    );

  return (
    <div className="space-y-8 relative max-w-7xl mx-auto font-sans antialiased">
      {/* HEADER E FILTROS (LIQUID GLASS) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
            <FileText className="h-8 w-8" />
          </div>
          Relatórios
        </h2>

        <div className="flex flex-wrap items-end gap-3 bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/40 shadow-xl">
          <div className="grid gap-1.5">
            <Label
              htmlFor="inicio"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1"
            >
              Início
            </Label>
            <Input
              type="date"
              id="inicio"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="h-11 bg-white/50 border-white/60 rounded-xl focus:bg-white/80 shadow-sm text-slate-700 font-bold"
            />
          </div>
          <div className="grid gap-1.5">
            <Label
              htmlFor="fim"
              className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1"
            >
              Fim
            </Label>
            <Input
              type="date"
              id="fim"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="h-11 bg-white/50 border-white/60 rounded-xl focus:bg-white/80 shadow-sm text-slate-700 font-bold"
            />
          </div>
          <Button
            onClick={buscarRelatorio}
            className="gap-2 h-11 bg-slate-900 hover:bg-black rounded-xl text-white font-bold shadow-lg"
          >
            <Search className="h-4 w-4" /> Filtrar
          </Button>
          <Button
            onClick={exportarExcel}
            variant="outline"
            className="gap-2 h-11 border-emerald-400/50 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 rounded-xl backdrop-blur-md shadow-sm"
          >
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-11 rounded-xl bg-white/50 border-white/60 hover:bg-white/80 shadow-sm"
            title="Imprimir"
          >
            <Printer className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* CARDS FINANCEIROS (LIQUID GLASS) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Faturamento (Dark Amber Glass) */}
        <Card className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full transition-all group-hover:bg-amber-500/20" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-[10px] uppercase text-slate-400 font-black tracking-[0.3em]">
              Faturamento Bruto
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-black text-amber-500 tracking-tighter">
              <span className="text-xl mr-1 opacity-40 font-medium italic text-white">
                R$
              </span>
              {data.stats.faturamentoTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Lucro (Emerald Glass) */}
        <Card className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/30 rounded-[2rem] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-emerald-800 font-black tracking-[0.3em]">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600 tracking-tighter">
              <span className="text-xl mr-1 opacity-60 font-medium italic">
                R$
              </span>
              {data.stats.lucroTotal.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-400/20">
              <TrendingUp className="h-3 w-3" /> Tendência positiva
            </div>
          </CardContent>
        </Card>

        {/* Pedidos (Blue Glass) */}
        <Card className="bg-sky-500/10 backdrop-blur-xl border border-sky-400/30 rounded-[2rem] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-sky-800 font-black tracking-[0.3em]">
              Total de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-sky-600 tracking-tighter">
              {data.vendas.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE DADOS (LIQUID GLASS) */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/40 border-b border-white/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-6 py-5 text-left">Data / Hora</th>
                <th className="px-6 py-5 text-left">Produtos</th>
                <th className="px-6 py-5 text-center">Método</th>
                <th className="px-6 py-5 text-right">Valor Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {data.vendas.map((v: any) => {
                const dataObj = new Date(v.createdAt);
                const temVariosItens = v.itens && v.itens.length > 0;

                return (
                  <tr
                    key={v.id}
                    className="hover:bg-white/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">
                          {dataObj.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-[10px] text-amber-600 font-black tracking-widest mt-0.5">
                          {dataObj.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          H
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {temVariosItens ? (
                        <button
                          onClick={() => setVendaDetalhe(v)}
                          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-black transition-all border border-blue-400/30 backdrop-blur-sm active:scale-95 shadow-sm"
                        >
                          <Eye className="w-4 h-4" /> Ver Itens (
                          {v.itens.length})
                        </button>
                      ) : (
                        <span className="font-black text-slate-800 uppercase text-xs">
                          {v.produto?.nome || "Produto Removido"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100/50 backdrop-blur-sm text-slate-600 px-3 py-1.5 rounded-xl text-[9px] font-black border border-white/60 uppercase tracking-widest shadow-sm">
                        {v.metodoPagamento.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-lg">
                      R$ {Number(v.valorTotal).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.vendas.length === 0 && (
            <div className="p-16 text-center text-slate-400 italic font-bold uppercase tracking-widest">
              Nenhuma venda encontrada no período.
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE DETALHES DA VENDA (LIQUID GLASS) */}
      {vendaDetalhe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setVendaDetalhe(null)}
        >
          <div
            className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden border border-white/60 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/40">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/20 shadow-inner">
                  <ShoppingBag className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">
                    Detalhes do Pedido
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 mt-1.5 uppercase tracking-[0.2em]">
                    {new Date(vendaDetalhe.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVendaDetalhe(null)}
                className="p-2 bg-white/50 hover:bg-rose-500/10 rounded-full text-slate-500 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de Itens do Modal */}
            <div className="p-6 overflow-y-auto bg-slate-50/30">
              <div className="space-y-3">
                {vendaDetalhe.itens?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl shadow-sm hover:bg-white/80 transition-colors"
                  >
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase">
                        {item.produto?.nome}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest">
                        {item.quantidade}x R${" "}
                        {Number(item.precoUnit).toFixed(2)}
                      </p>
                    </div>
                    <div className="font-black text-slate-900 text-lg">
                      R$ {Number(item.subtotal).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer do Modal (Dark Glass) */}
            <div className="p-8 bg-slate-950/90 backdrop-blur-xl text-white mt-auto flex justify-between items-center border-t border-slate-800 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em]">
                  Total da Venda
                </p>
                <p className="text-[10px] text-slate-300 mt-1.5 font-bold uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg w-fit">
                  {vendaDetalhe.metodoPagamento.replace("_", " ")}
                </p>
              </div>
              <div className="text-4xl font-black text-amber-500 tracking-tighter relative z-10">
                <span className="text-lg mr-1 font-medium text-white opacity-40 italic">
                  R$
                </span>
                {Number(vendaDetalhe.valorTotal).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print,
          button,
          input,
          label {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0;
          }
          .shadow-lg,
          .shadow-xl,
          .shadow-2xl {
            box-shadow: none !important;
          }
          .border {
            border-color: #eee !important;
          }
        }
      `}</style>
    </div>
  );
}
