import type { Book, BookTag } from '../types';

// Helper function to create BookTag from string
const createTag = (name: string, category: BookTag['category'] = 'theme', confidence: number = 0.8): BookTag => ({
  name,
  category,
  confidence
});

// Curated list of acclaimed books from the 21st century
// Based on various "Best Books of the 21st Century" lists from major publications
export const bestBooks21stCentury: Book[] = [
  {
    id: 'best21-1',
    title: 'The Corrections',
    author: 'Jonathan Franzen',
    genre: ['Literary Fiction', 'Family Drama'],
    rating: 4.1,
    year: 2001,
    summary: 'A darkly hilarious epic about the breakdown of the American middle-class family.',
    tags: [createTag('acclaimed', 'style', 0.9), createTag('family-saga'), createTag('social-commentary')]
  },
  {
    id: 'best21-2',
    title: 'Austerlitz',
    author: 'W. G. Sebald',
    genre: ['Literary Fiction', 'Historical Fiction'],
    rating: 4.3,
    year: 2001,
    summary: 'A haunting meditation on memory, history, and the Holocaust.',
    tags: [createTag('experimental', 'style'), createTag('historical'), createTag('philosophical')]
  },
  {
    id: 'best21-3',
    title: 'Gilead',
    author: 'Marilynne Robinson',
    genre: ['Literary Fiction', 'Religious Fiction'],
    rating: 4.2,
    year: 2004,
    summary: 'A luminous novel about faith, family, and forgiveness in small-town Iowa.',
    tags: [createTag('spiritual'), createTag('contemplative', 'mood'), createTag('pulitzer-winner', 'style', 0.9)]
  },
  {
    id: 'best21-4',
    title: 'Never Let Me Go',
    author: 'Kazuo Ishiguro',
    genre: ['Literary Fiction', 'Science Fiction', 'Dystopian'],
    rating: 4.1,
    year: 2005,
    summary: 'A haunting tale of love, loss, and what makes us human.',
    tags: [createTag('dystopian', 'genre'), createTag('emotional', 'mood'), createTag('speculative', 'genre')]
  },
  {
    id: 'best21-5',
    title: 'The Road',
    author: 'Cormac McCarthy',
    genre: ['Literary Fiction', 'Post-Apocalyptic', 'Dystopian'],
    rating: 4.0,
    year: 2006,
    summary: 'A father and son journey through a post-apocalyptic wasteland.',
    tags: [createTag('post-apocalyptic', 'setting'), createTag('survival'), createTag('pulitzer-winner', 'style', 0.9)]
  },
  {
    id: 'best21-6',
    title: 'Middlesex',
    author: 'Jeffrey Eugenides',
    genre: ['Literary Fiction', 'Coming of Age'],
    rating: 4.2,
    year: 2002,
    summary: 'An epic tale of genetics, identity, and the American immigrant experience.',
    tags: [createTag('identity'), createTag('family-saga'), createTag('pulitzer-winner', 'style', 0.9)]
  },
  {
    id: 'best21-7',
    title: 'Cloud Atlas',
    author: 'David Mitchell',
    genre: ['Literary Fiction', 'Science Fiction', 'Historical Fiction'],
    rating: 4.2,
    year: 2004,
    summary: 'Six interconnected stories spanning centuries in this ambitious novel.',
    tags: [createTag('ambitious', 'style'), createTag('interconnected', 'style'), createTag('genre-bending', 'style')]
  },
  {
    id: 'best21-8',
    title: 'The Amazing Adventures of Kavalier & Clay',
    author: 'Michael Chabon',
    genre: ['Literary Fiction', 'Historical Fiction'],
    rating: 4.3,
    year: 2000,
    summary: 'The golden age of comic books through the lives of two young artists.',
    tags: [createTag('comics'), createTag('historical'), createTag('pulitzer-winner', 'style', 0.9)]
  },
  {
    id: 'best21-9',
    title: 'Atonement',
    author: 'Ian McEwan',
    genre: ['Literary Fiction', 'Historical Fiction', 'Romance'],
    rating: 4.1,
    year: 2001,
    summary: 'A devastating exploration of guilt, memory, and the power of imagination.',
    tags: [createTag('psychological', 'mood'), createTag('war', 'setting'), createTag('guilt')]
  },
  {
    id: 'best21-10',
    title: 'Life of Pi',
    author: 'Yann Martel',
    genre: ['Adventure', 'Philosophical Fiction', 'Survival'],
    rating: 3.9,
    year: 2001,
    summary: 'A young man survives 227 days stranded on a lifeboat with a Bengal tiger.',
    tags: [createTag('survival'), createTag('philosophical'), createTag('adventure', 'genre')]
  },
  {
    id: 'best21-11',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    genre: ['Literary Fiction', 'Historical Fiction'],
    rating: 4.3,
    year: 2003,
    summary: 'A powerful story of friendship, guilt, and redemption in Afghanistan.',
    tags: [createTag('afghanistan', 'setting'), createTag('friendship'), createTag('redemption')]
  },
  {
    id: 'best21-12',
    title: 'White Teeth',
    author: 'Zadie Smith',
    genre: ['Literary Fiction', 'Multicultural'],
    rating: 4.0,
    year: 2000,
    summary: 'A vibrant portrait of multicultural London through three families.',
    tags: [createTag('multicultural'), createTag('london', 'setting'), createTag('generational')]
  },
  {
    id: 'best21-13',
    title: 'The Brief Wondrous Life of Oscar Wao',
    author: 'Junot Díaz',
    genre: ['Literary Fiction', 'Coming of Age'],
    rating: 4.1,
    year: 2007,
    summary: 'A Dominican-American family saga spanning generations.',
    tags: [createTag('dominican', 'setting'), createTag('family'), createTag('pulitzer-winner', 'style', 0.9)]
  },
  {
    id: 'best21-14',
    title: 'Persepolis',
    author: 'Marjane Satrapi',
    genre: ['Graphic Novel', 'Memoir', 'Historical'],
    rating: 4.4,
    year: 2000,
    summary: 'A graphic memoir of growing up during the Iranian Revolution.',
    tags: [createTag('graphic-novel', 'style'), createTag('iran', 'setting'), createTag('memoir', 'genre')]
  },
  {
    id: 'best21-15',
    title: 'Beloved',
    author: 'Toni Morrison',
    genre: ['Literary Fiction', 'Historical Fiction', 'Magical Realism'],
    rating: 4.1,
    year: 1987,
    summary: 'A haunting tale of slavery and its aftermath in post-Civil War Ohio.',
    tags: [createTag('slavery', 'setting'), createTag('magical-realism', 'style'), createTag('nobel-winner', 'style', 0.9)]
  },
  {
    id: 'best21-16',
    title: 'The Handmaid\'s Tale',
    author: 'Margaret Atwood',
    genre: ['Dystopian', 'Science Fiction', 'Feminist'],
    rating: 4.1,
    year: 1985,
    summary: 'A chilling vision of a totalitarian future where women have no rights.',
    tags: [createTag('dystopian', 'genre'), createTag('feminist'), createTag('totalitarian', 'setting')]
  },
  {
    id: 'best21-17',
    title: 'Everything Is Illuminated',
    author: 'Jonathan Safran Foer',
    genre: ['Literary Fiction', 'Historical Fiction'],
    rating: 4.0,
    year: 2002,
    summary: 'A young man searches for the woman who saved his grandfather during WWII.',
    tags: [createTag('holocaust', 'setting'), createTag('family-history'), createTag('experimental', 'style')]
  },
  {
    id: 'best21-18',
    title: 'The Time Traveler\'s Wife',
    author: 'Audrey Niffenegger',
    genre: ['Romance', 'Science Fiction', 'Contemporary'],
    rating: 4.0,
    year: 2003,
    summary: 'A love story between a man with a genetic disorder that causes time travel.',
    tags: [createTag('time-travel', 'genre'), createTag('romance', 'genre'), createTag('unconventional', 'style')]
  },
  {
    id: 'best21-19',
    title: 'The God of Small Things',
    author: 'Arundhati Roy',
    genre: ['Literary Fiction', 'Family Drama'],
    rating: 4.0,
    year: 1997,
    summary: 'A lyrical exploration of family secrets in Kerala, India.',
    tags: [createTag('india', 'setting'), createTag('family-secrets'), createTag('booker-winner', 'style', 0.9)]
  },
  {
    id: 'best21-20',
    title: 'A Visit from the Goon Squad',
    author: 'Jennifer Egan',
    genre: ['Literary Fiction', 'Music'],
    rating: 3.9,
    year: 2010,
    summary: 'Interconnected stories about music, time, and the passage of life.',
    tags: [createTag('music'), createTag('interconnected', 'style'), createTag('pulitzer-winner', 'style', 0.9)]
  },
  {
    id: 'best21-21',
    title: 'The Curious Incident of the Dog in the Night-Time',
    author: 'Mark Haddon',
    genre: ['Mystery', 'Coming of Age', 'Contemporary'],
    rating: 4.0,
    year: 2003,
    summary: 'A mystery novel narrated by a teenager with autism.',
    tags: [createTag('autism'), createTag('mystery', 'genre'), createTag('unique-perspective', 'style')]
  },
  {
    id: 'best21-22',
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    genre: ['Literary Fiction', 'Romance', 'Coming of Age'],
    rating: 4.0,
    year: 1987,
    summary: 'A nostalgic story of love and loss in 1960s Tokyo.',
    tags: [createTag('japan', 'setting'), createTag('nostalgia', 'mood'), createTag('coming-of-age')]
  },
  {
    id: 'best21-23',
    title: 'The Lovely Bones',
    author: 'Alice Sebold',
    genre: ['Literary Fiction', 'Mystery', 'Supernatural'],
    rating: 3.8,
    year: 2002,
    summary: 'A murdered girl watches from heaven as her family deals with her death.',
    tags: [createTag('afterlife', 'setting'), createTag('family'), createTag('grief', 'mood')]
  },
  {
    id: 'best21-24',
    title: 'Interpreter of Maladies',
    author: 'Jhumpa Lahiri',
    genre: ['Short Stories', 'Literary Fiction', 'Cultural'],
    rating: 4.1,
    year: 1999,
    summary: 'Nine stories exploring the Indian immigrant experience in America.',
    tags: [createTag('immigration'), createTag('cultural-identity'), createTag('pulitzer-winner', 'style', 0.9)]
  },
  {
    id: 'best21-25',
    title: 'The Underground Railroad',
    author: 'Colson Whitehead',
    genre: ['Historical Fiction', 'Literary Fiction'],
    rating: 4.1,
    year: 2016,
    summary: 'A literal underground railroad helps slaves escape in this powerful reimagining.',
    tags: [createTag('slavery', 'setting'), createTag('historical'), createTag('pulitzer-winner', 'style', 0.9)]
  }
];

// Function to get a random selection of best books
export const getBest21stCenturyBooks = (count: number = 10, excludeIds: string[] = []): Book[] => {
  const availableBooks = bestBooks21stCentury.filter(book => !excludeIds.includes(book.id));
  
  // Shuffle and return requested count
  const shuffled = [...availableBooks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Function to get books by genre from the best books list
export const getBest21stCenturyBooksByGenre = (genre: string, count: number = 5): Book[] => {
  const matchingBooks = bestBooks21stCentury.filter(book => 
    book.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
  );
  
  return matchingBooks.slice(0, count);
};

// Function to get highly rated books from the 21st century collection
export const getHighlyRatedBest21stCentury = (minRating: number = 4.0, count: number = 10): Book[] => {
  const highlyRated = bestBooks21stCentury
    .filter(book => book.rating >= minRating)
    .sort((a, b) => b.rating - a.rating);
    
  return highlyRated.slice(0, count);
};

// Function to get award-winning books from the collection
export const getAwardWinningBest21stCentury = (count: number = 8): Book[] => {
  const awardWinners = bestBooks21stCentury.filter(book => 
    book.tags?.some(tag => 
      tag.name.includes('pulitzer') || 
      tag.name.includes('nobel') || 
      tag.name.includes('booker')
    )
  );
  
  return awardWinners.slice(0, count);
};