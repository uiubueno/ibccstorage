"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, UserCircle, Power } from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usuarios")
      .then((res) => res.json())
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      });
  }, []);

  async function toggleStatus(id: string, statusAtual: boolean) {
    const res = await fetch("/api/usuarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ativo: !statusAtual }),
    });
    if (res.ok) window.location.reload();
  }

  if (loading) return <div className="p-8">Carregando equipe...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="h-8 w-8 text-indigo-600" /> Gestão de Equipe
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-600">
            Usuários Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">E-mail</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none">
                          <UserCircle className="h-3 w-3 mr-1" /> Vendedor
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.ativo ? (
                        <span className="flex items-center text-emerald-600 font-medium text-xs">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />{" "}
                          Ativo
                        </span>
                      ) : (
                        <span className="flex items-center text-slate-400 font-medium text-xs">
                          <div className="h-2 w-2 rounded-full bg-slate-300 mr-2" />{" "}
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          user.ativo ? "text-rose-500" : "text-emerald-600"
                        }
                        onClick={() => toggleStatus(user.id, user.ativo)}
                      >
                        <Power className="h-4 w-4 mr-1" />
                        {user.ativo ? "Desativar" : "Ativar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
