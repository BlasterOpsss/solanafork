"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect={false}>{children}</WalletProvider>
  </ConnectionProvider>;
}
