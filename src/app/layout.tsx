import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "App de Agenda | Novo Visual",
  description: "Seus compromissos, em um só lugar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-900 text-slate-200 flex items-center justify-center min-h-screen p-4`}>
        {children}
      </body>
    </html>
  );
}
