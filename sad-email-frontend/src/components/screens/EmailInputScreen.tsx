import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface EmailInputScreenProps {
  onSubmit: (userInput: string) => void
  onWaterCooler?: () => void
  isWaterCoolerMode?: boolean
  isLoading?: boolean
}

export function EmailInputScreen({ onSubmit, onWaterCooler, isWaterCoolerMode, isLoading }: EmailInputScreenProps) {
  const [userSadInput, setUserSadInput] = useState('')

  const handleSubmit = () => {
    onSubmit(userSadInput)
  }

  return (
    <div className="space-y-6">
      {/* Monitor Content - Email Input Interface */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">SADTEXT BOX</h2>
        <p className="text-sm text-green-300 mb-4">
          Paste your sad content or sad idea<br />
          that needs to be in an email BELOW. 👇👇👇
        </p>
      </div>
    </div>
  )
}

// Container component for the footer area
export function EmailInputContainer({ onSubmit, onWaterCooler, isWaterCoolerMode, isLoading }: EmailInputScreenProps) {
  const [userSadInput, setUserSadInput] = useState('')
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

  const sadLoadingMessages = [
    "Crafting your corporate despair...",
    "Adding extra sadness to your words...",
    "Generating professional disappointment...",
    "Polishing your email into oblivion...",
    "Making your message sound more dead inside...",
    "Converting feelings into corporate speak...",
    "Draining soul from your communication...",
    "Adding mandatory buzzwords of doom...",
    "Infusing existential dread into paragraphs...",
    "Translating human emotion to robot text..."
  ]

  const handleSubmit = () => {
    onSubmit(userSadInput)
  }

  // Cycle through loading messages
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % sadLoadingMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  return (
    <div className="w-full bg-black border-2 border-green-400 p-6">
      <div className="flex justify-center items-start gap-4">
        {/* Main rectangular input box */}
        <div className="w-[60vw] max-w-md h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm">SADTEXT BOX</span>
          </div>
        </div>
      </div>

      {/* Email input interface */}
      <div className="flex justify-center items-start gap-4 mt-4">
        {/* Intern image placeholder */}
        <div className="w-16 h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
          👨‍💼
        </div>
        
        {/* Textarea for user input */}
        <div className="w-[60vw] max-w-md">
          <textarea
            value={userSadInput}
            onChange={(e) => setUserSadInput(e.target.value)}
            placeholder="Paste your sad content or sad idea that needs to be in an email..."
            maxLength={256}
            className="w-full h-32 border-2 border-green-400 bg-black text-green-400 p-3 resize-none font-mono text-sm"
          />
          <div className="text-xs text-green-500 mt-1 text-right">
            {userSadInput.length}/256
          </div>
        </div>
        
        {/* Submit and Water Cooler buttons */}
        <div className="flex flex-col gap-3">
          <div className="w-36 h-8 border-2 border-green-400 bg-black rounded-lg flex items-center justify-center">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !userSadInput.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black text-xs px-2 py-1 w-full"
            >
              {isLoading ? "CRAFTING..." : "WRITE THE E-MAIL"}
            </Button>
          </div>
          
          <div className="w-36 h-8 border-2 border-blue-400 bg-black rounded-lg flex items-center justify-center">
            <Button 
              onClick={onWaterCooler}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs px-2 py-1 w-full"
            >
              {isWaterCoolerMode ? "🚪 RETURN" : "💧 WATER COOLER"}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-green-400 p-8 rounded-lg text-center max-w-md">
            <div className="mb-6">
              {/* Spinning sad face animation */}
              <div className="text-6xl animate-spin">😢</div>
            </div>
            <div className="text-green-400 text-lg font-mono mb-4">
              PROCESSING YOUR SADNESS...
            </div>
            <div className="text-green-300 text-sm font-mono leading-relaxed">
              {sadLoadingMessages[loadingMessageIndex]}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 