const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 'http://localhost:5179', 'http://localhost:5180', 'http://localhost:5181', 'http://localhost:5182', 'http://localhost:5183', 'http://localhost:5184'], // Allow your frontend
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running!' });
});

// Book recommendations endpoint
app.post('/api/recommendations', async (req, res) => {
  try {
    const { query, userBooks = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`📚 Getting recommendations for: "${query}"`);

    // Build context about user's reading history
    const userLibraryContext = userBooks.length > 0 
      ? `\n\nUser's reading history for context:\n${userBooks.map(book => 
          `- "${book.title}" by ${book.author} (${book.genre?.join(', ') || 'No genre'}) - Rated: ${book.rating || 'N/A'}/5`
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
5. Publication year
6. Average rating based on public reviews (out of 5, with decimals like 4.3)
7. Cover image URL (use a real book cover URL from Open Library or similar)
8. Why you're recommending it (1 sentence)

Format your response as a JSON array of objects with these fields:
[
  {
    "title": "Book Title",
    "author": "Author Name", 
    "genre": ["Genre1", "Genre2"],
    "description": "Brief description",
    "year": 2020,
    "rating": 4.3,
    "coverUrl": "https://covers.openlibrary.org/b/isbn/[ISBN]-M.jpg",
    "reason": "Why this book fits the request"
  }
]

IMPORTANT: For coverUrl, use actual Open Library cover URLs. If you don't know the exact ISBN, use a placeholder like "https://covers.openlibrary.org/b/title/[URL-safe-title]-M.jpg" or use a generic book cover placeholder.

Focus on variety, quality, and relevance to their request. Only return the JSON array, no other text.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const claudeResponse = message.content[0].text;
    console.log('🤖 Claude response:', claudeResponse);

    // Parse Claude's JSON response
    let claudeBooks;
    try {
      // Extract JSON from Claude's response (in case there's extra text)
      const jsonMatch = claudeResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : claudeResponse;
      claudeBooks = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ Failed to parse Claude response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse Claude response',
        rawResponse: claudeResponse?.substring(0, 500)
      });
    }

    // Convert to our expected format
    const recommendations = claudeBooks.map((book, index) => ({
      id: `claude-${Date.now()}-${index}`,
      title: book.title,
      author: book.author,
      genre: book.genre || ['General'],
      rating: book.rating || 4.0,
      year: book.year,
      coverUrl: book.coverUrl || 'https://via.placeholder.com/150x225/cccccc/666666?text=No+Cover',
      description: book.description || '',
      summary: book.description || '',
      score: 95 - index,
      reasons: [book.reason || 'Claude recommendation', 'AI curated']
    }));

    console.log(`✅ Returning ${recommendations.length} recommendations`);
    res.json({ recommendations });

  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    
    // Return specific error messages
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid Claude API key' });
    } else if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    } else if (error.status === 400) {
      return res.status(400).json({ error: 'Invalid request to Claude API' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📚 Book recommendations API available at http://localhost:${PORT}/api/recommendations`);
});