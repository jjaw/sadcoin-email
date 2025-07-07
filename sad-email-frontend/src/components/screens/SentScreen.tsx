import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCompleteGame, usePlayerSessions, useSessionDetails } from '@/hooks/useContracts'
import { SEPOLIA_CONTRACTS, GameRewards_ABI } from '@/lib/contracts'
import { useAccount, useReadContract } from 'wagmi'

interface SentScreenProps {
  onResetGame: () => void
  onBackToResponses: () => void
}

export function SentScreen({ onResetGame, onBackToResponses }: SentScreenProps) {
  const { address } = useAccount()
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)
  const { writeContract: completeGame, isPending: isCompletingGame } = useCompleteGame()
  const { data: playerSessions, refetch: refetchSessions } = usePlayerSessions(address)
  
  // Get details of the latest session
  const latestSessionId = playerSessions && playerSessions.length > 0 ? playerSessions[playerSessions.length - 1] : undefined
  const { data: sessionDetails, refetch: refetchSessionDetails } = useSessionDetails(latestSessionId)
  
  // Check if the FEELS contract has the GameRewards as a minter
  const { data: hasFeelsMinterRole } = useReadContract({
    address: SEPOLIA_CONTRACTS.FEELS,
    abi: [
      {
        "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {"internalType": "address", "name": "account", "type": "address"}],
        "name": "hasRole",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'hasRole',
    args: ['0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', SEPOLIA_CONTRACTS.GameRewards] // MINTER_ROLE hash
  })

  const handleClaimFeels = async () => {
    console.log('=== DEBUGGING COMPLETE GAME ===')
    console.log('Address:', address)
    console.log('Player Sessions:', playerSessions)
    console.log('Player Sessions length:', playerSessions?.length)
    console.log('Latest Session ID:', latestSessionId)
    console.log('Session Details:', sessionDetails)
    
    if (!address) {
      alert('Please connect your wallet first')
      return
    }
    
    // Check if GameRewards can mint FEELS
    if (hasFeelsMinterRole === false) {
      alert('GameRewards contract does not have permission to mint FEELS tokens. The contract setup is incomplete.')
      return
    }

    // Check if there's an active game session
    if (!playerSessions || !Array.isArray(playerSessions) || playerSessions.length === 0) {
      alert('No game session found! Please start a game first by clicking "START GAME" on the email input screen.')
      return
    }

    // Validate session details
    if (!sessionDetails || !Array.isArray(sessionDetails) || sessionDetails.length < 5) {
      console.error('Invalid session details format:', sessionDetails)
      alert('Unable to load session details. Please refresh the page and try again.')
      return
    }

    try {
      setIsClaimingRewards(true)
      
      // Detailed session analysis
      const [sessionPlayer, sessionScore, sessionTimestamp, sessionRewarded, sessionVrfRequestId] = sessionDetails
      
      console.log('=== SESSION ANALYSIS ===')
      console.log('Session Player:', sessionPlayer)
      console.log('Session Score:', sessionScore?.toString())
      console.log('Session Timestamp:', sessionTimestamp?.toString())
      console.log('Session Rewarded:', sessionRewarded)
      console.log('Session VRF Request ID:', sessionVrfRequestId?.toString())
      console.log('Current User:', address)
      
      // Validation checks
      if (sessionPlayer.toLowerCase() !== address.toLowerCase()) {
        alert('This game session belongs to a different player. Please start your own game.')
        return
      }
      
      if (sessionScore && sessionScore !== BigInt(0)) {
        alert(`This game session has already been completed with score: ${sessionScore}. Start a new game to play again!`)
        return
      }
      
      // Use the exact session ID from the array
      const sessionIdToComplete = latestSessionId
      if (!sessionIdToComplete) {
        alert('No valid session ID found. Please start a new game.')
        return
      }
      
      console.log('Completing Session ID:', sessionIdToComplete)
      console.log('Session ID type:', typeof sessionIdToComplete)
      
      // Generate a random score between 1-100
      const randomScore = Math.floor(Math.random() * 100) + 1
      console.log('Random score to submit:', randomScore)
      
      console.log('=== CALLING COMPLETE GAME ===')
      console.log('Contract Address:', SEPOLIA_CONTRACTS.GameRewards)
      console.log('Function:', 'completeGame')
      console.log('Args:', [sessionIdToComplete, BigInt(randomScore)])
      
      // Complete the game
      await completeGame({
        address: SEPOLIA_CONTRACTS.GameRewards,
        abi: GameRewards_ABI,
        functionName: 'completeGame',
        args: [sessionIdToComplete, BigInt(randomScore)]
      })
      
      console.log('Game completion transaction submitted successfully')
      alert('🎉 Email sent and game completed! Your FEELS rewards will be processed by Chainlink VRF. Check your wallet in a few minutes.')
      
      // Refetch data to update the UI
      await Promise.all([
        refetchSessions(),
        refetchSessionDetails()
      ])
      
    } catch (error) {
      console.error('=== COMPLETE GAME ERROR ===')
      console.error('Full error:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        
        if (error.message.includes('Game already completed')) {
          alert('This game has already been completed. Start a new game to play again!')
        } else if (error.message.includes('Invalid session')) {
          alert('Invalid game session. Please start a new game.')
        } else if (error.message.includes('Not your sad game')) {
          alert('This game session belongs to a different player.')
        } else if (error.message.includes('user rejected')) {
          alert('Transaction cancelled by user')
        } else if (error.message.includes('insufficient funds')) {
          alert('Insufficient funds for transaction')
        } else if (error.message.includes('execution reverted')) {
          alert('Transaction failed - contract execution reverted. Check console for details.')
        } else {
          alert(`Failed to complete game: ${error.message}`)
        }
      } else {
        alert('Failed to complete game: Unknown error. Check console for details.')
      }
    } finally {
      setIsClaimingRewards(false)
    }
  }

  // Check if there's an active game that can be completed
  const hasActiveGame = playerSessions && playerSessions.length > 0 && 
                       sessionDetails && Array.isArray(sessionDetails) && 
                       sessionDetails.length >= 5 &&
                       sessionDetails[1] === BigInt(0) // score is 0 (not completed)

  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4 text-green-400">🎉 SUCCESS!</h2>
      <div className="border border-green-400 p-6 mb-4">
        <div className="text-lg mb-4">Email sent successfully!</div>
        <div className="text-green-300 mb-4">
          You just completed a real task while thinking you were procrastinating!
        </div>
        
        {/* Enhanced Debug Info */}
        <div className="text-xs text-green-300 mb-4 p-3 border border-green-500 rounded">
          <div className="font-bold mb-2">🔍 Game Session Debug:</div>
          <div>Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</div>
          <div>Total Sessions: {playerSessions ? `${playerSessions.length}` : 'Loading...'}</div>
          {playerSessions && playerSessions.length > 0 && (
            <div>Latest Session ID: {latestSessionId?.toString()}</div>
          )}
          {sessionDetails && Array.isArray(sessionDetails) && sessionDetails.length >= 5 && (
            <div>
              <div>Session Player: {sessionDetails[0] ? `${sessionDetails[0].slice(0, 6)}...${sessionDetails[0].slice(-4)}` : 'None'}</div>
              <div>Session Score: {sessionDetails[1]?.toString() || '0'}</div>
              <div>Session Status: {sessionDetails[1] && sessionDetails[1] !== BigInt(0) ? `Completed` : 'Ready to complete'}</div>
              <div>Player Match: {sessionDetails[0] && address ? (sessionDetails[0].toLowerCase() === address.toLowerCase() ? '✅ Yes' : '❌ No') : 'Unknown'}</div>
            </div>
          )}
          <div>FEELS Minter Role: {hasFeelsMinterRole === undefined ? 'Loading...' : hasFeelsMinterRole ? '✅ Yes' : '❌ No'}</div>
        </div>
        
        <Button 
          onClick={handleClaimFeels}
          disabled={
            isClaimingRewards || 
            isCompletingGame || 
            !address ||
            hasFeelsMinterRole === false ||
            !hasActiveGame
          }
          className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white mb-4"
        >
          {(isClaimingRewards || isCompletingGame) ? "Processing..." : 
           !address ? "Connect Wallet" :
           hasFeelsMinterRole === false ? "Contract Setup Issue" :
           !playerSessions ? "Loading Sessions..." :
           playerSessions.length === 0 ? "No Game Session - Start Game First!" :
           !hasActiveGame ? "Game Already Completed" :
           "📧 E-MAIL DONE: GET FEELS 💝"}
        </Button>
        
        {!hasActiveGame && playerSessions && playerSessions.length > 0 && (
          <p className="text-xs text-yellow-400 mb-4">
            Start a new game session to earn more FEELS!
          </p>
        )}
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