import type { Book } from '../types';
import type { BookRecommendation } from './recommendations';

// Interface for Claude API response
interface ClaudeBook {
  title: string;
  author: string;
  genre?: string[];
  description?: string;
  rating?: number;
  year?: number;
  reason?: string;
}

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;

// Get book recommendations from Claude.ai
export const getClaudeRecommendations = async (
  query: string,
  userBooks: Book[]
): Promise<BookRecommendation[]> => {
  console.log(`🤖 Getting recommendations from Claude for: "${query}"`);
  
  if (!CLAUDE_API_KEY) {
    console.error('❌ Claude API key not found. Please set VITE_CLAUDE_API_KEY in your .env file');
    // Return error message as a "book recommendation" to inform the user
    return [{
      id: 'claude-config-error',
      title: 'Claude API Configuration Required',
      author: 'System Message',
      genre: ['Configuration'],
      rating: 0,
      description: 'To use Claude AI for book recommendations, please add your Claude API key to the .env file. Visit https://console.anthropic.com/ to get your API key, then add VITE_CLAUDE_API_KEY=your_key_here to your .env file and restart the development server.',
      summary: 'Claude API key is missing. Please configure your .env file.',
      score: 0,
      reasons: ['Configuration Required', 'Add API Key to .env file']
    }];
  }

  try {
    // Build context about user's reading history
    const userLibraryContext = userBooks.length > 0 
      ? `\n\nUser's reading history for context:\n${userBooks.map(book => 
          `- "${book.title}" by ${book.author} (${book.genre.join(', ')}) - Rated: ${book.rating || 'N/A'}/5`
        ).join('\n')}`
      : '';

    // Create the prompt for Claude
    const prompt = `You are a knowledgeable book recommendation assistant. The user is asking: "${query}"

${userLibraryContext}

Please recommend exactly 5 books that match their request. For each book, provide:
1. Title
2. Author  
3. Genre(s)
4. Brief description (1-2 sentences)
5. Approximate rating/quality (out of 5)
6. Why you're recommending it (1 sentence)

Format your response as a JSON array of objects with these fields:
[
  {
    "title": "Book Title",
    "author": "Author Name", 
    "genre": ["Genre1", "Genre2"],
    "description": "Brief description",
    "rating": 4.2,
    "year": 2020,
    "reason": "Why this book fits the request"
  }
]

Focus on variety, quality, and relevance to their request. Only return the JSON array, no other text.`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API HTTP Error: ${response.status} ${response.statusText}`, errorText);
      
      // Return helpful error message based on status code
      const errorMessage = response.status === 401 
        ? 'Invalid Claude API key. Please check your VITE_CLAUDE_API_KEY in the .env file.'
        : response.status === 429
        ? 'Claude API rate limit exceeded. Please try again in a moment.'
        : response.status === 403
        ? 'Claude API access forbidden. Please check your API key permissions.'
        : `Claude API error (${response.status}): ${response.statusText}`;
        
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const claudeResponse = data.content[0].text;
    
    console.log(`🤖 Claude raw response:`, claudeResponse);
    
    // Parse Claude's JSON response
    let claudeBooks: ClaudeBook[];
    try {
      // Extract JSON from Claude's response (in case there's extra text)
      const jsonMatch = claudeResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : claudeResponse;
      claudeBooks = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Failed to parse Claude response as JSON:', parseError);
      console.log('Raw response:', claudeResponse);
      
      // Return error message as a "book recommendation"
      return [{
        id: 'claude-parse-error',
        title: 'Claude Response Parsing Error',
        author: 'System Message',
        genre: ['Error'],
        rating: 0,
        description: `Claude returned a response that couldn't be parsed as book recommendations. This might be a temporary issue. Raw response: ${claudeResponse?.substring(0, 200)}...`,
        summary: 'Failed to parse Claude response. Please try rephrasing your request.',
        score: 0,
        reasons: ['Parsing Error', 'Try rephrasing your request']
      }];
    }

    // Convert Claude's response to BookRecommendation format
    const recommendations: BookRecommendation[] = claudeBooks.map((claudeBook, index) => ({
      id: `claude-${Date.now()}-${index}`,
      title: claudeBook.title,
      author: claudeBook.author,
      genre: claudeBook.genre || ['General'],
      rating: claudeBook.rating || 4.0,
      year: claudeBook.year,
      description: claudeBook.description || '',
      summary: claudeBook.description || '',
      score: 95 - index, // High scores since Claude curated these
      reasons: [claudeBook.reason || 'Claude recommendation', 'AI curated']
    }));

    console.log(`🤖 Claude returned ${recommendations.length} recommendations:`, 
      recommendations.map(r => `"${r.title}" by ${r.author}`));

    return recommendations;

  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    
    // Provide specific error messages based on the error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
    const isTimeoutError = errorMessage.includes('timeout');
    
    return [{
      id: 'claude-error',
      title: isNetworkError ? 'Network Connection Error' : 
             isTimeoutError ? 'Claude API Timeout' : 'Claude API Error',
      author: 'System Message',
      genre: ['Error'],
      rating: 0,
      description: isNetworkError 
        ? 'Unable to connect to Claude API. Please check your internet connection and try again.'
        : isTimeoutError
        ? 'Claude API request timed out. The service might be busy. Please try again in a moment.'  
        : `Claude AI error: ${errorMessage}. Please check your API key configuration and try again.`,
      summary: 'Claude AI is temporarily unavailable. Using fallback recommendations.',
      score: 0,
      reasons: ['API Error', 'Using fallback recommendations']
    }];
  }
};

// Get similar book recommendations for a specific book using Claude
export const getSimilarBookRecommendations = async (
  book: Book,
  userBooks: Book[]
): Promise<BookRecommendation[]> => {
  console.log(`🔍 Getting similar books to: "${book.title}" by ${book.author}`);
  
  if (!CLAUDE_API_KEY) {
    console.error('❌ Claude API key not found for similar book search');
    return [{
      id: 'similar-config-error',
      title: 'Claude API Configuration Required',
      author: 'System Message',
      genre: ['Configuration'],
      rating: 0,
      description: 'To get AI-powered similar book suggestions, please add your Claude API key to the .env file. Visit https://console.anthropic.com/ to get your API key.',
      summary: 'Claude API key needed for similar book recommendations.',
      score: 0,
      reasons: ['Configuration Required', 'Add API Key']
    }];
  }

  try {
    // Build context about the specific book and user's reading history
    const bookContext = `Book to find similarities for:
- Title: "${book.title}"
- Author: ${book.author}
- Genres: ${book.genre.join(', ')}
- User's rating: ${book.rating || 'Not rated'}/5
${book.summary ? `- Summary: ${book.summary}` : ''}
${book.description ? `- User's notes: ${book.description}` : ''}`;

    const userLibraryContext = userBooks.length > 0 
      ? `\n\nUser's reading history for context (to avoid duplicates and understand preferences):
${userBooks.map(userBook => 
        `- "${userBook.title}" by ${userBook.author} (${userBook.genre.join(', ')}) - Rated: ${userBook.rating || 'N/A'}/5`
      ).join('\n')}`
      : '';

    // Create a focused prompt for similar book recommendations
    const prompt = `You are a knowledgeable book recommendation assistant. I need you to recommend books that are similar to the specific book mentioned below.

${bookContext}
${userLibraryContext}

Please recommend exactly 5 books that are similar to "${book.title}" by ${book.author}. Consider:
1. Similar themes, mood, and writing style
2. Books that readers of this book typically enjoy
3. Similar genres but with variety
4. Avoid recommending books the user has already read (listed above)
5. Focus on quality books with good ratings

For each recommendation, provide:
- Title
- Author  
- Genre(s)
- Brief description (1-2 sentences explaining why it's similar)
- Approximate rating/quality (out of 5)
- Specific reason why it's similar to "${book.title}"

Format your response as a JSON array of objects with these fields:
[
  {
    "title": "Book Title",
    "author": "Author Name", 
    "genre": ["Genre1", "Genre2"],
    "description": "Brief description explaining similarity",
    "rating": 4.2,
    "year": 2020,
    "reason": "Specific reason why this is similar to ${book.title}"
  }
]

Only return the JSON array, no other text.`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API HTTP Error for similar books: ${response.status} ${response.statusText}`, errorText);
      
      const errorMessage = response.status === 401 
        ? 'Invalid Claude API key for similar book search.'
        : response.status === 429
        ? 'Claude API rate limit exceeded. Please try again in a moment.'
        : `Claude API error (${response.status}) for similar books.`;
        
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const claudeResponse = data.content[0].text;
    
    console.log(`🤖 Claude similar books response:`, claudeResponse);
    
    // Parse Claude's JSON response
    let claudeBooks: ClaudeBook[];
    try {
      const jsonMatch = claudeResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : claudeResponse;
      claudeBooks = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Failed to parse Claude similar books response:', parseError);
      return [{
        id: 'similar-parse-error',
        title: 'Similar Book Search Error',
        author: 'System Message',
        genre: ['Error'],
        rating: 0,
        description: `Could not parse similar book recommendations from Claude. Please try again or use the regular search feature.`,
        summary: 'Failed to get similar book suggestions.',
        score: 0,
        reasons: ['Parsing Error', 'Try again later']
      }];
    }

    // Convert Claude's response to BookRecommendation format
    const recommendations: BookRecommendation[] = claudeBooks.map((claudeBook, index) => ({
      id: `similar-${book.id}-${Date.now()}-${index}`,
      title: claudeBook.title,
      author: claudeBook.author,
      genre: claudeBook.genre || ['General'],
      rating: claudeBook.rating || 4.0,
      year: claudeBook.year,
      description: claudeBook.description || '',
      summary: claudeBook.description || '',
      score: 95 - index, // High scores for AI-curated similar books
      reasons: [`Similar to "${book.title}"`, claudeBook.reason || 'Claude AI recommendation']
    }));

    console.log(`🔍 Claude returned ${recommendations.length} similar books to "${book.title}":`, 
      recommendations.map(r => `"${r.title}" by ${r.author}`));

    return recommendations;

  } catch (error) {
    console.error('❌ Error getting similar books from Claude:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
    
    return [{
      id: 'similar-error',
      title: isNetworkError ? 'Network Error for Similar Books' : 'Similar Book Search Error',
      author: 'System Message',
      genre: ['Error'],
      rating: 0,
      description: isNetworkError 
        ? 'Unable to connect to Claude API for similar book suggestions. Please check your connection.'
        : `Error finding similar books: ${errorMessage}. Please try again or use the regular search.`,
      summary: 'Could not get similar book recommendations.',
      score: 0,
      reasons: ['API Error', 'Try regular search instead']
    }];
  }
};

// Fallback recommendations if Claude API fails
export const getFallbackClaudeRecommendations = (query: string): BookRecommendation[] => {
  console.log(`🔄 Using fallback recommendations for: "${query}"`);
  
  return [
    {
      id: 'fallback-1',
      title: 'The Seven Husbands of Evelyn Hugo',
      author: 'Taylor Jenkins Reid',
      genre: ['Contemporary Fiction', 'Romance'],
      rating: 4.3,
      year: 2017,
      description: 'A reclusive Hollywood icon reveals her secrets to a young journalist.',
      summary: 'Aging Hollywood icon Evelyn Hugo finally decides to tell her life story to unknown journalist Monique Grant.',
      score: 90,
      reasons: ['Popular recommendation', 'Highly rated']
    },
    {
      id: 'fallback-2', 
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      genre: ['Literary Fiction', 'Science Fiction'],
      rating: 4.1,
      year: 2021,
      description: 'An artificial friend observes the world with increasing wonder and understanding.',
      summary: 'From the perspective of Klara, an Artificial Friend, this novel looks at our changing world.',
      score: 88,
      reasons: ['Award-winning author', 'Unique perspective']
    },
    {
      id: 'fallback-3',
      title: 'The Midnight Library',
      author: 'Matt Haig', 
      genre: ['Literary Fiction', 'Philosophy'],
      rating: 4.2,
      year: 2020,
      description: 'Between life and death lies a library containing infinite possibilities.',
      summary: 'Nora Seed finds herself in a magical library between life and death, with books that let her live alternate lives.',
      score: 86,
      reasons: ['Thought-provoking', 'Popular choice']
    }
  ];
};