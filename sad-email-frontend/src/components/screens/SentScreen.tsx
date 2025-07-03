import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCompleteGame, usePlayerSessions, useSessionDetails, useStartGameSession } from '@/hooks/useContracts'
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
  const { writeContract: startGameSession, isPending: isStartingSession } = useStartGameSession()
  const { data: playerSessions, refetch: refetchSessions } = usePlayerSessions(address)
  
  // Get details of the latest session
  const latestSessionId = playerSessions && playerSessions.length > 0 ? playerSessions[playerSessions.length - 1] : undefined
  const { data: sessionDetails } = useSessionDetails(latestSessionId)
  
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

  // Check GameRewards contract owner
  const { data: contractOwner } = useReadContract({
    address: SEPOLIA_CONTRACTS.GameRewards,
    abi: [
      {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'owner'
  })

  const handleClaimFeels = async () => {
    console.log('=== DEBUGGING GAME COMPLETION ===')
    console.log('Address:', address)
    console.log('Player Sessions:', playerSessions)
    console.log('Sessions type:', typeof playerSessions)
    console.log('Sessions length:', playerSessions?.length)
    console.log('Session Details:', sessionDetails)
    console.log('GameRewards has FEELS minter role:', hasFeelsMinterRole)
    console.log('GameRewards contract owner:', contractOwner)
    console.log('Your address:', address)
    
    if (!address) {
      console.error('No wallet connected')
      alert('Please connect your wallet first')
      return
    }
    
    // Check if GameRewards can mint FEELS
    if (hasFeelsMinterRole === false) {
      alert('GameRewards contract does not have permission to mint FEELS tokens. The contract setup is incomplete.')
      return
    }

    try {
      setIsClaimingRewards(true)
      
      // Check if we need to start a game session first
      if (!playerSessions || !Array.isArray(playerSessions) || playerSessions.length === 0) {
        console.log('No game sessions found, starting a new one...')
        
        try {
          await startGameSession({
            address: SEPOLIA_CONTRACTS.GameRewards,
            abi: GameRewards_ABI,
            functionName: 'startGameSession'
          })
          
          console.log('Game session started successfully')
          
          // Wait a moment and refetch sessions
          await new Promise(resolve => setTimeout(resolve, 2000))
          await refetchSessions()
          
          // Note: Due to blockchain timing, we might need to ask user to try again
          alert('Game session started! Please click "Get FEELS" again to complete and claim your rewards.')
          return
          
        } catch (startError) {
          console.error('Failed to start game session:', startError)
          alert(`Failed to start game session: ${startError instanceof Error ? startError.message : 'Unknown error'}`)
          return
        }
      }
      
      // Check session details
      if (sessionDetails && Array.isArray(sessionDetails)) {
        console.log('Session details array length:', sessionDetails.length)
        const [player, score, timestamp, rewarded, vrfRequestId] = sessionDetails
        console.log('Session breakdown:')
        console.log('- Player:', player)
        console.log('- Score:', score?.toString())
        console.log('- Timestamp:', timestamp?.toString())
        console.log('- Rewarded:', rewarded)
        console.log('- VRF Request ID:', vrfRequestId?.toString())
        
        if (score && score !== BigInt(0)) {
          alert(`This game session (ID: ${latestSessionId}) has already been completed with score: ${score}. Starting a new session...`)
          
          // Start a new session for the user
          try {
            await startGameSession({
              address: SEPOLIA_CONTRACTS.GameRewards,
              abi: GameRewards_ABI,
              functionName: 'startGameSession'
            })
            
            console.log('New game session started successfully')
            alert('New game session started! Please click "Get FEELS" again to complete and claim your rewards.')
            await refetchSessions()
            return
            
          } catch (startError) {
            console.error('Failed to start new game session:', startError)
            alert(`Failed to start new game session: ${startError instanceof Error ? startError.message : 'Unknown error'}`)
            return
          }
        }
      }
      
      // Get the latest session ID (most recent one)
      const currentLatestSessionId = playerSessions[playerSessions.length - 1]
      console.log('Latest Session ID:', currentLatestSessionId)
      console.log('Session ID type:', typeof currentLatestSessionId)
      
      // Complete the game with a random score between 1-100
      const randomScore = Math.floor(Math.random() * 100) + 1
      console.log('Random score:', randomScore)
      
      console.log('Calling completeGame with args:', [currentLatestSessionId, BigInt(randomScore)])
      
      // Complete the game
      const result = await completeGame({
        address: SEPOLIA_CONTRACTS.GameRewards,
        abi: GameRewards_ABI,
        functionName: 'completeGame',
        args: [currentLatestSessionId, BigInt(randomScore)]
      })
      
      console.log('Game completion transaction submitted successfully:', result)
      alert('Game completed! Your FEELS rewards will be processed by Chainlink VRF. Check your wallet in a few minutes.')
      
    } catch (error) {
      console.error('Failed to complete game and claim FEELS:', error)
      
      // Provide better error messages
      if (error instanceof Error) {
        if (error.message.includes('Game already completed')) {
          alert('This game has already been completed. Starting a new session for you...')
          // Could start a new session here if needed
        } else if (error.message.includes('Invalid session')) {
          alert('Invalid game session. Please refresh the page and try again.')
        } else if (error.message.includes('Not your sad game')) {
          alert('This game session belongs to a different player.')
        } else {
          alert(`Failed to complete game: ${error.message}`)
        }
      } else {
        alert('Failed to complete game: Unknown error')
      }
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
        {/* Debug Info */}
        <div className="text-xs text-green-300 mb-2">
          <div>Wallet: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</div>
          <div>Sessions: {playerSessions ? `${playerSessions.length} found` : 'Loading...'}</div>
          {playerSessions && playerSessions.length > 0 && (
            <div>Latest Session: {playerSessions[playerSessions.length - 1]?.toString()}</div>
          )}
          {sessionDetails && Array.isArray(sessionDetails) && (
            <div>Session Status: {sessionDetails[1] && sessionDetails[1] !== BigInt(0) ? `Completed (Score: ${sessionDetails[1]})` : 'Ready to complete'}</div>
          )}
          <div>FEELS Minter Role: {hasFeelsMinterRole === undefined ? 'Loading...' : hasFeelsMinterRole ? '✅ Yes' : '❌ No'}</div>
          <div>Contract Owner: {contractOwner ? `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` : 'Loading...'}</div>
          <div>Your Address: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}</div>
        </div>
        
        <Button 
          onClick={handleClaimFeels}
          disabled={
            isClaimingRewards || 
            isCompletingGame || 
            isStartingSession ||
            !address ||
            hasFeelsMinterRole === false
          }
          className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white mb-4"
        >
          {(isClaimingRewards || isCompletingGame || isStartingSession) ? "Processing..." : 
           !address ? "Connect Wallet" :
           hasFeelsMinterRole === false ? "Contract Setup Issue" :
           !playerSessions ? "Loading..." :
           playerSessions.length === 0 ? "Start Game & Get FEELS 💝" :
           (sessionDetails && Array.isArray(sessionDetails) && sessionDetails[1] && sessionDetails[1] !== BigInt(0)) ? "Start New Game & Get FEELS 💝" :
           "Complete Game & Get FEELS 💝"}
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