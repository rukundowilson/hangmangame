// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  registerUser: `${API_BASE_URL}/api/users/register`,
  getUserStats: `${API_BASE_URL}/api/users/stats`,
  recordGame: `${API_BASE_URL}/api/games/record`,
  createWordBank: `${API_BASE_URL}/api/wordbanks/create`,
  getUserWordBanks: `${API_BASE_URL}/api/wordbanks/list`,
  deleteWordBank: `${API_BASE_URL}/api/wordbanks/delete`,
  updateActiveWordBank: `${API_BASE_URL}/api/users/active-word-bank`,
};

export default API_ENDPOINTS;


