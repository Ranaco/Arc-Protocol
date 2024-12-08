import Cookies from "js-cookie";

class AtProtoManager {
  private accessJwt: string | null;
  private did: string | null;
  private baseUrl: string;

  constructor() {
    this.accessJwt = Cookies.get("accessJwt") || null;
    this.did = Cookies.get("did") || null;
    this.baseUrl = "https://bsky.social/xrpc";

    if (!this.accessJwt) {
      throw new Error("User is not authenticated. Missing accessJwt.");
    }

    if (!this.did) {
      throw new Error("User DID is not available.");
    }
  }

  private async request(endpoint: string, method: string, body?: Record<string, any>) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessJwt}`,
    };

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error in ${method} request to ${endpoint}:`, errorData);
      throw new Error(response.statusText);
    }

    return response.json();
  }

  /**
   * Fetches the user's profile.
   * @returns The profile data.
   */
  public async getProfile(did: string): Promise<any> {
    return await this.request(`app.bsky.actor.getProfile?actor=${did}`, "GET");
  }

  /**
   * Updates the user's profile.
   * @param profile - The updated profile data.
   * @returns The response from the API.
   */
  public async updateProfileExtras(did: string, extras: Record<string, any>): Promise<any> {
    const endpoint = "com.atproto.repo.putRecord";

    const record = {
      repo: this.did,
      collection: "app.bsky.actor.profileExtra",
      rkey: `extras`,
      record: {
        walletSeed: extras.seed,
        walletId: extras.walletId,
        updatedAt: new Date().toISOString(),
      },
    };

    console.log("Payload to putRecord (extras):", JSON.stringify(record, null, 2));

    return await this.request(endpoint, "POST", record);
  }

  public async getPost(postDid: string) {
    const urlParts = postDid.split("/");
    if (urlParts.length < 4) {
      throw new Error("Invalid DID format. Expected format: at://did:plc:<did_id>/app.bsky.feed.post/<record_id>");
    }

    const repo = urlParts[2];
    const collection = urlParts[3];
    const rkey = urlParts[4];

    const endpoint = "com.atproto.repo.getRecord?" + new URLSearchParams({ repo, collection, rkey }).toString();

    return await this.request(endpoint, "GET");
  }

  public async createRecord(collection: string, record: Record<string, any>) {
    const endpoint = "com.atproto.repo.createRecord";
    return await this.request(endpoint, "POST", {
      repo: this.did,
      collection,
      record,
    });
  }

  public async deleteRecord(collection: string, rkey: string) {
    const endpoint = "com.atproto.repo.deleteRecord";
    return await this.request(endpoint, "POST", {
      repo: this.did,
      collection,
      rkey,
    });
  }

  public async getWallet(did: string) {
    const endpoint =
      "com.atproto.repo.getRecord?" +
      new URLSearchParams({ repo: did, collection: "app.bsky.actor.profileExtra", rkey: "extras" }).toString();

    const {
      value: { walletId, walletSeed },
    } = await this.request(endpoint, "GET");

    return { walletId, walletSeed };
  }
}

export default AtProtoManager;
