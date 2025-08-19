'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [slug, setSlug] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [defaultTag, setDefaultTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<{ id: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Check if user already has a tenant
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('owner_user_id', user.id)
          .single()
        
        if (tenant) {
          router.push('/dashboard')
        }
      }
    }
    getUser()
  }, [supabase, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    setMessage('')

    // Validate slug format
    if (!/^[a-z0-9-]{3,20}$/.test(slug)) {
      setMessage('Slug must be 3-20 characters, lowercase letters, numbers, and hyphens only')
      setLoading(false)
      return
    }

    // Validate webhook URL
    try {
      new URL(webhookUrl)
    } catch {
      setMessage('Please enter a valid webhook URL')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('tenants')
      .insert({
        owner_user_id: user.id,
        slug,
        ghl_webhook_url: webhookUrl,
        default_tag: defaultTag || null
      })

    if (error) {
      if (error.code === '23505') {
        setMessage('This slug is already taken. Please choose another.')
      } else {
        setMessage('Error saving settings. Please try again.')
      }
    } else {
      setMessage('Settings saved successfully!')
      setTimeout(() => router.push('/dashboard'), 1000)
    }
    setLoading(false)
  }

  const handleSendTest = async () => {
    if (!slug || !webhookUrl) {
      setMessage('Please save your settings first')
      return
    }

    setLoading(true)
    const response = await fetch('/api/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug })
    })

    const result = await response.json()
    setMessage(result.success ? 'Test sent successfully!' : result.error || 'Test failed')
    setLoading(false)
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Setup Your Voice Page</h1>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Unique Slug
            </label>
            <div className="mt-1 flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {process.env.NEXT_PUBLIC_BASE_URL || 'https://yourapp.com'}/v/
              </span>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="flex-1 rounded-r-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="your-event"
                required
                pattern="[a-z0-9-]{3,20}"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">3-20 characters, lowercase letters, numbers, and hyphens only</p>
          </div>

          <div>
            <label htmlFor="webhook" className="block text-sm font-medium text-gray-700">
              GHL Inbound Webhook URL
            </label>
            <input
              type="url"
              id="webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="https://services.leadconnectorhq.com/hooks/..."
              required
            />
          </div>

          <div>
            <label htmlFor="tag" className="block text-sm font-medium text-gray-700">
              Default Tag (Optional)
            </label>
            <input
              type="text"
              id="tag"
              value={defaultTag}
              onChange={(e) => setDefaultTag(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Event-Aug-2025"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={handleSendTest}
              disabled={loading || !slug || !webhookUrl}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Send Test
            </button>
          </div>
        </form>

        {message && (
          <div className={`mt-4 text-center text-sm ${
            message.includes('Error') || message.includes('failed') || message.includes('taken') 
              ? 'text-red-600' 
              : 'text-green-600'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}