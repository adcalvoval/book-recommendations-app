// NYT Books API Integration
// Note: NYT API requires an API key. For demo purposes, we'll use publicly available endpoints
// In production, you'd register for an API key at https://developer.nytimes.com/

export interface NYTBook {
  title: string;
  author: string;
  description: string;
  book_image?: string;
  amazon_product_url?: string;
  rank?: number;
  weeks_on_list?: number;
  publisher?: string;
}

export interface NYTBestsellerList {
  list_name: string;
  display_name: string;
  books: NYTBook[];
  updated: string;
}

// Popular bestseller list names
export const BESTSELLER_LISTS = {
  COMBINED_FICTION: 'combined-print-and-e-book-fiction',
  COMBINED_NONFICTION: 'combined-print-and-e-book-nonfiction', 
  HARDCOVER_FICTION: 'hardcover-fiction',
  PAPERBACK_FICTION: 'trade-fiction-paperback',
  ADVICE: 'advice-how-to-and-miscellaneous',
  BIOGRAPHY: 'biography-and-autobiography',
  BUSINESS: 'business-books',
  SCIENCE: 'science',
  TRAVEL: 'travel'
};

// Simulated NYT Books API responses (since we can't access the real API without a key)
// In a real implementation, this would fetch from https://api.nytimes.com/svc/books/v3/lists/current/{list}.json
export const getBestsellerList = async (listName: string = BESTSELLER_LISTS.COMBINED_FICTION): Promise<NYTBook[]> => {
  try {
    // For demo purposes, we'll return curated lists based on the list type
    // In production, replace this with actual NYT API calls
    
    const bestsellerData: Record<string, NYTBook[]> = {
      [BESTSELLER_LISTS.COMBINED_FICTION]: [
        {
          title: "Fourth Wing",
          author: "Rebecca Yarros",
          description: "Violet Sorrengail thought she'd live a quiet life among books and history, but the world's fate may rest in her hands.",
          rank: 1,
          weeks_on_list: 52
        },
        {
          title: "Iron Flame",
          author: "Rebecca Yarros",
          description: "The sequel to Fourth Wing. Violet faces new challenges at Basgiath War College.",
          rank: 2,
          weeks_on_list: 12
        },
        {
          title: "The Woman in Me",
          author: "Britney Spears",
          description: "The pop icon's memoir reveals her journey through fame, family, and finding her voice.",
          rank: 3,
          weeks_on_list: 8
        },
        {
          title: "Tomorrow, and Tomorrow, and Tomorrow",
          author: "Gabrielle Zevin",
          description: "A novel about friendship, love, art, and the video game industry.",
          rank: 4,
          weeks_on_list: 35
        }
      ],
      [BESTSELLER_LISTS.COMBINED_NONFICTION]: [
        {
          title: "Atomic Habits",
          author: "James Clear",
          description: "Tiny changes, remarkable results. A comprehensive guide to building good habits.",
          rank: 1,
          weeks_on_list: 180
        },
        {
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen R. Covey",
          description: "Powerful lessons in personal change and effectiveness.",
          rank: 2,
          weeks_on_list: 520
        }
      ],
      [BESTSELLER_LISTS.SCIENCE]: [
        {
          title: "Astrophysics for People in a Hurry",
          author: "Neil deGrasse Tyson",
          description: "The essential cosmic perspective on the universe.",
          rank: 1,
          weeks_on_list: 89
        }
      ]
    };

    return bestsellerData[listName] || bestsellerData[BESTSELLER_LISTS.COMBINED_FICTION];
  } catch (error) {
    console.error('Error fetching NYT bestsellers:', error);
    return [];
  }
};

// Get bestsellers by genre/category
export const getBestsellersByGenre = async (genre: string): Promise<NYTBook[]> => {
  const genreToListMap: Record<string, string> = {
    'fiction': BESTSELLER_LISTS.COMBINED_FICTION,
    'non-fiction': BESTSELLER_LISTS.COMBINED_NONFICTION,
    'nonfiction': BESTSELLER_LISTS.COMBINED_NONFICTION,
    'business': BESTSELLER_LISTS.BUSINESS,
    'biography': BESTSELLER_LISTS.BIOGRAPHY,
    'science': BESTSELLER_LISTS.SCIENCE,
    'travel': BESTSELLER_LISTS.TRAVEL,
    'advice': BESTSELLER_LISTS.ADVICE,
    'self-help': BESTSELLER_LISTS.ADVICE
  };

  const listName = genreToListMap[genre.toLowerCase()] || BESTSELLER_LISTS.COMBINED_FICTION;
  return getBestsellerList(listName);
};

// Convert NYT book to our Book interface
export const convertNYTBookToBook = (nytBook: NYTBook): import('../types').Book => {
  return {
    id: `nyt-${nytBook.title.replace(/\s+/g, '-').toLowerCase()}`,
    title: nytBook.title,
    author: nytBook.author,
    genre: ['Bestseller'], // We'll enhance this with Google Books data
    rating: 4.0 + (Math.random() * 1.0), // Estimate based on bestseller status
    description: nytBook.description,
    summary: nytBook.description,
    coverUrl: nytBook.book_image,
    year: new Date().getFullYear() // Recent bestsellers
  };
};

// Get mixed recommendations from multiple NYT lists
export const getMixedBestsellers = async (): Promise<NYTBook[]> => {
  try {
    const [fiction, nonFiction, business] = await Promise.all([
      getBestsellerList(BESTSELLER_LISTS.COMBINED_FICTION),
      getBestsellerList(BESTSELLER_LISTS.COMBINED_NONFICTION),
      getBestsellerList(BESTSELLER_LISTS.BUSINESS)
    ]);

    // Mix the results - take top 3 from each category
    const mixed = [
      ...fiction.slice(0, 3),
      ...nonFiction.slice(0, 2),
      ...business.slice(0, 1)
    ];

    return mixed;
  } catch (error) {
    console.error('Error getting mixed bestsellers:', error);
    return [];
  }
};