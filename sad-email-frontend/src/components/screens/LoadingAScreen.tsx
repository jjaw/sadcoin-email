import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAccount, useConnect, useWriteContract, useDisconnect } from 'wagmi'
import { useSADCoinBalance, usePurchaseSadness, usePurchaseCalculation, useLastPurchaseTime } from '@/hooks/useContracts'
import { SEPOLIA_CONTRACTS, ConversionContract_ABI, SADCoin_ABI } from '@/lib/contracts'
import { parseEther, formatEther, isAddress } from 'viem'

interface LoadingAScreenProps {
  onContinue: () => void
}

export function LoadingAScreen({ onContinue }: LoadingAScreenProps) {
  const [loadingText, setLoadingText] = useState('')
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [usdAmount, setUsdAmount] = useState('0.05') // Default $0.05
  const [sendRecipient, setSendRecipient] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [showSendSAD, setShowSendSAD] = useState(false)
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000))
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: sadBalance, refetch: refetchSAD } = useSADCoinBalance(address)
  const { writeContract: purchaseSadness, isPending: isPurchasing } = usePurchaseSadness()
  const { writeContract: transferSAD, isPending: isTransferring } = useWriteContract()
  const { data: lastPurchaseTime } = useLastPurchaseTime(address)

  // Calculate desired SAD amount (each SAD = $0.01)
  const usdAmountNum = parseFloat(usdAmount) || 0
  const desiredSADAmount = usdAmountNum / 0.01 // e.g., $0.05 / $0.01 = 5 SAD
  
  // Start with a rough estimate based on $2500 ETH price
  const roughEthEstimate = usdAmountNum / 2500 // Very rough starting point
  const ethAmountForCalculation = roughEthEstimate > 0 ? roughEthEstimate.toString() : '0'
  
  // Get the contract's calculation - this is the EXACT same logic as purchaseSadness()
  const { data: purchasePreview } = usePurchaseCalculation(ethAmountForCalculation)

  // Extract values directly from the contract's calculation
  let actualEthNeeded = ethAmountForCalculation
  let sadCoinsToReceive = '0'
  let ethPriceUSD = 0
  
  if (purchasePreview && Array.isArray(purchasePreview) && purchasePreview.length === 2) {
    const [sadAmount, ethPrice] = purchasePreview
    sadCoinsToReceive = formatEther(sadAmount)
    ethPriceUSD = Number(formatEther(ethPrice))
    
    // If we have valid data, recalculate the precise ETH amount needed
    if (ethPriceUSD > 0) {
      // Use the contract's exact formula: (ethAmount * ethPriceUSD) / (1 * 10^16) = sadAmount
      // Rearranged: ethAmount = (sadAmount * 10^16) / ethPriceUSD
      const targetSADWei = parseEther(desiredSADAmount.toString())
      const precisEthWei = (targetSADWei * BigInt(10**16)) / parseEther(ethPriceUSD.toString())
      actualEthNeeded = formatEther(precisEthWei)
      
      // Recalculate to verify - get what the contract would actually give us
      sadCoinsToReceive = formatEther((parseEther(actualEthNeeded) * parseEther(ethPriceUSD.toString())) / BigInt(10**16))
    }
  }

  const isValidAmount = usdAmountNum >= 0.01 // Minimum $0.01
  const hasSufficientSAD = sadBalance && sadBalance >= parseEther('1') // Need at least 1 SADCoin

  // Cooldown calculation (1 hour = 3600 seconds)
  const lastPurchaseTimeNum = lastPurchaseTime ? Number(lastPurchaseTime) : 0
  const cooldownEndTime = lastPurchaseTimeNum + 3600 // 1 hour cooldown
  const cooldownRemaining = Math.max(0, cooldownEndTime - currentTime)
  const canPurchase = cooldownRemaining === 0

  // Format cooldown time with maximum sadness
  const formatCooldown = (seconds: number) => {
    if (seconds === 0) return "Sadness replenished!"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s of despair`
    }
    return `${remainingSeconds}s of anguish`
  }

  // Send SAD validation
  const sendAmountNum = parseFloat(sendAmount) || 0
  const maxSendAmount = sadBalance ? parseFloat(formatEther(sadBalance)) : 0
  const isValidSendAmount = sendAmountNum > 0 && sendAmountNum <= maxSendAmount
  const isValidRecipient = isAddress(sendRecipient)

  useEffect(() => {
    const loadingSequence = [
      "SADCOIN\n",
      "INC.\n",
      "OS V.69.!.420\n",
      "Loading...\n"
    ]

    let currentIndex = 0
    let currentChar = 0
    let cancelled = false

    const typeText = () => {
      if (cancelled) return

      if (currentIndex < loadingSequence.length) {
        const currentLine = loadingSequence[currentIndex]
        
        if (currentChar < currentLine.length) {
          const char = currentLine[currentChar]
          setLoadingText(prev => prev + char)
          currentChar++
          setTimeout(typeText, 20)
        } else {
          currentIndex++
          currentChar = 0
          setTimeout(typeText, 50)
        }
      } else {
        setLoadingComplete(true)
      }
    }

    typeText()

    return () => {
      cancelled = true
    }
  }, [])

  // Update current time every second for live cooldown countdown
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCurrentTime(Math.floor(Date.now() / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownRemaining])

  const handleReconnect = async () => {
    try {
      await disconnect()
      setTimeout(() => {
        const injectedConnector = connectors.find(connector => connector.id === 'io.metamask')
        if (injectedConnector) {
          connect({ connector: injectedConnector })
        }
      }, 500)
    } catch (error) {
      console.error('Reconnection failed:', error)
    }
  }

  const handleConnect = () => {
    const injectedConnector = connectors.find(connector => connector.id === 'io.metamask')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] })
    }
  }

  const handlePurchase = async () => {
    if (!isConnected || !isValidAmount || isPurchasing || !ethPriceUSD || !canPurchase) return

    try {
      console.log(`Purchasing $${usdAmount} worth of SADCoin (${actualEthNeeded} ETH)...`)
      console.log(`Expected to receive: ${sadCoinsToReceive} SADCoin`)
      
      await purchaseSadness({
        address: SEPOLIA_CONTRACTS.ConversionContract,
        abi: ConversionContract_ABI,
        functionName: 'purchaseSadness',
        value: parseEther(actualEthNeeded)
      })
      
      console.log('SADCoin purchase transaction sent!')
      alert(`Purchase submitted! You should receive ~${parseFloat(sadCoinsToReceive).toFixed(2)} SADCoin.`)
      
      // Refresh balance
      await refetchSAD()
      
    } catch (error) {
      console.error('Failed to purchase SADCoin:', error)
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          alert('Purchase cancelled by user')
        } else if (error.message.includes('insufficient funds')) {
          alert('Insufficient ETH balance for purchase')
        } else if (error.message.includes('Must wait between purchases')) {
          alert(`Cooldown active! Wait ${formatCooldown(cooldownRemaining)} before next purchase.`)
        } else {
          alert(`Failed to purchase SADCoin: ${error.message}`)
        }
      }
    }
  }

  const handleSendSAD = async () => {
    if (!isConnected || !isValidSendAmount || !isValidRecipient || isTransferring) return

    try {
      console.log(`Sending ${sendAmount} SADCoin to ${sendRecipient}...`)
      await transferSAD({
        address: SEPOLIA_CONTRACTS.SADCoin,
        abi: SADCoin_ABI,
        functionName: 'transfer',
        args: [sendRecipient, parseEther(sendAmount)]
      })
      
      console.log('SADCoin transfer transaction sent!')
      alert(`Transfer submitted! Sending ${sendAmount} SADCoin to ${sendRecipient}`)
      
      // Reset form and refresh balance
      setSendAmount('')
      setSendRecipient('')
      setShowSendSAD(false)
      await refetchSAD()
      
    } catch (error) {
      console.error('Failed to send SADCoin:', error)
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          alert('Transfer cancelled by user')
        } else if (error.message.includes('insufficient funds')) {
          alert('Insufficient SADCoin balance')
        } else {
          alert(`Failed to send SADCoin: ${error.message}`)
        }
      }
    }
  }

  const handleContinue = () => {
    if (hasSufficientSAD) {
      onContinue()
    }
  }

  const getMainButtonText = () => {
    if (!isConnected) {
      return "🔗 CONNECT WALLET"
    } else if (!hasSufficientSAD) {
      return "❌ NEED ≥1 SADCOIN"
    } else {
      return "✅ CONTINUE"
    }
  }

  const canContinue = isConnected && hasSufficientSAD

  return (
    <div className="space-y-6">
      {/* Monitor Content - Typing Animation */}
      <div className="text-center">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
          {loadingText}
          <span className="animate-pulse">█</span>
        </pre>
        
        {/* Controls appear when animation is complete */}
        {loadingComplete && (
          <div className="mt-6 space-y-4">
            {/* Wallet Status */}
            <div className="text-xs text-green-300 border border-green-400 p-3 rounded">
              <div className="font-bold mb-2">🔍 Wallet Status:</div>
              <div>Connected: {isConnected ? '✅ Yes' : '❌ No'}</div>
              <div>Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</div>
              <div>SADCoin Balance: {sadBalance ? formatEther(sadBalance) : '0'} SAD</div>
              <div>Required: ≥1 SADCoin to continue</div>
              {isConnected && (
                <div className="mt-2">
                  <Button 
                    onClick={handleReconnect}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                  >
                    🔄 Reconnect Wallet
                  </Button>
                  <span className="text-xs text-blue-300 ml-2">Try reconnecting if balances seem wrong</span>
                </div>
              )}
            </div>

            {/* Connect Wallet Button */}
            {!isConnected && (
              <Button 
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-3"
              >
                🔗 CONNECT WALLET
              </Button>
            )}

            {/* Purchase SADCoin Section */}
            {isConnected && !hasSufficientSAD && (
              <div className="border border-yellow-400 p-4 rounded bg-yellow-900/20">
                <div className="text-yellow-300 font-bold mb-3">💰 Buy SADCoin</div>
                
                {/* USD Amount Input */}
                <div className="mb-3">
                  <label className="block text-sm text-green-300 mb-1">USD Amount (minimum $0.01):</label>
                  <input
                    type="number"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                    className="bg-black border border-green-400 text-green-400 px-3 py-2 w-32 text-sm"
                    placeholder="0.05"
                  />
                  <span className="text-green-300 ml-2">USD</span>
                </div>

                {/* Conversion Display */}
                {isValidAmount && ethPriceUSD > 0 && (
                  <div className="text-xs text-green-300 mb-3 p-2 border border-green-500 rounded">
                    <div>💱 Live Conversion:</div>
                    <div>ETH Price: ${ethPriceUSD.toFixed(2)}</div>
                    <div>Target: {desiredSADAmount.toFixed(2)} SADCoin (${usdAmount})</div>
                    <div>ETH needed: {parseFloat(actualEthNeeded).toFixed(6)} ETH</div>
                    <div>You'll receive: ~{parseFloat(sadCoinsToReceive).toFixed(2)} SADCoin</div>
                  </div>
                )}

                {/* Loading state */}
                {!ethPriceUSD && (
                  <div className="text-xs text-yellow-300 mb-3 p-2 border border-yellow-500 rounded">
                    📡 Loading live price data from blockchain...
                  </div>
                )}

                {/* Cooldown Display - Maximum Sadness Mode */}
                {isConnected && lastPurchaseTimeNum > 0 && (
                  <div className={`text-xs mb-3 p-4 border-2 rounded ${canPurchase ? 'border-green-500 bg-green-900/30' : 'border-red-600 bg-red-900/40'}`}>
                    {canPurchase ? (
                      <div className="text-center">
                        <div className="text-green-400 font-bold text-sm mb-1">💔➜💚 SUFFERING COMPLETE</div>
                        <div className="text-green-300">The sadness of waiting has ended...</div>
                        <div className="text-xs text-green-400 mt-1">You may purchase more sadness</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-red-400 font-bold text-sm mb-2">💀 THE SADNESS OF WAITING 💀</div>
                        <div className="text-red-200 mt-2 font-bold text-base">
                          ⏳ {formatCooldown(cooldownRemaining)} of corporate despair remaining
                        </div>
                        <div className="text-xs text-red-300 mt-2 leading-relaxed">
                          💼 The contract enforces mandatory suffering<br/>
                          😭 1 hour of pure sadness between purchases<br/>
                          📧 Use this time to contemplate your email failures<br/>
                          💸 The wait makes the sadness more valuable
                        </div>
                        <div className="text-xs text-red-400 mt-2 italic">
                          "Must wait between purchases (the sadness of waiting)"<br/>
                          - ConversionContract.sol
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Validation Messages */}
                {!isValidAmount && (
                  <div className="text-red-400 text-xs mb-2">Minimum purchase: $0.01</div>
                )}

                {/* Purchase Button */}
                <Button 
                  onClick={handlePurchase}
                  disabled={!isValidAmount || isPurchasing || !ethPriceUSD || !canPurchase}
                  className={`font-bold px-6 py-2 ${!canPurchase ? 'bg-red-800 hover:bg-red-800 text-red-200 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-black'} ${(!isValidAmount || isPurchasing || !ethPriceUSD) && canPurchase ? 'disabled:bg-gray-600' : ''}`}
                >
                  {isPurchasing ? "💰 PURCHASING SADNESS..." : 
                   !ethPriceUSD ? "📡 Loading sadness price..." :
                   !canPurchase ? `💀 SUFFERING... ${formatCooldown(cooldownRemaining)}` :
                   `💰 BUY ${parseFloat(sadCoinsToReceive).toFixed(1)} SADCOIN`}
                </Button>
              </div>
            )}

            {/* Continue & Send SAD Buttons */}
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleContinue}
                disabled={!canContinue}
                className={`font-bold text-lg px-8 py-3 ${
                  canContinue 
                    ? 'bg-green-600 hover:bg-green-700 text-black animate-pulse' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {getMainButtonText()}
              </Button>

              {/* Send SAD Button - only show if user has SADCoin */}
              {isConnected && sadBalance && sadBalance > 0 && (
                <Button 
                  onClick={() => setShowSendSAD(!showSendSAD)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg px-8 py-3"
                >
                  💸 SEND SAD
                </Button>
              )}
            </div>

            {/* Send SADCoin Section */}
            {showSendSAD && isConnected && sadBalance && sadBalance > 0 && (
              <div className="border border-purple-400 p-4 rounded bg-purple-900/20 mt-4">
                <div className="text-purple-300 font-bold mb-3">💸 Send SADCoin</div>
                
                <div className="space-y-3">
                  {/* Recipient Address Input */}
                  <div>
                    <label className="block text-sm text-green-300 mb-1">Recipient Address:</label>
                    <input
                      type="text"
                      value={sendRecipient}
                      onChange={(e) => setSendRecipient(e.target.value)}
                      className="bg-black border border-green-400 text-green-400 px-3 py-2 w-full text-sm"
                      placeholder="0x..."
                    />
                    {sendRecipient && !isValidRecipient && (
                      <div className="text-red-400 text-xs mt-1">Invalid address format</div>
                    )}
                  </div>

                  {/* Send Amount Input */}
                  <div>
                    <label className="block text-sm text-green-300 mb-1">
                      Amount (Max: {maxSendAmount.toFixed(2)} SAD):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        step="0.01"
                        min="0.01"
                        max={maxSendAmount}
                        className="bg-black border border-green-400 text-green-400 px-3 py-2 w-32 text-sm"
                        placeholder="0.00"
                      />
                      <Button
                        onClick={() => setSendAmount(maxSendAmount.toString())}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1"
                      >
                        MAX
                      </Button>
                    </div>
                    {sendAmount && !isValidSendAmount && (
                      <div className="text-red-400 text-xs mt-1">
                        {sendAmountNum > maxSendAmount ? 'Amount exceeds balance' : 'Amount must be greater than 0'}
                      </div>
                    )}
                  </div>

                  {/* Send Button */}
                  <Button 
                    onClick={handleSendSAD}
                    disabled={!isValidSendAmount || !isValidRecipient || isTransferring}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold px-6 py-2"
                  >
                    {isTransferring ? "💸 SENDING..." : `💸 SEND ${sendAmount || '0'} SAD`}
                  </Button>
                </div>
              </div>
            )}

            {/* Helper Text */}
            <div className="mt-2 text-xs text-green-300">
              {!isConnected ? (
                <p>Connect your wallet to start your sad journey</p>
              ) : !hasSufficientSAD ? (
                <p>Purchase at least $0.01 worth of SADCoin to continue</p>
              ) : (
                <p>Ready to proceed with your sad adventure! 🎮</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 