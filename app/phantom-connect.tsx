"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function PhantomConnect() {
  const { publicKey, connected, connecting, connect, disconnect, wallet } = useWallet();
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    try {
      if (connected) {
        await disconnect();
        return;
      }
      if (!wallet) {
        setError("Phantom is not available in this browser. Open this page inside Phantom's in-app browser.");
        return;
      }
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to Phantom.");
    }
  }

  return (
    <div>
      <button className="button" type="button" onClick={handleClick} disabled={connecting}>
        {connecting ? "Connecting..." : connected && publicKey ? "Disconnect Phantom" : "Connect Phantom"}
      </button>
      {connected && publicKey && <div className="small">Connected: {publicKey.toBase58()}</div>}
      {error && <div className="status">{error}</div>}
    </div>
  );
}
