import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import os from "os";
import * as path from "path";
import externalContracts from "~~/contracts/externalContracts";

export async function POST(request: NextRequest) {
  Coinbase.configureFromJson({
    filePath: path.resolve(`${os.homedir()}/Code/eth_24/packages/nextjs/lib/coinbase/cdp_api_key.json`),
  });
  const cookieStore = cookies();
  const { method, args } = await request.json();
  try {
    console.log(cookieStore.get("walletId")?.value);
    const wallet = await Wallet.import({
      seed: cookieStore.get("walletSeed")?.value ?? "",
      walletId: cookieStore.get("walletId")?.value ?? "",
    });

    const tx = await wallet.invokeContract({
      contractAddress: externalContracts[1].ARCToken.address,
      method: method,
      args: args,
      abi: externalContracts[1].ARCToken.abi,
    });

    const res = await tx.wait();
    console.log(res);
    return NextResponse.json({ res });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
