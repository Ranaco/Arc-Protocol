import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";

export const coinbase = Coinbase.configureFromJson({ filePath: "../../../cdp_api_key.json" });

class CoinbaseManager {
  private _coinbase: Coinbase;

  constructor() {
    this._coinbase = coinbase;
  }

  async createWallet(): Promise<Wallet> {
    const wallet = await Wallet.create();
    return wallet;
  }

  async getAccount(): Promise<string> {}
}
