import { NextResponse } from "next/server";
import { WalletData } from "@coinbase/coinbase-sdk";
import { createWallet, fetchWallet } from "~~/lib/coinbase/initCoinbase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const seed = url.searchParams.get("seed");

    const wallet: WalletData = await fetchWallet(seed ?? "", id ?? "");
    console.log("wallet is", wallet);
    return NextResponse.json({ walletId: wallet.walletId, walletSeed: wallet.seed });
  } catch (err: any) {
    console.error("Error fetching wallet:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const wallet = await createWallet();
    console.log("wallet is", wallet);
    return NextResponse.json({ wallet });
  } catch (err: any) {
    console.error("Error creating wallet:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
