import React, { useState, useEffect } from "react"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { metaMask } from "wagmi/connectors"
import { sepolia } from "wagmi/chains"
import { useAppKit } from "@reown/appkit/react"
import { DebugModal } from "./DebugModal"

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

interface NavBarProps {
  gameState?: string
  debugInfo?: {
    chainId?: number
    sadBalance?: string
    directSadBalance?: string
    sadLoading?: boolean
    directSadLoading?: boolean
    sadError?: Error | null
    directSadError?: Error | null
    address?: string
    isOnSepolia?: boolean
    feelsBalance?: string
    feelsLoading?: boolean
    isConnected?: boolean
    useAWS?: boolean
    setUseAWS?: (value: boolean) => void
  }
  sadBalance?: string
  feelsBalance?: string
  onAboutClick?: () => void
}

export default function NavBar({ gameState, debugInfo, sadBalance = "0", feelsBalance = "0", onAboutClick }: NavBarProps) {
  const { address, isConnected, chain } = useAccount()
  const { connect, status, variables } = useConnect()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()

  const { switchChain } = useSwitchChain()

  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-switch to Sepolia when wallet connects
  useEffect(() => {
    if (isConnected && chain?.id !== sepolia.id) {
      switchChain({ chainId: sepolia.id })
    }
  }, [isConnected, chain?.id, switchChain])

  const handleConnectMetaMask = () => {
    connect({ connector: metaMask() })
    setShowWalletOptions(false)
  }

  // For WalletConnect, use the AppKit modal
  const handleConnectWalletConnect = () => {
    open()
    setShowWalletOptions(false)
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        background: "#111",
        color: "#39ff14",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        borderBottom: "2px solid #39ff14",
        boxShadow: "0 2px 8px #000a",
        zIndex: 1000,
        height: "70px"
      }}
    >
      {/* Top line - Logo and Wallet */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.25rem 1rem",
        height: "35px",
        marginTop: "10px"
      }}>
        <div style={{ fontWeight: "bold", fontSize: "0.9rem", letterSpacing: "1px" }}>
          <span style={{ color: "#39ff14" }}>SADCOIN</span>
          <span style={{ color: "#39ff14", marginLeft: "0.5rem" }}>Let's Write an E-Mail</span>
        </div>
        
        <div style={{ position: "relative", flexShrink: 0}}>
          {!isClient ? (
            <div style={{ height: "28px", width: "120px" }}></div>
          ) : !isConnected ? (
            <>
              <button
                onClick={() => setShowWalletOptions((v) => !v)}
                style={{
                  background: "#111",
                  color: "#39ff14",
                  border: "1px solid #39ff14",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.8rem",
                  cursor: "pointer",
                  height: "28px"
                }}
              >
                Connect
              </button>
              {showWalletOptions && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "110%",
                    background: "#111",
                    border: "2px solid #39ff14",
                    borderRadius: "6px",
                    minWidth: "180px",
                    boxShadow: "0 2px 8px #000a",
                    zIndex: 100,
                  }}
                >
                  <button
                    onClick={handleConnectMetaMask}
                    style={{
                      width: "100%",
                      background: "none",
                      color: "#39ff14",
                      border: "none",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      padding: "0.75rem 1.2rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    disabled={status === "pending" && variables?.connector?.name === "MetaMask"}
                  >
                    {status === "pending" && variables?.connector?.name === "MetaMask" ? "Connecting..." : "MetaMask"}
                  </button>
                  <button
                    onClick={handleConnectWalletConnect}
                    style={{
                      width: "100%",
                      background: "none",
                      color: "#39ff14",
                      border: "none",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      padding: "0.75rem 1.2rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    WalletConnect
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  background: "#222",
                  color: "#39ff14",
                  border: "1px solid #39ff14",
                  borderRadius: "4px",
                  padding: "0.2rem 0.6rem",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                }}
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <DebugModal debugInfo={debugInfo} gameState={gameState} />
              <button
                onClick={() => disconnect()}
                style={{
                  background: "#111",
                  color: "#39ff14",
                  border: "1px solid #39ff14",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  padding: "0.2rem 0.6rem",
                  cursor: "pointer",
                  height: "28px"
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom line - Token balances and About */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.25rem 1rem",
        height: "30px",
        marginTop: "4px"
      }}>
        <button
          onClick={onAboutClick}
          style={{
            background: "#111",
            color: "#06b6d4",
            border: "1px solid #06b6d4",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "0.8rem",
            padding: "0.2rem 0.8rem",
            cursor: "pointer",
            height: "28px"
          }}
        >
          ABOUT
        </button>
        
        <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem" }}>
          <span style={{
            border: "1px solid #fbbf24",
            color: "#fbbf24",
            background: "#111",
            padding: "0.2rem 0.6rem",
            borderRadius: "4px"
          }}>
            SAD: {sadBalance}
          </span>
          <span style={{
            border: "1px solid #ec4899",
            color: "#ec4899",
            background: "#111",
            padding: "0.2rem 0.6rem",
            borderRadius: "4px"
          }}>
            FEELS: {feelsBalance}
          </span>
        </div>
      </div>
    </nav>
  )
} 