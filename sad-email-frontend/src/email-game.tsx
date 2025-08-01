"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AboutPage from "./about-page"
import CRTContainer from "./components/CRTContainer"
import NavBar from "./components/NavBar"

type GameState = "boot" | "inbox" | "reading" | "character-select" | "mini-game" | "writing" | "sent" | "about"
type Character = "officer" | "agent" | "monkey" | "intern"

interface Email {
  id: string
  from: string
  subject: string
  preview: string
  character: Character
  content?: string
}

const emails: Email[] = [
  {
    id: "1",
    from: "officer@company.com",
    subject: "URGENT: Q4 Fundraising Strategy",
    preview: "We need to leverage synergies...",
    character: "officer",
  },
  {
    id: "2",
    from: "agent@company.com",
    subject: "Re: Special Assignment 🎯",
    preview: "The package has been delivered...",
    character: "agent",
  },
  {
    id: "3",
    from: "monkey@company.com",
    subject: "banana banana BANANA!!! 🍌",
    preview: "GM GM GM fire fire...",
    character: "monkey",
  },
  {
    id: "4",
    from: "yourself@company.com",
    subject: "Important - Don't forget to...",
    preview: "Hey, just a reminder about...",
    character: "intern",
  },
]

const characterResponses = {
  officer: {
    name: "CORPORATE OFFICER",
    response:
      "Listen up, intern! We need to LEVERAGE this opportunity to CREATE SYNERGIES across all verticals. This is MISSION-CRITICAL for our Q4 deliverables. Let's circle back on this ASAP and ideate some solutions that will MOVE THE NEEDLE. Time to think outside the box and disrupt the paradigm!",
    miniGame: "Budget Juggling Simulator",
    emailHelp: "I'll add corporate buzzwords and action items to make this sound important.",
  },
  agent: {
    name: "FIELD AGENT",
    response:
      "The target has been... *ahem*... identified. Your mission, should you choose to accept it, involves careful handling of sensitive materials. The package contains everything you need to know. Remember: trust no one, question everything, and always have an exit strategy. The coffee machine on floor 3 is compromised.",
    miniGame: "Stealth Sniper Challenge",
    emailHelp: "I'll encode hidden meanings and add mysterious attachments to your email.",
  },
  monkey: {
    name: "BANANA MONKEY",
    response:
      "BANANA BANANA BANANA!!! 🍌🍌🍌 GM GM GM!!! Did someone say FIRE?? 🔥🔥🔥 Wait what were we talking about? OH RIGHT! Emails! I LOVE emails! They're like bananas but for your BRAIN! Want to play the banana game? It's TOTALLY not broken I promise!!! BANANA POWER ACTIVATE!!!",
    miniGame: "Banana Collection Frenzy",
    emailHelp: "I'll make your email fun and chaotic with lots of emojis and random tangents!",
  },
  intern: {
    name: "FELLOW INTERN",
    response:
      "Hey! I'm just trying to figure this out too. Maybe we can help each other? I've been here for like... 3 days and I'm still not sure what anyone actually does. But I found this cool matching game that might help us organize our thoughts! Also, you only need to complete 2 out of 3 tasks because, you know, we're learning!",
    miniGame: "File Organization Puzzle",
    emailHelp: "I'll help you write a simple, honest email that gets the job done.",
  },
}

const bootSequence = [
  "Initializing letswritean.email...",
  "Loading productivity protocols...",
  "Connecting to SAD network...",
  "Calibrating procrastination sensors...",
  "Ready to help you avoid work!",
]

export default function Component() {
  const [gameState, setGameState] = useState<GameState>("boot")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [bootText, setBootText] = useState("")
  const [sadCoins, setSadCoins] = useState(100)
  const [feels, setFeels] = useState(0)
  const [booted, setBooted] = useState(false)
  
  // Email composition state
  const [recipientEmail, setRecipientEmail] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  
  const [gameProgress, setGameProgress] = useState(0)

  useEffect(() => {
    if (gameState !== "boot" || booted) return

    let cancelled = false

    const runSequence = async () => {
      for (const line of bootSequence) {
        if (cancelled) return
        setBootText((prev) => prev + line + "\n")
        // wait 800ms before next line

        await new Promise((r) => setTimeout(r, 800))
      }
      if (cancelled) return

      setBooted(true)
      setTimeout(() => {
        if (!cancelled) setGameState("inbox")
      }, 1000)
    }

    runSequence()

    return () => {
      cancelled = true
    }
  }, [gameState, booted])


  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
    setSelectedCharacter(email.character)
    setGameState("reading")
  }

  const handleCharacterInteraction = () => {
    setGameState("character-select")
  }

  const playMiniGame = () => {
    setGameState("mini-game")
    // Simulate playing a frustrating mini-game
    setTimeout(() => {
      setSadCoins((prev) => prev - 10)
      setFeels((prev) => prev + 5)
      setGameProgress((prev) => prev + 1)
      setGameState("writing")
    }, 3000)
  }

  const sendEmail = async () => {
    // Send email content to backend for Resend integration
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailSubject,
          body: emailBody,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert('Failed to send email: ' + (data.error || 'Unknown error'));
      } else {
        alert('Email sent successfully!');
        setGameState('sent');
        setFeels((prev) => prev + 20);
      }
    } catch (err) {
      alert('Failed to send email: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  const resetGame = () => {
    setGameState("boot")
    setBootText("")
    setBooted(false); // allow boot to run again
    setSelectedEmail(null)
    setSelectedCharacter(null)
    setSadCoins(100)
    setFeels(0)
    setGameProgress(0)
  }

  return (
    <>
      <NavBar />
      <CRTContainer>
        <Card className="border-2 border-green-400 bg-black text-green-400 w-full h-full flex flex-col">
          {/* Header */}
          <div className="border-b-2 border-green-400 p-4 bg-black">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-center flex-1">═══ LETSWRITEAN.EMAIL ═══</h1>
              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                  SAD: {sadCoins}
                </Badge>
                <Badge variant="outline" className="border-pink-400 text-pink-400">
                  FEELS: {feels}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGameState("about")}
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-900/20"
                >
                  ABOUT
                </Button>
              </div>
            </div>
          </div>

          {/* Main Terminal */}
          <div className="flex-1 overflow-auto p-6">
            {gameState === "boot" && (
              <div className="space-y-2">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">💻</div>
                  <div className="text-xl">BOOTING SYSTEM...</div>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{bootText}</pre>
                <div className="flex justify-center mt-4">
                  <div className="animate-pulse">█</div>
                </div>
              </div>
            )}

            {gameState === "inbox" && (
              <div>
                <h2 className="text-xl mb-4">📧 INBOX (4 unread)</h2>
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className="border border-green-400 p-3 cursor-pointer hover:bg-green-900/20 transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-bold">{email.from}</span>
                        <span className="text-xs">{"[UNREAD]"}</span>
                      </div>
                      <div className="text-green-300">{email.subject}</div>
                      <div className="text-green-500 text-sm">{email.preview}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 border border-yellow-400 text-yellow-400 text-sm">
                  <strong>GAME THEORY INSIGHT:</strong> Each email choice creates a different game tree with unique
                  incentive structures and outcomes!
                </div>
              </div>
            )}

            {gameState === "reading" && selectedEmail && selectedCharacter && (
              <div>
                <div className="mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGameState("inbox")}
                    className="border-green-400 text-green-400 hover:bg-green-900/20"
                  >
                    ← Back to Inbox
                  </Button>
                </div>
                <div className="border border-green-400 p-4 mb-4">
                  <div className="text-sm text-green-500 mb-2">FROM: {selectedEmail.from}</div>
                  <div className="text-lg mb-4">{selectedEmail.subject}</div>
                  <div className="text-green-300 leading-relaxed">{characterResponses[selectedCharacter].response}</div>
                </div>
                <div className="text-center">
                  <Button onClick={handleCharacterInteraction} className="bg-green-600 hover:bg-green-700 text-black">
                    Get up from desk and procrastinate →
                  </Button>
                </div>
              </div>
            )}

            {gameState === "character-select" && selectedCharacter && (
              <div>
                <h2 className="text-xl mb-4">🎮 Time to "Take a Break"</h2>
                <div className="border border-green-400 p-4 mb-4">
                  <h3 className="text-lg mb-2">{characterResponses[selectedCharacter].name}</h3>
                  <p className="text-green-300 mb-4">{characterResponses[selectedCharacter].emailHelp}</p>
                  <div className="text-yellow-400 text-sm mb-4">
                    Available Mini-Game: {characterResponses[selectedCharacter].miniGame}
                  </div>
                </div>
                <div className="text-center">
                  <Button onClick={playMiniGame} className="bg-red-600 hover:bg-red-700 text-white">
                    Play Intentionally Frustrating Mini-Game
                  </Button>
                </div>
              </div>
            )}

            {gameState === "mini-game" && selectedCharacter && (
              <div className="text-center">
                <h2 className="text-xl mb-4">🎯 {characterResponses[selectedCharacter].miniGame}</h2>
                <div className="border border-red-400 p-8 mb-4 bg-red-900/10">
                  <div className="text-6xl mb-4">🎮</div>
                  <div className="text-red-400 mb-4">Playing intentionally buggy mini-game...</div>
                  <div className="text-sm text-red-300">
                    Controls are laggy, hitboxes are broken, and you're losing SAD coins!
                  </div>
                  <div className="mt-4 animate-pulse">Loading frustration... Please wait...</div>
                </div>
                <div className="text-yellow-400 text-sm">
                  This is designed to be annoying so you'll want to go back to writing emails!
                </div>
              </div>
            )}

            {gameState === "writing" && (
              <div>
                <h2 className="text-xl mb-4">✍️ Email Composition</h2>
                <div className="border border-green-400 p-4 mb-4">
                  <div className="text-sm text-green-500 mb-2">
                    AI Assistant ({selectedCharacter?.toUpperCase()}) is helping you write...
                  </div>
                  
                  {/* Recipient Email Input */}
                  <div className="mb-4">
                    <label className="block text-sm text-green-400 mb-2">To: (recipientEmail)</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full bg-black border border-green-400 text-green-300 p-2 focus:outline-none focus:border-green-300"
                      placeholder="Enter recipient email address..."
                    />
                  </div>

                  {/* Editable Subject */}
                  <div className="mb-4">
                    <label className="block text-sm text-green-400 mb-2">Subject:</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-black border border-green-400 text-green-300 p-2 focus:outline-none focus:border-green-300"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  {/* Editable Body */}
                  <div className="mb-4">
                    <label className="block text-sm text-green-400 mb-2">Body:</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={8}
                      className="w-full bg-black border border-green-400 text-green-300 p-2 focus:outline-none focus:border-green-300 resize-none"
                      placeholder="Enter email body..."
                    />
                  </div>
                </div>
                <div className="text-center">
                  <Button onClick={sendEmail} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Send Email to Real Inbox! 📧
                  </Button>
                </div>
              </div>
            )}

            {gameState === "sent" && (
              <div className="text-center">
                <h2 className="text-2xl mb-4 text-green-400">🎉 SUCCESS!</h2>
                <div className="border border-green-400 p-6 mb-4">
                  <div className="text-lg mb-4">Email sent successfully!</div>
                  <div className="text-green-300 mb-4">
                    You just completed a real task while thinking you were procrastinating!
                  </div>
                  <div className="text-yellow-400 text-sm mb-4">
                    <strong>THE META-GAME REVEALED:</strong> This entire experience was a commitment device that used
                    gamification to overcome procrastination. You "wasted time" but actually got work done!
                  </div>
                  <div className="text-pink-400">+20 FEELS earned for productivity through procrastination!</div>
                </div>
                <Button onClick={resetGame} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Write Another Email? 🔄
                </Button>
              </div>
            )}

            {gameState === "about" && <AboutPage onBack={() => setGameState("inbox")} />}
          </div>

          {/* Footer */}
          <div className="text-center text-green-600 text-sm border-t-2 border-green-400 p-2">
            <p>A productivity tool disguised as a procrastination game</p>
            <p className="text-xs mt-1">Built for the intersection of game theory and behavioral economics</p>
          </div>
        </Card>
      </CRTContainer>
    </>
  )
}
