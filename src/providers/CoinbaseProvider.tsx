import React from 'react'

import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";
import { COINBASE_PROJECT_ID } from '@/config/onramp';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { baseSepolia, base, sepolia } from 'viem/chains';
import { WagmiProvider, createConfig, http, injected } from 'wagmi';

// Your CDP config
const cdpConfig: Config = {
    projectId: COINBASE_PROJECT_ID,
    ethereum: {
        createOnLogin: "eoa"
    },
    appName: "MicroLeague",
    appLogoUrl: "",
    authMethods: ["email", "sms"],
    showCoinbaseFooter: true,

}

export const connector = createCDPEmbeddedWalletConnector({
    cdpConfig: cdpConfig,
    providerConfig: {
        chains: [sepolia],
        transports: {
            [sepolia.id]: http()
        }
    }
});

export const wagmiConfig = createConfig({
    connectors: [connector],
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
});




const theme: Partial<Theme> = {
    "colors-bg-default": "#ffffff",
    "colors-bg-alternate": "#eef0f3",
    "colors-bg-primary": "#0052ff",
    "colors-bg-secondary": "#eef0f3",
    "colors-fg-default": "#0a0b0d",
    "colors-fg-muted": "#5b616e",
    "colors-fg-primary": "#0052ff",
    "colors-fg-onPrimary": "#ffffff",
    "colors-fg-onSecondary": "#0a0b0d",
    "colors-fg-positive": "#098551",
    "colors-fg-negative": "#cf202f",
    "colors-fg-warning": "#ed702f",
    "colors-line-default": "#dcdfe4",
    "colors-line-heavy": "#9397a0",
    "borderRadius-banner": "var(--cdp-web-borderRadius-xl)",
    "borderRadius-cta": "var(--cdp-web-borderRadius-full)",
    "borderRadius-link": "var(--cdp-web-borderRadius-full)",
    "borderRadius-input": "var(--cdp-web-borderRadius-lg)",
    "borderRadius-select-trigger": "var(--cdp-web-borderRadius-lg)",
    "borderRadius-select-list": "var(--cdp-web-borderRadius-lg)",
    "borderRadius-modal": "var(--cdp-web-borderRadius-xl)"
}


export default function CoinbaseProvider({ children }: { children: React.ReactNode }) {
    return (
        <CDPReactProvider config={cdpConfig} theme={theme}>{children}</CDPReactProvider>
    )
}

