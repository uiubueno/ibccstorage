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
  }, []);

  // FUNÇÃO MÁGICA: Exportar para Excel
  const exportarExcel = () => {
    if (!data?.vendas) return;

    // 1. Formatamos os dados para que fiquem bonitos na planilha
    const dadosFormatados = data.vendas.map((v: any) => ({
      Data: new Date(v.createdAt).toLocaleDateString("pt-BR"),
      Produto: v.produto.nome,
      Vendedor: v.vendedor.name,
      Quantidade: v.quantidade,
      Metodo_Pagamento: v.metodoPagamento,
      Total_Venda: Number(v.valorTotal).toFixed(2),
      Lucro_Estimado: (
        Number(v.valorTotal) -
        Number(v.produto.precoCusto) * v.quantidade
      ).toFixed(2),
    }));

    // 2. Criamos a planilha
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas");

    // 3. Disparamos o download do arquivo
    const nomeArquivo = `Relatorio_Vendas_${inicio || "Geral"}_ate_${fim || "Hoje"}.xlsx`;
    XLSX.writeFile(workbook, nomeArquivo);
  };

  if (!data) return <div className="p-8">Gerando relatórios...</div>;

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
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fim">Fim</Label>
            <Input
              type="date"
              id="fim"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>
          <Button onClick={buscarRelatorio} className="gap-2">
            <Search className="h-4 w-4" /> Filtrar
          </Button>
          <Button
            onClick={exportarExcel}
            variant="outline"
            className="gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            title="Imprimir"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards de Performance Financeira */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-70">
              Faturamento Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.stats.faturamentoTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900">
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              R$ {data.stats.lucroTotal.toFixed(2)}
            </div>
            <TrendingUp className="h-4 w-4 mt-2 text-emerald-500" />
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {data.vendas.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Dados */}
      <Card>
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-right">Qtd</th>
                <th className="px-4 py-3 text-right">Método</th>
                <th className="px-4 py-3 text-right">Valor Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.vendas.map((v: any) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(v.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {v.produto.nome}
                  </td>
                  <td className="px-4 py-3 text-right">{v.quantidade}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {v.metodoPagamento}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    R$ {Number(v.valorTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          }
        }
      `}</style>
    </div>
  );
}
