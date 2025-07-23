# Book Recommendations Web App

A personalized book recommendation system that helps you discover new books based on your reading history and preferences.

**Created by:** Adrian Calvo

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

### 🔍 Smart Search
- Natural language search queries (e.g., "fantasy books like Harry Potter")
- Search by mood, genre, author, or similarity to other books
- Intelligent autocomplete and search suggestions
- Filter recommendations based on specific criteria

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
- **APIs:** Open Library, Google Books API
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

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be available in the `dist/` directory.

## Usage

1. **Add Books:** Start by adding books you've read using the form or import from Goodreads
2. **Rate & Review:** Give books ratings (including half-stars) and add personal notes
3. **Get Recommendations:** Click "Get Recommendations" to see personalized suggestions
4. **Smart Search:** Use the search bar to find books by mood, genre, or similarity
5. **Manage Library:** Edit tags, summaries, and notes to improve future recommendations

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