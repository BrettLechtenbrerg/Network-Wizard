import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has a tenant, if not redirect to setup
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('owner_user_id', user.id)
          .single()
        
        const redirectTo = tenant ? next : '/setup'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}