"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfileDropdown({ variant = 'light' }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // variant: 'light' for white backgrounds, 'dark' for colored backgrounds
  const isDark = variant === 'dark';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/');
  };

  const handleProfile = () => {
    router.push('/profile');
    setIsOpen(false);
  };

  if (!user) return null;

  const userInitials = user.displayName 
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email 
    ? user.email[0].toUpperCase()
    : 'U';

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-3 py-2 transition-all focus:outline-none focus:ring-2 ${
          isDark 
            ? 'hover:bg-white/10 focus:ring-white/50' 
            : 'hover:bg-gray-100 focus:ring-gray-300'
        }`}
      >
        {/* Avatar */}
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
          style={{ backgroundColor: '#1B5E20' }}
        >
          {userInitials}
        </div>
        {/* Name */}
        <span className={`hidden text-sm font-semibold md:block ${
          isDark ? 'text-white' : 'text-gray-700'
        }`}>
          {displayName}
        </span>
        {/* Dropdown Arrow */}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            isDark ? 'text-white' : 'text-gray-600'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden animate-slideUp">
          {/* User Info Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white shadow-md"
                style={{ backgroundColor: '#1B5E20' }}
              >
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleProfile}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                router.push('/game');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Play Game</span>
            </button>

            <button
              onClick={() => {
                router.push('/wordbanks');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>My Word Banks</span>
            </button>

            <div className="my-1 border-t border-gray-200"></div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

