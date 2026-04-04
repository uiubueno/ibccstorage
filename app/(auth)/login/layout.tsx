import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adega Eneas | Login",
  description: "Acesse o sistema de gestão da Adega Eneas.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
