import type { Book } from '../types';

// Brookline Booksmith-style recommendations: Independent bookstore curated selections
// Based on their Top 100 Books and staff picks - mix of literary fiction, popular contemporary works, and diverse voices
// Representing the kind of thoughtful curation independent bookstores are known for
export const brooklineBooksmithRecommendations: Book[] = [
  // Confirmed from their Top 100 collection
  {
    id: 'bb-001',
    title: 'A Court of Thorns and Roses',
    author: 'Sarah J. Maas',
    genre: ['Fantasy', 'Romance', 'Young Adult'],
    rating: 4.2,
    year: 2015,
    description: 'A fantasy romance that has become a phenomenon, reimagining Beauty and the Beast in a fae world.',
    tags: [{ name: 'fantasy-romance', weight: 1.0 }, { name: 'fae', weight: 0.9 }, { name: 'bestseller', weight: 0.8 }]
  },
  {
    id: 'bb-002',
    title: 'Everything I Know About Love',
    author: 'Dolly Alderton',
    genre: ['Memoir', 'Humor', 'Contemporary'],
    rating: 4.1,
    year: 2018,
    description: 'A funny, heartfelt memoir about friendship, dating, and growing up in your twenties.',
    tags: [{ name: 'memoir', weight: 1.0 }, { name: 'friendship', weight: 0.9 }, { name: 'humor', weight: 0.8 }]
  },
  {
    id: 'bb-003',
    title: 'Crying in H Mart',
    author: 'Michelle Zauner',
    genre: ['Memoir', 'Food', 'Korean American'],
    rating: 4.4,
    year: 2021,
    description: 'A powerful memoir about grief, family, and Korean identity through the lens of food.',
    tags: [{ name: 'memoir', weight: 1.0 }, { name: 'korean-american', weight: 0.9 }, { name: 'food', weight: 0.8 }]
  },
  {
    id: 'bb-004',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: ['Fiction', 'Philosophy', 'Contemporary'],
    rating: 4.2,
    year: 2020,
    description: 'A thought-provoking novel about life\'s infinite possibilities and second chances.',
    tags: [{ name: 'philosophical', weight: 1.0 }, { name: 'life-choices', weight: 0.9 }, { name: 'uplifting', weight: 0.8 }]
  },
  {
    id: 'bb-005',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    genre: ['Historical Fiction', 'LGBTQ+', 'Hollywood'],
    rating: 4.5,
    year: 2017,
    description: 'A captivating novel about a reclusive Hollywood icon who finally decides to tell her story.',
    tags: [{ name: 'hollywood', weight: 1.0 }, { name: 'lgbtq', weight: 0.9 }, { name: 'secrets', weight: 0.8 }]
  },
  {
    id: 'bb-006',
    title: 'This Is How You Lose the Time War',
    author: 'Amal El-Mohtar, Max Gladstone',
    genre: ['Science Fiction', 'Romance', 'Epistolary'],
    rating: 4.0,
    year: 2019,
    description: 'A poetic science fiction love story told through letters between two time-traveling agents.',
    tags: [{ name: 'sci-fi-romance', weight: 1.0 }, { name: 'time-travel', weight: 0.9 }, { name: 'epistolary', weight: 0.8 }]
  },
  {
    id: 'bb-007',
    title: 'A Little Life',
    author: 'Hanya Yanagihara',
    genre: ['Literary Fiction', 'Contemporary', 'Friendship'],
    rating: 4.3,
    year: 2015,
    description: 'An epic novel about friendship, trauma, and the enduring bonds between four men.',
    tags: [{ name: 'literary', weight: 1.0 }, { name: 'friendship', weight: 0.9 }, { name: 'emotional', weight: 0.8 }]
  },
  {
    id: 'bb-008',
    title: 'The Heaven & Earth Grocery Store',
    author: 'James McBride',
    genre: ['Historical Fiction', 'African American', 'Community'],
    rating: 4.2,
    year: 2023,
    description: 'A rich novel about a Jewish family who owned a grocery store in a Black neighborhood in 1920s-1960s Baltimore.',
    tags: [{ name: 'historical', weight: 1.0 }, { name: 'community', weight: 0.9 }, { name: 'baltimore', weight: 0.7 }]
  },
  {
    id: 'bb-009',
    title: 'North Woods',
    author: 'Daniel Mason',
    genre: ['Literary Fiction', 'Historical', 'Nature'],
    rating: 4.1,
    year: 2023,
    description: 'A sweeping novel spanning centuries, told through the history of a single plot of land.',
    tags: [{ name: 'literary', weight: 1.0 }, { name: 'historical-sweep', weight: 0.9 }, { name: 'nature', weight: 0.8 }]
  },
  {
    id: 'bb-010',
    title: 'The Hundred Years\' War on Palestine',
    author: 'Rashid Khalidi',
    genre: ['Nonfiction', 'History', 'Middle East'],
    rating: 4.3,
    year: 2020,
    description: 'A powerful history of Palestinian displacement and resistance over the past century.',
    tags: [{ name: 'history', weight: 1.0 }, { name: 'middle-east', weight: 0.9 }, { name: 'political', weight: 0.8 }]
  },

  // Additional Independent Bookstore Style Recommendations
  {
    id: 'bb-011',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    genre: ['Literary Fiction', 'Gaming', 'Friendship'],
    rating: 4.3,
    year: 2022,
    description: 'A brilliant novel about friendship, art, and identity through the world of video game design.',
    tags: [{ name: 'gaming', weight: 1.0 }, { name: 'friendship', weight: 0.9 }, { name: 'art', weight: 0.8 }]
  },
  {
    id: 'bb-012',
    title: 'Hamnet',
    author: 'Maggie O\'Farrell',
    genre: ['Historical Fiction', 'Family', 'Literary'],
    rating: 4.4,
    year: 2020,
    description: 'A devastating novel about the death of Shakespeare\'s son and its impact on his family.',
    tags: [{ name: 'historical', weight: 1.0 }, { name: 'shakespeare', weight: 0.9 }, { name: 'family-grief', weight: 0.8 }]
  },
  {
    id: 'bb-013',
    title: 'The Vanishing Half',
    author: 'Brit Bennett',
    genre: ['Literary Fiction', 'African American', 'Family Saga'],
    rating: 4.2,
    year: 2020,
    description: 'A multi-generational saga about twin sisters who choose to live in different worlds.',
    tags: [{ name: 'family-saga', weight: 1.0 }, { name: 'racial-identity', weight: 0.9 }, { name: 'twins', weight: 0.7 }]
  },
  {
    id: 'bb-014',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    genre: ['Literary Fiction', 'Science Fiction', 'AI'],
    rating: 4.0,
    year: 2021,
    description: 'A poignant novel told from the perspective of an artificial friend observing human nature.',
    tags: [{ name: 'nobel-winner', weight: 1.0 }, { name: 'ai', weight: 0.9 }, { name: 'literary-sci-fi', weight: 0.8 }]
  },
  {
    id: 'bb-015',
    title: 'The Atlas Six',
    author: 'Olivie Blake',
    genre: ['Dark Academia', 'Fantasy', 'Magic'],
    rating: 4.0,
    year: 2022,
    description: 'Six magicians compete for a place in an ancient society in this dark academic fantasy.',
    tags: [{ name: 'dark-academia', weight: 1.0 }, { name: 'magic', weight: 0.9 }, { name: 'competition', weight: 0.8 }]
  },
  {
    id: 'bb-016',
    title: 'Mexican Gothic',
    author: 'Silvia Moreno-Garcia',
    genre: ['Gothic', 'Horror', 'Mystery'],
    rating: 4.1,
    year: 2020,
    description: 'A atmospheric gothic novel set in 1950s Mexico with supernatural elements.',
    tags: [{ name: 'gothic', weight: 1.0 }, { name: 'mexican', weight: 0.9 }, { name: 'supernatural', weight: 0.8 }]
  },
  {
    id: 'bb-017',
    title: 'Detransition, Baby',
    author: 'Torrey Peters',
    genre: ['Contemporary Fiction', 'LGBTQ+', 'Family'],
    rating: 4.1,
    year: 2021,
    description: 'A groundbreaking novel about trans identity, motherhood, and unconventional families.',
    tags: [{ name: 'lgbtq', weight: 1.0 }, { name: 'trans', weight: 0.9 }, { name: 'family', weight: 0.8 }]
  },
  {
    id: 'bb-018',
    title: 'The Invisible Bridge',
    author: 'Julie Orringer',
    genre: ['Historical Fiction', 'Jewish', 'WWII'],
    rating: 4.2,
    year: 2010,
    description: 'An epic novel about a Hungarian Jewish architecture student during WWII.',
    tags: [{ name: 'historical', weight: 1.0 }, { name: 'wwii', weight: 0.9 }, { name: 'jewish', weight: 0.8 }]
  },
  {
    id: 'bb-019',
    title: 'The Water Dancer',
    author: 'Ta-Nehisi Coates',
    genre: ['Historical Fiction', 'Magical Realism', 'Slavery'],
    rating: 4.0,
    year: 2019,
    description: 'A powerful novel blending history and fantasy to tell the story of slavery and freedom.',
    tags: [{ name: 'magical-realism', weight: 1.0 }, { name: 'slavery', weight: 0.9 }, { name: 'historical', weight: 0.8 }]
  },
  {
    id: 'bb-020',
    title: 'Normal People',
    author: 'Sally Rooney',
    genre: ['Literary Fiction', 'Contemporary', 'Romance'],
    rating: 4.1,
    year: 2018,
    description: 'A nuanced exploration of a complex relationship between two Irish teenagers.',
    tags: [{ name: 'literary', weight: 1.0 }, { name: 'irish', weight: 0.8 }, { name: 'coming-of-age', weight: 0.9 }]
  },
  {
    id: 'bb-021',
    title: 'Circe',
    author: 'Madeline Miller',
    genre: ['Mythology', 'Fantasy', 'Feminist'],
    rating: 4.3,
    year: 2018,
    description: 'A stunning retelling of the Greek myth of Circe, the witch of Aiaia.',
    tags: [{ name: 'mythology', weight: 1.0 }, { name: 'greek-myth', weight: 0.9 }, { name: 'feminist', weight: 0.8 }]
  },
  {
    id: 'bb-022',
    title: 'The Ten Thousand Doors of January',
    author: 'Alix E. Harrow',
    genre: ['Fantasy', 'Portal Fantasy', 'Historical'],
    rating: 4.2,
    year: 2019,
    description: 'A magical novel about doors to other worlds and the power of stories.',
    tags: [{ name: 'portal-fantasy', weight: 1.0 }, { name: 'magical', weight: 0.9 }, { name: 'doors', weight: 0.7 }]
  },
  {
    id: 'bb-023',
    title: 'The Poppy War',
    author: 'R.F. Kuang',
    genre: ['Fantasy', 'Military', 'Asian'],
    rating: 4.2,
    year: 2018,
    description: 'A grimdark military fantasy inspired by 20th-century China.',
    tags: [{ name: 'grimdark', weight: 1.0 }, { name: 'military-fantasy', weight: 0.9 }, { name: 'chinese', weight: 0.8 }]
  },
  {
    id: 'bb-024',
    title: 'Beloved',
    author: 'Toni Morrison',
    genre: ['Literary Fiction', 'Historical', 'African American'],
    rating: 4.1,
    year: 1987,
    description: 'A haunting masterpiece about the legacy of slavery and trauma.',
    tags: [{ name: 'nobel-winner', weight: 1.0 }, { name: 'slavery', weight: 0.9 }, { name: 'literary-classic', weight: 1.0 }]
  },
  {
    id: 'bb-025',
    title: 'Station Eleven',
    author: 'Emily St. John Mandel',
    genre: ['Post-Apocalyptic', 'Literary Fiction', 'Pandemic'],
    rating: 4.1,
    year: 2014,
    description: 'A beautiful novel about art, memory, and human connection after civilization\'s collapse.',
    tags: [{ name: 'post-apocalyptic', weight: 1.0 }, { name: 'literary', weight: 0.9 }, { name: 'art', weight: 0.8 }]
  },
  {
    id: 'bb-026',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    genre: ['Mythology', 'LGBTQ+', 'Historical'],
    rating: 4.4,
    year: 2011,
    description: 'A breathtaking retelling of the Iliad through the relationship between Achilles and Patroclus.',
    tags: [{ name: 'mythology', weight: 1.0 }, { name: 'lgbtq', weight: 0.9 }, { name: 'greek-myth', weight: 0.9 }]
  },
  {
    id: 'bb-027',
    title: 'Lessons in Chemistry',
    author: 'Bonnie Garmus',
    genre: ['Historical Fiction', 'Feminist', 'Humor'],
    rating: 4.4,
    year: 2022,
    description: 'A smart, funny novel about a 1960s scientist who becomes an unlikely cooking show star.',
    tags: [{ name: 'feminist', weight: 1.0 }, { name: 'science', weight: 0.8 }, { name: 'humor', weight: 0.9 }]
  },
  {
    id: 'bb-028',
    title: 'The Priory of the Orange Tree',
    author: 'Samantha Shannon',
    genre: ['High Fantasy', 'Dragons', 'Epic'],
    rating: 4.2,
    year: 2019,
    description: 'An epic standalone fantasy featuring dragons, magic, and multiple POV characters.',
    tags: [{ name: 'high-fantasy', weight: 1.0 }, { name: 'dragons', weight: 0.9 }, { name: 'epic', weight: 0.8 }]
  },
  {
    id: 'bb-029',
    title: 'The Power',
    author: 'Naomi Alderman',
    genre: ['Science Fiction', 'Feminist', 'Dystopian'],
    rating: 4.0,
    year: 2016,
    description: 'A speculative novel about women developing the power to generate electrical shocks.',
    tags: [{ name: 'feminist-sci-fi', weight: 1.0 }, { name: 'power-dynamics', weight: 0.9 }, { name: 'speculative', weight: 0.8 }]
  },
  {
    id: 'bb-030',
    title: 'Educated',
    author: 'Tara Westover',
    genre: ['Memoir', 'Education', 'Family'],
    rating: 4.5,
    year: 2018,
    description: 'A powerful memoir about education, family, and the struggle to break free from the past.',
    tags: [{ name: 'memoir', weight: 1.0 }, { name: 'education', weight: 0.9 }, { name: 'family-dysfunction', weight: 0.8 }]
  }
];

// Helper function to get Brookline Booksmith books by genre
export const getBrooklineBooksmithByGenre = (genre: string, limit: number = 5): Book[] => {
  const normalizedGenre = genre.toLowerCase().trim();
  
  return brooklineBooksmithRecommendations
    .filter(book => 
      book.genre.some(g => 
        g.toLowerCase().includes(normalizedGenre) || 
        normalizedGenre.includes(g.toLowerCase())
      )
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get highly rated Brookline Booksmith picks
export const getHighRatedBrooklineBooksmith = (minRating: number = 4.2, limit: number = 10): Book[] => {
  return brooklineBooksmithRecommendations
    .filter(book => book.rating >= minRating)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get recent Brookline Booksmith recommendations
export const getRecentBrooklineBooksmith = (yearsBack: number = 5, limit: number = 10): Book[] => {
  const currentYear = new Date().getFullYear();
  const cutoffYear = currentYear - yearsBack;
  
  return brooklineBooksmithRecommendations
    .filter(book => book.year >= cutoffYear)
    .sort((a, b) => b.year - a.year)
    .slice(0, limit);
};

// Helper function to get diverse voices (a specialty of independent bookstores)
export const getBrooklineBooksmithDiverseVoices = (limit: number = 10): Book[] => {
  return brooklineBooksmithRecommendations
    .filter(book => 
      book.tags?.some(tag => 
        tag.name.includes('african-american') ||
        tag.name.includes('lgbtq') ||
        tag.name.includes('korean-american') ||
        tag.name.includes('mexican') ||
        tag.name.includes('chinese') ||
        tag.name.includes('irish') ||
        tag.name.includes('jewish') ||
        tag.name.includes('trans')
      ) ||
      book.genre.some(g => 
        g.includes('African American') ||
        g.includes('LGBTQ+') ||
        g.includes('Korean American')
      )
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get literary fiction favorites
export const getBrooklineBooksmithLiterary = (limit: number = 8): Book[] => {
  return brooklineBooksmithRecommendations
    .filter(book => 
      book.genre.some(g => g.toLowerCase().includes('literary')) ||
      book.tags?.some(tag => tag.name.includes('literary'))
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get staff pick style recommendations (mix of popular + literary)
export const getBrooklineBooksmithStaffPicks = (limit: number = 10): Book[] => {
  // Get a mix of high-rated books across different genres
  const literary = getBrooklineBooksmithLiterary(3);
  const contemporary = getBrooklineBooksmithByGenre('contemporary', 2);
  const fantasy = getBrooklineBooksmithByGenre('fantasy', 2);
  const memoir = getBrooklineBooksmithByGenre('memoir', 2);
  const historical = getBrooklineBooksmithByGenre('historical', 1);
  
  const mixed = [...literary, ...contemporary, ...fantasy, ...memoir, ...historical];
  
  // Remove duplicates and return top rated
  const unique = mixed.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return unique
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};