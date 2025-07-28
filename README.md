# Book Recommendations Web App

A personalized book recommendation system that helps you discover new books based on your reading history and preferences.

**Created by:** Adrian Calvo Valderrama

## Features

### 📚 Personal Library Management
- Track books you've read with detailed information
- Half-star rating system (0.5 increments) for precise ratings
- Add personal summaries and notes for each book
- Edit book information, tags, and descriptions
- Book cover fetching from multiple sources

### 🤖 AI-Powered Recommendations
- Get personalized book suggestions based on your reading history
- Intelligent scoring system (0-100%) indicating likelihood you'll enjoy each book
- Content-based filtering using genres, themes, and reading patterns
- Refresh suggestions to discover completely new recommendations

### 🔍 Claude AI-Powered Search & Similar Books
- **Claude.ai Integration:** Ask Claude directly for book recommendations using natural language
- **Similar Book Suggestions:** Click "Suggest a similar book" on any book card to get AI-powered similar recommendations
- Interactive AI chat for personalized book discovery
- Natural language queries (e.g., "I want something dark and psychological like Gone Girl")
- Claude understands your reading history and preferences
- Intelligent conversation with follow-up questions and suggestions

### 📊 Import & Export
- Import your reading history from Goodreads CSV exports
- Automatic book enhancement with summaries and metadata
- Preserve your existing ratings and reading dates

### 🏷️ Automatic Tagging
- AI-generated tags for genres, themes, moods, and settings
- Editable tag system - add, modify, or remove tags
- Smart categorization (genre, theme, setting, mood, etc.)
- Improves recommendation accuracy over time

### ➕ Add Recommended Books
- Add books from recommendations directly to your library
- Rate and add notes when adding recommended books
- Prevent duplicate additions with smart detection

## Technology Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** CSS3 with Flexbox/Grid
- **Storage:** Browser localStorage
- **APIs:** Claude.ai API, Google Books API, Open Library
- **AI:** Claude-3-Sonnet for natural language book recommendations
- **Book Data:** Goodreads-compatible CSV format

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/adcalvoval/book-recommendations.git
cd book-recommendations
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys (optional but recommended):
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys:
# VITE_CLAUDE_API_KEY=your_claude_api_key_here
# VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
```

**Get your Claude API key:** Visit [Anthropic Console](https://console.anthropic.com/) to get your Claude API key for AI-powered search.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Claude.ai Setup (Recommended)

To use the AI-powered search feature:

1. **Get API Key:** Sign up at [Anthropic Console](https://console.anthropic.com/)
2. **Add to Environment:** Add your API key to the `.env` file:
   ```
   VITE_CLAUDE_API_KEY=your_actual_api_key_here
   ```
3. **Restart Dev Server:** After adding the API key, restart your development server

**Without Claude API:** The app will still work and use fallback recommendations from curated book lists.

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist/` directory.

## Usage

1. **Add Books:** Start by adding books you've read using the form or import from Goodreads
2. **Rate & Review:** Give books ratings (including half-stars) and add personal notes
3. **Get Recommendations:** Click "Get Recommendations" to see personalized suggestions
4. **Ask Claude:** Use the AI-powered search to ask Claude for recommendations in natural language
   - "I want something like The Seven Husbands of Evelyn Hugo"
   - "Recommend me 5 sci-fi books similar to Dune"
   - "What should I read if I want something dark and psychological?"
5. **Find Similar Books:** Click the "🔍 Suggest a similar book" button on any book in your library to get AI-powered similar recommendations
6. **Manage Library:** Edit tags, summaries, and notes to improve future recommendations

## File Structure

```
src/
├── components/          # React components
│   ├── BookForm.tsx    # Add new books form
│   ├── BookList.tsx    # Display user's library
│   ├── StarRating.tsx  # Half-star rating component
│   ├── SmartSearch.tsx # Intelligent search bar
│   └── ...
├── utils/              # Utility functions
│   ├── recommendations.ts  # Recommendation algorithm
│   ├── claudeRecommendations.ts # Claude AI integration
│   ├── searchRecommendations.ts # Search filtering
│   ├── csvParser.ts    # Goodreads import
│   └── ...
├── types.ts            # TypeScript interfaces
└── App.tsx            # Main application component
```

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Created by Adrian Calvo** - A personalized book discovery platform built with modern web technologies.
