// Test script for the API module
import { saveSwipe, getMatches } from './api.js';

async function testAPI() {
  try {
    console.log('Testing saveSwipe function...');
    
    // Test saving swipes
    const swipe1 = await saveSwipe('room1', 'user1', 'pizza', true);
    console.log('Swipe 1 saved:', swipe1);
    
    const swipe2 = await saveSwipe('room1', 'user2', 'pizza', true);
    console.log('Swipe 2 saved:', swipe2);
    
    // Test getting matches
    console.log('\nTesting getMatches function...');
    const matches = await getMatches('room1', 'user1');
    console.log('Matches for user1:', matches);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();