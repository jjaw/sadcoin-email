import { useState } from 'react'
import { Character } from '@/types/game'

interface LoginScreenProps {
  onSelectCharacter: (character: Character) => void
}

export function LoginScreen({ onSelectCharacter }: LoginScreenProps) {
  const handleSelectCharacter = (character: Character) => {
    onSelectCharacter(character)
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
      <div className="grid grid-cols-4 gap-6 mt-8">
        {/* Officer - Unavailable */}
        <div 
          className="flex flex-col items-center space-y-2 cursor-not-allowed opacity-40 pointer-events-none p-2 rounded transition-colors"
          onClick={() => {}} // no-op
        >
          <div className="w-24 h-24 border-2 border-green-400 bg-black flex items-center justify-center text-green-400 relative overflow-hidden">
            <div className="text-3xl">👨‍💼</div>
          </div>
          <span className="text-sm text-green-400 uppercase font-bold">OFFICER</span>
        </div>

        {/* Agent - Unavailable */}
        <div 
          className="flex flex-col items-center space-y-2 cursor-not-allowed opacity-40 pointer-events-none p-2 rounded transition-colors"
          onClick={() => {}} // no-op
        >
          <div className="w-24 h-24 border-2 border-green-400 bg-black flex items-center justify-center text-green-400 relative overflow-hidden">
            <div className="text-3xl">🕵️‍♀️</div>
          </div>
          <span className="text-sm text-green-400 uppercase font-bold">AGENT</span>
        </div>

        {/* Monkey - Unavailable */}
        <div 
          className="flex flex-col items-center space-y-2 cursor-not-allowed opacity-40 pointer-events-none p-2 rounded transition-colors"
          onClick={() => {}} // no-op
        >
          <div className="w-24 h-24 border-2 border-green-400 bg-black flex items-center justify-center text-green-400 relative overflow-hidden">
            <div className="text-3xl">🐵</div>
          </div>
          <span className="text-sm text-green-400 uppercase font-bold">MONKEY</span>
        </div>

        {/* Intern - Available */}
        <div 
          className="flex flex-col items-center space-y-2 cursor-pointer hover:bg-green-900/20 p-2 rounded transition-colors"
          onClick={() => handleSelectCharacter("intern")}
        >
          <div className="w-24 h-24 border-2 border-green-400 bg-black flex items-center justify-center text-green-400 relative overflow-hidden">
            <div className="text-3xl">👩‍💼</div>
          </div>
          <span className="text-sm text-green-400 uppercase font-bold">INTERN</span>
        </div>
      </div>
    </div>
  )
} 