import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Connection, Keypair, PublicKey, Transaction, ComputeBudgetProgram } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import { OnlinePumpSdk, PUMP_SDK, getBuyTokenAmountFromSolAmount } from "@pump-fun/pump-sdk";
import BN from "bn.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREATOR = "2Enbz8kpr3XeuEahLdx9kyqa4JSmripKioAK3AAwNPSj";
const NAME = "REPO";
const SYMBOL = "REPO";
const URI = "https://copper-main-toad-738.mypinata.cloud/ipfs/bafkreidykminp2dnx2dpt336za3mnjuogvil2qkkkc6qshthzy67m5rtqy";
const SOL_AMOUNT = new BN("1000000000");

export async function POST(request: NextRequest) {
  try {
    // This endpoint is intended for a private Codespaces development session only.
    if (process.env.LAUNCHER_ENABLED !== "true") {
      return NextResponse.json({ error: "Launcher is disabled. Set LAUNCHER_ENABLED=true after reviewing the setup." }, { status: 403 });
    }
    const body = await request.json();
    if (body.creator !== CREATOR) {
      return NextResponse.json({ error: "Connected wallet does not match the configured creator." }, { status: 403 });
    }
    const rpc = process.env.SOLANA_RPC_URL;
    if (!rpc) return NextResponse.json({ error: "SOLANA_RPC_URL is not configured on the server." }, { status: 500 });

    const secretPath = resolve(process.cwd(), ".secrets/mint-keypair.json");
    const secret = JSON.parse(await readFile(secretPath, "utf8"));
    const mint = Keypair.fromSecretKey(Uint8Array.from(secret));
    const mintAddress = mint.publicKey.toBase58();
    if (!mintAddress.endsWith("fork")) {
      return NextResponse.json({ error: "The local mint keypair does not end in fork. Run npm run grind:mint." }, { status: 400 });
    }

    const user = new PublicKey(CREATOR);
    const connection = new Connection(rpc, "confirmed");
    const online = new OnlinePumpSdk(connection);
    const global = await online.fetchGlobal();
    const feeConfig = await online.fetchFeeConfig();
    const amount = getBuyTokenAmountFromSolAmount({
      global,
      feeConfig,
      mintSupply: null,
      bondingCurve: null,
      amount: SOL_AMOUNT,
      quoteMint: NATIVE_MINT,
    });
    const instructions = await PUMP_SDK.createV2AndBuyInstructions({
      global,
      mint: mint.publicKey,
      name: NAME,
      symbol: SYMBOL,
      uri: URI,
      creator: user,
      user,
      amount,
      solAmount: SOL_AMOUNT,
      mayhemMode: false,
      holderReward: false,
    });

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({ feePayer: user, recentBlockhash: blockhash });
    tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500000 }));
    tx.add(...instructions);
    tx.partialSign(mint);
    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");
    return NextResponse.json({ mint: mintAddress, transaction: serialized });
  } catch (error) {
    console.error("prepare transaction failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not prepare transaction." }, { status: 500 });
  }
}
