import type { Book } from '../types';

export interface BookTag {
  name: string;
  category: 'genre' | 'theme' | 'setting' | 'mood' | 'length' | 'era' | 'style' | 'audience';
  confidence: number; // 0-1 score for how confident we are about this tag
}

export const generateAutomaticTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  // Add genre-based tags
  tags.push(...generateGenreTags(book));
  
  // Add content-based tags from title, author, summary
  tags.push(...generateContentTags(book));
  
  // Add metadata-based tags
  tags.push(...generateMetadataTags(book));
  
  // Add rating-based tags
  tags.push(...generateRatingTags(book));
  
  // Remove duplicates and sort by confidence
  const uniqueTags = deduplicateTags(tags);
  
  return uniqueTags
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12); // Limit to top 12 tags
};

const generateGenreTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  // Convert genres to standardized tags
  book.genre.forEach(genre => {
    const normalizedGenre = genre.toLowerCase().trim();
    
    // Main genre tags with higher confidence since they come from Google Books API
    tags.push({
      name: genre,
      category: 'genre',
      confidence: 0.95 // Higher confidence for Google Books categories
    });
    
    // Add sub-genre and theme tags based on genre
    const subTags = getSubGenreTags(normalizedGenre);
    tags.push(...subTags);
    
    // Add style/mood tags based on Google Books categories
    const styleMoodTags = getStyleMoodFromGenre(normalizedGenre);
    tags.push(...styleMoodTags);
  });
  
  return tags;
};

const getSubGenreTags = (genre: string): BookTag[] => {
  const subGenreMap: Record<string, BookTag[]> = {
    // FICTION GENRES
    'fantasy': [
      { name: 'Magic', category: 'theme', confidence: 0.8 },
      { name: 'Adventure', category: 'theme', confidence: 0.7 },
      { name: 'Epic', category: 'style', confidence: 0.6 },
      { name: 'Escapist', category: 'mood', confidence: 0.7 },
      { name: 'Worldbuilding', category: 'style', confidence: 0.8 }
    ],
    'high fantasy': [
      { name: 'Epic Fantasy', category: 'style', confidence: 0.9 },
      { name: 'Complex Worldbuilding', category: 'style', confidence: 0.8 },
      { name: 'Mythological', category: 'theme', confidence: 0.7 }
    ],
    'urban fantasy': [
      { name: 'Modern Setting', category: 'setting', confidence: 0.9 },
      { name: 'Magic Realism', category: 'style', confidence: 0.8 },
      { name: 'Contemporary', category: 'era', confidence: 0.8 }
    ],
    'science fiction': [
      { name: 'Technology', category: 'theme', confidence: 0.8 },
      { name: 'Future', category: 'setting', confidence: 0.8 },
      { name: 'Space', category: 'setting', confidence: 0.6 },
      { name: 'Speculative', category: 'style', confidence: 0.7 }
    ],
    'dystopian': [
      { name: 'Dark Future', category: 'setting', confidence: 0.9 },
      { name: 'Social Commentary', category: 'theme', confidence: 0.8 },
      { name: 'Bleak', category: 'mood', confidence: 0.8 },
      { name: 'Political', category: 'theme', confidence: 0.7 }
    ],
    'mystery': [
      { name: 'Crime', category: 'theme', confidence: 0.7 },
      { name: 'Investigation', category: 'theme', confidence: 0.8 },
      { name: 'Suspenseful', category: 'mood', confidence: 0.8 },
      { name: 'Plot-driven', category: 'style', confidence: 0.7 }
    ],
    'cozy mystery': [
      { name: 'Light Crime', category: 'theme', confidence: 0.8 },
      { name: 'Small Town', category: 'setting', confidence: 0.7 },
      { name: 'Charming', category: 'mood', confidence: 0.8 }
    ],
    'crime': [
      { name: 'Criminal Activity', category: 'theme', confidence: 0.9 },
      { name: 'Dark', category: 'mood', confidence: 0.7 },
      { name: 'Gritty', category: 'style', confidence: 0.8 }
    ],
    'true crime': [
      { name: 'Real Events', category: 'theme', confidence: 1.0 },
      { name: 'Investigation', category: 'theme', confidence: 0.9 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 },
      { name: 'Documentary Style', category: 'style', confidence: 0.8 }
    ],
    'noir': [
      { name: 'Dark Atmosphere', category: 'mood', confidence: 0.9 },
      { name: 'Urban Setting', category: 'setting', confidence: 0.8 },
      { name: 'Cynical', category: 'mood', confidence: 0.8 }
    ],
    'romance': [
      { name: 'Love', category: 'theme', confidence: 0.9 },
      { name: 'Relationships', category: 'theme', confidence: 0.8 },
      { name: 'Emotional', category: 'mood', confidence: 0.8 },
      { name: 'Character-driven', category: 'style', confidence: 0.7 }
    ],
    'historical romance': [
      { name: 'Period Romance', category: 'theme', confidence: 0.9 },
      { name: 'Historical Setting', category: 'setting', confidence: 0.9 },
      { name: 'Romantic', category: 'mood', confidence: 0.9 }
    ],
    'thriller': [
      { name: 'Suspenseful', category: 'mood', confidence: 0.9 },
      { name: 'Fast-paced', category: 'style', confidence: 0.8 },
      { name: 'Action', category: 'theme', confidence: 0.7 },
      { name: 'Edge-of-seat', category: 'mood', confidence: 0.8 }
    ],
    'psychological thriller': [
      { name: 'Mind Games', category: 'theme', confidence: 0.9 },
      { name: 'Psychological', category: 'style', confidence: 0.9 },
      { name: 'Disturbing', category: 'mood', confidence: 0.8 }
    ],
    'horror': [
      { name: 'Dark', category: 'mood', confidence: 0.9 },
      { name: 'Scary', category: 'mood', confidence: 0.9 },
      { name: 'Supernatural', category: 'theme', confidence: 0.6 },
      { name: 'Psychological', category: 'style', confidence: 0.6 }
    ],
    'gothic': [
      { name: 'Gothic Atmosphere', category: 'mood', confidence: 0.9 },
      { name: 'Dark Romance', category: 'theme', confidence: 0.7 },
      { name: 'Brooding', category: 'mood', confidence: 0.8 }
    ],
    'historical fiction': [
      { name: 'Period Setting', category: 'setting', confidence: 0.9 },
      { name: 'Historical', category: 'era', confidence: 0.9 },
      { name: 'Educational', category: 'style', confidence: 0.6 },
      { name: 'Immersive', category: 'mood', confidence: 0.7 }
    ],
    'literary fiction': [
      { name: 'Character Study', category: 'style', confidence: 0.9 },
      { name: 'Prose Style', category: 'style', confidence: 0.8 },
      { name: 'Thought-provoking', category: 'mood', confidence: 0.8 },
      { name: 'Artistic', category: 'style', confidence: 0.9 }
    ],
    'contemporary fiction': [
      { name: 'Modern Life', category: 'theme', confidence: 0.8 },
      { name: 'Present Day', category: 'era', confidence: 0.9 },
      { name: 'Relatable', category: 'mood', confidence: 0.7 }
    ],
    'young adult': [
      { name: 'Teen Protagonists', category: 'theme', confidence: 0.9 },
      { name: 'Coming of Age', category: 'theme', confidence: 0.8 },
      { name: 'YA Audience', category: 'audience', confidence: 1.0 }
    ],
    'bildungsroman': [
      { name: 'Coming of Age', category: 'theme', confidence: 1.0 },
      { name: 'Character Development', category: 'style', confidence: 0.9 },
      { name: 'Personal Growth', category: 'theme', confidence: 0.9 }
    ],
    'adventure': [
      { name: 'Action-packed', category: 'style', confidence: 0.8 },
      { name: 'Journey', category: 'theme', confidence: 0.8 },
      { name: 'Exciting', category: 'mood', confidence: 0.8 }
    ],
    'action': [
      { name: 'Fast-paced', category: 'style', confidence: 0.9 },
      { name: 'High Stakes', category: 'theme', confidence: 0.8 },
      { name: 'Thrilling', category: 'mood', confidence: 0.8 }
    ],
    'western': [
      { name: 'American West', category: 'setting', confidence: 0.9 },
      { name: 'Frontier Life', category: 'theme', confidence: 0.8 },
      { name: 'Rugged', category: 'mood', confidence: 0.7 }
    ],
    'war fiction': [
      { name: 'Military Conflict', category: 'theme', confidence: 0.9 },
      { name: 'Wartime', category: 'era', confidence: 0.9 },
      { name: 'Intense', category: 'mood', confidence: 0.8 }
    ],
    'satire': [
      { name: 'Social Criticism', category: 'theme', confidence: 0.9 },
      { name: 'Humorous', category: 'mood', confidence: 0.8 },
      { name: 'Satirical', category: 'style', confidence: 1.0 }
    ],
    'magical realism': [
      { name: 'Magical Elements', category: 'theme', confidence: 0.9 },
      { name: 'Realistic Setting', category: 'setting', confidence: 0.8 },
      { name: 'Dreamlike', category: 'mood', confidence: 0.8 }
    ],
    // NON-FICTION GENRES
    'biography': [
      { name: 'Real People', category: 'theme', confidence: 0.9 },
      { name: 'Inspirational', category: 'mood', confidence: 0.7 },
      { name: 'Educational', category: 'style', confidence: 0.8 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'autobiography': [
      { name: 'Personal Story', category: 'theme', confidence: 1.0 },
      { name: 'First Person', category: 'style', confidence: 1.0 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'memoir': [
      { name: 'Personal Journey', category: 'theme', confidence: 0.9 },
      { name: 'Reflective', category: 'mood', confidence: 0.8 },
      { name: 'Autobiographical', category: 'style', confidence: 0.9 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'self-help': [
      { name: 'Personal Development', category: 'theme', confidence: 0.9 },
      { name: 'Instructional', category: 'style', confidence: 0.9 },
      { name: 'Motivational', category: 'mood', confidence: 0.8 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'philosophy': [
      { name: 'Deep Thinking', category: 'theme', confidence: 0.9 },
      { name: 'Intellectual', category: 'mood', confidence: 0.8 },
      { name: 'Thought-provoking', category: 'mood', confidence: 0.9 },
      { name: 'Academic', category: 'audience', confidence: 0.7 }
    ],
    'history': [
      { name: 'Historical Events', category: 'theme', confidence: 0.9 },
      { name: 'Educational', category: 'style', confidence: 0.9 },
      { name: 'Informative', category: 'mood', confidence: 0.8 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'science': [
      { name: 'Scientific Concepts', category: 'theme', confidence: 0.9 },
      { name: 'Educational', category: 'style', confidence: 0.9 },
      { name: 'Informative', category: 'mood', confidence: 0.8 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'travel': [
      { name: 'Journey', category: 'theme', confidence: 0.9 },
      { name: 'Cultural Exploration', category: 'theme', confidence: 0.8 },
      { name: 'Descriptive', category: 'style', confidence: 0.8 },
      { name: 'Non-fiction', category: 'genre', confidence: 1.0 }
    ],
    'cookbook': [
      { name: 'Food & Cooking', category: 'theme', confidence: 1.0 },
      { name: 'Instructional', category: 'style', confidence: 0.9 },
      { name: 'Practical', category: 'mood', confidence: 0.8 }
    ],
    'business': [
      { name: 'Business Strategy', category: 'theme', confidence: 0.9 },
      { name: 'Professional', category: 'audience', confidence: 0.9 },
      { name: 'Instructional', category: 'style', confidence: 0.8 }
    ],
    'health': [
      { name: 'Wellness', category: 'theme', confidence: 0.9 },
      { name: 'Informative', category: 'style', confidence: 0.8 },
      { name: 'Helpful', category: 'mood', confidence: 0.8 }
    ],
    'religion': [
      { name: 'Spiritual', category: 'theme', confidence: 0.9 },
      { name: 'Faith-based', category: 'theme', confidence: 0.9 },
      { name: 'Contemplative', category: 'mood', confidence: 0.8 }
    ],
    'spirituality': [
      { name: 'Spiritual Growth', category: 'theme', confidence: 0.9 },
      { name: 'Reflective', category: 'mood', confidence: 0.8 },
      { name: 'Inspirational', category: 'mood', confidence: 0.8 }
    ]
  };
  
  return subGenreMap[genre] || [];
};

const getStyleMoodFromGenre = (genre: string): BookTag[] => {
  // Enhanced mappings based on Google Books categories to style/mood tags
  const styleMoodMap: Record<string, BookTag[]> = {
    // Google Books common categories mapped to style/mood
    'fiction': [
      { name: 'Narrative Fiction', category: 'style', confidence: 0.8 },
      { name: 'Character-driven', category: 'style', confidence: 0.7 }
    ],
    'literature': [
      { name: 'Literary Style', category: 'style', confidence: 0.9 },
      { name: 'Artistic Writing', category: 'style', confidence: 0.8 },
      { name: 'Contemplative', category: 'mood', confidence: 0.7 }
    ],
    'classics': [
      { name: 'Timeless', category: 'mood', confidence: 0.9 },
      { name: 'Traditional Narrative', category: 'style', confidence: 0.8 },
      { name: 'Enduring Themes', category: 'mood', confidence: 0.8 }
    ],
    'drama': [
      { name: 'Dramatic', category: 'mood', confidence: 0.9 },
      { name: 'Emotional Intensity', category: 'mood', confidence: 0.8 },
      { name: 'Character Study', category: 'style', confidence: 0.8 }
    ],
    'adventure': [
      { name: 'Adventurous', category: 'mood', confidence: 0.9 },
      { name: 'Action-oriented', category: 'style', confidence: 0.8 },
      { name: 'Exciting', category: 'mood', confidence: 0.8 }
    ],
    'humor': [
      { name: 'Humorous', category: 'mood', confidence: 0.9 },
      { name: 'Light-hearted', category: 'mood', confidence: 0.8 },
      { name: 'Comic Style', category: 'style', confidence: 0.8 }
    ],
    'juvenile fiction': [
      { name: 'Child-friendly', category: 'mood', confidence: 0.9 },
      { name: 'Educational', category: 'style', confidence: 0.7 },
      { name: 'Innocent', category: 'mood', confidence: 0.8 }
    ],
    'young adult fiction': [
      { name: 'Coming-of-age', category: 'mood', confidence: 0.9 },
      { name: 'Teen Themes', category: 'style', confidence: 0.8 },
      { name: 'Identity Focused', category: 'mood', confidence: 0.8 }
    ],
    'suspense': [
      { name: 'Suspenseful', category: 'mood', confidence: 0.9 },
      { name: 'Tension Building', category: 'style', confidence: 0.8 },
      { name: 'Edge-of-seat', category: 'mood', confidence: 0.8 }
    ],
    'thrillers': [
      { name: 'Thrilling', category: 'mood', confidence: 0.9 },
      { name: 'Fast-paced', category: 'style', confidence: 0.8 },
      { name: 'High Stakes', category: 'mood', confidence: 0.8 }
    ],
    'espionage': [
      { name: 'Spy Fiction', category: 'style', confidence: 0.9 },
      { name: 'International Intrigue', category: 'mood', confidence: 0.8 },
      { name: 'Covert Operations', category: 'style', confidence: 0.8 }
    ],
    'medical': [
      { name: 'Medical Drama', category: 'style', confidence: 0.9 },
      { name: 'Professional Setting', category: 'mood', confidence: 0.7 },
      { name: 'Life and Death', category: 'mood', confidence: 0.8 }
    ],
    'legal': [
      { name: 'Legal Drama', category: 'style', confidence: 0.9 },
      { name: 'Courtroom Tension', category: 'mood', confidence: 0.8 },
      { name: 'Justice Themes', category: 'mood', confidence: 0.8 }
    ],
    'contemporary': [
      { name: 'Modern Themes', category: 'mood', confidence: 0.8 },
      { name: 'Current Issues', category: 'style', confidence: 0.7 },
      { name: 'Relevant', category: 'mood', confidence: 0.7 }
    ],
    'historical': [
      { name: 'Period Atmosphere', category: 'mood', confidence: 0.9 },
      { name: 'Historical Detail', category: 'style', confidence: 0.8 },
      { name: 'Immersive', category: 'mood', confidence: 0.8 }
    ],
    'biographical': [
      { name: 'Life Story', category: 'style', confidence: 0.9 },
      { name: 'Inspirational', category: 'mood', confidence: 0.8 },
      { name: 'Personal Journey', category: 'mood', confidence: 0.8 }
    ],
    'poetry': [
      { name: 'Lyrical', category: 'style', confidence: 0.9 },
      { name: 'Poetic Language', category: 'style', confidence: 0.9 },
      { name: 'Emotional Expression', category: 'mood', confidence: 0.8 }
    ],
    'short stories': [
      { name: 'Episodic', category: 'style', confidence: 0.9 },
      { name: 'Varied Themes', category: 'mood', confidence: 0.7 },
      { name: 'Compact Narrative', category: 'style', confidence: 0.8 }
    ],
    'essays': [
      { name: 'Reflective', category: 'style', confidence: 0.9 },
      { name: 'Analytical', category: 'mood', confidence: 0.8 },
      { name: 'Thoughtful', category: 'mood', confidence: 0.8 }
    ],
    'criticism': [
      { name: 'Analytical', category: 'style', confidence: 0.9 },
      { name: 'Critical Thinking', category: 'mood', confidence: 0.8 },
      { name: 'Scholarly', category: 'style', confidence: 0.8 }
    ],
    'technology': [
      { name: 'Tech-focused', category: 'style', confidence: 0.8 },
      { name: 'Innovation Themes', category: 'mood', confidence: 0.7 },
      { name: 'Future-oriented', category: 'mood', confidence: 0.7 }
    ],
    'computers': [
      { name: 'Digital Age', category: 'mood', confidence: 0.8 },
      { name: 'Technical', category: 'style', confidence: 0.8 },
      { name: 'Information Technology', category: 'style', confidence: 0.7 }
    ],
    'reference': [
      { name: 'Informational', category: 'style', confidence: 0.9 },
      { name: 'Educational', category: 'mood', confidence: 0.8 },
      { name: 'Practical', category: 'mood', confidence: 0.8 }
    ],
    'study aids': [
      { name: 'Educational Tool', category: 'style', confidence: 0.9 },
      { name: 'Learning Support', category: 'mood', confidence: 0.8 },
      { name: 'Academic', category: 'style', confidence: 0.8 }
    ],
    'cooking': [
      { name: 'Culinary', category: 'style', confidence: 0.9 },
      { name: 'Practical Guide', category: 'mood', confidence: 0.8 },
      { name: 'Food Culture', category: 'mood', confidence: 0.7 }
    ],
    'crafts & hobbies': [
      { name: 'Creative', category: 'mood', confidence: 0.8 },
      { name: 'Hands-on', category: 'style', confidence: 0.8 },
      { name: 'Hobby Guide', category: 'mood', confidence: 0.8 }
    ],
    'health & fitness': [
      { name: 'Wellness Focus', category: 'mood', confidence: 0.8 },
      { name: 'Self-improvement', category: 'style', confidence: 0.8 },
      { name: 'Health Conscious', category: 'mood', confidence: 0.8 }
    ],
    'self-improvement': [
      { name: 'Personal Growth', category: 'mood', confidence: 0.9 },
      { name: 'Motivational', category: 'style', confidence: 0.8 },
      { name: 'Life Enhancement', category: 'mood', confidence: 0.8 }
    ],
    'nature': [
      { name: 'Natural World', category: 'mood', confidence: 0.8 },
      { name: 'Environmental', category: 'style', confidence: 0.7 },
      { name: 'Peaceful', category: 'mood', confidence: 0.7 }
    ],
    'travel': [
      { name: 'Wanderlust', category: 'mood', confidence: 0.8 },
      { name: 'Cultural Exploration', category: 'style', confidence: 0.8 },
      { name: 'Adventure Guide', category: 'mood', confidence: 0.7 }
    ],
    'transportation': [
      { name: 'Journey Focus', category: 'style', confidence: 0.7 },
      { name: 'Movement Themes', category: 'mood', confidence: 0.6 },
      { name: 'Technical Guide', category: 'style', confidence: 0.7 }
    ]
  };

  // Check for exact matches and partial matches
  const tags: BookTag[] = [];
  
  // Direct match
  if (styleMoodMap[genre]) {
    tags.push(...styleMoodMap[genre]);
  }
  
  // Partial matches for compound categories (e.g., "fiction / mystery")
  Object.keys(styleMoodMap).forEach(key => {
    if (genre.includes(key) || key.includes(genre)) {
      // Reduce confidence slightly for partial matches
      const partialTags = styleMoodMap[key].map(tag => ({
        ...tag,
        confidence: tag.confidence * 0.9
      }));
      tags.push(...partialTags);
    }
  });
  
  return tags;
};

const generateContentTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  const content = `${book.title} ${book.author} ${book.summary || ''} ${book.description || ''}`.toLowerCase();
  
  // Enhanced Theme-based keywords
  const themeKeywords = [
    // Relationships & Family
    { keywords: ['love', 'romance', 'relationship', 'marriage', 'wedding', 'courtship', 'passion'], tag: 'Romance', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['family', 'mother', 'father', 'parent', 'child', 'daughter', 'son', 'sibling', 'grandmother', 'grandfather'], tag: 'Family', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['friendship', 'friends', 'companion', 'ally', 'bond', 'loyalty'], tag: 'Friendship', category: 'theme' as const, confidence: 0.7 },
    
    // Conflict & Violence
    { keywords: ['war', 'battle', 'military', 'soldier', 'combat', 'warfare', 'conflict', 'army', 'navy'], tag: 'War', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['death', 'murder', 'kill', 'died', 'funeral', 'assassination', 'execution', 'violence'], tag: 'Death', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['crime', 'criminal', 'theft', 'robbery', 'fraud', 'conspiracy', 'investigation'], tag: 'Crime', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['revenge', 'vengeance', 'betrayal', 'deception', 'lies'], tag: 'Revenge', category: 'theme' as const, confidence: 0.7 },
    
    // Adventure & Journey
    { keywords: ['journey', 'travel', 'adventure', 'quest', 'expedition', 'voyage', 'exploration'], tag: 'Journey', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['survival', 'wilderness', 'stranded', 'lost', 'rescue'], tag: 'Survival', category: 'theme' as const, confidence: 0.8 },
    
    // Supernatural & Fantasy
    { keywords: ['magic', 'wizard', 'spell', 'enchant', 'magical', 'sorcery', 'witch', 'fairy'], tag: 'Magic', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['ghost', 'spirit', 'haunted', 'supernatural', 'paranormal', 'otherworldly'], tag: 'Supernatural', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['vampire', 'werewolf', 'monster', 'creature', 'beast'], tag: 'Monsters', category: 'theme' as const, confidence: 0.8 },
    
    // Technology & Science
    { keywords: ['technology', 'computer', 'robot', 'artificial', 'digital', 'cyber', 'internet'], tag: 'Technology', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['space', 'alien', 'extraterrestrial', 'spaceship', 'galaxy', 'planet'], tag: 'Space', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['time travel', 'future', 'past', 'dimension', 'parallel'], tag: 'Time Travel', category: 'theme' as const, confidence: 0.8 },
    
    // Society & Politics
    { keywords: ['politics', 'government', 'election', 'politician', 'democracy', 'power', 'corruption'], tag: 'Politics', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['revolution', 'rebellion', 'uprising', 'resistance', 'freedom'], tag: 'Revolution', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['class', 'poverty', 'wealth', 'inequality', 'social'], tag: 'Social Issues', category: 'theme' as const, confidence: 0.7 },
    
    // Personal Growth & Identity
    { keywords: ['identity', 'self-discovery', 'coming of age', 'growing up', 'maturity'], tag: 'Identity', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['redemption', 'forgiveness', 'second chance', 'atonement'], tag: 'Redemption', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['sacrifice', 'duty', 'honor', 'nobility', 'heroism'], tag: 'Heroism', category: 'theme' as const, confidence: 0.7 },
    
    // Culture & Society
    { keywords: ['religion', 'god', 'faith', 'church', 'spiritual', 'divine', 'prayer'], tag: 'Religion', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['culture', 'tradition', 'heritage', 'customs', 'ancestry'], tag: 'Culture', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['school', 'university', 'student', 'education', 'learning', 'teacher', 'professor'], tag: 'Education', category: 'theme' as const, confidence: 0.6 },
    
    // Mental & Emotional
    { keywords: ['madness', 'insanity', 'mental illness', 'psychology', 'trauma'], tag: 'Mental Health', category: 'theme' as const, confidence: 0.8 },
    { keywords: ['memory', 'amnesia', 'forgotten', 'remember', 'nostalgia'], tag: 'Memory', category: 'theme' as const, confidence: 0.7 },
    { keywords: ['secrets', 'mystery', 'hidden', 'concealed', 'truth'], tag: 'Secrets', category: 'theme' as const, confidence: 0.7 }
  ];
  
  // Enhanced Setting and Context keywords
  const settingKeywords = [
    // Major Cities
    { keywords: ['new york', 'manhattan', 'brooklyn', 'nyc'], tag: 'New York', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['london', 'england', 'british', 'uk'], tag: 'England', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['paris', 'france', 'french'], tag: 'France', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['tokyo', 'japan', 'japanese'], tag: 'Japan', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['rome', 'italy', 'italian'], tag: 'Italy', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['berlin', 'germany', 'german'], tag: 'Germany', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['moscow', 'russia', 'russian'], tag: 'Russia', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['beijing', 'china', 'chinese'], tag: 'China', category: 'setting' as const, confidence: 0.8 },
    
    // Regions & Countries
    { keywords: ['america', 'american', 'usa', 'united states'], tag: 'America', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['europe', 'european'], tag: 'Europe', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['africa', 'african'], tag: 'Africa', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['asia', 'asian'], tag: 'Asia', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['scandinavia', 'scandinavian', 'nordic', 'norway', 'sweden', 'denmark'], tag: 'Scandinavia', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['ireland', 'irish', 'scotland', 'scottish'], tag: 'Celtic', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['australia', 'australian'], tag: 'Australia', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['canada', 'canadian'], tag: 'Canada', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['india', 'indian'], tag: 'India', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['mexico', 'mexican', 'latin america'], tag: 'Latin America', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['middle east', 'arab', 'persian'], tag: 'Middle East', category: 'setting' as const, confidence: 0.8 },
    
    // Environment Types
    { keywords: ['space', 'planet', 'galaxy', 'universe', 'cosmic', 'spacecraft'], tag: 'Space', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['ocean', 'sea', 'underwater', 'submarine', 'island'], tag: 'Ocean', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['desert', 'sand', 'oasis', 'dunes'], tag: 'Desert', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['forest', 'woods', 'jungle', 'trees'], tag: 'Forest', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['mountain', 'mountains', 'peaks', 'alpine'], tag: 'Mountains', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['small town', 'rural', 'countryside', 'village', 'farming'], tag: 'Small Town', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['city', 'urban', 'metropolitan', 'downtown'], tag: 'Urban', category: 'setting' as const, confidence: 0.6 },
    { keywords: ['suburb', 'suburban', 'neighborhood'], tag: 'Suburban', category: 'setting' as const, confidence: 0.6 },
    
    // Specific Locations
    { keywords: ['school', 'college', 'university', 'academy'], tag: 'School Setting', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['hospital', 'medical', 'clinic'], tag: 'Medical Setting', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['prison', 'jail', 'cell', 'convict'], tag: 'Prison', category: 'setting' as const, confidence: 0.8 },
    { keywords: ['ship', 'boat', 'sailing', 'naval'], tag: 'Maritime', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['train', 'railway', 'station'], tag: 'Railway', category: 'setting' as const, confidence: 0.7 },
    { keywords: ['hotel', 'inn', 'tavern'], tag: 'Inn/Hotel', category: 'setting' as const, confidence: 0.6 },
    { keywords: ['mansion', 'estate', 'manor'], tag: 'Estate', category: 'setting' as const, confidence: 0.7 }
  ];
  
  // Enhanced Mood and Atmosphere keywords
  const moodKeywords = [
    // Dark & Gritty
    { keywords: ['dark', 'gritty', 'noir', 'bleak', 'grim', 'sinister', 'ominous'], tag: 'Dark', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['disturbing', 'unsettling', 'eerie', 'creepy', 'haunting'], tag: 'Disturbing', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['gothic', 'brooding', 'moody', 'atmospheric'], tag: 'Gothic', category: 'mood' as const, confidence: 0.8 },
    
    // Light & Positive
    { keywords: ['funny', 'humor', 'comedy', 'hilarious', 'witty', 'amusing', 'satirical'], tag: 'Humorous', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['uplifting', 'inspiring', 'hopeful', 'optimistic', 'heartwarming'], tag: 'Uplifting', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['whimsical', 'playful', 'lighthearted', 'charming'], tag: 'Whimsical', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['cozy', 'comfortable', 'warm', 'intimate'], tag: 'Cozy', category: 'mood' as const, confidence: 0.7 },
    
    // Emotional
    { keywords: ['sad', 'tragic', 'heartbreaking', 'melancholy', 'sorrowful'], tag: 'Melancholic', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['emotional', 'touching', 'moving', 'poignant'], tag: 'Emotional', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['romantic', 'passionate', 'sensual', 'tender'], tag: 'Romantic', category: 'mood' as const, confidence: 0.8 },
    
    // Intense & Suspenseful
    { keywords: ['intense', 'gripping', 'suspenseful', 'thrilling', 'exciting'], tag: 'Intense', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['mysterious', 'enigmatic', 'puzzling', 'cryptic'], tag: 'Mysterious', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['tense', 'anxiety', 'nerve-wracking', 'edge-of-seat'], tag: 'Tense', category: 'mood' as const, confidence: 0.8 },
    
    // Contemplative & Reflective
    { keywords: ['thoughtful', 'reflective', 'contemplative', 'philosophical'], tag: 'Contemplative', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['nostalgic', 'reminiscent', 'memories', 'past', 'bittersweet'], tag: 'Nostalgic', category: 'mood' as const, confidence: 0.7 },
    { keywords: ['dreamy', 'surreal', 'ethereal', 'otherworldly'], tag: 'Dreamy', category: 'mood' as const, confidence: 0.8 },
    
    // Calm & Serene
    { keywords: ['peaceful', 'calm', 'serene', 'gentle', 'tranquil'], tag: 'Peaceful', category: 'mood' as const, confidence: 0.7 },
    { keywords: ['meditative', 'zen', 'spiritual'], tag: 'Meditative', category: 'mood' as const, confidence: 0.7 },
    
    // Action & Adventure
    { keywords: ['action-packed', 'fast-paced', 'dynamic', 'energetic'], tag: 'Action-Packed', category: 'mood' as const, confidence: 0.8 },
    { keywords: ['adventurous', 'daring', 'bold', 'exciting'], tag: 'Adventurous', category: 'mood' as const, confidence: 0.8 }
  ];
  
  // Enhanced Era and Historical Context keywords
  const eraKeywords = [
    // Ancient Times
    { keywords: ['ancient', 'antiquity', 'classical', 'roman empire', 'greece'], tag: 'Ancient', category: 'era' as const, confidence: 0.9 },
    { keywords: ['medieval', 'middle ages', 'castle', 'knight', 'feudal'], tag: 'Medieval', category: 'era' as const, confidence: 0.8 },
    { keywords: ['renaissance', 'enlightenment', '15th century', '16th century'], tag: 'Renaissance', category: 'era' as const, confidence: 0.8 },
    
    // Modern Historical Periods
    { keywords: ['victorian', '19th century', '1800s', 'industrial revolution'], tag: 'Victorian Era', category: 'era' as const, confidence: 0.8 },
    { keywords: ['edwardian', 'early 1900s', '1910s'], tag: 'Edwardian Era', category: 'era' as const, confidence: 0.8 },
    { keywords: ['roaring twenties', '1920s', 'jazz age', 'prohibition'], tag: '1920s', category: 'era' as const, confidence: 0.9 },
    { keywords: ['great depression', '1930s', 'dust bowl'], tag: '1930s', category: 'era' as const, confidence: 0.9 },
    { keywords: ['wwii', 'world war', 'nazi', 'holocaust', '1940s'], tag: 'WWII Era', category: 'era' as const, confidence: 0.9 },
    { keywords: ['1950s', 'post-war', 'cold war'], tag: '1950s', category: 'era' as const, confidence: 0.8 },
    { keywords: ['1960s', 'sixties', 'counterculture', 'civil rights'], tag: '1960s', category: 'era' as const, confidence: 0.8 },
    { keywords: ['1970s', 'seventies', 'vietnam war'], tag: '1970s', category: 'era' as const, confidence: 0.8 },
    { keywords: ['1980s', 'eighties', 'reagan era'], tag: '1980s', category: 'era' as const, confidence: 0.8 },
    { keywords: ['1990s', 'nineties'], tag: '1990s', category: 'era' as const, confidence: 0.8 },
    { keywords: ['2000s', 'millennium', 'early 2000s'], tag: '2000s', category: 'era' as const, confidence: 0.8 },
    { keywords: ['contemporary', 'modern', 'present day', 'current'], tag: 'Contemporary', category: 'era' as const, confidence: 0.6 },
    { keywords: ['future', 'futuristic', 'dystopian future'], tag: 'Future', category: 'era' as const, confidence: 0.8 }
  ];
  
  // Writing Style keywords
  const styleKeywords = [
    { keywords: ['lyrical', 'poetic', 'beautiful prose', 'elegant writing'], tag: 'Lyrical', category: 'style' as const, confidence: 0.8 },
    { keywords: ['experimental', 'avant-garde', 'unconventional', 'innovative'], tag: 'Experimental', category: 'style' as const, confidence: 0.8 },
    { keywords: ['minimalist', 'sparse', 'concise', 'stripped-down'], tag: 'Minimalist', category: 'style' as const, confidence: 0.8 },
    { keywords: ['stream of consciousness', 'interior monologue'], tag: 'Stream of Consciousness', category: 'style' as const, confidence: 0.9 },
    { keywords: ['epistolary', 'letters', 'diary', 'documents'], tag: 'Epistolary', category: 'style' as const, confidence: 0.9 },
    { keywords: ['multiple perspectives', 'multiple narrators', 'alternating'], tag: 'Multiple POV', category: 'style' as const, confidence: 0.8 },
    { keywords: ['first person', 'narrator', 'personal voice'], tag: 'First Person', category: 'style' as const, confidence: 0.7 },
    { keywords: ['unreliable narrator', 'unreliable'], tag: 'Unreliable Narrator', category: 'style' as const, confidence: 0.9 }
  ];
  
  // Check for all keyword matches
  [...themeKeywords, ...settingKeywords, ...moodKeywords, ...eraKeywords, ...styleKeywords].forEach(({ keywords, tag, category, confidence }) => {
    const matchCount = keywords.filter(keyword => content.includes(keyword)).length;
    if (matchCount > 0) {
      tags.push({
        name: tag,
        category,
        confidence: Math.min(confidence + (matchCount - 1) * 0.1, 1.0)
      });
    }
  });
  
  return tags;
};

const generateMetadataTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  // Publication era tags
  if (book.year) {
    if (book.year >= 2020) {
      tags.push({ name: 'Recent Release', category: 'era', confidence: 1.0 });
    } else if (book.year >= 2010) {
      tags.push({ name: '2010s', category: 'era', confidence: 0.9 });
    } else if (book.year >= 2000) {
      tags.push({ name: '2000s', category: 'era', confidence: 0.9 });
    } else if (book.year >= 1990) {
      tags.push({ name: '1990s', category: 'era', confidence: 0.9 });
    } else if (book.year >= 1950) {
      tags.push({ name: 'Mid-20th Century', category: 'era', confidence: 0.8 });
    } else if (book.year >= 1900) {
      tags.push({ name: 'Early 20th Century', category: 'era', confidence: 0.8 });
    } else {
      tags.push({ name: 'Classic', category: 'era', confidence: 0.9 });
    }
  }
  
  // Author-based tags (for well-known authors)
  const authorTags = getAuthorTags(book.author);
  tags.push(...authorTags);
  
  return tags;
};

const getAuthorTags = (author: string): BookTag[] => {
  const authorLower = author.toLowerCase();
  const authorTagMap: Record<string, BookTag[]> = {
    // Horror & Thriller Masters
    'stephen king': [
      { name: 'Horror Master', category: 'style', confidence: 0.9 },
      { name: 'Psychological Horror', category: 'style', confidence: 0.8 },
      { name: 'Page-turner', category: 'style', confidence: 0.8 }
    ],
    'edgar allan poe': [
      { name: 'Gothic Horror', category: 'style', confidence: 0.9 },
      { name: 'Classic Literature', category: 'style', confidence: 0.9 },
      { name: 'Dark Atmosphere', category: 'mood', confidence: 0.9 }
    ],
    'gillian flynn': [
      { name: 'Psychological Thriller', category: 'style', confidence: 0.9 },
      { name: 'Unreliable Narrator', category: 'style', confidence: 0.8 },
      { name: 'Dark Psychology', category: 'theme', confidence: 0.8 }
    ],
    
    // Mystery & Crime Writers
    'agatha christie': [
      { name: 'Cozy Mystery', category: 'style', confidence: 0.9 },
      { name: 'Classic Detective', category: 'style', confidence: 0.9 },
      { name: 'Puzzle Plot', category: 'style', confidence: 0.8 }
    ],
    'arthur conan doyle': [
      { name: 'Classic Detective', category: 'style', confidence: 0.9 },
      { name: 'Victorian Setting', category: 'era', confidence: 0.9 },
      { name: 'Logical Deduction', category: 'theme', confidence: 0.8 }
    ],
    'raymond chandler': [
      { name: 'Hard-boiled', category: 'style', confidence: 0.9 },
      { name: 'Noir', category: 'mood', confidence: 0.9 },
      { name: 'Urban Crime', category: 'theme', confidence: 0.8 }
    ],
    'tana french': [
      { name: 'Literary Crime', category: 'style', confidence: 0.9 },
      { name: 'Atmospheric', category: 'mood', confidence: 0.8 },
      { name: 'Psychological Depth', category: 'style', confidence: 0.8 }
    ],
    
    // Fantasy & Sci-Fi Authors
    'j.k. rowling': [
      { name: 'Coming of Age', category: 'theme', confidence: 0.8 },
      { name: 'Young Adult', category: 'audience', confidence: 0.9 },
      { name: 'Magic School', category: 'setting', confidence: 0.9 }
    ],
    'george r.r. martin': [
      { name: 'Epic Fantasy', category: 'style', confidence: 0.9 },
      { name: 'Complex Plot', category: 'style', confidence: 0.8 },
      { name: 'Political Intrigue', category: 'theme', confidence: 0.8 }
    ],
    'j.r.r. tolkien': [
      { name: 'High Fantasy', category: 'style', confidence: 0.9 },
      { name: 'Mythological', category: 'theme', confidence: 0.9 },
      { name: 'Classic Fantasy', category: 'style', confidence: 0.9 }
    ],
    'ursula k. le guin': [
      { name: 'Literary Sci-Fi', category: 'style', confidence: 0.9 },
      { name: 'Philosophical', category: 'mood', confidence: 0.8 },
      { name: 'Social Commentary', category: 'theme', confidence: 0.8 }
    ],
    'isaac asimov': [
      { name: 'Hard Sci-Fi', category: 'style', confidence: 0.9 },
      { name: 'Technology Focus', category: 'theme', confidence: 0.9 },
      { name: 'Golden Age Sci-Fi', category: 'era', confidence: 0.8 }
    ],
    'philip k. dick': [
      { name: 'Paranoid Fiction', category: 'style', confidence: 0.9 },
      { name: 'Reality Questions', category: 'theme', confidence: 0.9 },
      { name: 'Psychological Sci-Fi', category: 'style', confidence: 0.8 }
    ],
    
    // Literary Fiction Masters
    'margaret atwood': [
      { name: 'Literary Fiction', category: 'style', confidence: 0.9 },
      { name: 'Feminist Themes', category: 'theme', confidence: 0.8 },
      { name: 'Speculative Fiction', category: 'style', confidence: 0.7 }
    ],
    'toni morrison': [
      { name: 'Literary Fiction', category: 'style', confidence: 0.9 },
      { name: 'African American Experience', category: 'theme', confidence: 0.9 },
      { name: 'Lyrical Prose', category: 'style', confidence: 0.9 }
    ],
    'haruki murakami': [
      { name: 'Surreal', category: 'style', confidence: 0.9 },
      { name: 'Magical Realism', category: 'style', confidence: 0.8 },
      { name: 'Philosophical', category: 'mood', confidence: 0.8 }
    ],
    'gabriel garcía márquez': [
      { name: 'Magical Realism', category: 'style', confidence: 1.0 },
      { name: 'Latin American', category: 'setting', confidence: 0.9 },
      { name: 'Lyrical', category: 'style', confidence: 0.9 }
    ],
    'vladimir nabokov': [
      { name: 'Literary Virtuosity', category: 'style', confidence: 0.9 },
      { name: 'Unreliable Narrator', category: 'style', confidence: 0.8 },
      { name: 'Linguistic Brilliance', category: 'style', confidence: 0.9 }
    ],
    
    // Contemporary Literary Authors
    'zadie smith': [
      { name: 'Contemporary Literary', category: 'style', confidence: 0.9 },
      { name: 'Multicultural', category: 'theme', confidence: 0.8 },
      { name: 'Social Commentary', category: 'theme', confidence: 0.8 }
    ],
    'donna tartt': [
      { name: 'Literary Fiction', category: 'style', confidence: 0.9 },
      { name: 'Coming of Age', category: 'theme', confidence: 0.8 },
      { name: 'Dense Prose', category: 'style', confidence: 0.8 }
    ],
    'elena ferrante': [
      { name: 'Psychological Realism', category: 'style', confidence: 0.9 },
      { name: 'Female Friendship', category: 'theme', confidence: 0.9 },
      { name: 'Italian Setting', category: 'setting', confidence: 0.8 }
    ],
    'kazuo ishiguro': [
      { name: 'Understated Style', category: 'style', confidence: 0.9 },
      { name: 'Memory Theme', category: 'theme', confidence: 0.8 },
      { name: 'Melancholic', category: 'mood', confidence: 0.8 }
    ],
    'salman rushdie': [
      { name: 'Magical Realism', category: 'style', confidence: 0.9 },
      { name: 'Postcolonial', category: 'theme', confidence: 0.8 },
      { name: 'Rich Imagery', category: 'style', confidence: 0.8 }
    ],
    
    // Historical Fiction Authors
    'hilary mantel': [
      { name: 'Historical Fiction', category: 'style', confidence: 0.9 },
      { name: 'Tudor England', category: 'setting', confidence: 0.9 },
      { name: 'Political Drama', category: 'theme', confidence: 0.8 }
    ],
    'ken follett': [
      { name: 'Historical Epic', category: 'style', confidence: 0.9 },
      { name: 'Sweeping Narrative', category: 'style', confidence: 0.8 },
      { name: 'Multiple Generations', category: 'theme', confidence: 0.8 }
    ],
    
    // Scandinavian/Nordic Noir
    'stieg larsson': [
      { name: 'Nordic Noir', category: 'style', confidence: 0.9 },
      { name: 'Crime Thriller', category: 'style', confidence: 0.9 },
      { name: 'Social Issues', category: 'theme', confidence: 0.8 }
    ],
    'henning mankell': [
      { name: 'Scandinavian Crime', category: 'style', confidence: 0.9 },
      { name: 'Police Procedural', category: 'style', confidence: 0.8 },
      { name: 'Social Realism', category: 'theme', confidence: 0.8 }
    ],
    
    // Romance Authors
    'jane austen': [
      { name: 'Regency Romance', category: 'style', confidence: 0.9 },
      { name: 'Social Commentary', category: 'theme', confidence: 0.8 },
      { name: 'Classic Literature', category: 'style', confidence: 0.9 }
    ],
    'nora roberts': [
      { name: 'Contemporary Romance', category: 'style', confidence: 0.9 },
      { name: 'Series Fiction', category: 'style', confidence: 0.8 },
      { name: 'Escapist', category: 'mood', confidence: 0.7 }
    ],
    
    // Non-fiction Authors
    'malcolm gladwell': [
      { name: 'Popular Science', category: 'style', confidence: 0.9 },
      { name: 'Accessible Non-fiction', category: 'style', confidence: 0.8 },
      { name: 'Psychology', category: 'theme', confidence: 0.8 }
    ],
    'bill bryson': [
      { name: 'Humorous Non-fiction', category: 'style', confidence: 0.9 },
      { name: 'Travel Writing', category: 'theme', confidence: 0.8 },
      { name: 'Educational', category: 'mood', confidence: 0.8 }
    ]
  };
  
  // Check for partial matches
  for (const [authorName, tags] of Object.entries(authorTagMap)) {
    if (authorLower.includes(authorName) || authorName.includes(authorLower)) {
      return tags;
    }
  }
  
  return [];
};

const generateRatingTags = (book: Book): BookTag[] => {
  const tags: BookTag[] = [];
  
  if (book.rating >= 5) {
    tags.push({ name: 'Favorite', category: 'mood', confidence: 1.0 });
  } else if (book.rating >= 4) {
    tags.push({ name: 'Highly Rated', category: 'mood', confidence: 0.9 });
  } else if (book.rating <= 2) {
    tags.push({ name: 'Disappointing', category: 'mood', confidence: 0.8 });
  }
  
  return tags;
};

const deduplicateTags = (tags: BookTag[]): BookTag[] => {
  const tagMap = new Map<string, BookTag>();
  
  tags.forEach(tag => {
    const existing = tagMap.get(tag.name);
    if (!existing || tag.confidence > existing.confidence) {
      tagMap.set(tag.name, tag);
    }
  });
  
  return Array.from(tagMap.values());
};

// Function to generate tags for multiple books
export const generateTagsForBooks = async (books: Book[]): Promise<Map<string, BookTag[]>> => {
  const bookTags = new Map<string, BookTag[]>();
  
  books.forEach(book => {
    const tags = generateAutomaticTags(book);
    bookTags.set(book.id, tags);
  });
  
  return bookTags;
};

// Get all unique tags across books for filtering
export const getAllUniqueTags = (books: Book[]): string[] => {
  const allTags = new Set<string>();
  
  books.forEach(book => {
    if (book.tags) {
      book.tags.forEach(tag => allTags.add(tag.name));
    }
  });
  
  return Array.from(allTags).sort();
};

// Filter books by tags
export const filterBooksByTags = (books: Book[], selectedTags: string[]): Book[] => {
  if (selectedTags.length === 0) return books;
  
  return books.filter(book => {
    if (!book.tags) return false;
    const bookTagNames = book.tags.map(tag => tag.name);
    return selectedTags.some(selectedTag => bookTagNames.includes(selectedTag));
  });
};

// Get category description for UI display
export const getCategoryDescription = (category: BookTag['category']): string => {
  const descriptions = {
    'genre': 'Literary genres and subgenres',
    'theme': 'Story themes and subjects',
    'setting': 'Geographic and environmental settings',
    'mood': 'Emotional atmosphere and tone',
    'length': 'Book length and format',
    'era': 'Time periods and historical contexts',
    'style': 'Writing styles and narrative techniques',
    'audience': 'Target readership'
  };
  
  return descriptions[category] || category;
};

// Get all tags grouped by category for better UI organization
export const getTagsByCategory = (books: Book[]): Record<string, string[]> => {
  const tagsByCategory: Record<string, Set<string>> = {};
  
  books.forEach(book => {
    if (book.tags) {
      book.tags.forEach(tag => {
        if (!tagsByCategory[tag.category]) {
          tagsByCategory[tag.category] = new Set();
        }
        tagsByCategory[tag.category].add(tag.name);
      });
    }
  });
  
  // Convert Sets to sorted arrays
  const result: Record<string, string[]> = {};
  Object.keys(tagsByCategory).forEach(category => {
    result[category] = Array.from(tagsByCategory[category]).sort();
  });
  
  return result;
};

// Enhanced tag statistics
export const getTagStatistics = (books: Book[]): Array<{tag: string, category: string, count: number, confidence: number}> => {
  const tagStats = new Map<string, {category: string, count: number, totalConfidence: number}>();
  
  books.forEach(book => {
    if (book.tags) {
      book.tags.forEach(tag => {
        const existing = tagStats.get(tag.name);
        if (existing) {
          existing.count += 1;
          existing.totalConfidence += tag.confidence;
        } else {
          tagStats.set(tag.name, {
            category: tag.category,
            count: 1,
            totalConfidence: tag.confidence
          });
        }
      });
    }
  });
  
  return Array.from(tagStats.entries())
    .map(([tag, stats]) => ({
      tag,
      category: stats.category,
      count: stats.count,
      confidence: stats.totalConfidence / stats.count
    }))
    .sort((a, b) => b.count - a.count || b.confidence - a.confidence);
};