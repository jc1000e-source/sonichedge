import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId, genre, weekStartDate, weekEndDate, title } = await request.json()

    // Verify user is a member of this team
    const { data: membership } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', session.user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if team has enough credits
    const { data: team } = await supabase
      .from('teams')
      .select('song_credits_remaining, name')
      .eq('id', teamId)
      .single()

    if (!team || team.song_credits_remaining < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits.' },
        { status: 402 }
      )
    }

    // Get unused accomplishments for the time period
    const { data: accomplishments } = await supabase
      .from('accomplishments')
      .select('*')
      .eq('team_id', teamId)
      .eq('used_in_song', false)
      .gte('created_at', weekStartDate)
      .lte('created_at', weekEndDate)
      .order('created_at', { ascending: true })

    if (!accomplishments || accomplishments.length === 0) {
      return NextResponse.json(
        { error: 'No accomplishments found for the selected period' },
        { status: 400 }
      )
    }

    // Create song record with 'pending' status
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        team_id: teamId,
        created_by_user_id: session.user.id,
        title: title || `${genre.charAt(0).toUpperCase() + genre.slice(1)} Song`,
        genre,
        status: 'pending',
        week_start_date: weekStartDate,
        week_end_date: weekEndDate,
      })
      .select()
      .single()

    if (songError) {
      console.error('Error creating song:', songError)
      return NextResponse.json({ error: 'Failed to create song' }, { status: 500 })
    }

    // Consume 1 credit using the database function
    const { error: creditError } = await supabase.rpc('consume_song_credit', {
      p_team_id: teamId,
      p_user_id: session.user.id,
      p_song_id: song.id,
    })

    if (creditError) {
      console.error('Error consuming credit:', creditError)
      // Delete the song since credit consumption failed
      await supabase.from('songs').delete().eq('id', song.id)
      return NextResponse.json(
        { error: 'Failed to consume credit. Please try again.' },
        { status: 500 }
      )
    }

    // Mark accomplishments as used
    const accomplishmentIds = accomplishments.map(a => a.id)
    await supabase
      .from('accomplishments')
      .update({
        used_in_song: true,
        used_in_song_id: song.id,
      })
      .in('id', accomplishmentIds)

    // Update song status to 'generating'
    await supabase
      .from('songs')
      .update({ status: 'generating' })
      .eq('id', song.id)

    // Call your song generation API asynchronously
    // We don't await this so the user gets immediate feedback
    generateSongAsync(song.id, accomplishments, genre, teamId, team.name, weekStartDate, weekEndDate)

    return NextResponse.json({
      songId: song.id,
      status: 'generating',
      message: 'Song generation started',
    })
  } catch (error) {
    console.error('Song generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate song' },
      { status: 500 }
    )
  }
}

// Async function to call your song generation API
async function generateSongAsync(
  songId: string,
  accomplishments: any[],
  genre: string,
  teamId: string,
  teamName: string,
  weekStartDate: string,
  weekEndDate: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Format accomplishments into lyrics
    const lyrics = accomplishments
      .map(a => a.text)
      .join('\n\n')

    // Format week label
    const weekLabel = `${new Date(weekStartDate).toLocaleDateString()} - ${new Date(weekEndDate).toLocaleDateString()}`

    // Call your custom song generation API
    const response = await fetch(process.env.SONG_GENERATION_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-song-engine-secret': process.env.SONG_GENERATION_API_KEY!,
      },
      body: JSON.stringify({
        songId: songId,
        teamName: teamName,
        genre: genre,
        weekLabel: weekLabel,
        lyrics: lyrics,
        lengthMs: 90000, // 90 seconds
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Song API failed (${response.status}): ${errorText}`)
    }

    const result = await response.json()

    // Update song with generated content
    // Your API should return the audio_url
    await supabase
      .from('songs')
      .update({
        lyrics: lyrics,
        audio_url: result.audio_url || result.audioUrl, // Handle both formats
        status: 'complete',
        completed_at: new Date().toISOString(),
      })
      .eq('id', songId)

    console.log(`✅ Song ${songId} generated successfully`)
  } catch (error) {
    console.error(`❌ Error generating song ${songId}:`, error)
    
    // Update song status to error
    await supabase
      .from('songs')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', songId)

    // Refund the credit since generation failed
    await supabase.rpc('grant_credits', {
      p_team_id: teamId,
      p_amount: 1,
      p_transaction_type: 'refunded',
      p_notes: `Refund for failed song generation (${songId})`,
    })
  }
}

// Import for admin client
import { createClient } from '@supabase/supabase-js'
