import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

    // Verify the user owns this tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .eq('owner_user_id', user.id)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found or unauthorized' }, { status: 404 })
    }

    // Generate JWT token with short expiry
    const token = jwt.sign(
      { 
        slug,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (10 * 60) // 10 minutes
      },
      process.env.JWT_SECRET!
    )

    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Error issuing voice token:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}