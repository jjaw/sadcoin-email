import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { EmailContent } from '@/lib/gemini'

interface AgentResponsesScreenProps {
  userSadInput: string
  agentInitialEmail: EmailContent
  officerInitialEmail: EmailContent
  monkeyInitialEmail: EmailContent
  onSelectEmail: (email: EmailContent, sender: string) => void
}

export function AgentResponsesScreen({ 
  userSadInput, 
  agentInitialEmail, 
  officerInitialEmail, 
  monkeyInitialEmail, 
  onSelectEmail
}: AgentResponsesScreenProps) {
  const [selectedAction, setSelectedAction] = useState<number | null>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key
      if (key >= '1' && key <= '4') {
        const actionIndex = parseInt(key) - 1
        handleActionSelect(actionIndex)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleActionSelect = (index: number) => {
    setSelectedAction(index)
    
    // Handle action based on index
    if (index === 0) { // Officer
      onSelectEmail(officerInitialEmail, "Officer")
    } else if (index === 1) { // Agent  
      onSelectEmail(agentInitialEmail, "Agent")
    } else if (index === 2) { // Monkey
      onSelectEmail(monkeyInitialEmail, "Monkey")
    } else if (index === 3) { // Self
      onSelectEmail({ subject: "Your Email", body: userSadInput }, "Self")
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  // Email data for display with dynamic subjects
  const emailData = [
    { 
      from: "officer@sadcoin.net", 
      subject: truncateText(officerInitialEmail.subject || "EXTREMELY IMPORTANT: I know I don't..", 32),
      content: officerInitialEmail 
    },
    { 
      from: "agent@sadcoin.net", 
      subject: truncateText(agentInitialEmail.subject || "KEY ACTION ITEMS: Appendix attached..", 32),
      content: agentInitialEmail 
    },
    { 
      from: "monkey@sadcoin.net", 
      subject: truncateText(monkeyInitialEmail.subject || "GM GANG;): LOCKED IN last night. All..", 32),
      content: monkeyInitialEmail 
    },
    { 
      from: "intern@sadcoin.net", 
      subject: truncateText("DON'T FORGET Self, this is a remin..", 32),
      content: { subject: "Your Email", body: userSadInput } 
    },
    { 
      from: "mail@sadcoin.net", 
      subject: "YOUR MESSAGE COULD NOT BE DELIVERED", 
      content: null 
    }
  ]

  return (
    <div className="text-center">
      <div className="flex justify-between mb-4">
        <span className="text-sm text-green-300">INBOX</span>
        <span className="text-sm text-green-300">ACCOUNT: INTERN</span>
      </div>
      
      {/* Monitor Display - ONLY inbox table */}
      <div className="border-2 border-green-400 bg-black p-4 min-h-[300px] font-mono text-xs">
        {/* Email Table */}
        <div className="text-green-400">
          <div className="border-b border-green-400 pb-1 mb-2 flex">
            <div className="w-1/3 font-bold">FROM</div>
            <div className="w-2/3 font-bold">SUBJECT</div>
          </div>
          
          {emailData.map((email, index) => (
            <div
              key={index}
              onClick={() => email.content && handleActionSelect(index)}
              className={`flex py-1 transition-colors text-xs ${
                email.content ? 'cursor-pointer hover:bg-green-900/20' : 'text-red-400'
              }`}
            >
              <div className="w-1/3 text-green-300">
                {truncateText(email.from, 20)}
              </div>
              <div className="w-2/3 text-green-300">
                {email.subject}
              </div>
            </div>
          ))}
        </div>
        
        {/* Command prompt */}
        <div className="mt-4 text-green-400">
          {'>'}
        </div>
      </div>
    </div>
  )
}

// Container component for the SADTEXT BOX actions area
export function AgentResponsesContainer({ 
  userSadInput, 
  agentInitialEmail, 
  officerInitialEmail, 
  monkeyInitialEmail, 
  onSelectEmail,
  onWaterCooler
}: AgentResponsesScreenProps & { onWaterCooler?: () => void }) {
  const [selectedAction, setSelectedAction] = useState<number | null>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key
      if (key >= '1' && key <= '4') {
        const actionIndex = parseInt(key) - 1
        handleActionSelect(actionIndex)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const handleActionSelect = (index: number) => {
    setSelectedAction(index)
    
    // Handle action based on index
    if (index === 0) { // Officer
      onSelectEmail(officerInitialEmail, "Officer")
    } else if (index === 1) { // Agent  
      onSelectEmail(agentInitialEmail, "Agent")
    } else if (index === 2) { // Monkey
      onSelectEmail(monkeyInitialEmail, "Monkey")
    } else if (index === 3) { // Self
      onSelectEmail({ subject: "Your Email", body: userSadInput }, "Self")
    }
  }

  return (
    <div className="w-full bg-black border-2 border-green-400 p-6">
      <div className="flex justify-center items-start gap-4">
        {/* Main rectangular display box */}
        <div className="w-[60vw] max-w-md h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm">SADTEXT BOX</span>
          </div>
        </div>
      </div>

      {/* Action interface */}
      <div className="flex justify-center items-start gap-4 mt-4">
        {/* Character image */}
        <div className="w-16 h-16 border-2 border-green-400 bg-black flex items-center justify-center text-green-400">
          👨‍💼
        </div>
        
        {/* Actions list */}
        <div className="w-[60vw] max-w-md">
          <div className="border-2 border-green-400 bg-black p-4 text-green-400 text-sm font-mono min-h-[128px] flex flex-col justify-center">
            <div className="text-cyan-400 mb-2">{'>'} Check Message From:</div>
            <div className="space-y-1">
              <div
                onClick={() => handleActionSelect(0)}
                className={`cursor-pointer hover:bg-green-900/20 transition-colors px-2 py-1 ${
                  selectedAction === 0 ? 'bg-green-900/40' : ''
                }`}
              >
                1) Officer
              </div>
              <div
                onClick={() => handleActionSelect(1)}
                className={`cursor-pointer hover:bg-green-900/20 transition-colors px-2 py-1 ${
                  selectedAction === 1 ? 'bg-green-900/40' : ''
                }`}
              >
                2) Agent
              </div>
              <div
                onClick={() => handleActionSelect(2)}
                className={`cursor-pointer hover:bg-green-900/20 transition-colors px-2 py-1 ${
                  selectedAction === 2 ? 'bg-green-900/40' : ''
                }`}
              >
                3) Monkey
              </div>
              <div
                onClick={() => handleActionSelect(3)}
                className={`cursor-pointer hover:bg-green-900/20 transition-colors px-2 py-1 ${
                  selectedAction === 3 ? 'bg-green-900/40' : ''
                }`}
              >
                4) Self
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <div className="w-36 h-8 border-2 border-green-400 bg-black rounded-lg flex items-center justify-center">
            <Button 
              onClick={() => handleActionSelect(3)}
              className="bg-green-600 hover:bg-green-700 text-black text-xs px-2 py-1 w-full"
            >
              WRITE THE E-MAIL
            </Button>
          </div>
          
          <div className="w-36 h-8 border-2 border-gray-600 bg-black rounded-lg flex items-center justify-center">
            <Button 
              disabled={true}
              className="bg-gray-600 cursor-not-allowed text-gray-400 text-xs px-2 py-1 w-full"
            >
              GET UP
            </Button>
          </div>
          
          {onWaterCooler && (
            <div className="w-36 h-8 border-2 border-blue-400 bg-black rounded-lg flex items-center justify-center">
              <Button 
                onClick={onWaterCooler}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 w-full"
              >
                💧 SAD WATER COOLER
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 