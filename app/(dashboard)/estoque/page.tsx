"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Package } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  tamanho: string;
  cor: string;
  precoCusto: number;
  precoVenda: number;
  quantidade: number;
}

const categorias = [
  "CAMISETA",
  "CALCA",
  "VESTIDO",
  "SAIA",
  "JAQUETA",
  "MOLETOM",
  "SHORTS",
  "OUTRO",
];
const tamanhos = ["PP", "P", "M", "G", "GG", "XGG", "UNICO"];
const emptyForm = {
  nome: "",
  categoria: "CAMISETA",
  tamanho: "M",
  cor: "",
  precoCusto: "",
  precoVenda: "",
  quantidade: "",
};

export default function EstoquePage() {
  const { data: session } = useSession();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const formatBRL = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  async function fetchProdutos() {
    try {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProdutos([]);
    }
  }

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      precoCusto: Number(form.precoCusto) || 0,
      precoVenda: Number(form.precoVenda) || 0,
      quantidade: Number(form.quantidade) || 0,
    };

    const url = editId ? `/api/produtos/${editId}` : "/api/produtos";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(
          editId
            ? "Produto atualizado com sucesso!"
            : "Produto cadastrado com sucesso!",
        );
        fetchProdutos();
        setOpen(false);
        setForm(emptyForm);
        setEditId(null);
      } else {
        alert("Erro ao salvar produto no banco de dados.");
      }
    } catch (error) {
      alert("Erro de comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja remover este produto definitivamente?")) return;

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Produto removido do estoque.");
        fetchProdutos();
      } else {
        alert("Erro ao remover o produto.");
      }
    } catch (error) {
      alert("Erro de comunicação com o servidor.");
    }
  }

  function openEdit(p: Produto) {
    setForm({
      nome: p.nome,
      categoria: p.categoria,
      tamanho: p.tamanho,
      cor: p.cor,
      precoCusto: String(p.precoCusto),
      precoVenda: String(p.precoVenda),
      quantidade: String(p.quantidade),
    });
    setEditId(p.id);
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Estoque</h2>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => {
                  setForm(emptyForm);
                  setEditId(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editId ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label>Nome da Peça</Label>
                    <Input
                      value={form.nome}
                      onChange={(e) =>
                        setForm({ ...form, nome: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Categoria</Label>
                    <Select
                      value={form.categoria}
                      onValueChange={(v) => setForm({ ...form, categoria: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Tamanho</Label>
                    <Select
                      value={form.tamanho}
                      onValueChange={(v) => setForm({ ...form, tamanho: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tamanhos.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Cor</Label>
                    <Input
                      value={form.cor}
                      onChange={(e) =>
                        setForm({ ...form, cor: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Qtd. em Estoque</Label>
                    <Input
                      type="number"
                      min="0"
                      value={form.quantidade}
                      onChange={(e) =>
                        setForm({ ...form, quantidade: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Preço de Custo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precoCusto}
                      onChange={(e) =>
                        setForm({ ...form, precoCusto: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Preço de Venda (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precoVenda}
                      onChange={(e) =>
                        setForm({ ...form, precoVenda: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Produto
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Categoria
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Tam.
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Cor
              </th>
              {isAdmin && (
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  Custo
                </th>
              )}
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Venda
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Estoque
              </th>
              {isAdmin && (
                <th className="text-left px-4 py-3 font-medium text-slate-600">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produtos.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    {p.nome}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{p.categoria}</Badge>
                </td>
                <td className="px-4 py-3">{p.tamanho}</td>
                <td className="px-4 py-3">{p.cor}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-slate-500">
                    {formatBRL(p.precoCusto)}
                  </td>
                )}
                <td className="px-4 py-3 font-medium text-emerald-700">
                  {formatBRL(p.precoVenda)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      p.quantidade <= 5
                        ? "bg-orange-100 text-orange-700"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  >
                    {p.quantidade} un.
                  </Badge>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
