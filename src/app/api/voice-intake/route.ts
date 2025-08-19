import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

interface VoiceIntakePayload {
  full_name: string
  email: string
  phone: string
  business_name: string
  fun_fact: string
  duration_sec?: number
  slug: string
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    let decoded: { slug: string; iat: number; exp: number }
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { slug: string; iat: number; exp: number }
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const payload: VoiceIntakePayload = await request.json()
    
    // Validate payload
    if (!payload.full_name || !payload.email || !payload.phone || !payload.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify slug matches token
    if (payload.slug !== decoded.slug) {
      return NextResponse.json({ error: 'Slug mismatch' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Get tenant info
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', payload.slug)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Transform payload for GHL
    const nameParts = payload.full_name.trim().split(' ')
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ') || ''

    // Normalize phone to E.164 format (basic US format)
    let normalizedPhone = payload.phone.replace(/\D/g, '')
    if (normalizedPhone.length === 10) {
      normalizedPhone = `+1${normalizedPhone}`
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      normalizedPhone = `+${normalizedPhone}`
    } else {
      normalizedPhone = `+1${normalizedPhone.slice(-10)}`
    }

    const ghlPayload = {
      first_name: firstName,
      last_name: lastName,
      email: payload.email,
      phone: normalizedPhone,
      business_name: payload.business_name,
      fun_fact: payload.fun_fact,
      ...(tenant.default_tag && { tag: tenant.default_tag })
    }

    // Send to GHL webhook
    let ghlStatus = 'sent'
    try {
      const ghlResponse = await fetch(tenant.ghl_webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ghlPayload)
      })

      if (!ghlResponse.ok) {
        ghlStatus = 'error'
        console.error('GHL webhook failed:', ghlResponse.status, await ghlResponse.text())
      }
    } catch (error) {
      ghlStatus = 'error'
      console.error('Error sending to GHL:', error)
    }

    // Log intake
    const { error: intakeError } = await supabase
      .from('intakes')
      .insert({
        tenant_id: tenant.id,
        payload: payload,
        duration_sec: payload.duration_sec || null,
        status: ghlStatus
      })

    if (intakeError) {
      console.error('Error logging intake:', intakeError)
    }

    return NextResponse.json({ 
      success: ghlStatus === 'sent',
      error: ghlStatus === 'error' ? 'Failed to send to GHL' : undefined
    })

  } catch (error) {
    console.error('Error processing voice intake:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}