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
  ArrowRight,
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
      <div className="p-10 text-center font-black animate-pulse text-slate-500 uppercase tracking-[0.3em]">
        Limpando o balcão... 🍻
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-2 md:p-4 font-sans antialiased pb-20 md:pb-0">
      {/* HEADER E FILTROS ✨ */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 md:gap-6">
        <div className="px-2 md:px-0">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
              <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            Visão <span className="text-amber-500">Geral</span>
          </h2>
          <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Performance Adega Eneas
          </p>
        </div>

        {/* Filtros Mobile-Friendly */}
        <div className="w-full xl:w-auto bg-white/60 backdrop-blur-xl p-4 md:p-5 rounded-[2rem] border border-white/40 shadow-xl flex flex-col md:flex-row items-end gap-3">
          <div className="flex gap-3 w-full">
            <div className="grid gap-1.5 flex-1">
              <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Início
              </Label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="h-11 bg-white/50 border-white/60 rounded-xl font-bold text-sm"
              />
            </div>
            <div className="grid gap-1.5 flex-1">
              <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">
                Fim
              </Label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="h-11 bg-white/50 border-white/60 rounded-xl font-bold text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={fetchStats}
              className="h-11 bg-slate-900 hover:bg-black text-white font-bold px-6 shadow-lg transition-all active:scale-95 flex-1"
            >
              <Filter className="h-4 w-4 mr-2" /> Filtrar
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="h-11 w-11 rounded-xl bg-slate-100 text-slate-500"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* CARDS DE MÉTRICAS (2 COLUNAS NO MOBILE) ✨ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Faturamento */}
        <Card className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-400/30 rounded-[1.8rem] md:rounded-[2.2rem] shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-1 p-4 md:p-6">
            <CardTitle className="text-[8px] md:text-[10px] uppercase text-emerald-800 font-black tracking-widest flex items-center gap-1.5">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4" /> Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-4xl font-black text-emerald-600 tracking-tighter">
              <span className="text-xs md:text-xl mr-0.5 font-medium italic opacity-50 text-emerald-500">
                R$
              </span>
              {Number(stats?.revenue || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Vendas */}
        <Card className="bg-sky-500/10 backdrop-blur-xl border border-sky-400/30 rounded-[1.8rem] md:rounded-[2.2rem] shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-1 p-4 md:p-6">
            <CardTitle className="text-[8px] md:text-[10px] uppercase text-sky-800 font-black tracking-widest flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" /> Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-4xl font-black text-sky-600 tracking-tighter">
              {stats?.count || 0}{" "}
              <span className="text-[10px] md:text-lg opacity-40 uppercase ml-0.5">
                un
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card className="bg-amber-500/10 backdrop-blur-xl border border-amber-400/30 rounded-[1.8rem] md:rounded-[2.2rem] shadow-lg relative overflow-hidden group">
          <CardHeader className="pb-1 p-4 md:p-6">
            <CardTitle className="text-[8px] md:text-[10px] uppercase text-amber-800 font-black tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-4xl font-black text-amber-600 tracking-tighter">
              <span className="text-xs md:text-xl mr-0.5 font-medium italic opacity-50 text-amber-500">
                R$
              </span>
              {Number(stats?.averageTicket || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        {/* Baixo Estoque */}
        <Link href="/estoque?filtro=baixo" className="block h-full">
          <Card
            className={cn(
              "h-full relative overflow-hidden border-2 border-dashed rounded-[1.8rem] md:rounded-[2.2rem] shadow-lg transition-all active:scale-95 group",
              stats?.lowStock > 0
                ? "bg-rose-500/10 border-rose-400/50"
                : "bg-slate-50 border-slate-200",
            )}
          >
            <CardHeader className="pb-1 p-4 md:p-6 flex flex-row items-center justify-between space-y-0">
              <CardTitle
                className={cn(
                  "text-[8px] md:text-[10px] uppercase font-black tracking-widest",
                  stats?.lowStock > 0 ? "text-rose-800" : "text-slate-500",
                )}
              >
                Estoque
              </CardTitle>
              {stats?.lowStock > 0 && (
                <AlertTriangle className="h-3 w-3 md:h-5 md:w-5 text-rose-500 animate-pulse" />
              )}
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div
                className={cn(
                  "text-xl md:text-4xl font-black tracking-tighter",
                  stats?.lowStock > 0 ? "text-rose-600" : "text-slate-400",
                )}
              >
                {stats?.lowStock || 0}{" "}
                <span className="text-[10px] md:text-lg opacity-40 uppercase ml-0.5">
                  Itens
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* GRÁFICOS E RECENTES (STACK NO MOBILE) ✨ */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Gráfico Meios de Pagamento */}
        <Card className="lg:col-span-2 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-5 border-b border-white/40 bg-white/20">
            <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-500 text-center md:text-left">
              Fluxo por Método
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] md:h-[350px] p-2 md:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.chartData || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
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
                    border: "none",
                    background: "#0f172a",
                    color: "white",
                    fontSize: "10px",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Últimas Movimentações */}
        <Card className="lg:col-span-3 bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="p-5 border-b border-white/40 bg-white/20 flex flex-row items-center justify-between">
            <CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-500">
              Movimentações
            </CardTitle>
            <span className="text-[8px] md:text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full uppercase">
              Recentes
            </span>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
            {stats?.recent?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.map((v: any) => {
                  const temDevedor = v.devedor?.nome;
                  const nomeExibicao = temDevedor
                    ? `PENDURA: ${v.devedor.nome}`
                    : v.itens?.[0]?.produto?.nome || "Venda Avulsa";

                  return (
                    <div
                      key={v.id}
                      className="flex justify-between items-center p-3 md:p-4 bg-white/50 border border-white rounded-2xl shadow-sm active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-xl flex items-center justify-center font-black text-[10px] shadow-inner",
                            temDevedor
                              ? "bg-rose-100 text-rose-600"
                              : "bg-emerald-100 text-emerald-600",
                          )}
                        >
                          {v.metodoPagamento[0]}
                        </div>
                        <div className="max-w-[120px] md:max-w-none">
                          <p className="font-black text-slate-800 text-[11px] md:text-xs uppercase truncate leading-tight">
                            {nomeExibicao}
                          </p>
                          <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                            {new Date(v.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            H • {v.metodoPagamento}
                          </p>
                        </div>
                      </div>
                      <p className="font-black text-slate-900 text-sm md:text-base tracking-tighter whitespace-nowrap">
                        R$ {Number(v.valorTotal).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-30">
                <ShoppingBag size={40} />
                <p className="text-[10px] font-black uppercase mt-2">
                  Sem vendas hoje
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
