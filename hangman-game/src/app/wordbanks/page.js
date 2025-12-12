"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import { API_ENDPOINTS } from '@/lib/api';

export default function WordBanksPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [wordBanks, setWordBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    input: ''
  });
  const [previewWords, setPreviewWords] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeWordBank, setActiveWordBank] = useState('default');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load active word bank from database
  useEffect(() => {
    const loadActiveWordBank = async () => {
      if (!user) {
        setActiveWordBank('default');
        return;
      }

      try {
        const response = await fetch(`${API_ENDPOINTS.getUserStats}?firebase_uid=${user.uid}`);
        if (response.ok) {
          const stats = await response.json();
          if (stats.active_word_bank_id) {
            setActiveWordBank(stats.active_word_bank_id.toString());
          } else {
            setActiveWordBank('default');
          }
        }
      } catch (error) {
        console.error('Error loading active word bank:', error);
        setActiveWordBank('default');
      }
    };

    if (user) {
      loadActiveWordBank();
    }
  }, [user]);

  // Fetch word banks
  useEffect(() => {
    const fetchWordBanks = async () => {
      if (!user) return;

      try {
        const response = await fetch(`${API_ENDPOINTS.getUserWordBanks}?firebase_uid=${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setWordBanks(data);
        }
      } catch (error) {
        console.error('Error fetching word banks:', error);
      } finally {
        setLoadingBanks(false);
      }
    };

    if (user) {
      fetchWordBanks();
    }
  }, [user]);

  // Save active word bank to database
  const handleWordBankChange = async (bankId) => {
    setActiveWordBank(bankId);
    
    if (!user) return;

    try {
      const wordBankId = bankId === 'default' ? null : parseInt(bankId);
      const response = await fetch(API_ENDPOINTS.updateActiveWordBank, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          word_bank_id: wordBankId,
        }),
      });

      if (response.ok) {
        console.log('Active word bank updated in database');
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successMsg.textContent = 'Word bank updated! Game will use this word bank.';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          document.body.removeChild(successMsg);
        }, 3000);
      } else {
        const error = await response.json();
        console.error('Failed to update active word bank:', error);
      }
    } catch (error) {
      console.error('Error updating active word bank:', error);
    }
  };

  // Extract words preview (matches backend logic exactly)
  const extractWordsPreview = (input) => {
    if (!input || !input.trim()) {
      setPreviewWords([]);
      return;
    }

    const trimmed = input.trim();
    let words = [];

    // Check if it's a single word (very short, no spaces, no commas, no periods)
    if (trimmed.length < 50 && !/\s/.test(trimmed) && !trimmed.includes(',') && !trimmed.includes('.')) {
      const cleaned = trimmed.replace(/[^A-Za-z]/g, '').toUpperCase();
      if (cleaned.length >= 4 && /^[A-Z]+$/.test(cleaned)) {
        setPreviewWords([cleaned]);
        return;
      }
    }

    // Check if it's clearly a comma-separated LIST (not a paragraph with commas)
    const hasPeriods = trimmed.includes('.');
    const hasSentenceStructure = /[.!?]\s+[A-Z]/.test(trimmed);
    const commaCount = (trimmed.match(/,/g) || []).length;
    const hasSpacesAfterCommas = /,\s+[A-Za-z]/.test(trimmed);
    
    if (!hasPeriods && !hasSentenceStructure && commaCount > 0 && hasSpacesAfterCommas && trimmed.length < 500) {
      // Comma-separated list
      words = trimmed
        .split(',')
        .map(w => w.trim())
        .filter(w => w.length > 0)
        .map(w => {
          const cleaned = w.replace(/[^A-Za-z]/g, '');
          if (cleaned.length >= 4 && /^[A-Za-z]+$/.test(cleaned)) {
            return cleaned.toUpperCase();
          }
          return null;
        })
        .filter(w => w !== null);
    } else {
      // Paragraph - split on spaces, commas, periods, etc.
      let normalized = trimmed.replace(/[''`]/g, ' '); // Handle apostrophes
      
      // Replace sentence separators (periods, commas, semicolons, etc.) with spaces
      normalized = normalized.replace(/[.,!?;:()\[\]{}""-]/g, ' ');
      
      // Split by whitespace
      words = normalized
        .split(/\s+/) // Split on any whitespace (one or more spaces/tabs/newlines)
        .map(w => w.trim())
        .filter(w => w.length > 0) // Remove empty strings
        .map(w => {
          // Strip ALL non-letter characters
          const cleaned = w.replace(/[^A-Za-z]/g, '');
          if (cleaned.length >= 4 && /^[A-Za-z]+$/.test(cleaned)) {
            return cleaned.toUpperCase();
          }
          return null;
        })
        .filter(w => w !== null && w.length >= 4);
    }

    // Remove duplicates and set as array
    words = [...new Set(words)];
    setPreviewWords(words);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, input: value });
    extractWordsPreview(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.name.trim()) {
      setError('Word bank name is required');
      setSubmitting(false);
      return;
    }

    if (previewWords.length === 0) {
      setError('No valid words found. Words must be at least 4 characters and contain only letters.');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.createWordBank, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          name: formData.name.trim(),
          input: formData.input.trim(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh word banks list
        const refreshResponse = await fetch(`${API_ENDPOINTS.getUserWordBanks}?firebase_uid=${user.uid}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setWordBanks(data);
        }
        // Reset form
        setFormData({ name: '', input: '' });
        setPreviewWords([]);
        setShowCreateForm(false);
        
        // Reload active word bank from database
        const statsResponse = await fetch(`${API_ENDPOINTS.getUserStats}?firebase_uid=${user.uid}`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          if (stats.active_word_bank_id) {
            setActiveWordBank(stats.active_word_bank_id.toString());
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create word bank');
      }
    } catch (error) {
      console.error('Error creating word bank:', error);
      setError('Failed to create word bank. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (wordBankId) => {
    if (!confirm('Are you sure you want to delete this word bank?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.deleteWordBank, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_uid: user.uid,
          wordBankId: wordBankId,
        }),
      });

      if (response.ok) {
        // Refresh word banks list
        const refreshResponse = await fetch(`${API_ENDPOINTS.getUserWordBanks}?firebase_uid=${user.uid}`);
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setWordBanks(data);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete word bank');
      }
    } catch (error) {
      console.error('Error deleting word bank:', error);
      alert('Failed to delete word bank. Please try again.');
    }
  };

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
          <UserProfileDropdown variant="light" />
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">My Word Banks</h1>
          <p className="text-gray-600">Create custom word banks from paragraphs, comma-separated words, or single words</p>
        </div>

        {/* Active Word Bank Selector */}
        <div className="mb-6 rounded-xl bg-white/80 shadow-lg p-6">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Active Word Bank for Game
          </label>
          <select
            value={activeWordBank}
            onChange={(e) => handleWordBankChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
          >
            <option value="default">System Default</option>
            {wordBanks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name} ({bank.wordCount} words)
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Selected word bank will be used in the game
          </p>
        </div>

        {/* Create Word Bank Button */}
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="mb-6 rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#1B5E20' }}
          >
            + Create New Word Bank
          </button>
        )}

        {/* Create Word Bank Form */}
        {showCreateForm && (
          <div className="mb-8 rounded-xl bg-white/80 shadow-lg p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create Word Bank</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: '', input: '' });
                  setPreviewWords([]);
                  setError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Word Bank Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Word Bank Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                  placeholder="e.g., My Favorite Words"
                  required
                />
              </div>

              {/* Input Field */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Enter Words
                </label>
                <p className="mb-2 text-xs text-gray-500">
                  Paste a paragraph, enter comma-separated words, or type a single word. Words must be at least 4 characters and contain only letters.
                </p>
                <textarea
                  value={formData.input}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-gray-400 focus:outline-none"
                  placeholder="ELEPHANT, TIGER, LION&#10;or paste a paragraph here..."
                  rows={6}
                  required
                />
              </div>

              {/* Preview Words */}
              {previewWords.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Preview: {previewWords.length} word{previewWords.length !== 1 ? 's' : ''} found
                  </p>
                  <div className="max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {previewWords.map((word, index) => (
                        <span
                          key={index}
                          className="inline-block rounded bg-white px-2 py-1 text-xs font-mono text-gray-700 border border-gray-200"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  {previewWords.length > 50 && (
                    <p className="mt-2 text-xs text-gray-500">
                      Showing all {previewWords.length} words
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || previewWords.length === 0}
                  className="rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#1B5E20' }}
                >
                  {submitting ? 'Creating...' : 'Create Word Bank'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', input: '' });
                    setPreviewWords([]);
                    setError('');
                  }}
                  className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Word Banks List */}
        {loadingBanks ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading word banks...</div>
          </div>
        ) : wordBanks.length === 0 ? (
          <div className="rounded-xl bg-white/80 shadow-lg p-8 text-center">
            <p className="text-gray-600">No word banks yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wordBanks.map((bank) => (
              <div key={bank.id} className="rounded-xl bg-white/80 shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{bank.name}</h3>
                    <p className="mb-3 text-sm text-gray-600">
                      {bank.wordCount} word{bank.wordCount !== 1 ? 's' : ''} • Created {new Date(bank.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bank.words.slice(0, 10).map((word, index) => (
                        <span
                          key={index}
                          className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700"
                        >
                          {word}
                        </span>
                      ))}
                      {bank.words.length > 10 && (
                        <span className="text-xs text-gray-500">
                          +{bank.words.length - 10} more...
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(bank.id)}
                    className="ml-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}



