import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import os from "os";
import * as path from "path";

export async function POST(request: NextRequest) {
  Coinbase.configureFromJson({
    filePath: path.resolve(`${os.homedir()}/Code/eth_24/packages/nextjs/lib/coinbase/cdp_api_key.json`),
  });
  const cookieStore = cookies();
  try {
    console.log(cookieStore.get("walletId")?.value);
    const wallet = await Wallet.import({
      seed: cookieStore.get("walletSeed")?.value ?? "",
      walletId: cookieStore.get("walletId")?.value ?? "",
    });

    const address = await wallet.getDefaultAddress();

    return NextResponse.json({ res: "hello" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
