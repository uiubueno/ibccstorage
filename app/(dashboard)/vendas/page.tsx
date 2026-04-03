"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Banknote,
  CreditCard,
  X,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function VendasPage() {
  const { data: session } = useSession();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados da Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estado da Venda
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");

  useEffect(() => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(data.filter((p: any) => p.quantidade > 0)));

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const produtosFiltrados = produtos
    .filter((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 10);

  const precoUnitario = produtoSelecionado
    ? Number(produtoSelecionado.precoVenda)
    : 0;
  const totalVenda = precoUnitario * quantidade;

  async function finalizarVenda() {
    if (!produtoSelecionado || quantidade <= 0)
      return alert("Selecione um produto.");

    setLoading(true);
    const res = await fetch("/api/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produtoId: produtoSelecionado.id,
        quantidade,
        metodoPagamento,
        valorTotal: totalVenda,
        vendedorId: session?.user?.id,
      }),
    });

    if (res.ok) {
      alert("Venda realizada com sucesso! 🍻");
      window.location.reload();
    } else {
      alert("Erro ao processar venda.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 font-sans antialiased">
      {/* HEADER PREMIUM */}
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
            <ShoppingCart className="h-8 w-8" />
          </div>
          Frente de <span className="text-amber-500 font-black">Caixa</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LADO ESQUERDO: NOVA VENDA (GLASS) */}
        <Card className="lg:col-span-2 bg-white/60 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] overflow-visible">
          <CardHeader className="border-b border-white/40 pb-6">
            <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Nova Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="relative space-y-3" ref={dropdownRef}>
              <Label className="text-slate-600 font-bold ml-1 uppercase text-[10px] tracking-widest">
                Procurar Produto
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Busque por cerveja, destilados, gelo..."
                  className="pl-12 h-14 text-lg bg-white/50 border-white/60 focus:bg-white/80 transition-all rounded-2xl shadow-sm text-slate-900 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setProdutoSelecionado(null);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-rose-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400 hover:text-rose-500" />
                  </button>
                )}
              </div>

              {showResults && searchTerm && (
                <div className="absolute z-50 w-full bg-white/90 backdrop-blur-2xl border border-white/60 rounded-[1.5rem] shadow-2xl mt-2 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                  {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 hover:bg-amber-500/10 cursor-pointer flex justify-between items-center border-b border-slate-100 last:border-0 transition-colors"
                        onClick={() => {
                          setProdutoSelecionado(p);
                          setSearchTerm(p.nome);
                          setShowResults(false);
                        }}
                      >
                        <div>
                          <p className="font-black text-slate-800 uppercase text-sm leading-tight">
                            {p.nome}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            {p.tamanho} • Disponível: {p.quantidade} un.
                          </p>
                        </div>
                        <p className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
                          R$ {Number(p.precoVenda).toFixed(2)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic">
                      Nenhum produto em estoque...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-slate-600 font-bold ml-1 uppercase text-[10px] tracking-widest">
                  Quantidade
                </Label>
                <Input
                  type="number"
                  min="1"
                  className="h-14 text-2xl text-center font-black bg-white/50 border-white/60 rounded-2xl shadow-sm"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <Label className="text-slate-600 font-bold ml-1 uppercase text-[10px] tracking-widest">
                  Preço Unitário
                </Label>
                <div className="h-14 flex items-center justify-center bg-slate-900/5 text-slate-900 border border-white/60 rounded-2xl font-black text-2xl shadow-inner">
                  <span className="text-sm mr-1 opacity-40">R$</span>{" "}
                  {precoUnitario.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-600 font-bold ml-1 uppercase text-[10px] tracking-widest">
                Forma de Pagamento
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "PIX", label: "Pix", icon: CheckCircle2 },
                  { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
                  { id: "CARTAO_CREDITO", label: "Crédito", icon: CreditCard },
                  { id: "CARTAO_DEBITO", label: "Débito", icon: CreditCard },
                ].map((metodo) => {
                  const isActive = metodoPagamento === metodo.id;
                  return (
                    <button
                      key={metodo.id}
                      type="button"
                      onClick={() => setMetodoPagamento(metodo.id)}
                      className={cn(
                        "h-14 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest group",
                        isActive
                          ? "bg-amber-500 text-white border-amber-400 shadow-xl shadow-amber-500/30 scale-[1.02]"
                          : "bg-white/40 backdrop-blur-md border-white/60 text-slate-500 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm",
                      )}
                    >
                      <metodo.icon
                        className={cn(
                          "w-5 h-5 transition-transform",
                          isActive
                            ? "scale-110"
                            : "opacity-40 group-hover:opacity-100",
                        )}
                      />
                      {metodo.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LADO DIREITO: RESUMO E FINALIZAR */}
        <div className="space-y-6">
          {/* CARD DE VALOR (LIQUID AMBER GLASS) */}
          <div className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/20 blur-[60px] rounded-full" />

            <div className="relative text-center">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mb-4 opacity-70">
                Total da Venda
              </p>
              <div className="text-6xl font-black text-amber-500 tracking-tighter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <span className="text-2xl mr-1 opacity-40 font-medium italic">
                  R$
                </span>
                {totalVenda.toFixed(2)}
              </div>
            </div>
          </div>

          {/* BOTÃO FINALIZAR (TEXTO EM BRANCO PARA O PADRÃO) */}
          <button
            onClick={finalizarVenda}
            disabled={loading || !produtoSelecionado}
            className={cn(
              "w-full h-32 rounded-[3rem] flex flex-col items-center justify-center gap-1 font-black text-3xl uppercase tracking-tighter transition-all duration-300 shadow-2xl relative overflow-hidden group active:scale-95",
              loading || !produtoSelecionado
                ? "bg-slate-100 text-slate-300 cursor-not-allowed opacity-50 border border-slate-200"
                : "bg-amber-500/80 backdrop-blur-xl border border-amber-400/40 shadow-amber-500/20 hover:bg-amber-500 hover:scale-[1.02] text-white",
            )}
          >
            {/* EFEITO DE SHIMMER */}
            {!loading && produtoSelecionado && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            )}

            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin text-white" />
            ) : (
              <>
                <span
                  className={
                    !produtoSelecionado ? "text-slate-300" : "text-white"
                  }
                >
                  Finalizar
                </span>
                <span className="text-[10px] opacity-40 tracking-[0.3em] font-bold text-white">
                  (F8)
                </span>
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
            CONFIRA OS ITENS ANTES DE FECHAR 🍺
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
