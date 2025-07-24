"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DebugPanel } from "./DebugPanel"
import { SimpleTest } from "./SimpleTest"
import { PriceCalculator } from "./PriceCalculator"
import { useWriteContract, useBalance } from 'wagmi'
import { SEPOLIA_CONTRACTS, ConversionContract_ABI } from '@/lib/contracts'
import { parseEther } from 'viem'

interface DebugModalProps {
  debugInfo?: {
    address?: string
    isConnected?: boolean
    useAWS?: boolean
    setUseAWS?: (value: boolean) => void
  }
}


export function DebugModal({ debugInfo }: DebugModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [claimStatus, setClaimStatus] = useState<string | null>(null)
  const [claimLoading, setClaimLoading] = useState(false)
  const [hasClaimed, setHasClaimed] = useState(false)
  const [autoPurchaseStatus, setAutoPurchaseStatus] = useState<string | null>(null)

  const { writeContractAsync: purchaseSadness } = useWriteContract()
  const { data: ethBalance } = useBalance({
    address: debugInfo?.address as `0x${string}`,
    query: {
      refetchInterval: 10_000, // Optional: 10 seconds polling
    },
  })
  

  // Fetch claimed status when modal opens or after claiming
  useEffect(() => {
    if (debugInfo?.address && isOpen) {
      fetch(`/api/claim-faucet?address=${debugInfo.address}`)
        .then(res => res.json())
        .then(data => setHasClaimed(!!data.claimed))
        .catch(() => setHasClaimed(false));
    }
  }, [debugInfo?.address, isOpen, claimStatus]);

  // Clear statuses after final purchase status
  useEffect(() => {
    if (autoPurchaseStatus?.startsWith("✅") || autoPurchaseStatus?.startsWith("❌")) {
      const timer = setTimeout(() => {
        setClaimStatus(null)
        setAutoPurchaseStatus(null)
      }, 60000)
      return () => clearTimeout(timer)
    }
  }, [autoPurchaseStatus])

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-cyan-600 hover:bg-cyan-700 text-black text-sm px-3 py-1 h-auto"
      >
        🔧 DEBUG
      </Button>
    )
  }

  const handleClaimSADToken = async () => {
    if (!debugInfo?.address) return;
    setClaimLoading(true)
    setClaimStatus("✅ ETH sent! Awaiting auto SAD purchase... It can take up to a minute")
    setAutoPurchaseStatus(null)

    // Request ETH from faucet
    try {
      const res = await fetch("/api/claim-faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: debugInfo.address }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setHasClaimed(true)

        // Initiate SAD purchase via MetaMask (hash-only)
        try {
          setAutoPurchaseStatus("⏳ Initiating SAD purchase...")
          const txHash = await purchaseSadness({
            address: SEPOLIA_CONTRACTS.ConversionContract,
            abi: ConversionContract_ABI,
            functionName: "purchaseSadness",
            args: [],
            value: parseEther("0.007"),
          })
          setAutoPurchaseStatus(`✅ Transaction sent: ${txHash}`)
        } catch (err: any) {
          console.error("Auto purchase failed:", err)
          setAutoPurchaseStatus("❌ Auto purchase failed: " + err.message)
        }
      } else {
        setClaimStatus("❌ Claim failed: " + (data.error || "Unknown error"))
      }
    } catch (err: any) {
      setClaimStatus("❌ Claim failed: " + (err.message || "Unknown error"))
    }
    setClaimLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-green-400 max-w-4xl max-h-[90vh] overflow-auto m-4">
        <div className="flex justify-between items-center p-4 border-b border-green-400">
          <h2 className="text-green-400 font-mono text-lg">BLOCKCHAIN DEBUG CONSOLE</h2>
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 h-auto"
          >
            ✕ CLOSE
          </Button>
        </div>
        <div className="p-4 space-y-6">
          {debugInfo?.isConnected && (
            <div className="flex flex-col items-center space-y-2 bg-black border border-cyan-400 p-3 rounded">
              <Button
                onClick={handleClaimSADToken}
                disabled={hasClaimed || claimLoading}
                className={`text-xs px-4 py-2 font-mono ${
                  hasClaimed
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-700 text-black'
                }`}
              >
                {hasClaimed
                  ? '✅ Already Claimed'
                  : claimLoading
                    ? 'Claiming...'
                    : '💸 CLAIM FREE ETH + SAD'}
              </Button>
              <div className="text-xs italic text-cyan-300 mt-1">
                {hasClaimed ? '*You have already claimed FREE SAD' : '*First time SAD USERS only 😢'}
              </div>
              {(claimStatus || autoPurchaseStatus) && (
                <div className="flex flex-col items-center space-y-1">
                  {claimStatus && (
                    <div className={`text-xs font-mono ${
                      claimStatus.startsWith('✅') ? 'text-green-400' :
                     claimStatus.startsWith('⏳') ? 'text-yellow-300' : 'text-red-400'
                    }`}>{claimStatus}</div>
                  )}
                  {autoPurchaseStatus && (
                    <div className={`text-xs font-mono ${
                      autoPurchaseStatus.startsWith('✅') ? 'text-green-400' :
                     autoPurchaseStatus.startsWith('⏳') ? 'text-yellow-300' : 'text-red-400'
                    }`}>{autoPurchaseStatus}</div>
                  )}
                </div>
              )}
            </div>
          )}

          <PriceCalculator />
          <SimpleTest />
          <DebugPanel useAWS={debugInfo?.useAWS} setUseAWS={debugInfo?.setUseAWS} />
        </div>
      </div>
    </div>
  )
}
