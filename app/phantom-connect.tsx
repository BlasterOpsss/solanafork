"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function PhantomConnect() {
  const { publicKey, connected, connecting, connect, disconnect, wallet, select } = useWallet();
  const [message, setMessage] = useState("");

  async function handleClick() {
    setMessage("");
    try {
      if (connected) {
        await disconnect();
        return;
      }
      if (!wallet) {
        select("Phantom");
        setMessage("Phantom selected. Tap Connect Phantom once more to open its approval request.");
        return;
      }
      await connect();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not connect to Phantom.");
    }
  }

  return (
    <div>
      <button className="button" type="button" onClick={handleClick} disabled={connecting}>
        {connecting ? "Connecting..." : connected && publicKey ? "Disconnect Phantom" : "Connect Phantom"}
      </button>
      {connected && publicKey && <div className="small">Connected: {publicKey.toBase58()}</div>}
      {message && <div className="status">{message}</div>}
    </div>
  );
}
