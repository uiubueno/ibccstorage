"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-slate-900 dark:text-white text-xs">{user.name}</p>
            <p className="text-slate-400 text-xs">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-slate-500 hover:text-red-500"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Sair</span>
        </Button>
      </div>
    </header>
  );
};