'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🎵</span>
            <h1 className="text-2xl font-bold text-white">SongTeam</h1>
          </div>
          <div className="flex gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-2.5 text-white hover:text-gray-200 transition-colors font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              ✨ Turn Accomplishments Into Music
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Turn Team Wins Into
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Custom Songs
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-light">
              Celebrate your team's accomplishments with custom songs. Track achievements, generate music, and make every milestone unforgettable.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                Start Creating Free →
              </Link>
              <Link
                href="#pricing"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 transform">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-3">Track Accomplishments</h3>
              <p className="text-white/80 text-lg">Team members log their wins and achievements throughout the week.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 transform">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-2xl font-bold text-white mb-3">Song Generation</h3>
              <p className="text-white/80 text-lg">Transform accomplishments into custom songs in 10+ genres.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105 transform">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-3">Team Collaboration</h3>
              <p className="text-white/80 text-lg">Share join codes. Everyone contributes, everyone celebrates.</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-32" id="pricing">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Simple Pricing</h2>
              <p className="text-xl text-white/80">Buy credits when you need them. No subscriptions.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Starter */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:scale-105 transform transition-all">
                <h3 className="text-xl font-bold text-white/80 mb-2">Starter Pack</h3>
                <div className="mt-4 mb-6">
                  <span className="text-5xl font-black text-white">$20</span>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-white text-lg font-semibold">4 song credits</p>
                  <p className="text-white/70">$5 per song</p>
                  <p className="text-white/60 text-sm">Perfect for trying it out</p>
                </div>
                <Link
                  href="/signup"
                  className="block w-full text-center px-6 py-3 bg-white/20 border border-white/30 text-white rounded-full font-semibold hover:bg-white/30 transition-all"
                >
                  Get Started
                </Link>
              </div>

              {/* Pro - Featured */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl relative hover:scale-105 transform transition-all shadow-2xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full text-sm font-bold text-orange-600">
                  ⭐ BEST VALUE
                </div>
                <h3 className="text-xl font-bold text-white/90 mb-2">Pro Pack</h3>
                <div className="mt-4 mb-6">
                  <span className="text-5xl font-black text-white">$80</span>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-white text-lg font-semibold">20 song credits</p>
                  <p className="text-white/90">$4 per song</p>
                  <p className="text-white/80 text-sm font-semibold">Save 20%</p>
                </div>
                <Link
                  href="/signup"
                  className="block w-full text-center px-6 py-3 bg-white text-orange-600 rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg"
                >
                  Get Started
                </Link>
              </div>

              {/* Corporate */}
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:scale-105 transform transition-all">
                <h3 className="text-xl font-bold text-white/80 mb-2">Corporate Pack</h3>
                <div className="mt-4 mb-6">
                  <span className="text-5xl font-black text-white">$175</span>
                </div>
                <div className="space-y-3 mb-6">
                  <p className="text-white text-lg font-semibold">50 song credits</p>
                  <p className="text-white/70">$3.50 per song</p>
                  <p className="text-white/60 text-sm font-semibold">Save 30%</p>
                </div>
                <Link
                  href="/signup"
                  className="block w-full text-center px-6 py-3 bg-white/20 border border-white/30 text-white rounded-full font-semibold hover:bg-white/30 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>

            <p className="text-center text-white/80 mt-10 text-lg">
              Need 100+ songs? <a href="mailto:sales@songteam.com" className="text-yellow-300 hover:text-yellow-200 font-semibold underline">Contact us</a> for Enterprise pricing
            </p>
          </div>

          {/* CTA Section */}
          <div className="mt-32 text-center bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to celebrate your team?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join teams already using SongTeam to make every win memorable
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-white text-purple-600 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 transform"
            >
              Start Free Today →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-white/60">
          <p className="text-lg">&copy; 2026 SongTeam. Turn wins into music.</p>
        </div>
      </footer>
    </div>
  )
}
