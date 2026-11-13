"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  {
    ssr: false,
    loading: () => <button className="button" type="button" disabled>Loading wallet...</button>,
  }
);

export function PhantomConnect() {
  return <WalletMultiButton />;
}
