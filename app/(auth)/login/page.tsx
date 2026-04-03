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
    // Fundo Branco Gelo com um gradiente suave para profundidade
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans antialiased relative overflow-hidden">
      {/* Detalhes de brilho ao fundo para realçar o efeito de vidro */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-200/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo Adega Eneas */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 rounded-3xl bg-white/80 shadow-xl border border-white/50 backdrop-blur-sm">
            <img
              src="/adegalogo.png"
              alt="Logo Adega Eneas"
              className="w-16 h-16 object-contain"
              style={{ minWidth: "64px", minHeight: "64px" }}
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Adega <span className="text-amber-500">Eneas</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Gestão de Bebidas
            </p>
          </div>
        </div>

        {/* Card Liquid Glass */}
        <Card className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-slate-800 text-xl font-extrabold uppercase tracking-tight">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Identifique-se para gerenciar a adega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 font-semibold ml-1"
                >
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@adegaeneas.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50 border-white/60 focus:bg-white/80 transition-all h-12 rounded-xl text-slate-900 placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-semibold ml-1"
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
                  className="bg-white/50 border-white/60 focus:bg-white/80 transition-all h-12 rounded-xl text-slate-900 placeholder:text-slate-400 shadow-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50/50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 transition-all active:scale-[0.98] rounded-xl mt-4"
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

        <p className="text-center text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em]">
          Copyright © {new Date().getFullYear()} Adega Eneas
        </p>
      </div>
    </div>
  );
}
