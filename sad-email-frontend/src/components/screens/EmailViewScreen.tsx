import { Button } from '@/components/ui/button'
import { EmailContent } from '@/lib/gemini'
import { useState, useEffect } from 'react'

interface EmailViewScreenProps {
  email: EmailContent
  sender: string
  onBack: () => void
  onContinue: (email: EmailContent, recipientEmail: string) => void
  onWaterCooler?: () => void
}

export function EmailViewScreen({ 
  email, 
  sender, 
  onBack, 
  onContinue,
  onWaterCooler 
}: EmailViewScreenProps) {
  const [editableEmail, setEditableEmail] = useState<EmailContent>({ subject: '', body: '' })
  const [recipientEmail, setRecipientEmail] = useState('')

  // Update editable email when email prop changes
  useEffect(() => {
    setEditableEmail({
      subject: email.subject,
      body: email.body
    })
  }, [email])

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

  const handleContinue = () => {
    onContinue(editableEmail, recipientEmail)
  }

  return (
    <div>
      <div className="mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="border-green-400 text-green-400 hover:bg-green-900/20"
        >
          ← Back to Email Selection
        </Button>
      </div>

      <div className="border border-green-400 p-4 mb-4">
        <div className="text-sm text-green-500 mb-2">FROM: {sender}@sadcoin.net</div>
        
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
      </div>

      <div className="text-center">
        <div className="flex gap-3 justify-center">
          <Button onClick={handleContinue} className="bg-green-600 hover:bg-green-700 text-black">
            Continue with this email →
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

      <div className="mt-6 p-4 border border-blue-400 text-blue-400 text-sm">
        <strong>EMAIL ANALYSIS:</strong> This email was generated using the {sender.toLowerCase()} personality and communication style!
      </div>
    </div>
  )
} 