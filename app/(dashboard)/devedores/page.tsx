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
  Loader2,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DevedoresPage() {
  const [devedores, setDevedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

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

  async function cadastrarCliente(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const res = await fetch("/api/devedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoNome, telefone: novoTelefone }),
    });

    if (res.ok) {
      setModalNovo(false);
      setNovoNome("");
      setNovoTelefone("");
      carregarDevedores();
    }
    setSalvando(false);
  }

  async function registrarPagamento(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const res = await fetch("/api/devedores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: modalPagamento.id, valorPago }),
    });

    if (res.ok) {
      setModalPagamento(null);
      setValorPago("");
      carregarDevedores();
    }
    setSalvando(false);
  }

  if (loading)
    return (
      <div className="p-10 text-center font-black animate-pulse text-slate-500 uppercase tracking-widest">
        Abrindo o caderninho... 📖
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 p-2 md:p-4 font-sans antialiased relative pb-20 md:pb-0">
      {/* HEADER ✨ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-2xl shadow-lg text-white">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            Fiados
          </h2>
          <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Gestão de Quem Não tem UM puto pra pagar
          </p>
        </div>

        <Button
          onClick={() => setModalNovo(true)}
          className="w-full md:w-auto h-12 md:h-14 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest shadow-xl rounded-2xl px-8 transition-all active:scale-95 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
          <UserPlus className="h-5 w-5 mr-2" /> Novo Cliente
        </Button>
      </div>

      {/* MÉTRICAS (2 COLUNAS NO MOBILE) */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        <Card className="bg-rose-500/10 backdrop-blur-xl border border-rose-400/30 rounded-[1.8rem] md:rounded-[2.5rem] shadow-lg relative overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-[8px] md:text-[10px] uppercase text-rose-800 font-black tracking-widest flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4" /> Na Rua
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-4xl font-black text-rose-600 tracking-tighter">
              <span className="text-xs md:text-xl mr-0.5 opacity-50 italic">
                R$
              </span>
              {totalNaRua.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-sky-500/10 backdrop-blur-xl border border-sky-400/30 rounded-[1.8rem] md:rounded-[2.5rem] shadow-lg relative overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-2">
            <CardTitle className="text-[8px] md:text-[10px] uppercase text-sky-800 font-black tracking-widest flex items-center gap-1.5">
              <User className="w-3 h-3 md:w-4 md:h-4" /> Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="text-xl md:text-4xl font-black text-sky-600 tracking-tighter">
              {devedores.length}{" "}
              <span className="text-[10px] md:text-xl opacity-40 uppercase">
                pess.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BUSCA */}
      <div className="bg-white/60 backdrop-blur-xl p-3 md:p-4 px-4 md:px-6 rounded-[1.8rem] md:rounded-[2.5rem] border border-white/40 shadow-xl">
        <div className="relative w-full">
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Procurar cliente..."
            className="pl-12 md:pl-14 h-12 md:h-14 bg-white/40 border-white/60 rounded-xl md:rounded-2xl font-bold text-base md:text-lg focus:bg-white/70 transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* LISTA DE DEVEDORES: VERSÃO DESKTOP (TABELA) ✨ */}
      <Card className="hidden md:block bg-white/60 backdrop-blur-xl border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/40 border-b border-white/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-6">Cliente</th>
                <th className="px-8 py-6">Contato</th>
                <th className="px-8 py-6 text-right">Saldo Devedor</th>
                <th className="px-8 py-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {devedoresFiltrados.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-white/50 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-800 uppercase text-sm">
                      {d.nome}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    {d.telefone ? (
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-100/50 w-fit px-3 py-1 rounded-lg border border-white/60">
                        <Phone className="h-3 w-3 text-emerald-500" />{" "}
                        {d.telefone}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">
                        Sem contato
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    {Number(d.saldoDevedor) > 0 ? (
                      <span className="font-black text-rose-600 text-xl tracking-tighter">
                        R$ {Number(d.saldoDevedor).toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-black text-emerald-600 text-sm uppercase tracking-widest flex items-center justify-end gap-1">
                        <Check className="h-4 w-4" /> Pago
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <Button
                      onClick={() => setModalPagamento(d)}
                      disabled={Number(d.saldoDevedor) <= 0}
                      className={cn(
                        "h-10 px-6 rounded-xl font-black uppercase text-[10px] transition-all",
                        Number(d.saldoDevedor) > 0
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100 text-slate-400",
                      )}
                    >
                      <Wallet className="h-3 w-3 mr-2" /> Receber
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* LISTA DE DEVEDORES: VERSÃO MOBILE (CARDS) ✨ */}
      <div className="md:hidden space-y-4 px-2">
        {devedoresFiltrados.map((d) => (
          <Card
            key={d.id}
            className="bg-white/70 backdrop-blur-md border-white/60 rounded-[2rem] shadow-md overflow-hidden transition-all active:scale-[0.98]"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-black text-slate-800 uppercase text-sm leading-tight">
                    {d.nome}
                  </p>
                  {d.telefone && (
                    <p className="text-[10px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                      <Phone size={10} className="text-emerald-500" />{" "}
                      {d.telefone}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Saldo
                  </p>
                  <p
                    className={cn(
                      "text-lg font-black tracking-tighter",
                      Number(d.saldoDevedor) > 0
                        ? "text-rose-600"
                        : "text-emerald-600",
                    )}
                  >
                    R$ {Number(d.saldoDevedor).toFixed(2)}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setModalPagamento(d)}
                disabled={Number(d.saldoDevedor) <= 0}
                className={cn(
                  "w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                  Number(d.saldoDevedor) > 0
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-slate-100 text-slate-400 opacity-50",
                )}
              >
                {Number(d.saldoDevedor) > 0 ? (
                  <>
                    <Wallet className="h-4 w-4 mr-2" /> Registrar Recebimento
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Conta Quitada
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {devedoresFiltrados.length === 0 && (
        <div className="p-16 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">
          Nenhum devedor encontrado 🍻
        </div>
      )}

      {/* MODAL: NOVO CLIENTE (LIQUID GLASS MOBILE-READY) ✨ */}
      {modalNovo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalNovo(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-md border border-white/60 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8 border-b border-white/40 flex justify-between items-center">
              <h3 className="font-black text-slate-900 uppercase text-xl flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-amber-500" /> Novo Cliente
              </h3>
              <button
                onClick={() => setModalNovo(false)}
                className="p-2 text-slate-400 hover:text-rose-500"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={cadastrarCliente} className="p-6 md:p-10 space-y-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Nome Completo
                </Label>
                <Input
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="h-14 rounded-2xl bg-white/50 font-bold"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Telefone (WhatsApp)
                </Label>
                <Input
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  className="h-14 rounded-2xl bg-white/50 font-bold"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <Button
                type="submit"
                disabled={salvando}
                className="w-full h-16 bg-amber-500 text-slate-950 font-black uppercase rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
              >
                {salvando ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Cadastrar Cliente"
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECEBER PAGAMENTO (LIQUID GLASS MOBILE-READY) ✨ */}
      {modalPagamento && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in"
          onClick={() => setModalPagamento(null)}
        >
          <div
            className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl w-full max-w-lg border border-white/60 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8 border-b border-white/40 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 md:p-3 rounded-2xl">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-lg leading-tight">
                    Receber
                  </h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase truncate max-w-[150px]">
                    {modalPagamento.nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalPagamento(null)}
                className="p-2 text-slate-400 hover:text-rose-500"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={registrarPagamento}
              className="p-6 md:p-10 space-y-6 md:space-y-8"
            >
              <div className="bg-rose-500/5 p-6 rounded-[2rem] border border-rose-500/10 text-center">
                <p className="text-[10px] uppercase font-black text-rose-500 tracking-widest mb-1">
                  Dívida no Caderno
                </p>
                <p className="text-4xl font-black text-rose-600 tracking-tighter">
                  R$ {Number(modalPagamento.saldoDevedor).toFixed(2)}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                  Valor do Pagamento (R$)
                </Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  max={Number(modalPagamento.saldoDevedor)}
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="h-16 md:h-20 rounded-3xl bg-white/50 border-white/60 font-black text-emerald-600 text-3xl md:text-4xl text-center shadow-inner"
                  placeholder="0,00"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={salvando}
                className="w-full h-16 bg-emerald-500 text-white font-black uppercase rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
              >
                {salvando ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-6 w-6" /> Confirmar Recebimento
                  </>
                )}
              </Button>
            </form>
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
