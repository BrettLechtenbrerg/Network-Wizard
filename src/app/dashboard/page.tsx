'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Tenant {
  id: string
  slug: string
  ghl_webhook_url: string
  default_tag: string | null
}

interface Intake {
  id: string
  payload: Record<string, unknown>
  duration_sec: number | null
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [intakes, setIntakes] = useState<Intake[]>([])
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Load tenant
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_user_id', user.id)
        .single()

      if (!tenantData) {
        router.push('/setup')
        return
      }

      setTenant(tenantData)

      // Load recent intakes
      const { data: intakesData } = await supabase
        .from('intakes')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false })
        .limit(20)

      setIntakes(intakesData || [])
      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const handleSendTest = async () => {
    if (!tenant) return
    
    setTestLoading(true)
    setMessage('')

    const response = await fetch('/api/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: tenant.slug })
    })

    const result = await response.json()
    setMessage(result.success ? 'Test sent successfully!' : result.error || 'Test failed')
    setTestLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!tenant) {
    return null
  }

  const voicePageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/v/${tenant.slug}`
  const totalDuration = intakes.reduce((sum, intake) => sum + (intake.duration_sec || 0), 0)
  const last24h = intakes.filter(intake => 
    new Date(intake.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Voice Networking Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href={voicePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Open Voice Page
            </a>
            <a
              href="/setup"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Edit Settings
            </a>
            <button
              onClick={handleSendTest}
              disabled={testLoading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {testLoading ? 'Sending...' : 'Send Test'}
            </button>
          </div>
          {message && (
            <div className={`mt-3 text-sm ${
              message.includes('successfully') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Intakes</h3>
            <p className="text-2xl font-bold text-gray-900">{intakes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Last 24h</h3>
            <p className="text-2xl font-bold text-gray-900">{last24h.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Duration</h3>
            <p className="text-2xl font-bold text-gray-900">{Math.round(totalDuration / 60)}m</p>
          </div>
        </div>

        {/* Recent Intakes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Contacts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {intakes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No contacts yet. Share your voice page to get started!
                    </td>
                  </tr>
                ) : (
                  intakes.map((intake) => (
                    <tr key={intake.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(intake.payload?.full_name as string) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(intake.payload?.email as string) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(intake.payload?.phone as string) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          intake.status === 'sent' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {intake.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(intake.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Voice Page Link */}
        <div className="bg-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Your Voice Page</h3>
          <p className="text-indigo-700 mb-4">Share this URL with attendees to collect their contact information:</p>
          <div className="bg-white rounded border p-3 font-mono text-sm break-all">
            {voicePageUrl}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(voicePageUrl)}
            className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  )
}