"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AtpAgent } from "@atproto/api";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { LeftSideBar } from "~~/components/LeftSideBar";
import { RightSideBar } from "~~/components/RightSideBar";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useInitializeNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const AgentContext = createContext<AtpAgent | null>(null);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const agent = useMemo(() => {
    const instance = new AtpAgent({ service: "https://bsky.social", persistSession: true });
    const accessJwt = Cookies.get("accessJwt");
    if (accessJwt) {
      instance.setHeader("Authorization", `Bearer ${accessJwt}`);
    }
    return instance;
  }, []);

  return <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>;
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  useInitializeNativeCurrencyPrice();

  return (
    <>
      <div className="flex flex-col min-h-screen items-center max-h-screen">
        <div className="flex flex-row w-full max-w-screen-xl flex-1 h-full">
          <LeftSideBar />
          <main className="flex flex-col flex-1 h-full overflow-y-auto overflow-x-clip">{children}</main>
          <RightSideBar />
        </div>
      </div>
      <Toaster />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar height="3px" color="#2299dd" />
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={mounted ? (isDarkMode ? darkTheme() : lightTheme()) : lightTheme()}
        >
          <AgentProvider>
            <OnchainKitProvider chain={base} apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}>
              <ScaffoldEthApp>{children}</ScaffoldEthApp>
            </OnchainKitProvider>
          </AgentProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
