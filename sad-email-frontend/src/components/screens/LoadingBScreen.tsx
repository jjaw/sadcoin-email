import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useStartGameSession, usePlayerSessions, useSessionDetails } from '@/hooks/useContracts'
import { SEPOLIA_CONTRACTS, GameRewards_ABI } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { formatEther } from 'viem'

interface LoadingBScreenProps {
  onMonitorClick: () => void
}

export function LoadingBScreen({ onMonitorClick }: LoadingBScreenProps) {
  const { address } = useAccount()
  const [isStartingGame, setIsStartingGame] = useState(false)
  const { writeContract: startGameSession, isPending: isStartingSession } = useStartGameSession()
  const { data: playerSessions, refetch: refetchSessions } = usePlayerSessions(address)
  
  // Get details of the latest session to check if already has active game
  const latestSessionId = playerSessions && playerSessions.length > 0 ? playerSessions[playerSessions.length - 1] : undefined
  const { data: sessionDetails, refetch: refetchSessionDetails } = useSessionDetails(latestSessionId)

  // Check if user has an active (uncompleted) game session
  const hasActiveGame = playerSessions && playerSessions.length > 0 && 
                       sessionDetails && Array.isArray(sessionDetails) && 
                       sessionDetails.length >= 5 &&
                       sessionDetails[1] === BigInt(0) // score is 0 (not completed)

  const handleStartGame = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setIsStartingGame(true)
      
      console.log('Starting game session during banana peeling...')
      await startGameSession({
        address: SEPOLIA_CONTRACTS.GameRewards,
        abi: GameRewards_ABI,
        functionName: 'startGameSession'
      })
      
      console.log('Game session started successfully during peeling!')
      alert('🎮 Game session started! You can now write your email to earn FEELS.')
      
      // Refetch both sessions and session details to update the state
      await Promise.all([
        refetchSessions(),
        refetchSessionDetails()
      ])
      
    } catch (error) {
      console.error('Failed to start game session during peeling:', error)
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          alert('Transaction cancelled by user')
        } else if (error.message.includes('insufficient funds')) {
          alert('Insufficient funds for transaction')
        } else {
          alert(`Failed to start game session: ${error.message}`)
        }
      }
    } finally {
      setIsStartingGame(false)
    }
  }

  const handleContinue = () => {
    if (hasActiveGame) {
      onMonitorClick()
    }
  }

  const getMainButtonText = () => {
    if (!address) {
      return "❌ CONNECT WALLET FIRST"
    } else if (!hasActiveGame) {
      return "❌ START GAME SESSION FIRST"
    } else {
      return "✅ CONTINUE PEELING"
    }
  }

  const canContinue = address && hasActiveGame

  return (
    <div className="space-y-6">
      {/* Monitor Content */}
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4">////...Peeling Bananas...///</h3>
        
        {/* Game Session Status */}
        <div className="text-xs text-green-300 border border-green-400 p-3 rounded mb-4">
          <div className="font-bold mb-2">🎮 Game Session Status:</div>
          <div>Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</div>
          <div>Total Sessions: {playerSessions ? `${playerSessions.length}` : 'Loading...'}</div>
          {playerSessions && playerSessions.length > 0 && (
            <div>Latest Session ID: {latestSessionId?.toString()}</div>
          )}
          {sessionDetails && Array.isArray(sessionDetails) && sessionDetails.length >= 5 && (
            <div>
              <div>Session Status: {sessionDetails[1] && sessionDetails[1] !== BigInt(0) ? `Completed` : 'Active & Ready'}</div>
              <div>Player Match: {sessionDetails[0] && address ? (sessionDetails[0].toLowerCase() === address.toLowerCase() ? '✅ Yes' : '❌ No') : 'Unknown'}</div>
            </div>
          )}
          <div>Required: Active game session to continue</div>
        </div>

        {/* Start Game Button */}
        {address && !hasActiveGame && (
          <div className="border border-purple-400 p-4 rounded bg-purple-900/20 mb-4">
            <div className="text-purple-300 font-bold mb-3">🎮 Start Game Session</div>
            <div className="text-sm text-green-300 mb-3">
              You need to start a game session before writing your email to earn FEELS tokens.
            </div>
            
            <Button 
              onClick={handleStartGame}
              disabled={isStartingGame || isStartingSession}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold px-6 py-2"
            >
              {isStartingGame || isStartingSession ? "🎮 STARTING GAME..." : "🎮 START GAME SESSION"}
            </Button>
          </div>
        )}

        {/* Continue Button */}
        <div 
          className={`cursor-pointer p-4 rounded transition-colors ${
            canContinue 
              ? 'hover:bg-green-900/20 border-2 border-green-400' 
              : 'border-2 border-gray-600 cursor-not-allowed'
          }`}
          onClick={canContinue ? handleContinue : undefined}
        >
          {/* Dynamic text based on game session state */}
          <div className={`text-lg ${canContinue ? 'text-yellow-400 animate-pulse' : 'text-gray-400'}`}>
            {getMainButtonText()}
          </div>
          
          {/* Status indicator */}
          {address && (
            <div className="text-xs text-green-400 mt-2">
              {hasActiveGame ? (
                "🎮 Active game session ready - click to continue!"
              ) : (
                "🎮 Start a game session first to proceed"
              )}
            </div>
          )}
        </div>

        {/* Helper Text */}
        <div className="mt-4 text-xs text-green-300">
          {!address ? (
            <p>Connect your wallet on the previous screen first</p>
          ) : !hasActiveGame ? (
            <p>Start a game session to begin earning FEELS tokens</p>
          ) : (
            <p>Ready to proceed to email writing! 🎮✍️</p>
          )}
        </div>
      </div>
    </div>
  )
} 