"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Beer,
  Banknote,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function VendasPage() {
  const { data: session } = useSession();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estado da Venda
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");

  // Busca produtos do banco
  useEffect(() => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(data.filter((p: any) => p.quantidade > 0)));
  }, []);

  // Encontra o produto selecionado para mostrar o preço
  const produtoSelecionado = produtos.find((p) => p.id === produtoId);
  const precoUnitario = produtoSelecionado
    ? Number(produtoSelecionado.precoVenda)
    : 0;
  const totalVenda = precoUnitario * quantidade;

  async function finalizarVenda() {
    if (!produtoId || quantidade <= 0)
      return alert("Selecione um produto e a quantidade.");

    setLoading(true);
    const res = await fetch("/api/vendas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produtoId,
        quantidade,
        metodoPagamento,
        valorTotal: totalVenda,
        vendedorId: session?.user?.id, // Pega o ID do vendedor logado
      }),
    });

    if (res.ok) {
      alert("Venda realizada com sucesso! 🍻");
      window.location.reload(); // Atualiza para baixar o estoque na tela
    } else {
      const erro = await res.json();
      alert(erro.error || "Erro ao processar venda.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-2">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart className="h-8 w-8 text-indigo-600" />
        <h2 className="text-3xl font-bold text-slate-800">
          Frente de Caixa (PDV)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lado Esquerdo: Formulário */}
        <Card className="md:col-span-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Beer className="h-5 w-5 text-amber-600" /> Nova Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-600">
                Selecione o Produto / Bebida
              </Label>
              <Select onValueChange={setProdutoId}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="O que o cliente vai levar?" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} ({p.tamanho}) - Est: {p.quantidade} un.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-600">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  className="h-12 text-lg text-center"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600">Preço Unitário</Label>
                <div className="h-12 flex items-center px-4 bg-slate-50 border rounded-md font-bold text-slate-700">
                  R$ {precoUnitario.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-600">Forma de Pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={metodoPagamento === "PIX" ? "default" : "outline"}
                  onClick={() => setMetodoPagamento("PIX")}
                  className={metodoPagamento === "PIX" ? "bg-indigo-600" : ""}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" /> PIX
                </Button>
                <Button
                  type="button"
                  variant={
                    metodoPagamento === "DINHEIRO" ? "default" : "outline"
                  }
                  onClick={() => setMetodoPagamento("DINHEIRO")}
                  className={
                    metodoPagamento === "DINHEIRO" ? "bg-emerald-600" : ""
                  }
                >
                  <Banknote className="mr-2 h-4 w-4" /> Dinheiro
                </Button>
                <Button
                  type="button"
                  variant={
                    metodoPagamento === "CARTAO_CREDITO" ? "default" : "outline"
                  }
                  onClick={() => setMetodoPagamento("CARTAO_CREDITO")}
                  className={
                    metodoPagamento === "CARTAO_CREDITO" ? "bg-blue-600" : ""
                  }
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Crédito
                </Button>
                <Button
                  type="button"
                  variant={
                    metodoPagamento === "CARTAO_DEBITO" ? "default" : "outline"
                  }
                  onClick={() => setMetodoPagamento("CARTAO_DEBITO")}
                  className={
                    metodoPagamento === "CARTAO_DEBITO" ? "bg-blue-800" : ""
                  }
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Débito
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lado Direito: Resumo */}
        <div className="space-y-4">
          <Card className="bg-indigo-900 text-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-indigo-200 uppercase tracking-widest text-xs">
                Total a Pagar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <div className="text-5xl font-black">
                R$ {totalVenda.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={finalizarVenda}
            disabled={loading || !produtoId}
            className="w-full h-20 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg group"
          >
            {loading ? (
              "Processando..."
            ) : (
              <>
                Confirmar Venda
                <CheckCircle2 className="ml-2 h-6 w-6 group-hover:scale-125 transition-transform" />
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-slate-400 italic">
            Vendedor: {session?.user?.name || "Aguardando login..."}
          </p>
        </div>
      </div>
    </div>
  );
}
