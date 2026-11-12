# SolanaFork — Pump.fun vanity mint launcher

Configured for:
- Token name / ticker: REPO / REPO
- Pump.fun `create_v2`, SOL-paired
- Mint public key suffix: `fork`
- Initial buy: 1 SOL
- Mayhem: off
- Tokenized agent: off
- Cashback: off (deprecated by Pump.fun)
- Holder rewards: off
- Creator: `2Enbz8kpr3XeuEahLdx9kyqa4JSmripKioAK3AAwNPSj`
- Metadata: `https://copper-main-toad-738.mypinata.cloud/ipfs/bafkreidykminp2dnx2dpt336za3mnjuogvil2qkkkc6qshthzy67m5rtqy`

## Important security boundary

This is a development launcher intended to run in your own GitHub Codespace. Do not deploy it publicly. The mint keypair is stored in `.secrets/mint-keypair.json`, ignored by Git, and never returned by the API. The server only partially signs the transaction with the mint; Phantom must sign as creator before the browser submits it.

Never put a wallet seed phrase or creator private key in Codespaces, GitHub, browser code, or environment variables. Rotate any RPC API key that was previously pasted into chat.

## 1. Install

```bash
npm install
```

## 2. Configure Codespaces secrets

Add a new, rotated mainnet RPC URL as a Codespaces secret named `SOLANA_RPC_URL`. Do not reuse an RPC key previously exposed in chat.

In the Codespace terminal, export it for this session:

```bash
export SOLANA_RPC_URL='YOUR_ROTATED_MAINNET_RPC_URL'
export NEXT_PUBLIC_SOLANA_RPC_URL='YOUR_ROTATED_MAINNET_RPC_URL'
export LAUNCHER_ENABLED=true
```

Do not commit these values. `NEXT_PUBLIC_SOLANA_RPC_URL` is visible to the browser; use a dedicated public RPC endpoint with appropriate rate limits if you prefer not to expose the private Helius key. The server-side `SOLANA_RPC_URL` is not sent to the browser.

## 3. Generate the vanity mint

```bash
npm run grind:mint
```

This searches for a public key ending exactly in lowercase `fork`. A four-character suffix can take a long time; runtime is variable. Keep the Codespace running. The secret is saved under `.secrets/` and must remain private. Back up that file securely; losing it means losing control of the mint signer.

## 4. Run locally in Codespaces

```bash
npm run dev
```

Open the forwarded port 3000 using the Codespaces private port visibility. Do not make the port public.

## 5. Launch

1. Connect Phantom using the creator wallet shown on the page.
2. Click **Prepare launch transaction**.
3. Review the mint address and metadata URI.
4. Click **Approve in Phantom & launch**.
5. In Phantom, verify the transaction and approve only if the wallet, amount and instruction details are correct.

The transaction includes a 1 SOL initial buy plus network, priority and Pump.fun fees. The buy amount is quoted by the official Pump SDK; actual spend is bounded by the 1 SOL quote input plus transaction fees.

## Notes

- The API checks the creator wallet, local mint suffix and server-side RPC before preparing the transaction.
- The mint keypair is required to sign `create_v2`; the connected creator wallet separately signs through Phantom.
- No transaction is sent when preparing. Submission occurs only after Phantom returns the creator-signed transaction.
- Never reuse a mint keypair. After a successful launch, archive its secret securely and disable the launcher.
- Inspect the Pinata JSON at the configured URI and ensure its `name`, `symbol`, `description`, and `image` fields are correct before launch.
- Pump.fun's SDK/API can change. Run a test build and verify on-chain state before approving a mainnet transaction.
