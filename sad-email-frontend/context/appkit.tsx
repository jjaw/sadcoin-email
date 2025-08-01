'use client'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors'
import { http, WagmiProvider, cookieToInitialState } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { type ReactNode } from 'react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const metadata = {
  name: 'SadCoin Email Frontend',
  description: 'SadCoin Email Frontend',
  url: process.env.NODE_ENV === 'production' ? 'https://www.letswritean.email' : 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

const connectors = [
  walletConnect({ projectId, metadata, showQrModal: false }),
  injected({ shimDisconnect: true }),
  coinbaseWallet({ appName: metadata.name, appLogoUrl: metadata.icons[0] })
]

const networks = [mainnet, sepolia]

const wagmiAdapter = new WagmiAdapter({
  transports: { 
    [mainnet.id]: http(),
    [sepolia.id]: http('https://sepolia.drpc.org')
  },
  connectors,
  projectId,
  networks
})

const config = wagmiAdapter.wagmiConfig

// Create the modal with singleton pattern to prevent double initialization
let appKitInstance: any = null;
if (typeof window !== 'undefined' && !appKitInstance) {
  appKitInstance = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [mainnet, sepolia],
    metadata,
    features: {
      email: false,
      socials: ['google', 'discord', 'github'],
      emailShowWallets: false
    },
    allWallets: 'HIDE'
  })
}

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const queryClient = new QueryClient()
  const initialState = cookieToInitialState(config, cookies)

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider 