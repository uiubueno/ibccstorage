"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Plus,
  Trash2,
  BookOpen,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export default function VendasPage() {
  const { data: session } = useSession();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [devedores, setDevedores] = useState<any[]>([]); // Nova lista de clientes
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [carrinho, setCarrinho] = useState<any[]>([]);

  // Estado para o Modal de Fiado
  const [modalFiado, setModalFiado] = useState(false);

  useEffect(() => {
    // Busca produtos com estoque
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(data.filter((p: any) => p.quantidade > 0)));

    // Busca os clientes do caderno para o modal
    fetch("/api/devedores")
      .then((res) => res.json())
      .then(setDevedores);
  }, []);

  const produtosFiltrados = produtos
    .filter((p) => p.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 8);

  const totalGeral = useMemo(
    () => carrinho.reduce((acc, item) => acc + item.subtotal, 0),
    [carrinho],
  );

  const adicionarItem = () => {
    if (!produtoSelecionado) return;
    const novoItem = {
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      quantidade,
      precoUnitario: Number(produtoSelecionado.precoVenda),
      subtotal: Number(produtoSelecionado.precoVenda) * quantidade,
      tempId: Date.now(),
    };
    setCarrinho([...carrinho, novoItem]);
    setProdutoSelecionado(null);
    setSearchTerm("");
    setQuantidade(1);
  };

  // 1. Intercepta o clique em Finalizar
  function prepararVenda() {
    if (carrinho.length === 0) return;

    if (metodoPagamento === "FIADO") {
      setModalFiado(true); // Abre o modal se for fiado
      return;
    }

    executarVenda(null); // Segue reto se não for fiado
  }

  // 2. Executa a gravação no banco
  async function executarVenda(devedorIdLocal: string | null) {
    setLoading(true);
    try {
      const res = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: carrinho,
          metodoPagamento,
          valorTotal: totalGeral,
          vendedorId: session?.user?.id,
          devedorId: devedorIdLocal, // Passa o ID do cliente se tiver
        }),
      });
      if (res.ok) {
        alert("Venda Finalizada! 🥂");
        setCarrinho([]);
        setModalFiado(false);
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao processar venda.");
      }
    } catch {
      alert("Erro ao processar venda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 antialiased relative">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
        <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
          <ShoppingCart className="h-8 w-8" />
        </div>
        Frente de <span className="text-amber-500">Caixa</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* BUSCA E SELEÇÃO */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase">
                Selecionar Item
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative" ref={dropdownRef}>
                <Label className="text-[10px] font-bold uppercase ml-1">
                  Produto
                </Label>
                <Input
                  placeholder="Busque o item..."
                  className="h-14 bg-white/50 border-white/60 rounded-2xl pl-10 font-bold"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                  }}
                />
                <Search className="absolute left-3 bottom-4 h-5 w-5 text-slate-400" />
                {showResults && searchTerm && (
                  <div className="absolute z-50 w-full bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl mt-2 max-h-60 overflow-y-auto">
                    {produtosFiltrados.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 hover:bg-amber-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                        onClick={() => {
                          setProdutoSelecionado(p);
                          setSearchTerm(p.nome);
                          setShowResults(false);
                        }}
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {p.nome}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Estoque: {p.quantidade} un
                          </span>
                        </div>
                        <span className="text-amber-600 font-black text-lg">
                          R$ {Number(p.precoVenda).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase ml-1">
                    Qtd
                  </Label>
                  <Input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="h-14 text-center font-black text-xl bg-white/50 rounded-2xl border-white/60"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={adicionarItem}
                    disabled={!produtoSelecionado}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-bold uppercase shadow-lg disabled:opacity-50 transition-all active:scale-95"
                  >
                    <Plus className="h-5 w-5" /> Incluir
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PAGAMENTO (COM FIADO) */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-xl rounded-[2.5rem]">
            <CardContent className="pt-6">
              <Label className="text-[10px] font-bold uppercase block mb-4">
                Pagamento
              </Label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: "PIX", label: "Pix", icon: CheckCircle2 },
                  { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
                  { id: "CARTAO_CREDITO", label: "Crédito", icon: CreditCard },
                  { id: "CARTAO_DEBITO", label: "Débito", icon: CreditCard },
                  { id: "FIADO", label: "Fiado", icon: BookOpen }, // <-- Adicionado aqui
                ].map((metodo) => {
                  const isActive = metodoPagamento === metodo.id;
                  return (
                    <button
                      key={metodo.id}
                      onClick={() => setMetodoPagamento(metodo.id)}
                      className={cn(
                        "h-14 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 text-[10px] font-black uppercase",
                        isActive
                          ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20"
                          : "bg-white/40 border-white/60 text-slate-500 hover:bg-white/80",
                      )}
                    >
                      <metodo.icon className="w-4 h-4" /> {metodo.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LISTA DE ITENS (CARRINHO) */}
        <div className="lg:col-span-4">
          <Card className="bg-white/40 backdrop-blur-xl border-white/40 shadow-xl rounded-[2.5rem] min-h-[480px] flex flex-col">
            <CardHeader className="border-b border-white/20">
              <CardTitle className="text-xs font-black uppercase text-slate-400 tracking-widest">
                Lista de Compras
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[420px]">
              {carrinho.length > 0 ? (
                carrinho.map((item) => (
                  <div
                    key={item.tempId}
                    className="p-4 flex justify-between items-center border-b border-white/10 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm uppercase">
                        {item.nome}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold tracking-widest">
                        {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 text-lg">
                        R$ {item.subtotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() =>
                          setCarrinho(
                            carrinho.filter((i) => i.tempId !== item.tempId),
                          )
                        }
                        className="text-rose-400 hover:text-rose-600 bg-rose-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-20 text-slate-400">
                  <ShoppingCart className="h-10 w-10 opacity-20 mb-3" />{" "}
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">
                    Carrinho Vazio
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* TOTAL E FINALIZAR */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-950/90 backdrop-blur-2xl border border-slate-800 p-8 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">
              Total Geral
            </p>
            <div className="text-5xl font-black text-amber-500 tracking-tighter">
              <span className="text-xl mr-1 font-medium text-white opacity-40">
                R$
              </span>
              {totalGeral.toFixed(2)}
            </div>
          </div>

          <button
            onClick={prepararVenda}
            disabled={loading || carrinho.length === 0}
            className={cn(
              "w-full h-32 rounded-[3rem] flex flex-col items-center justify-center gap-1 text-white font-black text-3xl uppercase tracking-tighter shadow-2xl relative overflow-hidden active:scale-95 transition-all group",
              loading || carrinho.length === 0
                ? "bg-slate-200/50 text-slate-400 backdrop-blur-sm"
                : "bg-amber-500/90 backdrop-blur-xl border border-amber-400/50 hover:bg-amber-500",
            )}
          >
            {loading ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              "Finalizar"
            )}
            {!loading && carrinho.length > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      {/* MODAL LIQUID GLASS PARA SELECIONAR CLIENTE DO FIADO */}
      {modalFiado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setModalFiado(false)}
        >
          <div
            className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-white/60 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/40 flex justify-between items-center bg-white/40">
              <div className="flex items-center gap-4">
                <div className="bg-sky-500/20 p-3 rounded-2xl border border-sky-500/20 shadow-inner">
                  <BookOpen className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">
                    Venda no Fiado
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 mt-1.5 uppercase tracking-[0.2em]">
                    Quem vai pagar a conta?
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalFiado(false)}
                className="p-2 bg-white/50 hover:bg-rose-500/10 rounded-full text-slate-500 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/30 flex-1">
              {devedores.length > 0 ? (
                <div className="space-y-3">
                  {devedores.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => executarVenda(dev.id)} // Clicou no nome, finaliza a venda!
                      className="w-full flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl shadow-sm hover:bg-sky-50 hover:border-sky-200 transition-all active:scale-95 group text-left"
                    >
                      <div className="bg-slate-100 p-2.5 rounded-xl group-hover:bg-sky-100 group-hover:text-sky-600 text-slate-400 transition-colors">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-800 uppercase text-sm group-hover:text-sky-700 transition-colors">
                          {dev.nome}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                          Saldo atual: R$ {Number(dev.saldoDevedor).toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                    Nenhum cliente cadastrado.
                  </p>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-2">
                    Vá na aba "Devedores" para criar o caderninho.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-950/90 backdrop-blur-xl text-white mt-auto border-t border-slate-800">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] text-center mb-1">
                Valor a pendurar
              </p>
              <div className="text-3xl font-black text-amber-500 tracking-tighter text-center">
                R$ {totalGeral.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

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
