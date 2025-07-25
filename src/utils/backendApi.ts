import type { Book } from '../types';

interface BackendBookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  summary: string;
  genre: string[];
  rating: number;
  year?: number;
  coverUrl?: string;
  score: number;
  reasons: string[];
}

const BACKEND_URL = import.meta.env.PROD 
  ? '' // Use relative URLs in production (same domain)
  : 'http://localhost:3001';

export const getBackendRecommendations = async (query: string, userBooks: Book[]): Promise<BackendBookRecommendation[]> => {
  try {
    console.log(`🔗 Calling backend API for: "${query}"`);
    
    const response = await fetch(`${BACKEND_URL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        userBooks
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Backend returned ${data.recommendations.length} recommendations`);
    
    return data.recommendations;

  } catch (error) {
    console.error('❌ Backend API error:', error);
    
    // Check if it's a network error (backend not running)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend server not running. Please start the backend server first.');
    }
    
    throw error;
  }
};

// Check if backend is running
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};