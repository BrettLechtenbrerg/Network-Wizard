'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function VoicePage() {
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const slug = params.slug as string

  useEffect(() => {
    const initializePage = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get voice token for this slug
      const response = await fetch('/api/issue-voice-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      })

      const result = await response.json()
      if (result.success) {
        setToken(result.token)
      } else {
        setError(result.error || 'Failed to initialize voice page')
      }
      setLoading(false)
    }

    initializePage()
  }, [supabase, slug, router])

  useEffect(() => {
    if (!token) return

    // Load Vapi script
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [token])

  const startVoiceCapture = () => {
    if (!token) return

    setIsRecording(true)
    
    // Initialize Vapi widget
    // This is a placeholder - you'll need to implement the actual Vapi integration
    // based on your Vapi assistant configuration
    console.log('Starting voice capture with token:', token)
    
    // For demo purposes, simulate a voice interaction
    setTimeout(() => {
      simulateVoiceCapture()
    }, 2000)
  }

  const simulateVoiceCapture = async () => {
    // This simulates what the Vapi widget would do
    const sampleData = {
      full_name: "John Doe",
      email: "john@example.com", 
      phone: "(555) 123-4567",
      business_name: "Acme Corp",
      fun_fact: "I love hiking",
      duration_sec: 45,
      slug: slug
    }

    const response = await fetch('/api/voice-intake', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(sampleData)
    })

    const result = await response.json()
    setIsRecording(false)
    
    if (result.success) {
      alert('Contact information captured successfully!')
    } else {
      alert('Error capturing information: ' + (result.error || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading voice page...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Share Your Details
        </h1>
        <p className="text-gray-600 mb-8">
          Click the button below and tell us your name, email, phone, business, and a fun fact about yourself. 
          We&apos;ll confirm the details with you before saving.
        </p>

        <div className="space-y-6">
          <button
            onClick={startVoiceCapture}
            disabled={isRecording}
            className={`w-full py-4 px-6 rounded-lg text-xl font-semibold transition-colors ${
              isRecording
                ? 'bg-red-500 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isRecording ? 'Recording... Please speak clearly' : 'Start Voice Capture'}
          </button>

          <div className="text-left bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click &quot;Start Voice Capture&quot;</li>
              <li>Answer questions about your name, email, phone, business, and fun fact</li>
              <li>Confirm your information when asked</li>
              <li>You&apos;re done! Your details are automatically saved</li>
            </ol>
          </div>

          <p className="text-xs text-gray-500">
            By starting, you consent to voice capture to share your contact details.
          </p>
        </div>
      </div>
    </div>
  )
}