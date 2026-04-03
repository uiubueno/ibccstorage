"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCcw,
  LayoutDashboard,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
        Carregando Dashboard... 🍺
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 font-sans antialiased">
      {/* HEADER E FILTROS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
            <LayoutDashboard className="h-8 w-8" />
          </div>
          Visão <span className="text-amber-500">Geral</span>
        </h2>

        <div className="flex flex-wrap items-end gap-3 bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/40 shadow-xl">
          <div className="grid gap-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
              Início
            </Label>
            <Input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="h-11 bg-white/50 border-white/60 rounded-xl focus:bg-white/80 shadow-sm text-slate-700 font-bold w-40"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
              Fim
            </Label>
            <Input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="h-11 bg-white/50 border-white/60 rounded-xl focus:bg-white/80 shadow-sm text-slate-700 font-bold w-40"
            />
          </div>
          <Button
            onClick={fetchStats}
            className="gap-2 h-11 bg-slate-900 hover:bg-black rounded-xl text-white font-bold shadow-lg"
          >
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="h-11 rounded-xl bg-white/50 border-white/60 hover:bg-white/80 shadow-sm"
            title="Atualizar"
          >
            <RefreshCcw className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/30 rounded-[2rem] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-emerald-800 font-black tracking-[0.3em] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600 tracking-tighter">
              <span className="text-xl mr-1 opacity-60 font-medium italic">
                R$
              </span>
              {Number(stats?.revenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/10 backdrop-blur-xl border border-sky-400/30 rounded-[2rem] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-sky-800 font-black tracking-[0.3em] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-sky-600" /> Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-sky-600 tracking-tighter">
              {stats?.count || 0}{" "}
              <span className="text-xl opacity-60 font-black uppercase tracking-widest">
                Pedidos
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 backdrop-blur-xl border border-amber-400/30 rounded-[2rem] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-amber-800 font-black tracking-[0.3em] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" /> Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-amber-600 tracking-tighter">
              <span className="text-xl mr-1 opacity-60 font-medium italic">
                R$
              </span>
              {Number(stats?.averageTicket || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Link
          href="/estoque?filtro=baixo"
          className="transition-all duration-300 hover:scale-105 active:scale-95 block h-full"
        >
          <Card className="bg-rose-500/10 backdrop-blur-xl border-2 border-dashed border-rose-400/50 rounded-[2rem] shadow-xl relative overflow-hidden h-full group hover:bg-rose-500/20 hover:border-rose-400">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] uppercase text-rose-800 font-black tracking-[0.3em] flex items-center gap-2">
                Baixo Estoque
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-rose-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-rose-600 tracking-tighter group-hover:scale-105 transition-transform origin-left">
                {stats?.lowStock || 0}{" "}
                <span className="text-xl opacity-60 font-black uppercase tracking-widest">
                  Itens
                </span>
              </div>
              <p className="text-[10px] text-rose-600/70 mt-2 font-bold uppercase tracking-widest group-hover:text-rose-600 transition-colors">
                Ver produtos →
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* GRÁFICOS E RECENTES */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] overflow-hidden">
          <CardHeader className="border-b border-white/40 bg-white/20">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
              Meios de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.chartData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  stroke="none"
                >
                  {stats?.chartData?.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.5)",
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(8px)",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vendas Recentes (AJUSTADO COM LÓGICA DE FIADO) */}
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="border-b border-white/40 bg-white/20">
            <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">
              Vendas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 overflow-y-auto max-h-[350px]">
            {stats?.recent?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.map((v: any) => {
                  // --- LÓGICA DE NOME DE EXIBIÇÃO ---
                  const temDevedor = v.devedor?.nome;
                  const temVariosItens = v.itens && v.itens.length > 1;

                  const nomeExibicao = temDevedor
                    ? `FIADO: ${v.devedor.nome}`
                    : temVariosItens
                      ? `${v.itens[0]?.produto?.nome || "Item"} + ${v.itens.length - 1} itens`
                      : v.itens?.[0]?.produto?.nome || "Venda Avulsa";
                  // ---------------------------------

                  return (
                    <div
                      key={v.id}
                      className="flex justify-between items-center p-4 bg-white/50 border border-white/60 rounded-2xl shadow-sm hover:bg-white/80 transition-colors"
                    >
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase">
                          {nomeExibicao}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1 bg-white/50 w-fit px-2 py-0.5 rounded-lg border border-white/60">
                          {v.metodoPagamento.replace("_", " ")}
                        </p>
                      </div>
                      <p className="font-black text-emerald-600 text-lg">
                        R$ {Number(v.valorTotal).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingBag className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  Sem movimento no período
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
