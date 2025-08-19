import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json()

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .eq('owner_user_id', user.id)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found or unauthorized' }, { status: 404 })
    }

    // Create test payload
    const testPayload = {
      first_name: "Test",
      last_name: "Contact",
      email: "test@example.com",
      phone: "+15551234567",
      business_name: "Test Business",
      fun_fact: "This is a test contact from your voice networking app",
      ...(tenant.default_tag && { tag: `${tenant.default_tag}-Test` })
    }

    // Send to GHL webhook
    try {
      const ghlResponse = await fetch(tenant.ghl_webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      })

      if (!ghlResponse.ok) {
        const errorText = await ghlResponse.text()
        console.error('GHL webhook failed:', ghlResponse.status, errorText)
        return NextResponse.json({ 
          error: `GHL webhook failed with status ${ghlResponse.status}` 
        }, { status: 400 })
      }

      // Log the test intake
      await supabase
        .from('intakes')
        .insert({
          tenant_id: tenant.id,
          payload: {
            full_name: "Test Contact",
            email: "test@example.com",
            phone: "+15551234567",
            business_name: "Test Business",
            fun_fact: "This is a test contact from your voice networking app",
            slug: slug
          },
          duration_sec: null,
          status: 'sent'
        })

      return NextResponse.json({ success: true })

    } catch (error) {
      console.error('Error sending test to GHL:', error)
      return NextResponse.json({ error: 'Failed to send test webhook' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in send-test:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}