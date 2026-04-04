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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas_Adega");
    const nomeArquivo = `Faturamento_Eneas_${new Date().toLocaleDateString().replaceAll("/", "-")}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
  };

  if (!data)
    return (
      <div className="p-10 text-center font-black animate-pulse text-slate-500 uppercase tracking-widest">
        Consolidando finanças... 🍺
      </div>
    );

  return (
    <div className="space-y-8 relative max-w-7xl mx-auto font-sans antialiased">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 no-print">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
            <FileText className="h-8 w-8" />
          </div>
          Relatórios <span className="text-amber-500">Financeiros</span>
        </h2>
      </div>

      {/* BARRA DE FILTROS REFINADA ✨ */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/40 shadow-xl no-print">
        {/* Datas à Esquerda */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="grid gap-1.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Data Início
            </Label>
            <Input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="h-12 bg-white/40 border-white/60 rounded-2xl font-bold"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
              Data Fim
            </Label>
            <Input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="h-12 bg-white/40 border-white/60 rounded-2xl font-bold"
            />
          </div>
          <Button
            onClick={buscarRelatorio}
            className="h-12 bg-slate-900 hover:bg-black text-white rounded-2xl px-6 self-end font-bold"
          >
            <Search className="h-4 w-4 mr-2" /> Filtrar
          </Button>
        </div>

        {/* Botões de Ação à Direita */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t xl:border-t-0 pt-4 xl:pt-0 border-white/40">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-12 rounded-2xl px-6 bg-white/60 border-white/40 font-bold uppercase text-[10px]"
          >
            <Printer className="h-4 w-4 mr-2" /> PDF
          </Button>

          {/* BOTÃO EXCEL COM SHIMMER ✨ */}
          <Button
            onClick={exportarExcel}
            className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 rounded-2xl px-6 transition-all active:scale-95 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <Download className="h-4 w-4 mr-2" /> Exportar Excel
          </Button>
        </div>
      </div>

      {/* CARDS FINANCEIROS */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-slate-400 font-black tracking-widest">
              Faturamento Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-amber-500 tracking-tighter">
              <span className="text-xl mr-1 font-medium italic text-white/40">
                R$
              </span>
              {data.stats.faturamentoTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/30 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-emerald-800 font-black tracking-widest">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600 tracking-tighter">
              <span className="text-xl mr-1 font-medium italic text-emerald-600/40">
                R$
              </span>
              {data.stats.lucroTotal.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-black text-[8px] uppercase tracking-widest bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-400/20">
              <TrendingUp className="h-3 w-3" /> Tendência positiva
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/10 backdrop-blur-xl border border-sky-400/30 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-sky-800 font-black tracking-widest">
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

      {/* TABELA PREMIUM */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/40 border-b border-white/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-6">Data / Hora</th>
                <th className="px-8 py-6">Produtos</th>
                <th className="px-8 py-6 text-center">Método</th>
                <th className="px-8 py-6 text-right">Valor Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {data.vendas.map((v: any) => {
                const dataObj = new Date(v.createdAt);
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-white/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">
                          {dataObj.toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-[9px] text-amber-600 font-black uppercase">
                          {dataObj.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          H
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {v.itens?.length > 0 ? (
                        <button
                          onClick={() => setVendaDetalhe(v)}
                          className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500 text-blue-700 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border border-blue-400/30"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Itens (
                          {v.itens.length})
                        </button>
                      ) : (
                        <span className="font-black text-slate-800 uppercase text-[11px]">
                          {v.produto?.nome || "Serviço"}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="bg-slate-100/80 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white">
                        {v.metodoPagamento.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 text-lg tracking-tighter">
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

      {/* MODAL DE DETALHES (LIQUID GLASS) */}
      {vendaDetalhe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setVendaDetalhe(null)}
        >
          <div
            className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/60 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-white/40 flex justify-between items-center bg-white/40">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500/20 p-3 rounded-2xl shadow-inner">
                  <ShoppingBag className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-lg">
                    Detalhes do Pedido
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {new Date(vendaDetalhe.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVendaDetalhe(null)}
                className="p-2 hover:bg-rose-500/10 rounded-full text-slate-400 hover:text-rose-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-4 max-h-[50vh] overflow-y-auto bg-slate-50/30">
              {vendaDetalhe.itens?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-white/70 border border-white rounded-2xl shadow-sm"
                >
                  <div>
                    <p className="font-black text-slate-800 text-xs uppercase">
                      {item.produto?.nome}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">
                      {item.quantidade}x R$ {Number(item.precoUnit).toFixed(2)}
                    </p>
                  </div>
                  <div className="font-black text-slate-900 text-lg tracking-tighter">
                    R$ {Number(item.subtotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-10 bg-slate-950/90 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                  Total da Venda
                </p>
                <p className="text-[10px] text-amber-500 mt-1 font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  {vendaDetalhe.metodoPagamento.replace("_", " ")}
                </p>
              </div>
              <div className="text-4xl font-black text-amber-500 tracking-tighter relative z-10">
                <span className="text-lg mr-1 text-white/40 italic font-medium">
                  R$
                </span>
                {Number(vendaDetalhe.valorTotal).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS GLOBAL COM ANIMAÇÕES */}
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
          .rounded-[3rem],
          .rounded-[2.5rem] {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
