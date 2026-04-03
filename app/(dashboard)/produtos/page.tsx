"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Beer, PackageCheck } from "lucide-react";

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [custo, setCusto] = useState("");
  const [venda, setVenda] = useState("");
  const [qtd, setQtd] = useState("");

  const carregar = () =>
    fetch("/api/produtos")
      .then((res) => res.json())
      .then(setProdutos);
  useEffect(() => {
    carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        categoria,
        tamanho,
        precoCusto: custo,
        precoVenda: venda,
        quantidade: qtd,
      }),
    });
    if (res.ok) {
      alert("Sucesso! Item adicionado à adega.");
      carregar();
      setNome("");
      setCusto("");
      setVenda("");
      setQtd("");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-2">
      <h2 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
        <PackageCheck className="text-indigo-600" /> Gerenciar Estoque
      </h2>

      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="bg-indigo-50/30">
          <CardTitle className="text-lg">Nova Entrada</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            onSubmit={salvar}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="md:col-span-2 space-y-2">
              <Label>Nome do Produto</Label>
              <Input
                placeholder="Ex: Black Label 1L, Skol 269ml..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select onValueChange={setCategoria} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CERVEJA">Cerveja</SelectItem>
                  <SelectItem value="DESTILADO">Destilado</SelectItem>
                  <SelectItem value="VINHO">Vinho</SelectItem>
                  <SelectItem value="CIGARRO">Cigarro</SelectItem>
                  <SelectItem value="REFRIGERANTE">Refrigerante</SelectItem>
                  <SelectItem value="GELO">Gelo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Volume/Tamanho</Label>
              <Select onValueChange={setTamanho} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ML_269">Lata 269ml</SelectItem>
                  <SelectItem value="ML_350">Lata 350ml</SelectItem>
                  <SelectItem value="ML_473">Latão 473ml</SelectItem>
                  <SelectItem value="ML_600">600ml</SelectItem>
                  <SelectItem value="LITRO_1">1 Litro</SelectItem>
                  <SelectItem value="MACO">Maço</SelectItem>
                  <SelectItem value="UNIDADE">Unidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Custo (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Venda (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={venda}
                onChange={(e) => setVenda(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="md:col-span-3 bg-indigo-600 hover:bg-indigo-700"
              disabled={loading}
            >
              <PlusCircle className="mr-2 h-4 w-4" />{" "}
              {loading ? "Salvando..." : "Confirmar Entrada"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {produtos.map((p) => (
          <Card key={p.id} className="bg-white border-slate-100 shadow-sm">
            <CardContent className="pt-4">
              <p className="font-bold text-slate-800 leading-tight">{p.nome}</p>
              <div className="flex justify-between items-end mt-2">
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase font-bold text-slate-500">
                  {p.tamanho}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    R$ {Number(p.precoVenda).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Estoque: {p.quantidade}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
