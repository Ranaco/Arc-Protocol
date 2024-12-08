import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Coinbase, Wallet, readContract } from "@coinbase/coinbase-sdk";
import os from "os";
import * as path from "path";
import externalContracts from "~~/contracts/externalContracts";

export async function POST(request: NextRequest) {
  Coinbase.configureFromJson({
    filePath: path.resolve(`${os.homedir()}/Code/eth_24/packages/nextjs/lib/coinbase/cdp_api_key.json`),
  });
  const cookieStore = cookies();
  const { method, args, get } = await request.json();
  try {
    console.log(cookieStore.get("walletId")?.value);
    const wallet = await Wallet.import({
      seed: cookieStore.get("walletSeed")?.value ?? "",
      walletId: cookieStore.get("walletId")?.value ?? "",
    });

    console.log(args);
    let res;

    const address = await wallet.getDefaultAddress();
    console.log("This is the address", address.getId().toString());

    if (!get) {
      const tx = await wallet.invokeContract({
        contractAddress: externalContracts[1].ARCBoundingCurveMarketplace.address,
        method: method,
        args: args,
        abi: externalContracts[1].ARCBoundingCurveMarketplace.abi,
      });
      res = await tx.wait();
      console.log(res);
    } else {
      const posts = await readContract({
        contractAddress: externalContracts[1].ARCBoundingCurveMarketplace.address,
        method: method,
        args: {
          ...args,
          user: address.getId().toString(),
        },
        abi: externalContracts[1].ARCBoundingCurveMarketplace.abi as any,
        networkId: "base-sepolia",
      });
      res = posts;
      console.log("Posts, from ,", posts);
    }
    return NextResponse.json({ res });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { method, args } = await request.json();

  try {
    const posts = readContract({
      contractAddress: externalContracts[1].ARCBoundingCurveMarketplace.address,
      method: method,
      args: args,
      abi: externalContracts[1].ARCBoundingCurveMarketplace.abi as any,
      networkId: "base-sepolia",
    });

    console.log(posts);
  } catch (err) {
    console.error(err);
  }
}
