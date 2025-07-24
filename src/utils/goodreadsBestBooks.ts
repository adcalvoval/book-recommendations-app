import type { Book } from '../types';

// Goodreads "Best Books Ever" list - curated selection of highly-rated classics and popular books
// Source: https://www.goodreads.com/list/show/1.Best_Books_Ever
export const goodreadsBestBooksEver: Book[] = [
  {
    id: 'gr-best-1',
    title: 'The Hunger Games',
    author: 'Suzanne Collins',
    genre: ['Dystopian', 'Young Adult', 'Science Fiction'],
    rating: 4.35,
    year: 2008,
    description: 'In a dark vision of the near future, twelve boys and twelve girls are forced to appear in a live TV show called the Hunger Games.',
    tags: [{ name: 'bestseller', weight: 1.0 }, { name: 'popular', weight: 0.9 }]
  },
  {
    id: 'gr-best-2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: ['Romance', 'Classic', 'Historical Fiction'],
    rating: 4.29,
    year: 1813,
    description: 'A witty comedy of manners that follows the romantic entanglements of the Bennet sisters.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'romance', weight: 0.9 }]
  },
  {
    id: 'gr-best-3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: ['Classic', 'Historical Fiction', 'Coming of Age'],
    rating: 4.26,
    year: 1960,
    description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'pulitzer-winner', weight: 0.8 }]
  },
  {
    id: 'gr-best-4',
    title: 'Harry Potter and the Order of the Phoenix',
    author: 'J.K. Rowling',
    genre: ['Fantasy', 'Young Adult', 'Adventure'],
    rating: 4.50,
    year: 2003,
    description: 'Harry returns for his fifth year at Hogwarts and discovers that the wizarding community is in denial about Voldemort\'s return.',
    tags: [{ name: 'bestseller', weight: 1.0 }, { name: 'fantasy', weight: 0.9 }]
  },
  {
    id: 'gr-best-5',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    genre: ['Historical Fiction', 'Young Adult', 'War'],
    rating: 4.39,
    year: 2005,
    description: 'Death narrates the story of Liesel, a young girl living in Nazi Germany who steals books and shares them with others.',
    tags: [{ name: 'historical', weight: 1.0 }, { name: 'award-winner', weight: 0.8 }]
  },
  {
    id: 'gr-best-6',
    title: 'Twilight',
    author: 'Stephenie Meyer',
    genre: ['Paranormal Romance', 'Young Adult', 'Fantasy'],
    rating: 3.67,
    year: 2005,
    description: 'The romance between Bella and Edward, a vampire, in the small town of Forks.',
    tags: [{ name: 'bestseller', weight: 1.0 }, { name: 'paranormal', weight: 0.8 }]
  },
  {
    id: 'gr-best-7',
    title: 'Animal Farm',
    author: 'George Orwell',
    genre: ['Classic', 'Political Fiction', 'Allegory'],
    rating: 4.01,
    year: 1945,
    description: 'A satirical allegory of Soviet totalitarianism where farm animals rebel against their human owner.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'political', weight: 0.9 }]
  },
  {
    id: 'gr-best-8',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    genre: ['Fantasy', 'Adventure', 'Epic'],
    rating: 4.61,
    year: 1954,
    description: 'The epic tale of the quest to destroy the One Ring and defeat the Dark Lord Sauron.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'fantasy-epic', weight: 1.0 }]
  },
  {
    id: 'gr-best-9',
    title: 'The Chronicles of Narnia',
    author: 'C.S. Lewis',
    genre: ['Fantasy', 'Children', 'Adventure'],
    rating: 4.28,
    year: 1950,
    description: 'Seven fantasy novels about children who discover the magical world of Narnia.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'children', weight: 0.8 }]
  },
  {
    id: 'gr-best-10',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    genre: ['Young Adult', 'Romance', 'Contemporary'],
    rating: 4.12,
    year: 2012,
    description: 'A love story between two teenagers who meet in a cancer support group.',
    tags: [{ name: 'bestseller', weight: 1.0 }, { name: 'contemporary', weight: 0.8 }]
  },
  {
    id: 'gr-best-11',
    title: 'The Picture of Dorian Gray',
    author: 'Oscar Wilde',
    genre: ['Classic', 'Gothic', 'Philosophy'],
    rating: 4.13,
    year: 1890,
    description: 'A philosophical novel about a man whose portrait ages while he remains young.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'gothic', weight: 0.8 }]
  },
  {
    id: 'gr-best-12',
    title: 'The Giving Tree',
    author: 'Shel Silverstein',
    genre: ['Children', 'Picture Book', 'Philosophy'],
    rating: 4.38,
    year: 1964,
    description: 'A touching story about the relationship between a boy and a tree.',
    tags: [{ name: 'children', weight: 1.0 }, { name: 'philosophy', weight: 0.7 }]
  },
  {
    id: 'gr-best-13',
    title: 'Wuthering Heights',
    author: 'Emily Brontë',
    genre: ['Classic', 'Gothic', 'Romance'],
    rating: 3.89,
    year: 1847,
    description: 'A tale of passion and revenge set on the Yorkshire moors.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'gothic', weight: 0.9 }]
  },
  {
    id: 'gr-best-14',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    genre: ['Classic', 'Romance', 'Gothic'],
    rating: 4.14,
    year: 1847,
    description: 'The story of an orphaned girl who becomes a governess and falls in love with her mysterious employer.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'romance', weight: 0.8 }]
  },
  {
    id: 'gr-best-15',
    title: '1984',
    author: 'George Orwell',
    genre: ['Dystopian', 'Political Fiction', 'Classic'],
    rating: 4.19,
    year: 1949,
    description: 'A dystopian social science fiction novel about totalitarian control.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'dystopian', weight: 1.0 }]
  },
  {
    id: 'gr-best-16',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: ['Classic', 'American Literature', 'Historical Fiction'],
    rating: 3.93,
    year: 1925,
    description: 'A critique of the American Dream set in the Jazz Age.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'american-literature', weight: 0.9 }]
  },
  {
    id: 'gr-best-17',
    title: 'Lord of the Flies',
    author: 'William Golding',
    genre: ['Classic', 'Dystopian', 'Adventure'],
    rating: 3.70,
    year: 1954,
    description: 'British schoolboys stranded on an uninhabited island struggle to govern themselves.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'nobel-winner', weight: 0.8 }]
  },
  {
    id: 'gr-best-18',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    genre: ['Classic', 'Coming of Age', 'American Literature'],
    rating: 3.81,
    year: 1951,
    description: 'Holden Caulfield\'s adventures in New York City after being expelled from prep school.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'coming-of-age', weight: 0.9 }]
  },
  {
    id: 'gr-best-19',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    genre: ['Historical Fiction', 'Drama', 'Contemporary'],
    rating: 4.34,
    year: 2003,
    description: 'A story of friendship, guilt, and redemption set against the backdrop of Afghanistan.',
    tags: [{ name: 'contemporary', weight: 1.0 }, { name: 'historical', weight: 0.8 }]
  },
  {
    id: 'gr-best-20',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    genre: ['Philosophy', 'Adventure', 'Inspirational'],
    rating: 3.90,
    year: 1988,
    description: 'A young shepherd\'s journey to find treasure and discover his personal legend.',
    tags: [{ name: 'philosophy', weight: 1.0 }, { name: 'inspirational', weight: 0.9 }]
  },
  {
    id: 'gr-best-21',
    title: 'Of Mice and Men',
    author: 'John Steinbeck',
    genre: ['Classic', 'American Literature', 'Drama'],
    rating: 3.89,
    year: 1937,
    description: 'The story of two displaced migrant ranch workers during the Great Depression.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'nobel-winner', weight: 0.8 }]
  },
  {
    id: 'gr-best-22',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: ['Fantasy', 'Adventure', 'Children'],
    rating: 4.28,
    year: 1937,
    description: 'Bilbo Baggins\' unexpected journey to help dwarves reclaim their homeland.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'fantasy', weight: 1.0 }]
  },
  {
    id: 'gr-best-23',
    title: 'Romeo and Juliet',
    author: 'William Shakespeare',
    genre: ['Classic', 'Drama', 'Romance'],
    rating: 3.74,
    year: 1597,
    description: 'The tragic tale of two young star-crossed lovers.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'shakespeare', weight: 1.0 }]
  },
  {
    id: 'gr-best-24',
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    genre: ['Dystopian', 'Science Fiction', 'Classic'],
    rating: 3.99,
    year: 1953,
    description: 'A future society where books are outlawed and burned by firemen.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'dystopian', weight: 1.0 }]
  },
  {
    id: 'gr-best-25',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    genre: ['Dystopian', 'Science Fiction', 'Classic'],
    rating: 3.99,
    year: 1932,
    description: 'A dystopian society where people are manufactured and conditioned for specific roles.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'dystopian', weight: 1.0 }]
  },
  {
    id: 'gr-best-26',
    title: 'One Flew Over the Cuckoo\'s Nest',
    author: 'Ken Kesey',
    genre: ['Classic', 'Drama', 'Psychology'],
    rating: 4.20,
    year: 1962,
    description: 'A story of rebellion in a mental institution.',
    tags: [{ name: 'classic', weight: 1.0 }, { name: 'psychology', weight: 0.8 }]
  },
  {
    id: 'gr-best-27',
    title: 'The Outsiders',
    author: 'S.E. Hinton',
    genre: ['Young Adult', 'Coming of Age', 'Drama'],
    rating: 4.12,
    year: 1967,
    description: 'The story of rival gangs and social class conflict in 1960s Oklahoma.',
    tags: [{ name: 'young-adult', weight: 1.0 }, { name: 'coming-of-age', weight: 0.9 }]
  },
  {
    id: 'gr-best-28',
    title: 'A Wrinkle in Time',
    author: 'Madeleine L\'Engle',
    genre: ['Science Fiction', 'Young Adult', 'Fantasy'],
    rating: 3.99,
    year: 1962,
    description: 'A young girl travels through time and space to rescue her father.',
    tags: [{ name: 'young-adult', weight: 1.0 }, { name: 'science-fiction', weight: 0.8 }]
  },
  {
    id: 'gr-best-29',
    title: 'Where the Red Fern Grows',
    author: 'Wilson Rawls',
    genre: ['Children', 'Adventure', 'Coming of Age'],
    rating: 4.32,
    year: 1961,
    description: 'A boy\'s dedication to training his hunting dogs in the Ozark Mountains.',
    tags: [{ name: 'children', weight: 1.0 }, { name: 'adventure', weight: 0.8 }]
  },
  {
    id: 'gr-best-30',
    title: 'The Perks of Being a Wallflower',
    author: 'Stephen Chbosky',
    genre: ['Young Adult', 'Coming of Age', 'Contemporary'],
    rating: 4.22,
    year: 1999,
    description: 'An introspective teenager navigates his freshman year of high school.',
    tags: [{ name: 'young-adult', weight: 1.0 }, { name: 'coming-of-age', weight: 0.9 }]
  }
];

// Helper function to get Goodreads best books by genre
export const getGoodreadsBestBooksByGenre = (genre: string, limit: number = 5): Book[] => {
  const normalizedGenre = genre.toLowerCase().trim();
  
  return goodreadsBestBooksEver
    .filter(book => 
      book.genre.some(g => 
        g.toLowerCase().includes(normalizedGenre) || 
        normalizedGenre.includes(g.toLowerCase())
      )
    )
    .sort((a, b) => b.rating - a.rating) // Sort by rating descending
    .slice(0, limit);
};

// Helper function to get highly rated Goodreads best books
export const getHighlyRatedGoodreadsBestBooks = (minRating: number = 4.0, limit: number = 10): Book[] => {
  return goodreadsBestBooksEver
    .filter(book => book.rating >= minRating)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

// Helper function to get Goodreads best books by author
export const getGoodreadsBestBooksByAuthor = (authorName: string): Book[] => {
  const normalizedAuthor = authorName.toLowerCase().trim();
  
  return goodreadsBestBooksEver
    .filter(book => 
      book.author.toLowerCase().includes(normalizedAuthor) ||
      normalizedAuthor.includes(book.author.toLowerCase())
    )
    .sort((a, b) => b.rating - a.rating);
};

// Helper function to get random selection of Goodreads best books
export const getRandomGoodreadsBestBooks = (limit: number = 5): Book[] => {
  const shuffled = [...goodreadsBestBooksEver].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};

// Helper function to get classic books from Goodreads best list
export const getGoodreadsClassicBooks = (limit: number = 5): Book[] => {
  return goodreadsBestBooksEver
    .filter(book => 
      book.genre.some(g => g.toLowerCase().includes('classic')) ||
      book.tags?.some(tag => tag.name.includes('classic'))
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};