"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  UserPlus,
  Search,
  Wallet,
  DollarSign,
  X,
  Check,
  Phone,
  AlertCircle,
} from "lucide-react";

export default function DevedoresPage() {
  const [devedores, setDevedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  // Modais
  const [modalNovo, setModalNovo] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");

  const [modalPagamento, setModalPagamento] = useState<any>(null);
  const [valorPago, setValorPago] = useState("");

  const carregarDevedores = () => {
    fetch("/api/devedores")
      .then((res) => res.json())
      .then((data) => {
        setDevedores(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    carregarDevedores();
  }, []);

  const devedoresFiltrados = devedores.filter((d) =>
    d.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  const totalNaRua = useMemo(() => {
    return devedores.reduce((acc, dev) => acc + Number(dev.saldoDevedor), 0);
  }, [devedores]);

  // FUNÇÃO: CADASTRAR CLIENTE
  async function cadastrarCliente(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/devedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome, telefone: novoTelefone }),
    });

    if (res.ok) {
      alert("Cliente de confiança cadastrado! 🤝");
      setModalNovo(false);
      setNovoNome("");
      setNovoTelefone("");
      carregarDevedores();
    } else {
      alert("Erro ao cadastrar cliente.");
    }
  }

  // FUNÇÃO: RECEBER PAGAMENTO
  async function registrarPagamento(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/devedores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: modalPagamento.id, valorPago }),
    });

    if (res.ok) {
      alert("Pagamento abatido com sucesso! 💰");
      setModalPagamento(null);
      setValorPago("");
      carregarDevedores();
    } else {
      alert("Erro ao registrar pagamento.");
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
        Abrindo o caderninho... 📖
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 font-sans antialiased relative">
      {/* HEADER E AÇÕES (LIQUID GLASS) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg shadow-amber-500/20 text-white">
              <BookOpen className="h-8 w-8" />
            </div>
            Fiados & <span className="text-amber-500">Devedores</span>
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 ml-1">
            Gestão de clientes de confiança
          </p>
        </div>
        <Button
          onClick={() => setModalNovo(true)}
          className="h-12 bg-amber-500/90 backdrop-blur-md border border-amber-400/50 hover:bg-amber-500 text-slate-950 font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 rounded-2xl px-6 transition-all active:scale-95"
        >
          <UserPlus className="h-5 w-5 mr-2" /> Novo Cliente
        </Button>
      </div>

      {/* MÉTRICAS (LIQUID GLASS PANELS) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-rose-500/10 backdrop-blur-xl border border-rose-400/30 rounded-[2rem] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-rose-800 font-black tracking-[0.3em] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" /> Total na Rua (A
              Receber)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-rose-600 tracking-tighter">
              <span className="text-xl mr-1 opacity-60 font-medium italic">
                R$
              </span>
              {totalNaRua.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/10 backdrop-blur-xl border border-sky-400/30 rounded-[2rem] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase text-sky-800 font-black tracking-[0.3em] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-600" /> Clientes no Caderno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-sky-600 tracking-tighter">
              {devedores.length}{" "}
              <span className="text-xl opacity-60 font-black uppercase tracking-widest">
                Pessoas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/40 shadow-xl">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-12 h-14 bg-white/50 border-white/60 rounded-2xl focus:bg-white/80 shadow-sm text-slate-700 font-bold text-lg placeholder:text-slate-400"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA DE DEVEDORES */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/40 border-b border-white/50 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Contato</th>
                <th className="px-6 py-5 text-right">Saldo Devedor</th>
                <th className="px-6 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {devedoresFiltrados.map((d) => (
                <tr key={d.id} className="hover:bg-white/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800 text-sm uppercase">
                      {d.nome}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {d.telefone ? (
                      <span className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                        <Phone className="h-3 w-3" /> {d.telefone}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Não informado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {Number(d.saldoDevedor) > 0 ? (
                      <span className="font-black text-rose-600 text-lg">
                        R$ {Number(d.saldoDevedor).toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-black text-emerald-600 text-lg">
                        R$ 0.00{" "}
                        <span className="text-[10px] uppercase ml-1">
                          (Quitado)
                        </span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setModalPagamento(d)}
                      disabled={Number(d.saldoDevedor) <= 0}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border border-emerald-400/30 rounded-xl h-10 font-bold uppercase tracking-widest text-[10px] shadow-sm transition-all"
                    >
                      <Wallet className="h-3 w-3 mr-2" /> Receber
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {devedoresFiltrados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <BookOpen className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">
                Nenhum cliente encontrado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: NOVO CLIENTE */}
      {modalNovo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setModalNovo(false)}
        >
          <div
            className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/60 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/40 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase text-xl">
                Novo Cliente
              </h3>
              <button onClick={() => setModalNovo(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={cadastrarCliente} className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  Nome Completo
                </Label>
                <Input
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="h-14 rounded-2xl font-bold"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  Telefone (WhatsApp)
                </Label>
                <Input
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  className="h-14 rounded-2xl font-bold"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 bg-amber-500 rounded-2xl font-black uppercase tracking-widest text-slate-950 shadow-lg hover:bg-amber-600"
              >
                Cadastrar Cliente
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECEBER PAGAMENTO */}
      {modalPagamento && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setModalPagamento(null)}
        >
          <div
            className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/60 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-xl">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900 uppercase text-xl">
                  Receber Pagamento
                </h3>
              </div>
              <button onClick={() => setModalPagamento(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={registrarPagamento} className="p-8 space-y-6">
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                <p className="text-[10px] uppercase font-bold text-rose-500 tracking-widest mb-1">
                  Dívida Atual de {modalPagamento.nome}
                </p>
                <p className="text-3xl font-black text-rose-600">
                  R$ {Number(modalPagamento.saldoDevedor).toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">
                  Valor Sendo Pago (R$)
                </Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  max={Number(modalPagamento.saldoDevedor)}
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="h-14 rounded-2xl font-black text-emerald-600 text-2xl text-center"
                  placeholder="0.00"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 bg-emerald-500 rounded-2xl font-black uppercase tracking-widest text-white shadow-lg hover:bg-emerald-600"
              >
                <Check className="w-5 h-5 mr-2" /> Confirmar Recebimento
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
