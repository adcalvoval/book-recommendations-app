import type { Book } from '../types';

export const expandedBookDatabase: Book[] = [
  // Percival Everett books
  {
    id: 'everett-1',
    title: 'James',
    author: 'Percival Everett',
    genre: ['Literary Fiction', 'Historical Fiction'],
    rating: 4.6,
    description: 'A brilliant reimagining of Adventures of Huckleberry Finn told from Jim\'s perspective.',
    year: 2024
  },
  {
    id: 'everett-2',
    title: 'The Trees',
    author: 'Percival Everett',
    genre: ['Literary Fiction', 'Satire', 'Mystery'],
    rating: 4.3,
    description: 'A darkly comic novel about murders that echo the past in a small Mississippi town.',
    year: 2021
  },
  {
    id: 'everett-3',
    title: 'Telephone',
    author: 'Percival Everett',
    genre: ['Literary Fiction', 'Experimental'],
    rating: 4.1,
    description: 'An experimental novel exploring multiple versions and realities.',
    year: 2020
  },
  {
    id: 'everett-4',
    title: 'Percival Everett by Virgil Russell',
    author: 'Percival Everett',
    genre: ['Literary Fiction', 'Memoir'],
    rating: 4.2,
    description: 'A unique memoir told through the lens of his father\'s life.',
    year: 2013
  },
  {
    id: 'everett-5',
    title: 'Erasure',
    author: 'Percival Everett',
    genre: ['Literary Fiction', 'Satire'],
    rating: 4.4,
    description: 'A satirical novel about race, identity, and the publishing industry.',
    year: 2001
  },

  // Scandinavian Crime/Nordic Noir
  {
    id: 'scandi-1',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    genre: ['Crime', 'Thriller', 'Scandinavian Crime'],
    rating: 4.4,
    description: 'Swedish crime thriller about a journalist and hacker investigating a missing person case.',
    year: 2005
  },
  {
    id: 'scandi-2',
    title: 'The Snowman',
    author: 'Jo Nesbø',
    genre: ['Crime', 'Thriller', 'Norwegian Crime'],
    rating: 4.2,
    description: 'Norwegian detective Harry Hole investigates a serial killer in Oslo.',
    year: 2007
  },
  {
    id: 'scandi-3',
    title: 'Faceless Killers',
    author: 'Henning Mankell',
    genre: ['Crime', 'Mystery', 'Swedish Crime'],
    rating: 4.1,
    description: 'Inspector Wallander investigates a brutal murder in rural Sweden.',
    year: 1991
  },
  {
    id: 'scandi-4',
    title: 'The Keeper of Lost Causes',
    author: 'Jussi Adler-Olsen',
    genre: ['Crime', 'Thriller', 'Danish Crime'],
    rating: 4.3,
    description: 'Detective Carl Mørck investigates cold cases in Copenhagen.',
    year: 2007
  },
  {
    id: 'scandi-5',
    title: 'Those Who Wish Me Dead',
    author: 'Michael Koryta',
    genre: ['Thriller', 'Crime'],
    rating: 4.0,
    description: 'A survival thriller about a boy who witnesses a murder.',
    year: 2014
  },
  {
    id: 'scandi-6',
    title: 'The Ice Princess',
    author: 'Camilla Läckberg',
    genre: ['Crime', 'Mystery', 'Swedish Crime'],
    rating: 4.0,
    description: 'A murder mystery set in a small Swedish fishing village.',
    year: 2003
  },

  // True Crime
  {
    id: 'true-crime-1',
    title: 'In Cold Blood',
    author: 'Truman Capote',
    genre: ['True Crime', 'Non-fiction'],
    rating: 4.3,
    description: 'The classic true crime account of a Kansas family murder.',
    year: 1966
  },
  {
    id: 'true-crime-2',
    title: 'The Stranger Beside Me',
    author: 'Ann Rule',
    genre: ['True Crime', 'Biography'],
    rating: 4.4,
    description: 'Ann Rule\'s personal account of working alongside Ted Bundy.',
    year: 1980
  },
  {
    id: 'true-crime-3',
    title: 'I\'ll Be Gone in the Dark',
    author: 'Michelle McNamara',
    genre: ['True Crime', 'Investigation'],
    rating: 4.2,
    description: 'The hunt for the Golden State Killer by a dedicated crime writer.',
    year: 2018
  },

  // More diverse authors and genres
  {
    id: 'diverse-1',
    title: 'Americanah',
    author: 'Chimamanda Ngozi Adichie',
    genre: ['Literary Fiction', 'Contemporary'],
    rating: 4.3,
    description: 'A powerful novel about identity, race, and belonging.',
    year: 2013
  },
  {
    id: 'diverse-2',
    title: 'The Namesake',
    author: 'Jhumpa Lahiri',
    genre: ['Literary Fiction', 'Family Saga'],
    rating: 4.1,
    description: 'A story about identity and family across generations.',
    year: 2003
  },
  {
    id: 'diverse-3',
    title: 'Exit West',
    author: 'Mohsin Hamid',
    genre: ['Literary Fiction', 'Magical Realism'],
    rating: 4.0,
    description: 'A love story set against the backdrop of migration and displacement.',
    year: 2017
  },
  {
    id: 'diverse-4',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    genre: ['Literary Fiction', 'Historical Fiction'],
    rating: 4.4,
    description: 'A story of friendship, guilt, and redemption set in Afghanistan.',
    year: 2003
  },
  {
    id: 'diverse-5',
    title: 'Beloved',
    author: 'Toni Morrison',
    genre: ['Literary Fiction', 'Historical Fiction'],
    rating: 4.2,
    description: 'A haunting tale of slavery and its aftermath.',
    year: 1987
  },

  // Original sample books (keeping existing ones)
  {
    id: 'sample-1',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    genre: ['Fantasy', 'Adventure'],
    rating: 4.5,
    description: 'A tale of Kvothe, a legendary figure whose story unfolds in a fantasy world.',
    year: 2007
  },
  {
    id: 'sample-2',
    title: 'Dune',
    author: 'Frank Herbert',
    genre: ['Science Fiction', 'Adventure'],
    rating: 4.3,
    description: 'A science fiction epic set on the desert planet Arrakis.',
    year: 1965
  },
  {
    id: 'sample-3',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: ['Fiction', 'Philosophy'],
    rating: 4.1,
    description: 'A philosophical novel about life choices and alternate realities.',
    year: 2020
  },
  {
    id: 'sample-4',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: ['Science Fiction', 'Thriller'],
    rating: 4.6,
    description: 'A lone astronaut must save humanity in this thrilling space adventure.',
    year: 2021
  },
  {
    id: 'sample-5',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    genre: ['Romance', 'Drama'],
    rating: 4.4,
    description: 'A reclusive Hollywood icon tells her life story to a young journalist.',
    year: 2017
  },
  {
    id: 'sample-6',
    title: 'Gone Girl',
    author: 'Gillian Flynn',
    genre: ['Thriller', 'Mystery'],
    rating: 4.2,
    description: 'A psychological thriller about a marriage gone wrong.',
    year: 2012
  },
  {
    id: 'sample-7',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: ['Fantasy', 'Adventure'],
    rating: 4.7,
    description: 'A hobbit\'s unexpected journey through Middle-earth.',
    year: 1937
  },
  {
    id: 'sample-8',
    title: 'Educated',
    author: 'Tara Westover',
    genre: ['Memoir', 'Biography'],
    rating: 4.5,
    description: 'A memoir about education and family in rural Idaho.',
    year: 2018
  }
];