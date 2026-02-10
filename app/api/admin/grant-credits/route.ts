import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is an admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (!adminUser || !adminUser.can_grant_credits) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { teamId, credits, notes } = await request.json()

    if (!teamId || !credits || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid request. Team ID and positive credit amount required.' },
        { status: 400 }
      )
    }

    // Grant credits using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.rpc('grant_credits', {
      p_team_id: teamId,
      p_amount: credits,
      p_transaction_type: 'admin_granted',
      p_user_id: session.user.id,
      p_notes: notes || `Admin granted ${credits} credits`,
    })

    if (error) {
      console.error('Error granting credits:', error)
      return NextResponse.json(
        { error: 'Failed to grant credits' },
        { status: 500 }
      )
    }

    // Get updated team info
    const { data: team } = await supabaseAdmin
      .from('teams')
      .select('name, song_credits_remaining')
      .eq('id', teamId)
      .single()

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${credits} credits to ${team?.name}`,
      newBalance: team?.song_credits_remaining,
    })
  } catch (error) {
    console.error('Admin grant credits error:', error)
    return NextResponse.json(
      { error: 'Failed to grant credits' },
      { status: 500 }
    )
  }
}
