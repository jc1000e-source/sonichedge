'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showJoinTeam, setShowJoinTeam] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserAndTeams()
  }, [])

  async function loadUserAndTeams() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Get user's teams
      const { data: memberships } = await supabase
        .from('team_members')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('user_id', user.id)

      const userTeams = memberships?.map(m => m.team) || []
      setTeams(userTeams)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎵</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🎵 SongTeam</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">Manage your teams and generate songs</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setShowCreateTeam(true)}
            className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left"
          >
            <div className="text-2xl mb-2">➕</div>
            <h3 className="text-lg font-semibold">Create New Team</h3>
            <p className="text-sm text-blue-100">Start a team and invite members</p>
          </button>

          <button
            onClick={() => setShowJoinTeam(true)}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors text-left"
          >
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="text-lg font-semibold text-gray-900">Join a Team</h3>
            <p className="text-sm text-gray-600">Have a join code? Enter it here</p>
          </button>
        </div>

        {/* Teams List */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Teams</h3>
          
          {teams.length === 0 ? (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-4">Create a team or join an existing one to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-semibold text-blue-600">
                        {team.song_credits_remaining} songs
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Join Code:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {team.join_code}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <CreateTeamModal
          onClose={() => setShowCreateTeam(false)}
          onSuccess={() => {
            setShowCreateTeam(false)
            loadUserAndTeams()
          }}
        />
      )}

      {/* Join Team Modal */}
      {showJoinTeam && (
        <JoinTeamModal
          onClose={() => setShowJoinTeam(false)}
          onSuccess={() => {
            setShowJoinTeam(false)
            loadUserAndTeams()
          }}
        />
      )}
    </div>
  )
}

// Create Team Modal Component
function CreateTeamModal({ onClose, onSuccess }: any) {
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!teamName.trim()) return
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Create New Team</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="My Awesome Team"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !teamName.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Join Team Modal Component
function JoinTeamModal({ onClose, onSuccess }: any) {
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin() {
    if (!joinCode.trim()) return
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.toUpperCase() }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Join a Team</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Join Code
          </label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="TEAM4X9Z"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
            maxLength={8}
          />
          <p className="mt-1 text-xs text-gray-500">Enter the 8-character code (e.g., TEAM4X9Z)</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={loading || !joinCode.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Team'}
          </button>
        </div>
      </div>
    </div>
  )
}
