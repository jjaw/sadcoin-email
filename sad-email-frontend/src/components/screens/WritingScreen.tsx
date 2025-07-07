import { Button } from '@/components/ui/button'
import { Character } from '@/types/game'
import { EmailContent } from '@/lib/gemini'
import { useState, useEffect } from 'react'

interface WritingScreenProps {
  selectedCharacter: Character | null
  generatedEmail: EmailContent | null
  isGeneratingEmail: boolean
  onSendEmail: (email: EmailContent, recipientEmail: string) => void
  onWaterCooler?: () => void
}

export function WritingScreen({ 
  selectedCharacter, 
  generatedEmail, 
  isGeneratingEmail, 
  onSendEmail,
  onWaterCooler 
}: WritingScreenProps) {
  const [editableEmail, setEditableEmail] = useState<EmailContent>({ subject: '', body: '' })
  const [recipientEmail, setRecipientEmail] = useState('')

  // Update editable email when generated email changes
  useEffect(() => {
    if (generatedEmail) {
      setEditableEmail({
        subject: generatedEmail.subject,
        body: generatedEmail.body
      })
    }
  }, [generatedEmail])

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableEmail(prev => ({
      ...prev,
      subject: e.target.value
    }))
  }

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableEmail(prev => ({
      ...prev,
      body: e.target.value
    }))
  }

  const handleRecipientEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientEmail(e.target.value)
  }

  const handleSendEmail = () => {
    onSendEmail(editableEmail, recipientEmail)
  }

  return (
    <div>
      <h2 className="text-xl mb-4">✍️ Email Composition</h2>
      
      {isGeneratingEmail && (
        <div className="border border-yellow-400 p-4 mb-4">
          <div className="text-sm text-yellow-500 mb-2">
            AI Assistant ({selectedCharacter?.toUpperCase()}) is crafting your email...
          </div>
          <div className="text-xs text-yellow-600">Please wait while we generate your email...</div>
        </div>
      )}

      {generatedEmail && (
        <div className="border border-green-400 p-4 mb-4">
          <div className="text-sm text-green-500 mb-2">Edit Your Email:</div>
          
          {/* Recipient Email Input */}
          <div className="mb-4">
            <label className="block text-sm text-green-400 mb-2">To: (recipientEmail)</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={handleRecipientEmailChange}
              className="w-full bg-black border border-green-400 text-green-300 p-2 focus:outline-none focus:border-green-300"
              placeholder="Enter recipient email address..."
            />
          </div>

          {/* Editable Subject */}
          <div className="mb-4">
            <label className="block text-sm text-green-400 mb-2">Subject:</label>
            <input
              type="text"
              value={editableEmail.subject}
              onChange={handleSubjectChange}
              className="w-full bg-black border border-green-400 text-green-300 p-2 focus:outline-none focus:border-green-300"
              placeholder="Enter email subject..."
            />
          </div>

          {/* Editable Body */}
          <div className="mb-4">
            <label className="block text-sm text-green-400 mb-2">Body:</label>
            <textarea
              value={editableEmail.body}
              onChange={handleBodyChange}
              rows={8}
              className="w-full bg-black border border-green-400 text-green-300 p-2 focus:outline-none focus:border-green-300 resize-none"
              placeholder="Enter email body..."
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSendEmail} className="bg-green-600 hover:bg-green-700 text-black">
              Send Email →
            </Button>
            
            {onWaterCooler && (
              <Button 
                onClick={onWaterCooler}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                💧 SAD WATER COOLER
              </Button>
            )}
          </div>
        </div>
      )}

      {!generatedEmail && !isGeneratingEmail && (
        <div className="text-center text-yellow-400">
          No email content available. Please try again.
        </div>
      )}
    </div>
  )
} 