import type { Book } from '../types';

// New Yorker-style literary recommendations: critically acclaimed books from 2022-2024
// Based on major award winners (Pulitzer, Booker, National Book Award, etc.)
// Curated for literary quality and cultural significance
export const newYorkerStyleBestBooks: Book[] = [
  // 2024 Award Winners
  {
    id: 'ny-2024-1',
    title: 'Orbital',
    author: 'Samantha Harvey',
    genre: ['Literary Fiction', 'Science Fiction', 'Contemporary'],
    rating: 4.2,
    year: 2024,
    description: 'A dreamy space station drama with lush and beautiful writing. Winner of the 2024 Booker Prize.',
    tags: [{ name: 'booker-winner', weight: 1.0 }, { name: 'literary', weight: 0.9 }, { name: 'space', weight: 0.7 }]
  },
  {
    id: 'ny-2024-2',
    title: 'Kairos',
    author: 'Jenny Erpenbeck',
    genre: ['Literary Fiction', 'Historical Fiction', 'Translated'],
    rating: 4.1,
    year: 2024,
    description: 'An intense novel about an affair in East Germany during the 1980s and 1990s. Winner of the 2024 International Booker Prize.',
    tags: [{ name: 'international-booker-winner', weight: 1.0 }, { name: 'historical', weight: 0.8 }, { name: 'german-literature', weight: 0.7 }]
  },
  {
    id: 'ny-2024-3',
    title: 'Night Watch',
    author: 'Jayne Anne Phillips',
    genre: ['Literary Fiction', 'Historical Fiction', 'Family Saga'],
    rating: 4.3,
    year: 2024,
    description: 'A mother-daughter story set in a West Virginia asylum after the American Civil War. Winner of the 2024 Pulitzer Prize for Fiction.',
    tags: [{ name: 'pulitzer-winner', weight: 1.0 }, { name: 'historical', weight: 0.8 }, { name: 'family', weight: 0.7 }]
  },
  {
    id: 'ny-2024-4',
    title: 'James',
    author: 'Percival Everett',
    genre: ['Literary Fiction', 'Historical Fiction', 'African American Literature'],
    rating: 4.4,
    year: 2024,
    description: 'A powerful reimagining of Huckleberry Finn from Jim\'s perspective. Winner of the 2024 National Book Award for Fiction.',
    tags: [{ name: 'national-book-award', weight: 1.0 }, { name: 'african-american', weight: 0.9 }, { name: 'retelling', weight: 0.8 }]
  },
  {
    id: 'ny-2024-5',
    title: 'Praiseworthy',
    author: 'Alexis Wright',
    genre: ['Literary Fiction', 'Indigenous Literature', 'Australian Literature'],
    rating: 4.0,
    year: 2024,
    description: 'An epic, ambitious nonlinear narrative set in an Aboriginal community. Winner of the 2024 Miles Franklin Award.',
    tags: [{ name: 'miles-franklin-winner', weight: 1.0 }, { name: 'indigenous', weight: 0.9 }, { name: 'australian', weight: 0.8 }]
  },
  {
    id: 'ny-2024-6',
    title: 'Supremacy: AI, ChatGPT, and the Race that Will Change the World',
    author: 'Parmy Olson',
    genre: ['Nonfiction', 'Technology', 'Business'],
    rating: 4.2,
    year: 2024,
    description: 'An inside look at the rivalry between AI leaders Demis Hassabis and Sam Altman. Winner of the Financial Times Business Book of the Year.',
    tags: [{ name: 'ft-business-winner', weight: 1.0 }, { name: 'technology', weight: 0.9 }, { name: 'ai', weight: 0.8 }]
  },
  {
    id: 'ny-2024-7',
    title: 'A Day in the Life of Abed Salama',
    author: 'Nathan Thrall',
    genre: ['Nonfiction', 'Political', 'Middle East'],
    rating: 4.5,
    year: 2024,
    description: 'A powerful account of a school bus crash outside Jerusalem and its broader context. Winner of the 2024 Pulitzer Prize for Nonfiction.',
    tags: [{ name: 'pulitzer-winner', weight: 1.0 }, { name: 'political', weight: 0.9 }, { name: 'middle-east', weight: 0.8 }]
  },
  {
    id: 'ny-2024-8',
    title: 'Question 7',
    author: 'Richard Flanagan',
    genre: ['Nonfiction', 'Memoir', 'History'],
    rating: 4.3,
    year: 2024,
    description: 'Part memoir, part science, part history - a genre-defying work. Winner of the 2024 Baillie Gifford Prize.',
    tags: [{ name: 'baillie-gifford-winner', weight: 1.0 }, { name: 'memoir', weight: 0.8 }, { name: 'science', weight: 0.7 }]
  },

  // 2023 Award Winners
  {
    id: 'ny-2023-1',
    title: 'Demon Copperhead',
    author: 'Barbara Kingsolver',
    genre: ['Literary Fiction', 'Coming of Age', 'American Literature'],
    rating: 4.4,
    year: 2023,
    description: 'A mesmerizing novel and razor-sharp coming-of-age story about a boy called Demon Copperhead set in Appalachia. Winner of the 2023 Pulitzer Prize for Fiction.',
    tags: [{ name: 'pulitzer-winner', weight: 1.0 }, { name: 'coming-of-age', weight: 0.9 }, { name: 'appalachian', weight: 0.8 }]
  },
  {
    id: 'ny-2023-2',
    title: 'Prophet Song',
    author: 'Paul Lynch',
    genre: ['Literary Fiction', 'Dystopian', 'Irish Literature'],
    rating: 4.1,
    year: 2023,
    description: 'A haunting vision of a society on the brink. Winner of the 2023 Booker Prize.',
    tags: [{ name: 'booker-winner', weight: 1.0 }, { name: 'dystopian', weight: 0.9 }, { name: 'irish-literature', weight: 0.8 }]
  },
  {
    id: 'ny-2023-3',
    title: 'Trust',
    author: 'Hernan Diaz',
    genre: ['Literary Fiction', 'Historical Fiction', 'Metafiction'],
    rating: 4.0,
    year: 2022,
    description: 'An innovative novel about wealth, power, and truth in 1920s New York. Winner of multiple major awards including the Pulitzer Prize.',
    tags: [{ name: 'pulitzer-winner', weight: 1.0 }, { name: 'metafiction', weight: 0.8 }, { name: '1920s', weight: 0.7 }]
  },
  {
    id: 'ny-2023-4',
    title: 'His Name Is George Floyd',
    author: 'Robert Samuels, Toluse Olorunnipa',
    genre: ['Nonfiction', 'Biography', 'Social Justice'],
    rating: 4.6,
    year: 2022,
    description: 'A comprehensive biography and examination of systemic racism in America. Winner of the 2023 Pulitzer Prize for General Nonfiction.',
    tags: [{ name: 'pulitzer-winner', weight: 1.0 }, { name: 'social-justice', weight: 0.9 }, { name: 'biography', weight: 0.8 }]
  },
  {
    id: 'ny-2023-5',
    title: 'G-Man: J. Edgar Hoover and the Making of the American Century',
    author: 'Beverly Gage',
    genre: ['Nonfiction', 'Biography', 'American History'],
    rating: 4.4,
    year: 2022,
    description: 'A definitive biography drawing on never-before-seen sources. Winner of the 2023 Pulitzer Prize for Biography.',
    tags: [{ name: 'pulitzer-winner', weight: 1.0 }, { name: 'biography', weight: 0.9 }, { name: 'american-history', weight: 0.8 }]
  },

  // 2022 Award Winners
  {
    id: 'ny-2022-1',
    title: 'The Seven Moons of Maali Almeida',
    author: 'Shehan Karunatilaka',
    genre: ['Literary Fiction', 'Magical Realism', 'Sri Lankan Literature'],
    rating: 4.2,
    year: 2022,
    description: 'A darkly comic afterlife adventure set during Sri Lanka\'s civil war. Winner of the 2022 Booker Prize.',
    tags: [{ name: 'booker-winner', weight: 1.0 }, { name: 'magical-realism', weight: 0.9 }, { name: 'sri-lankan', weight: 0.8 }]
  },
  {
    id: 'ny-2022-2',
    title: 'The Netanyahus',
    author: 'Joshua Cohen',
    genre: ['Literary Fiction', 'Jewish Literature', 'Family Saga'],
    rating: 4.1,
    year: 2021,
    description: 'A comic and deeply human story of identity and belonging. Winner of the 2022 Pulitzer Prize for Fiction.',
    tags: [{ name: 'pulitzer-winner', weight: 1.0 }, { name: 'jewish-literature', weight: 0.9 }, { name: 'family', weight: 0.8 }]
  },
  {
    id: 'ny-2022-3',
    title: 'The 1619 Project: A New Origin Story',
    author: 'Nikole Hannah-Jones',
    genre: ['Nonfiction', 'American History', 'Social Justice'],
    rating: 4.3,
    year: 2021,
    description: 'A groundbreaking reframing of American history centered on the consequences of slavery.',
    tags: [{ name: 'social-justice', weight: 1.0 }, { name: 'american-history', weight: 0.9 }, { name: 'slavery', weight: 0.8 }]
  },

  // Additional Critically Acclaimed Works
  {
    id: 'ny-2024-9',
    title: 'A City on Mars',
    author: 'Kelly Weinersmith, Zach Weinersmith',
    genre: ['Nonfiction', 'Science', 'Space'],
    rating: 4.2,
    year: 2024,
    description: 'A witty and thorough examination of the challenges of space settlement. Winner of the Royal Society Science Book Prize.',
    tags: [{ name: 'royal-society-winner', weight: 1.0 }, { name: 'science', weight: 0.9 }, { name: 'space', weight: 0.8 }]
  },
  {
    id: 'ny-2024-10',
    title: 'The Picnic',
    author: 'Matthew Longo',
    genre: ['Nonfiction', 'Political', 'History'],
    rating: 4.1,
    year: 2024,
    description: 'The story of a 1989 activist event that helped collapse the Iron Curtain. Winner of the Orwell Prize for Political Writing.',
    tags: [{ name: 'orwell-prize', weight: 1.0 }, { name: 'political', weight: 0.9 }, { name: 'cold-war', weight: 0.8 }]
  },
  {
    id: 'ny-2023-6',
    title: 'Fourth Wing',
    author: 'Rebecca Yarros',
    genre: ['Fantasy', 'Romance', 'Young Adult'],
    rating: 4.5,
    year: 2023,
    description: 'A dragon rider academy romance that became a literary phenomenon.',
    tags: [{ name: 'bestseller', weight: 1.0 }, { name: 'fantasy', weight: 0.9 }, { name: 'romance', weight: 0.8 }]
  },
  {
    id: 'ny-2023-7',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    genre: ['Literary Fiction', 'Contemporary', 'Gaming'],
    rating: 4.3,
    year: 2022,
    description: 'A novel about friendship, art, and the creative process through the world of video game design.',
    tags: [{ name: 'contemporary', weight: 1.0 }, { name: 'friendship', weight: 0.9 }, { name: 'gaming', weight: 0.8 }]
  },
  {
    id: 'ny-2022-4',
    title: 'The Atlas Six',
    author: 'Olivie Blake',
    genre: ['Dark Academia', 'Fantasy', 'Contemporary'],
    rating: 4.0,
    year: 2022,
    description: 'A dark academic fantasy about six young magicians competing for a place in an ancient society.',
    tags: [{ name: 'dark-academia', weight: 1.0 }, { name: 'fantasy', weight: 0.9 }, { name: 'competition', weight: 0.7 }]
  },
  {
    id: 'ny-2022-5',
    title: 'Lessons in Chemistry',
    author: 'Bonnie Garmus',
    genre: ['Historical Fiction', 'Feminist', 'Contemporary'],
    rating: 4.4,
    year: 2022,
    description: 'A smart, funny novel about a 1960s scientist who becomes an unlikely cooking show star.',
    tags: [{ name: 'feminist', weight: 1.0 }, { name: 'historical', weight: 0.8 }, { name: 'science', weight: 0.7 }]
  }
];

// Helper function to get New Yorker-style books by genre
export const getNewYorkerBooksByGenre = (genre: string, limit: number = 5): Book[] => {
  const normalizedGenre = genre.toLowerCase().trim();
  
  return newYorkerStyleBestBooks
    .filter(book => 
      book.genre.some(g => 
        g.toLowerCase().includes(normalizedGenre) || 
        normalizedGenre.includes(g.toLowerCase())
      )
    )
    .sort((a, b) => b.rating - a.rating) // Sort by rating descending
    .slice(0, limit);
};

// Helper function to get New Yorker-style award winners
export const getNewYorkerAwardWinners = (limit: number = 10): Book[] => {
  return newYorkerStyleBestBooks
    .filter(book => 
      book.tags?.some(tag => 
        tag.name.includes('winner') || 
        tag.name.includes('pulitzer') ||
        tag.name.includes('booker') ||
        tag.name.includes('national-book-award')
      )
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get recent highly rated New Yorker-style books
export const getRecentNewYorkerBooks = (minRating: number = 4.0, limit: number = 10): Book[] => {
  const currentYear = new Date().getFullYear();
  
  return newYorkerStyleBestBooks
    .filter(book => 
      book.rating >= minRating && 
      book.year >= currentYear - 3 // Last 3 years
    )
    .sort((a, b) => b.year - a.year) // Sort by year descending (most recent first)
    .slice(0, limit);
};

// Helper function to get New Yorker-style literary fiction
export const getNewYorkerLiteraryFiction = (limit: number = 5): Book[] => {
  return newYorkerStyleBestBooks
    .filter(book => 
      book.genre.some(g => g.toLowerCase().includes('literary')) ||
      book.tags?.some(tag => tag.name.includes('literary'))
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get New Yorker-style nonfiction
export const getNewYorkerNonfiction = (limit: number = 5): Book[] => {
  return newYorkerStyleBestBooks
    .filter(book => 
      book.genre.some(g => g.toLowerCase().includes('nonfiction'))
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get New Yorker-style books by year
export const getNewYorkerBooksByYear = (year: number, limit: number = 10): Book[] => {
  return newYorkerStyleBestBooks
    .filter(book => book.year === year)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};