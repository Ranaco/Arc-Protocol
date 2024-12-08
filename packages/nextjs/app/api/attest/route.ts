import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { Schema, TrueApi, U64 } from "@truenetworkio/sdk";
import os from "os";
import * as path from "path";

const schmea = Schema.create({
  profitMade: U64,
});

const getTrueNetworkInstance = async (): Promise<TrueApi> => {
  const trueApi = await TrueApi.create("0x1e365210857f7fb1a098c08c58e578d933eb8178cdb822ed090a332bdaaf37c9");
  trueApi.setIssuer("0xe51e3b8cf2d51c4abf7391d6bb8021c7abebb4dee5470ced351f2d7bdc3eb216");
  return trueApi;
};

export async function POST(request: NextRequest) {
  const { profitMade } = await request.json();

  Coinbase.configureFromJson({
    filePath: path.resolve(`${os.homedir()}/Code/eth_24/packages/nextjs/lib/coinbase/cdp_api_key.json`),
  });
  const cookieStore = cookies();
  const wallet = await Wallet.import({
    seed: cookieStore.get("walletSeed")?.value ?? "",
    walletId: cookieStore.get("walletId")?.value ?? "",
  });

  const api = await getTrueNetworkInstance();
  const address = (await wallet.getDefaultAddress()).getId().toString();

  console.log("Address from POST", address);

  try {
    const attestation = await schmea.attest(api, address ?? "", {
      profitMade: 100,
    });

    return NextResponse.json({ attestation });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function GET(_: NextRequest) {
  Coinbase.configureFromJson({
    filePath: path.resolve(`${os.homedir()}/Code/eth_24/packages/nextjs/lib/coinbase/cdp_api_key.json`),
  });
  const cookieStore = cookies();
  const wallet = await Wallet.import({
    seed: cookieStore.get("walletSeed")?.value ?? "",
    walletId: cookieStore.get("walletId")?.value ?? "",
  });

  const api = await getTrueNetworkInstance();
  const address = (await wallet.getDefaultAddress()).getId().toString();

  console.log("Address from GET", address);

  console.log("Calling reputation");
  try {
    const reputationPoint = await api.getReputationScore(140, address ?? "");
    console.log("This is reputation", reputationPoint);
    return NextResponse.json({ reputationPoint });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
