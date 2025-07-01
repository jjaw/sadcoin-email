import { useState } from 'react'
import { Character } from '@/types/game'
import { useStartGameSession } from '@/hooks/useContracts'
import { SEPOLIA_CONTRACTS, GameRewards_ABI } from '@/lib/contracts'

interface LoginScreenProps {
  onSelectCharacter: (character: Character) => void
}

export function LoginScreen({ onSelectCharacter }: LoginScreenProps) {
  const [isStartingGame, setIsStartingGame] = useState(false)
  const { writeContract: startGameSession, isPending: isStartingSession } = useStartGameSession()

  const handleSelectIntern = async () => {
    try {
      setIsStartingGame(true)
      
      // Start the game session first
      await startGameSession({
        address: SEPOLIA_CONTRACTS.GameRewards,
        abi: GameRewards_ABI,
        functionName: 'startGameSession'
      })
      
      // Then proceed with character selection
      onSelectCharacter("intern")
    } catch (error) {
      console.error('Failed to start game session:', error)
      // Still proceed with character selection even if game session fails
      onSelectCharacter("intern")
    } finally {
      setIsStartingGame(false)
    }
  }
  return (
    <div className="text-center space-y-6">
      {/* Login Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">LOGIN:</h1>
        <h2 className="text-xl">WHO ARE YOU TODAY?</h2>
      </div>

      {/* Thin green line */}
      <div className="border-t border-green-400 w-full"></div>

      {/* Character Selection */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        {/* Officer - Locked */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400 opacity-50">
            👮
          </div>
          <span className="text-sm text-green-400 opacity-50">Officer</span>
          <span className="text-xs text-red-400">LOCKED</span>
        </div>

        {/* Agent - Locked */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400 opacity-50">
            🕵️
          </div>
          <span className="text-sm text-green-400 opacity-50">Agent</span>
          <span className="text-xs text-red-400">LOCKED</span>
        </div>

        {/* Monkey - Locked */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400 opacity-50">
            🐒
          </div>
          <span className="text-sm text-green-400 opacity-50">Monkey</span>
          <span className="text-xs text-red-400">LOCKED</span>
        </div>

        {/* Intern - Available */}
        <div 
          className={`flex flex-col items-center space-y-2 cursor-pointer hover:bg-green-900/20 p-2 rounded transition-colors ${(isStartingGame || isStartingSession) ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={handleSelectIntern}
        >
          <div className="w-16 h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
            👨‍💼
          </div>
          <span className="text-sm text-green-400">Intern</span>
          <span className="text-xs text-green-300">
            {(isStartingGame || isStartingSession) ? "STARTING GAME..." : "CLICK TO SELECT"}
          </span>
        </div>
      </div>

      <div className="text-sm text-green-500 mt-4">
        Only Intern access granted. Other characters require higher clearance level.
      </div>
    </div>
  )
} 