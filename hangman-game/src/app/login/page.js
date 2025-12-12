"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/game');
    }
  }, [user, authLoading, router]);

  const handlePlayAsGuest = () => {
    router.push('/game');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      // Login
      const result = await signIn(email, password);
      if (result.success) {
        router.push('/game');
      } else {
        setError(result.error || 'Failed to sign in');
      }
    } else {
      // Sign Up
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const result = await signUp(email, password, displayName);
      if (result.success) {
        router.push('/game');
      } else {
        setError(result.error || 'Failed to sign up');
      }
    }
    setLoading(false);
  };

  // Show loading state while checking auth or if already logged in
  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold" style={{ color: '#1B5E20' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push('/')}
            className="text-lg font-semibold text-gray-700 hover:text-gray-900"
            style={{ fontFamily: 'monospace' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md items-center justify-center px-6 py-12">
        <div className="w-full space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>
              {isLogin ? 'LOGIN' : 'SIGN UP'}
            </h1>
            <p className="text-gray-600" style={{ fontFamily: 'monospace' }}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          {/* Auth Form Card */}
          <div className="rounded-xl bg-white/80 p-8">
            {/* Toggle Login/Signup */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  isLogin
                    ? 'text-white'
                    : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                }`}
                style={isLogin ? { backgroundColor: '#1B5E20' } : {}}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  !isLogin
                    ? 'text-white'
                    : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                }`}
                style={!isLogin ? { backgroundColor: '#1B5E20' } : {}}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-100/80 p-3 text-center">
                <p className="text-sm text-red-700" style={{ fontFamily: 'monospace' }}>
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700" style={{ fontFamily: 'monospace' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                    style={{ fontFamily: 'monospace' }}
                    placeholder="Enter username"
                    required={!isLogin}
                  />
                </div>
              )}
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" style={{ fontFamily: 'monospace' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                  style={{ fontFamily: 'monospace' }}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" style={{ fontFamily: 'monospace' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                  style={{ fontFamily: 'monospace' }}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1B5E20', fontFamily: 'monospace' }}
              >
                {loading ? 'PLEASE WAIT...' : (isLogin ? 'LOGIN' : 'SIGN UP')}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500" style={{ fontFamily: 'monospace' }}>
                OR
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Play as Guest Button */}
            <button
              onClick={handlePlayAsGuest}
              className="w-full rounded-lg bg-gray-100/80 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200/80"
              style={{ fontFamily: 'monospace' }}
            >
              PLAY AS GUEST
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
