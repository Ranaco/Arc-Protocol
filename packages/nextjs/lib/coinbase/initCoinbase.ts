import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

const filePath = path.resolve("./key.json");

export const createWallet = async () => {
  Coinbase.configureFromJson({
    filePath: path.resolve(`${os.homedir()}/Code/eth_24/packages/nextjs/lib/coinbase/cdp_api_key.json`),
  });
  try {
    const wallet = await Wallet.create({
      networkId: Coinbase.networks.BaseSepolia,
    });

    await wallet.faucet();
    wallet.saveSeed(filePath, true);
    console.log("wallet is", wallet);
    return wallet.export();
  } catch (err: any) {
    console.error("Error creating wallet:", err);
    throw err;
  }
};

export const fetchWallet = async (seed: string, id: string) => {
  Coinbase.configureFromJson({
    filePath: path.resolve(`${os.homedir()}/Code/eth_24/packages/nextjs/lib/coinbase/cdp_api_key.json`),
  });
  try {
    if (seed && id) {
      const wallet = await Wallet.import({
        seed: seed,
        walletId: id,
      });
      console.log("wallet is", wallet);
      return wallet.export();
    } else {
      return await createWallet();
    }
  } catch (err: any) {
    console.error("Error fetching wallet:", err);
    throw err;
  }
};
