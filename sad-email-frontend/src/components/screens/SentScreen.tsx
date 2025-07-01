import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCompleteGame, usePlayerSessions } from '@/hooks/useContracts'
import { SEPOLIA_CONTRACTS, GameRewards_ABI } from '@/lib/contracts'
import { useAccount } from 'wagmi'

interface SentScreenProps {
  onResetGame: () => void
  onBackToResponses: () => void
}

export function SentScreen({ onResetGame, onBackToResponses }: SentScreenProps) {
  const { address } = useAccount()
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)
  const { writeContract: completeGame, isPending: isCompletingGame } = useCompleteGame()
  const { data: playerSessions } = usePlayerSessions(address)

  const handleClaimFeels = async () => {
    if (!address || !playerSessions || !Array.isArray(playerSessions) || playerSessions.length === 0) {
      console.error('No game sessions found or wallet not connected')
      return
    }

    try {
      setIsClaimingRewards(true)
      
      // Get the latest session ID (most recent one)
      const latestSessionId = playerSessions[playerSessions.length - 1]
      
      // Complete the game with a random score between 1-100
      const randomScore = Math.floor(Math.random() * 100) + 1
      
      await completeGame({
        address: SEPOLIA_CONTRACTS.GameRewards,
        abi: GameRewards_ABI,
        functionName: 'completeGame',
        args: [latestSessionId, BigInt(randomScore)]
      })
      
    } catch (error) {
      console.error('Failed to complete game and claim FEELS:', error)
    } finally {
      setIsClaimingRewards(false)
    }
  }
  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4 text-green-400">🎉 SUCCESS!</h2>
      <div className="border border-green-400 p-6 mb-4">
        <div className="text-lg mb-4">Email sent successfully!</div>
        <div className="text-green-300 mb-4">
          You just completed a real task while thinking you were procrastinating!
        </div>
        <Button 
          onClick={handleClaimFeels}
          disabled={isClaimingRewards || isCompletingGame || !address}
          className="bg-pink-600 hover:bg-pink-700 text-white mb-4"
        >
          {isClaimingRewards || isCompletingGame ? "Claiming..." : "Get FEELS 💝"}
        </Button>
      </div>
      <Button onClick={onResetGame} className="bg-purple-600 hover:bg-purple-700 text-white">
        Write Another Email? 🔄
      </Button>
      <Button onClick={onBackToResponses} className="bg-blue-600 hover:bg-blue-700 text-white ml-4">
        Back to Responses 📧
      </Button>
    </div>
  )
} 