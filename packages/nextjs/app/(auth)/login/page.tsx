"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import AtProtoManager from "~~/lib/atproto_manager";

const LoginPage = () => {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const authResponse = await fetch("https://bsky.social/xrpc/com.atproto.server.createSession", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: account, password }),
      });

      if (!authResponse.ok) {
        throw new Error("Invalid username or password");
      }

      const authData = await authResponse.json();

      Cookies.set("accessJwt", authData.accessJwt, { expires: 7, secure: true });
      Cookies.set("refreshJwt", authData.refreshJwt, { expires: 7, secure: true });
      Cookies.set("did", authData.did, { expires: 7, secure: true });

      const atProtoManager = new AtProtoManager();

      let wallet = await atProtoManager.getWallet(authData.did);

      let walletResponse;
      if (!wallet) {
        walletResponse = await fetch("/api/wallet?" + new URLSearchParams({ walletId: "", seed: "" }), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!walletResponse?.ok) {
          throw new Error("Failed to fetch wallet");
        }

        const { wallet: walletData } = await walletResponse.json();

        wallet = walletData;

        console.log(wallet);

        const profile = await atProtoManager.getProfile(authData.did);

        if (!profile.metadata) {
          profile.metadata = {};
          profile.metadata = wallet;
        }

        await atProtoManager.updateProfileExtras(authData.did, wallet);
      }

      Cookies.set("walletId", wallet.walletId, { expires: 7, secure: true });
      Cookies.set("walletSeed", wallet.walletSeed, { expires: 7, secure: true });

      window.location.href = "/";
    } catch (err: any) {
      console.error("Error during login:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex w-full gap-10 mx-auto">
        <div className="flex-[0.5] w-full flex items-center justify-end">
          <div className="w-full flex flex-col justify-center items-end pl-12 text-left">
            <h1 className="text-6xl font-bold text-blue-500">Sign in</h1>
            <p className="mt-2 text-gray-400">Enter your username and password</p>
          </div>
        </div>
        <div className="h-screen shadow-[1px_1px_1px_1px_rgba(255,255,255,0.1)]" />
        <div className="flex-1 flex flex-col justify-center items-start">
          <div className=" p-8 rounded-lg min-w-fit">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleLogin();
              }}
              className="flex flex-col gap-4 min-w-[500px]"
            >
              <label htmlFor="account" className="block text-sm font-medium text-gray-400">
                Account
              </label>
              <input
                id="account"
                type="text"
                placeholder="e.g., ranac0.bsky.social"
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-700 border-none shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-300 px-4 py-2"
              />

              <div className="relative">
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-none shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-300 px-4 py-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="bg-gray-700 text-gray-300 px-4 py-2 rounded-md hover:bg-gray-600 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
