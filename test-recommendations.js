import { getDynamicRecommendations } from './src/utils/dynamicRecommendations.js';

// Create a sample user library with a variety of books
const sampleUserLibrary = [
  {
    id: 'user-1',
    title: 'The Handmaid\'s Tale',
    author: 'Margaret Atwood',
    genre: ['Dystopian Fiction', 'Literary Fiction', 'Feminist Literature'],
    rating: 4.5,
    year: 1985,
    summary: 'A dystopian novel set in a future totalitarian society where women are subjugated.',
  },
  {
    id: 'user-2',
    title: '1984',
    author: 'George Orwell',
    genre: ['Dystopian Fiction', 'Science Fiction', 'Political Fiction'],
    rating: 5.0,
    year: 1949,
    summary: 'A dystopian social science fiction novel about totalitarian control.',
  },
  {
    id: 'user-3',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    genre: ['Contemporary Fiction', 'Historical Fiction', 'LGBTQ+ Fiction'],
    rating: 4.0,
    year: 2017,
    summary: 'A reclusive Hollywood icon recounts her scandalous life story.',
  },
  {
    id: 'user-4',
    title: 'Educated',
    author: 'Tara Westover',
    genre: ['Memoir', 'Non-fiction', 'Biography'],
    rating: 4.5,
    year: 2018,
    summary: 'A memoir about a woman who grows up in a survivalist family and eventually earns a PhD.',
  },
  {
    id: 'user-5',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    genre: ['Literary Fiction', 'Philosophy', 'Fantasy'],
    rating: 3.5,
    year: 2020,
    summary: 'A novel about life, death, and all the possible lives in between.',
  }
];

// Test function to run the recommendations
async function testDynamicRecommendations() {
  console.log('🚀 Starting Dynamic Recommendations Test\n');
  
  console.log('📚 Sample User Library:');
  sampleUserLibrary.forEach((book, index) => {
    console.log(`   ${index + 1}. "${book.title}" by ${book.author} (${book.rating}/5 stars)`);
    console.log(`      Genres: ${book.genre.join(', ')}`);
    console.log(`      Year: ${book.year}\n`);
  });
  
  console.log('=' * 80);
  console.log('🔍 Calling getDynamicRecommendations...\n');
  
  try {
    const startTime = Date.now();
    
    // Call the function with our sample library
    const recommendations = await getDynamicRecommendations(sampleUserLibrary, []);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('\n' + '=' * 80);
    console.log(`✅ Function completed in ${duration}ms`);
    console.log(`📊 Found ${recommendations.length} recommendations\n`);
    
    if (recommendations.length === 0) {
      console.log('⚠️  No recommendations returned!');
      return;
    }
    
    console.log('🎯 RECOMMENDATIONS RESULTS:');
    console.log('=' * 50);
    
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. "${rec.title}" by ${rec.author}`);
      console.log(`   Score: ${rec.score}`);
      console.log(`   Rating: ${rec.rating}/5`);
      console.log(`   Genres: ${rec.genre.join(', ')}`);
      console.log(`   Year: ${rec.year || 'Unknown'}`);
      console.log(`   Reasons: ${rec.reasons ? rec.reasons.join(', ') : 'No reasons provided'}`);
      if (rec.similarTo) {
        console.log(`   Similar to: "${rec.similarTo}"`);
      }
      if (rec.summary) {
        console.log(`   Summary: ${rec.summary.substring(0, 100)}${rec.summary.length > 100 ? '...' : ''}`);
      }
      console.log('   ' + '-' * 40);
    });
    
    // Analyze the results
    console.log('\n📈 ANALYSIS:');
    console.log('=' * 30);
    
    const avgScore = recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length;
    console.log(`Average Score: ${avgScore.toFixed(1)}`);
    
    const avgRating = recommendations.reduce((sum, rec) => sum + rec.rating, 0) / recommendations.length;
    console.log(`Average Rating: ${avgRating.toFixed(1)}/5`);
    
    const allGenres = [...new Set(recommendations.flatMap(rec => rec.genre))];
    console.log(`Unique Genres: ${allGenres.length} (${allGenres.join(', ')})`);
    
    const allAuthors = [...new Set(recommendations.map(rec => rec.author))];
    console.log(`Unique Authors: ${allAuthors.length} (${allAuthors.join(', ')})`);
    
    const withSimilarTo = recommendations.filter(rec => rec.similarTo).length;
    console.log(`Recommendations based on user library: ${withSimilarTo}/${recommendations.length}`);
    
    // Check for variety
    const genreOverlap = recommendations.reduce((overlap, rec) => {
      const userGenres = new Set(sampleUserLibrary.flatMap(book => book.genre));
      const recGenreMatches = rec.genre.filter(genre => userGenres.has(genre)).length;
      return overlap + recGenreMatches;
    }, 0);
    console.log(`Genre overlap with user library: ${genreOverlap} matches`);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Additional test with empty library (for new users)
async function testEmptyLibrary() {
  console.log('\n\n🆕 Testing with empty user library (new user scenario)...\n');
  
  try {
    const startTime = Date.now();
    const recommendations = await getDynamicRecommendations([], []);
    const endTime = Date.now();
    
    console.log(`✅ Empty library test completed in ${endTime - startTime}ms`);
    console.log(`📊 Found ${recommendations.length} recommendations for new user\n`);
    
    if (recommendations.length > 0) {
      console.log('🎯 NEW USER RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. "${rec.title}" by ${rec.author} (Score: ${rec.score}, Rating: ${rec.rating}/5)`);
        console.log(`   Reasons: ${rec.reasons?.join(', ') || 'No reasons'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing empty library:', error);
  }
}

// Test with excluded IDs (simulating shown books)
async function testWithExclusions() {
  console.log('\n\n🚫 Testing with excluded book IDs (simulating refresh scenario)...\n');
  
  const excludeIds = ['some-book-id-1', 'some-book-id-2'];
  
  try {
    const startTime = Date.now();
    const recommendations = await getDynamicRecommendations(sampleUserLibrary, excludeIds);
    const endTime = Date.now();
    
    console.log(`✅ Exclusion test completed in ${endTime - startTime}ms`);
    console.log(`📊 Found ${recommendations.length} recommendations with ${excludeIds.length} exclusions\n`);
    
    if (recommendations.length > 0) {
      console.log('🎯 RECOMMENDATIONS WITH EXCLUSIONS:');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. "${rec.title}" by ${rec.author} (ID: ${rec.id})`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing with exclusions:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testDynamicRecommendations();
  await testEmptyLibrary();
  await testWithExclusions();
  
  console.log('\n🏁 All tests completed!');
  process.exit(0);
}

// Handle any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});