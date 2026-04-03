"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link"; // Adicionado para navegação
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCcw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Inicia com a data de hoje
  const hoje = new Date().toISOString().split("T")[0];
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/stats?inicio=${dataInicio}&fim=${dataFim}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats)
    return (
      <div className="p-10 text-center font-mono">Carregando Adega... 🍺</div>
    );

  return (
    <div className="space-y-8 p-4">
      {/* FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Relatório de Vendas
        </h2>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-40"
          />
          <Button onClick={fetchStats} size="icon" className="bg-blue-600">
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="icon"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-emerald-600 font-bold">
              Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">
              R$ {Number(stats?.revenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-blue-600 font-bold">
              Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-700">
              {stats?.count || 0} itens
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase text-amber-600 font-bold">
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-700">
              R$ {Number(stats?.averageTicket || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* CARD DE BAIXO ESTOQUE - CLICÁVEL */}
        <Link
          href="/estoque?filtro=baixo"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <Card className="bg-rose-50/50 border-rose-100 cursor-pointer h-full border-2 border-dashed hover:border-rose-300">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase text-rose-600 font-bold">
                Baixo Estoque
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-rose-700">
                {stats?.lowStock || 0} un.
              </div>
              <p className="text-[10px] text-rose-500 mt-1 font-bold italic underline">
                Clique para ver itens →
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* GRÁFICO E RECENTES */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">
              Meios de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.chartData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60} // Deixando estilo Donut mais moderno
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {stats?.chartData?.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-700">
              Vendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recent?.length > 0 ? (
              <div className="space-y-4">
                {stats.recent.map((v: any) => (
                  <div
                    key={v.id}
                    className="flex justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {v.produto?.nome}
                      </p>
                      <p className="text-xs text-slate-400 uppercase font-mono">
                        {v.metodoPagamento}
                      </p>
                    </div>
                    <p className="font-bold text-emerald-600">
                      R$ {Number(v.valorTotal).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <ShoppingBag className="h-10 w-10 mb-2 opacity-20" />
                <p>Nenhuma venda neste período.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
