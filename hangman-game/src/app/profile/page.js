"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { API_ENDPOINTS } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    games_played: 0,
    games_won: 0,
    games_lost: 0,
    total_score: 0,
    high_score: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${API_ENDPOINTS.getUserStats}?firebase_uid=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          const error = await response.json();
          console.error('Error fetching stats:', error);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold" style={{ color: '#1B5E20' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = user.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email 
    ? user.email[0].toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-lg font-semibold text-gray-700 hover:text-gray-900"
          >
            ← Back to Home
          </button>
          <UserProfileDropdown />
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-xl bg-white/80 shadow-lg p-8">
          {/* Profile Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div 
                className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg"
                style={{ backgroundColor: '#1B5E20' }}
              >
                {userInitials}
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {user.displayName || 'User Profile'}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Display Name
                  </label>
                  <p className="text-base text-gray-900">
                    {user.displayName || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <p className="text-base text-gray-900">
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </label>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {user.uid}
                  </p>
                </div>
              </div>
            </div>

            {/* Game Statistics Section */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Game Statistics</h2>
              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading statistics...</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold mb-1" style={{ color: '#1B5E20' }}>
                        {stats.games_played || 0}
                      </div>
                      <div className="text-sm text-gray-600">Games Played</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold mb-1" style={{ color: '#1B5E20' }}>
                        {stats.games_won || 0}
                      </div>
                      <div className="text-sm text-gray-600">Games Won</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-3xl font-bold mb-1" style={{ color: '#1B5E20' }}>
                        {stats.high_score || 0}
                      </div>
                      <div className="text-sm text-gray-600">High Score</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold mb-1" style={{ color: '#1B5E20' }}>
                        {stats.games_lost || 0}
                      </div>
                      <div className="text-sm text-gray-600">Games Lost</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold mb-1" style={{ color: '#1B5E20' }}>
                        {stats.total_score || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Score</div>
                    </div>
                  </div>
                  {stats.games_played === 0 && (
                    <p className="mt-4 text-sm text-gray-500 text-center">
                      Start playing games to see your statistics!
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => router.push('/game')}
                className="flex-1 rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1B5E20' }}
              >
                Play Game
              </button>
              <button
                onClick={() => router.push('/wordbanks')}
                className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                My Word Banks
              </button>
              <button
                onClick={() => router.push('/')}
                className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



