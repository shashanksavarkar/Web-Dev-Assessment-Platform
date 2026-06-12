import DEFAULT_QUESTIONS from '../constants/challenges.json';

// Initialize API URL using environment variables or fallback to local port 5000
export const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:5000';

// Local storage key for offline syncing
const LOCAL_STORAGE_KEY = 'ppa_custom_challenges';

// Helper to check if API is online and reachable
export const isPocketBaseOnline = async () => {
  try {
    const res = await fetch(`${API_URL}/api/health`);
    if (res.ok) {
      const data = await res.json();
      return data.status === 'OK';
    }
    return false;
  } catch {
    return false;
  }
};

// Fetch all challenges from API (falling back to localStorage if offline)
export const getChallenges = async () => {
  const isOnline = await isPocketBaseOnline();
  if (isOnline) {
    try {
      const res = await fetch(`${API_URL}/api/challenges`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      
      const records = await res.json();
      
      // Auto-seeding: If database is online but blank, the Express backend automatically seeds.
      // We return the fetched list.
      return records;
    } catch (e) {
      console.warn("API fetch failed, falling back to local storage:", e);
    }
  }

  // Offline Fallback
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
  } catch {
    return DEFAULT_QUESTIONS;
  }
};

// Save a challenge (updates/creates in API if online and always updates local storage)
export const saveChallenge = async (q) => {
  const isOnline = await isPocketBaseOnline();
  
  const payload = {
    title: q.title,
    difficulty: q.difficulty,
    type: q.type,
    duration: q.duration,
    topics: q.topics,
    companies: q.companies,
    description: q.description,
    changesToBeDone: q.changesToBeDone,
    hints: q.hints,
    rules: q.rules,
    initialHtml: q.initialHtml,
    initialCss: q.initialCss,
    initialJs: q.initialJs,
    solutionHtml: q.solutionHtml,
    solutionCss: q.solutionCss,
    solutionJs: q.solutionJs,
    env: q.env || 'web',
  };

  let savedRecord = null;

  if (isOnline) {
    try {
      // Connects to the Express upsert endpoint
      const res = await fetch(`${API_URL}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: q.id })
      });
      if (res.ok) {
        savedRecord = await res.json();
      } else {
        throw new Error(`Save failed with status ${res.status}`);
      }
    } catch (e) {
      console.error("Failed to save to database:", e);
    }
  }

  // Sync to local storage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let currentQuestions = saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    
    const mappedQ = savedRecord ? {
      ...q,
      id: savedRecord.id,
      dbId: savedRecord.id
    } : q;

    const exists = currentQuestions.some(x => x.id === q.id);
    const updatedQuestions = exists 
      ? currentQuestions.map(x => x.id === q.id ? mappedQ : x)
      : [...currentQuestions, mappedQ];

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQuestions));
    return { success: true, question: mappedQ, online: !!savedRecord };
  } catch (e) {
    console.error("LocalStorage sync failed:", e);
    return { success: false, error: e.message };
  }
};

// Delete a challenge
export const deleteChallenge = async (id) => {
  const isOnline = await isPocketBaseOnline();

  if (isOnline && id) {
    try {
      const res = await fetch(`${API_URL}/api/challenges/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
    } catch (e) {
      console.error("Failed to delete from database:", e);
    }
  }

  // Sync delete locally
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const currentQuestions = JSON.parse(saved);
      const updated = currentQuestions.filter(x => x.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};
