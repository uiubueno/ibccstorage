"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("E-mail ou senha inválidos. Tente novamente.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans antialiased relative overflow-hidden">
      {/* Detalhes de brilho ao fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />

      {/* Ajuste: space-y menor no mobile para caber em telas curtas */}
      <div className="w-full max-w-md space-y-6 md:space-y-8 z-10">
        {/* Logo Adega Eneas */}
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <div className="p-3 md:p-4 rounded-[2rem] md:rounded-[2.5rem] bg-white shadow-2xl border border-white/50 backdrop-blur-sm flex items-center justify-center">
            <Image
              src="/adegalogo.png"
              alt="Logo Adega Eneas"
              width={80}
              height={80}
              priority // Faz o logo carregar instantaneamente
              className="object-contain w-16 h-16 md:w-20 md:h-20" // Ajuste de tamanho do logo no mobile
            />
          </div>
          <div className="text-center">
            {/* Ajuste: Fonte menor no celular para não quebrar a linha */}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Adega <span className="text-amber-500">Eneas</span>
            </h1>
            <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Gestão de Estoque
            </p>
          </div>
        </div>

        {/* Card Liquid Glass */}
        {/* Ajuste: Borda um pouco menos arredondada no mobile para economizar espaço interno */}
        <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
          <CardHeader className="pb-4 text-center pt-6 md:pt-8 px-6 md:px-8">
            <CardTitle className="text-slate-800 text-lg md:text-xl font-extrabold uppercase tracking-tight">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium text-xs md:text-sm">
              Gerencie a adega como um profissional (ou quase)
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 md:px-8 pb-6 md:pb-8">
            {/* Ajuste: Espaçamento entre inputs um pouco menor no mobile */}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div className="space-y-1.5 md:space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 font-bold ml-1 text-[9px] md:text-[10px] uppercase tracking-widest"
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Login obrigatório, vagabundo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50 border-white/60 focus:bg-white/80 transition-all h-12 md:h-14 rounded-2xl text-slate-900 placeholder:text-slate-400 shadow-sm font-bold text-sm md:text-base"
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-bold ml-1 text-[9px] md:text-[10px] uppercase tracking-widest"
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50 border-white/60 focus:bg-white/80 transition-all h-12 md:h-14 rounded-2xl text-slate-900 placeholder:text-slate-400 shadow-sm font-bold text-sm md:text-base"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/50 border border-red-100 text-red-600 text-xs md:text-sm font-bold animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 transition-all active:scale-[0.96] rounded-2xl mt-2 md:mt-4 text-xs md:text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  "Entrar agora"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-[8px] md:text-[10px] uppercase font-black tracking-[0.3em]">
          Copyright © {new Date().getFullYear()} Adega Eneas & WILL B.
        </p>
      </div>
    </div>
  );
}
