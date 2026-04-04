"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Loader2,
  Infinity,
  UserCircle,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function VendasPage() {
  const { data: session } = useSession();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [devedores, setDevedores] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [metodo, setMetodo] = useState("PIX");
  const [devedorId, setDevedorId] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then(setProdutos);
    fetch("/api/devedores")
      .then((res) => res.json())
      .then(setDevedores);
  }, []);

  const produtosDisponiveis = produtos.filter((p) => {
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const temEstoqueOuEhDose = p.controlaEstoque === false || p.quantidade > 0;
    return bateBusca && temEstoqueOuEhDose;
  });

  const adicionarAoCarrinho = (p: any) => {
    const existe = carrinho.find((item) => item.produtoId === p.id);
    if (existe) {
      atualizarQuantidade(p.id, existe.quantidade + 1);
    } else {
      setCarrinho([
        ...carrinho,
        {
          produtoId: p.id,
          nome: p.nome,
          quantidade: 1,
          precoUnitario: Number(p.precoVenda),
        },
      ]);
    }
  };

  // FUNÇÃO NOVA: Atualiza a quantidade direto no carrinho ✨
  const atualizarQuantidade = (id: string, novaQtd: number) => {
    if (novaQtd < 1) return;
    setCarrinho(
      carrinho.map((item) =>
        item.produtoId === id ? { ...item, quantidade: novaQtd } : item,
      ),
    );
  };

  const total = carrinho.reduce(
    (acc, item) => acc + item.precoUnitario * item.quantidade,
    0,
  );

  async function finalizarVenda() {
    if (carrinho.length === 0) return;
    if (!session?.user?.id) {
      alert("Sessão expirada. Faça login novamente.");
      return;
    }

    if (metodo === "FIADO" && !devedorId) {
      alert("Para venda FIADO, selecione o cliente!");
      return;
    }

    setFinalizando(true);

    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: carrinho,
          metodoPagamento: metodo,
          valorTotal: total,
          vendedorId: session.user.id,
          devedorId: metodo === "FIADO" ? devedorId : null,
        }),
      });

      if (res.ok) {
        alert("Venda realizada! 🍻");
        setCarrinho([]);
        setDevedorId("");
        fetch("/api/produtos")
          .then((res) => res.json())
          .then(setProdutos);
      } else {
        const err = await res.json();
        alert(err.error || "Erro na venda");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans antialiased">
      {/* LISTA DE PRODUTOS */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/40 shadow-xl">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar bebida, dose ou cigarro..."
              className="pl-14 h-14 bg-white/40 border-white/60 rounded-2xl font-bold text-lg focus:bg-white/80 transition-all"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {produtosDisponiveis.map((p) => (
            <Card
              key={p.id}
              onClick={() => adicionarAoCarrinho(p)}
              className="cursor-pointer hover:scale-[1.02] active:scale-95 transition-all bg-white/60 backdrop-blur-md border-white/40 rounded-[2.2rem] shadow-lg group overflow-hidden border-b-4 border-b-transparent hover:border-b-amber-500"
            >
              <CardContent className="p-6 text-center md:text-left">
                <p className="font-black text-slate-800 uppercase text-xs leading-tight group-hover:text-amber-600 transition-colors h-8 overflow-hidden">
                  {p.nome}
                </p>
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mt-6 gap-2">
                  <span className="text-emerald-600 font-black text-xl tracking-tighter">
                    R$ {Number(p.precoVenda).toFixed(2)}
                  </span>
                  <div>
                    {p.controlaEstoque ? (
                      <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        {p.quantidade} un
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 whitespace-nowrap">
                        <Infinity className="h-3 w-3" />{" "}
                        <span className="text-[9px] font-black uppercase">
                          Dose
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CARRINHO (DARK GLASS) */}
      <div className="lg:col-span-1">
        <Card className="bg-slate-900/95 backdrop-blur-3xl border-slate-800 rounded-[3rem] shadow-2xl sticky top-6 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
            <h3 className="font-black uppercase tracking-tighter flex items-center gap-2">
              <ShoppingCart className="text-amber-500" /> Carrinho
            </h3>
            <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full">
              {carrinho.length} ITENS
            </span>
          </div>

          {/* LISTA DO CARRINHO COM CONTROLE DE QTD ✨ */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar bg-slate-900/50">
            {carrinho.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <p className="font-black text-white text-xs uppercase leading-tight pr-4">
                    {item.nome}
                  </p>
                  <button
                    onClick={() =>
                      setCarrinho(carrinho.filter((_, i) => i !== idx))
                    }
                    className="text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  {/* CONTROLE DE QUANTIDADE ✨ */}
                  <div className="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
                    <button
                      onClick={() =>
                        atualizarQuantidade(item.produtoId, item.quantidade - 1)
                      }
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarQuantidade(
                          item.produtoId,
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-10 bg-transparent text-center text-white font-black text-xs outline-none"
                    />
                    <button
                      onClick={() =>
                        atualizarQuantidade(item.produtoId, item.quantidade + 1)
                      }
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold">
                      Subtotal
                    </p>
                    <p className="text-emerald-400 font-black text-sm">
                      R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL E PAGAMENTO */}
          <div className="p-6 bg-slate-950/80 border-t border-slate-800 space-y-4 shrink-0">
            <div className="flex justify-between items-end text-white">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Total
              </span>
              <span className="text-4xl font-black text-amber-500 tracking-tighter">
                R$ {total.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["PIX", "DINHEIRO", "CARTÃO", "FIADO"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodo(m)}
                  className={cn(
                    "py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border",
                    metodo === m
                      ? "bg-amber-500 border-amber-400 text-slate-950 shadow-lg"
                      : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {metodo === "FIADO" && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <select
                  value={devedorId}
                  onChange={(e) => setDevedorId(e.target.value)}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-xs font-bold outline-none"
                >
                  <option value="" className="bg-slate-900">
                    Selecione o Cliente...
                  </option>
                  {devedores.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900">
                      {d.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              disabled={carrinho.length === 0 || finalizando}
              onClick={finalizarVenda}
              className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl relative overflow-hidden group active:scale-95 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
              {finalizando ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Finalizar
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
