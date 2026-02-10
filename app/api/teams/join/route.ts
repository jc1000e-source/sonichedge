import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { joinCode } = await request.json()

    if (!joinCode) {
      return NextResponse.json({ error: 'Join code required' }, { status: 400 })
    }

    // Find team by join code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('join_code', joinCode.toUpperCase())
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Invalid join code. Please check and try again.' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', team.id)
      .eq('user_id', session.user.id)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this team', teamId: team.id },
        { status: 409 }
      )
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: session.user.id,
        role: 'member',
      })

    if (memberError) {
      console.error('Error adding team member:', memberError)
      return NextResponse.json(
        { error: 'Failed to join team. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      teamId: team.id,
      teamName: team.name,
      message: `Successfully joined ${team.name}!`,
    })
  } catch (error) {
    console.error('Join team error:', error)
    return NextResponse.json(
      { error: 'Failed to join team' },
      { status: 500 }
    )
  }
}
