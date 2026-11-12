import type { Metadata } from "next";
import "./globals.css";
import { SolanaWalletProvider } from "./wallet-provider";

export const metadata: Metadata = {
  title: "SolanaFork — Pump.fun Vanity Launcher",
  description: "Create a Pump.fun token with a custom vanity mint address.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SolanaWalletProvider>{children}</SolanaWalletProvider></body></html>;
}
