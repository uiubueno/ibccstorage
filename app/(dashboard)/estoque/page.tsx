"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Beer,
  AlertTriangle,
  List,
  Plus,
  Search,
  Edit2,
  X,
  Check,
} from "lucide-react";

export default function EstoquePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filtroAtivo = searchParams.get("filtro") || "todos";

  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState(""); // Estado para a barra de busca
  const [loading, setLoading] = useState(true);

  // Estado para o Modal de Edição
  const [produtoEditando, setProdutoEditando] = useState<any>(null);

  const carregarProdutos = () => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  // Lógica de Filtragem (Categoria + Busca por Nome)
  const produtosFiltrados = produtos.filter((p) => {
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const bateFiltro = filtroAtivo === "baixo" ? p.quantidade <= 5 : true;
    return bateBusca && bateFiltro;
  });

  // Função para salvar a edição
  async function confirmarEdicao() {
    const res = await fetch("/api/produtos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produtoEditando),
    });

    if (res.ok) {
      setProdutoEditando(null);
      carregarProdutos();
    } else {
      alert("Erro ao atualizar produto.");
    }
  }

  if (loading)
    return (
      <div className="p-8 text-slate-500 italic text-center">
        Abrindo a geladeira... 🍻
      </div>
    );

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Beer className="h-8 w-8 text-amber-600" /> Controle de Inventário
          </h2>
          <p className="text-slate-500 text-sm">
            Pesquise produtos e ajuste preços
          </p>
        </div>
        <Button
          onClick={() => router.push("/produtos")}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Entrada
        </Button>
      </div>

      {/* BARRA DE BUSCA E FILTROS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Procurar bebida (ex: Heineken, Jack...)"
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <Button
            variant={filtroAtivo === "todos" ? "default" : "ghost"}
            size="sm"
            onClick={() => router.push("/estoque")}
            className={
              filtroAtivo === "todos"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500"
            }
          >
            Todos
          </Button>
          <Button
            variant={filtroAtivo === "baixo" ? "default" : "ghost"}
            size="sm"
            onClick={() => router.push("/estoque?filtro=baixo")}
            className={
              filtroAtivo === "baixo"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-500"
            }
          >
            Baixo Estoque
          </Button>
        </div>
      </div>

      {/* TABELA DE PRODUTOS */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4 text-center">Qtd</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Preço Venda</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtosFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {p.nome}
                      <p className="text-[10px] text-slate-400 font-normal uppercase">
                        {p.tamanho} • {p.categoria}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                      {p.quantidade}
                    </td>
                    <td className="px-6 py-4">
                      {p.quantidade <= 5 ? (
                        <Badge className="bg-rose-100 text-rose-700 border-none">
                          Alerta
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-700 border-none">
                          Ok
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      R$ {Number(p.precoVenda).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProdutoEditando(p)}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE EDIÇÃO ATUALIZADO COM CAMPO DE NOME */}
      {produtoEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Editar Produto</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProdutoEditando(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* CAMPO DE NOME (O QUE VOCÊ PEDIU) */}
              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <Input
                  type="text"
                  value={produtoEditando.nome}
                  onChange={(e) =>
                    setProdutoEditando({
                      ...produtoEditando,
                      nome: e.target.value,
                    })
                  }
                  placeholder="Ex: Heineken 600ml"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço Venda (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={produtoEditando.precoVenda}
                    onChange={(e) =>
                      setProdutoEditando({
                        ...produtoEditando,
                        precoVenda: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={produtoEditando.quantidade}
                    onChange={(e) =>
                      setProdutoEditando({
                        ...produtoEditando,
                        quantidade: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={confirmarEdicao}
                >
                  <Check className="h-4 w-4 mr-2" /> Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setProdutoEditando(null)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
