"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Transaction } from "@solana/web3.js";

const MINT_SUFFIX = "fork";
const METADATA_URI = "https://copper-main-toad-738.mypinata.cloud/ipfs/bafkreidykminp2dnx2dpt336za3mnjuogvil2qkkkc6qshthzy67m5rtqy";
const CREATOR = "2Enbz8kpr3XeuEahLdx9kyqa4JSmripKioAK3AAwNPSj";

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [mint, setMint] = useState("");
  const [transaction, setTransaction] = useState("");
  const [status, setStatus] = useState("Connect Phantom to prepare your launch.");
  const [busy, setBusy] = useState(false);

  async function prepare() {
    if (!wallet.publicKey) return setStatus("Connect Phantom first.");
    if (wallet.publicKey.toBase58() !== CREATOR) return setStatus("Connected wallet does not match the configured creator wallet.");
    setBusy(true);
    setTransaction("");
    try {
      const response = await fetch("/api/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator: wallet.publicKey.toBase58() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to prepare transaction.");
      if (!data.mint || !data.transaction) throw new Error("Server returned an incomplete transaction.");
      if (!data.mint.toLowerCase().endsWith(MINT_SUFFIX)) throw new Error("Generated mint does not have the required suffix.");
      setMint(data.mint);
      setTransaction(data.transaction);
      setStatus("Transaction prepared and mint keypair has signed its part. Review the details, then approve in Phantom.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setBusy(false);
    }
  }

  async function approveAndSend() {
    if (!wallet.publicKey || !wallet.signTransaction || !transaction) return;
    setBusy(true);
    try {
      const tx = Transaction.from(Buffer.from(transaction, "base64"));
      const signed = await wallet.signTransaction(tx);
      setStatus("Phantom approved. Sending the signed transaction to Solana mainnet...");
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });
      setStatus("Transaction submitted: " + signature + "\nWaiting for confirmation...");
      const latest = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction({ signature, ...latest }, "confirmed");
      setStatus("Launch transaction confirmed. Signature: " + signature);
      setTransaction("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Transaction failed or was rejected.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="shell">
    <div className="eyebrow">Solana mainnet · Pump.fun create_v2</div>
    <h1 className="title">SOLANA<span style={{color:"#c5f36b"}}>FORK</span></h1>
    <p className="muted">Vanity mint launcher. Your token mint must end in <b>fork</b>. The creator wallet signs through Phantom; the mint keypair stays on the server.</p>
    <section className="panel">
      <div className="row"><b>Launch configuration</b><span className="pill">Mainnet</span></div>
      <div className="label">Token name</div><div className="value">REPO</div>
      <div className="label">Ticker</div><div className="value">REPO</div>
      <div className="label">Creator wallet</div><div className="value">{CREATOR}</div>
      <div className="label">Metadata URI</div><div className="value">{METADATA_URI}</div>
      <div className="label">Vanity suffix</div><div className="value">...fork</div>
      <div className="label">Initial buy</div><div className="value">1 SOL (plus network and protocol fees)</div>
      <div className="warning">This is a real mainnet transaction. Approving it in Phantom spends approximately 1 SOL plus fees. Verify the wallet, metadata, mint address and transaction in Phantom before approving.</div>
      <div className="actions"><WalletMultiButton /></div>
      {wallet.publicKey && <div className="small">Connected: {wallet.publicKey.toBase58()}</div>}
      <div className="actions"><button className="button" disabled={!wallet.publicKey || busy} onClick={prepare}>{busy ? "Working..." : "Prepare launch transaction"}</button>
      <button className="button secondary" disabled={!transaction || busy || !wallet.publicKey} onClick={approveAndSend}>Approve in Phantom & launch</button></div>
      {mint && <><div className="label">Vanity mint address</div><div className="value">{mint}</div></>}
      <div className="status">{status}</div>
    </section>
    <p className="small">No private key or seed phrase is requested. Never paste either into this site or GitHub. This launcher only submits after the connected creator wallet explicitly approves in Phantom.</p>
  </main>;
}
