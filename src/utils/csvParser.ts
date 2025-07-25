import type { Book } from '../types';

export interface GoodreadsCSVRow extends Record<string, string> {
  'Book Id': string;
  'Title': string;
  'Author': string;
  'Author l-f': string;
  'Additional Authors': string;
  'ISBN': string;
  'ISBN13': string;
  'My Rating': string;
  'Average Rating': string;
  'Publisher': string;
  'Binding': string;
  'Number of Pages': string;
  'Year Published': string;
  'Original Publication Year': string;
  'Date Read': string;
  'Date Added': string;
  'Bookshelves': string;
  'Bookshelves with positions': string;
  'Exclusive Shelf': string;
  'My Review': string;
  'Spoiler': string;
  'Private Notes': string;
  'Read Count': string;
  'Owned Copies': string;
}

export const parseCSV = (csvText: string): Record<string, string>[] => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    if (values.length !== headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  result.push(current.trim());
  return result;
};

export const convertGoodreadsToBooks = (csvRows: GoodreadsCSVRow[]): Book[] => {
  const readBooks = csvRows.filter(row => {
    // Only include books that have been read (not just added to shelves)
    const exclusiveShelf = row['Exclusive Shelf']?.toLowerCase();
    return exclusiveShelf === 'read' && row['My Rating'] && parseInt(row['My Rating']) > 0;
  });

  console.log('CSV Import Debug:');
  console.log('Total rows:', csvRows.length);
  console.log('Read books with ratings:', readBooks.length);
  console.log('Sample rows:', csvRows.slice(0, 3).map(row => ({
    title: row['Title'],
    exclusiveShelf: row['Exclusive Shelf'],
    rating: row['My Rating']
  })));

  return readBooks
    .map(row => {
      const genres = extractGenres(row['Bookshelves'], row['Bookshelves with positions'], row['Title'], row['Author']);
      const rating = parseInt(row['My Rating']) || 0;
      const year = parseInt(row['Year Published']) || parseInt(row['Original Publication Year']) || undefined;
      const cleanISBN = cleanISBNField(row['ISBN13'] || row['ISBN']);

      return {
        id: `goodreads-${row['Book Id']}`,
        title: row['Title'] || 'Unknown Title',
        author: row['Author'] || 'Unknown Author',
        genre: genres,
        rating: rating,
        description: row['My Review'] || undefined,
        year: year,
        isbn: cleanISBN || undefined
      };
    })
    .filter(book => book.title !== 'Unknown Title' && book.rating > 0);
};


const cleanISBNField = (isbn: string): string | null => {
  if (!isbn) return null;
  // Remove Excel formula formatting like ="123456789"
  const cleaned = isbn.replace(/^="?|"?$/g, '');
  return cleaned || null;
};

const extractGenres = (bookshelves: string, bookshelvesWithPositions: string, title: string, author: string): string[] => {
  const genreKeywords = [
    'fiction', 'non-fiction', 'nonfiction', 'fantasy', 'sci-fi', 'science-fiction',
    'mystery', 'thriller', 'romance', 'horror', 'biography', 'memoir', 'history',
    'philosophy', 'psychology', 'self-help', 'business', 'poetry', 'drama',
    'adventure', 'classic', 'contemporary', 'historical', 'young-adult', 'ya',
    'children', 'graphic-novel', 'comics', 'cookbook', 'travel', 'religion',
    'spirituality', 'science', 'technology', 'politics', 'economics', 'art',
    'music', 'sports', 'health', 'fitness', 'parenting', 'education'
  ];

  const shelves = (bookshelves || '').toLowerCase().split(',').concat((bookshelvesWithPositions || '').toLowerCase().split(','));
  const genres: string[] = [];

  shelves.forEach(shelf => {
    const cleanShelf = shelf.trim().replace(/[^a-z-]/g, '');
    if (genreKeywords.includes(cleanShelf)) {
      const formattedGenre = cleanShelf.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      if (!genres.includes(formattedGenre)) {
        genres.push(formattedGenre);
      }
    }
  });

  // If no genres found from shelves, try to infer from title/author
  if (genres.length === 0) {
    const inferredGenres = inferGenresFromTitleAuthor(title, author);
    if (inferredGenres.length > 0) {
      genres.push(...inferredGenres);
    } else {
      genres.push('Fiction'); // Default fallback
    }
  }

  return genres;
};

const inferGenresFromTitleAuthor = (title: string, author: string): string[] => {
  const titleLower = title.toLowerCase();
  const authorLower = author.toLowerCase();
  const genres: string[] = [];

  // Common genre indicators in titles
  const genrePatterns = [
    { keywords: ['memoir', 'biography', 'autobiography'], genre: 'Biography' },
    { keywords: ['history', 'historical', 'war', 'battle', 'empire', 'revolution'], genre: 'History' },
    { keywords: ['philosophy', 'philosophical'], genre: 'Philosophy' },
    { keywords: ['cookbook', 'cooking', 'recipe'], genre: 'Cookbook' },
    { keywords: ['poetry', 'poems'], genre: 'Poetry' },
    { keywords: ['travel', 'journey'], genre: 'Travel' },
    { keywords: ['science', 'physics', 'biology', 'chemistry'], genre: 'Science' },
    { keywords: ['business', 'economics', 'finance'], genre: 'Business' },
    { keywords: ['self-help', 'guide', 'how to'], genre: 'Self Help' },
    { keywords: ['mystery', 'detective', 'murder'], genre: 'Mystery' },
    { keywords: ['romance', 'love story'], genre: 'Romance' },
    { keywords: ['thriller', 'suspense'], genre: 'Thriller' },
    { keywords: ['fantasy', 'magic', 'wizard', 'dragon'], genre: 'Fantasy' },
    { keywords: ['sci-fi', 'science fiction', 'space', 'alien'], genre: 'Science Fiction' }
  ];

  for (const pattern of genrePatterns) {
    if (pattern.keywords.some(keyword => titleLower.includes(keyword) || authorLower.includes(keyword))) {
      genres.push(pattern.genre);
    }
  }

  // Known non-fiction authors
  const nonFictionAuthors = [
    'doris kearns goodwin', 'david mccullough', 'malcolm gladwell', 'bill bryson',
    'mary roach', 'erik larson', 'jon krakauer', 'sebastian junger', 'michael lewis'
  ];

  if (nonFictionAuthors.some(nfAuthor => authorLower.includes(nfAuthor))) {
    if (!genres.some(g => ['Biography', 'History', 'Science', 'Business'].includes(g))) {
      genres.push('Non Fiction');
    }
  }

  return genres;
};

export const validateGoodreadsCSV = (csvRows: Record<string, string>[]): { isValid: boolean; error?: string } => {
  if (csvRows.length === 0) {
    return { isValid: false, error: 'CSV file is empty' };
  }

  const requiredFields = ['Title', 'Author', 'My Rating'];
  const firstRow = csvRows[0];
  
  for (const field of requiredFields) {
    if (!(field in firstRow)) {
      return { 
        isValid: false, 
        error: `Missing required field: ${field}. Make sure this is a Goodreads library export.` 
      };
    }
  }

  return { isValid: true };
};

export const exportWishlistToGoodreadsCSV = (wishlistItems: import('../types').WishlistItem[]): string => {
  // Goodreads CSV headers - using the same format as the import
  const headers = [
    'Book Id',
    'Title', 
    'Author',
    'Author l-f',
    'Additional Authors',
    'ISBN',
    'ISBN13',
    'My Rating',
    'Average Rating',
    'Publisher',
    'Binding',
    'Number of Pages',
    'Year Published',
    'Original Publication Year',
    'Date Read',
    'Date Added',
    'Bookshelves',
    'Bookshelves with positions',
    'Exclusive Shelf',
    'My Review',
    'Spoiler',
    'Private Notes',
    'Read Count',
    'Owned Copies'
  ];

  const csvRows: string[] = [];
  csvRows.push(headers.map(header => `"${header}"`).join(','));

  wishlistItems.forEach((item, index) => {
    const bookId = item.id.replace('goodreads-', '') || (index + 1).toString();
    const authorLastFirst = formatAuthorLastFirst(item.author);
    const bookshelves = item.genre ? item.genre.map(g => g.toLowerCase().replace(/\s+/g, '-')).join(',') : 'to-read';
    const dateAdded = formatDateForGoodreads(item.dateAdded);
    
    const row = [
      bookId,                           // Book Id
      item.title,                       // Title
      item.author,                      // Author
      authorLastFirst,                  // Author l-f
      '',                              // Additional Authors
      '',                              // ISBN
      '',                              // ISBN13
      item.rating ? item.rating.toString() : '0', // My Rating
      item.rating ? item.rating.toString() : '0', // Average Rating
      '',                              // Publisher
      '',                              // Binding
      '',                              // Number of Pages
      item.year ? item.year.toString() : '', // Year Published
      item.year ? item.year.toString() : '', // Original Publication Year
      '',                              // Date Read
      dateAdded,                       // Date Added
      bookshelves,                     // Bookshelves
      bookshelves,                     // Bookshelves with positions
      'to-read',                       // Exclusive Shelf
      item.summary || '',              // My Review
      '',                              // Spoiler
      '',                              // Private Notes
      '0',                             // Read Count
      '0'                              // Owned Copies
    ];

    csvRows.push(row.map(field => `"${field.replace(/"/g, '""')}"`).join(','));
  });

  return csvRows.join('\n');
};

const formatAuthorLastFirst = (author: string): string => {
  const parts = author.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  const firstName = parts.slice(0, -1).join(' ');
  const lastName = parts[parts.length - 1];
  return `${lastName}, ${firstName}`;
};

const formatDateForGoodreads = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch {
    return new Date().toISOString().split('T')[0].replace(/-/g, '/');
  }
};