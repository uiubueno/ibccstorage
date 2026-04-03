"use client";

import { useEffect, useState, useCallback } from "react";
import * as XLSX from "xlsx"; // Importação da biblioteca de Excel
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Printer, TrendingUp, Search, Download } from "lucide-react";

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

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

  // FUNÇÃO MÁGICA: Exportar para Excel (Atualizada com Horário)
  const exportarExcel = () => {
    if (!data?.vendas) return;

    const dadosFormatados = data.vendas.map((v: any) => {
      const dataObjeto = new Date(v.createdAt);
      return {
        Data: dataObjeto.toLocaleDateString("pt-BR"),
        Horario: dataObjeto.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        Produto: v.produto.nome,
        Vendedor: v.vendedor?.name || "N/A",
        Quantidade: v.quantidade,
        Metodo_Pagamento: v.metodoPagamento,
        Total_Venda: Number(v.valorTotal).toFixed(2),
        Lucro_Estimado: (
          Number(v.valorTotal) -
          Number(v.produto.precoCusto) * v.quantidade
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
      <div className="p-8 text-center italic text-slate-500">
        Gerando relatórios da Adega... 🍺
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" /> Relatórios
        </h2>

        <div className="flex flex-wrap items-end gap-2 bg-white p-4 rounded-lg border shadow-sm">
          <div className="grid gap-1.5">
            <Label htmlFor="inicio">Início</Label>
            <Input
              type="date"
              id="inicio"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fim">Fim</Label>
            <Input
              type="date"
              id="fim"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              className="h-9"
            />
          </div>
          <Button onClick={buscarRelatorio} className="gap-2 h-9 bg-slate-900">
            <Search className="h-4 w-4" /> Filtrar
          </Button>
          <Button
            onClick={exportarExcel}
            variant="outline"
            className="gap-2 h-9 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="h-9"
            title="Imprimir"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards de Performance Financeira */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 text-white shadow-lg">
          <CardHeader className="pb-2 text-center md:text-left">
            <CardTitle className="text-xs uppercase opacity-70 font-bold tracking-widest">
              Faturamento Bruto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center md:text-left">
            <div className="text-3xl font-black">
              R$ {data.stats.faturamentoTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardHeader className="pb-2 text-center md:text-left">
            <CardTitle className="text-xs uppercase text-emerald-900 font-bold tracking-widest">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center md:text-left">
            <div className="text-3xl font-black text-emerald-700">
              R$ {data.stats.lucroTotal.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-emerald-500 font-bold text-xs uppercase">
              <TrendingUp className="h-3 w-3" /> Tendência positiva
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-2 text-center md:text-left">
            <CardTitle className="text-xs uppercase text-blue-900 font-bold tracking-widest">
              Total de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center md:text-left">
            <div className="text-3xl font-black text-blue-700">
              {data.vendas.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados Atualizada com Horário */}
      <Card className="shadow-xl border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">Data / Hora</th>
                <th className="px-6 py-4 text-left">Produto</th>
                <th className="px-6 py-4 text-right">Qtd</th>
                <th className="px-6 py-4 text-right">Método</th>
                <th className="px-6 py-4 text-right">Valor Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.vendas.map((v: any) => {
                const dataObj = new Date(v.createdAt);
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {dataObj.toLocaleDateString("pt-BR")}
                        </span>
                        {/* AQUI ESTÁ O HORÁRIO NA TABELA: */}
                        <span className="text-[10px] text-amber-600 font-black">
                          {dataObj.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {v.produto.nome}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 font-mono">
                      {v.quantidade}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-[9px] font-black border border-slate-200">
                        {v.metodoPagamento}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
                      R$ {Number(v.valorTotal).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {data.vendas.length === 0 && (
            <div className="p-12 text-center text-slate-400 italic">
              Nenhuma venda encontrada para o período selecionado.
            </div>
          )}
        </CardContent>
      </Card>

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
          .shadow-xl {
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
