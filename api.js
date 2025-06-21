// Simple API module for swipe functionality
const API_BASE = 'http://localhost:5000';

/**
 * Save a user's swipe for a meal in a room
 * @param {string} room - The room identifier
 * @param {string} userId - The user identifier
 * @param {string} mealId - The meal identifier
 * @param {boolean} liked - Whether the user liked the meal
 * @returns {Promise<Object>} Response from server
 */
export async function saveSwipe(room, userId, mealId, liked) {
  try {
    const response = await fetch(`${API_BASE}/swipe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room,
        userId,
        mealId,
        liked
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving swipe:', error);
    throw error;
  }
}

/**
 * Get matches for a user in a room
 * @param {string} room - The room identifier
 * @param {string} userId - The user identifier
 * @returns {Promise<Object>} Object containing mealIds array
 */
export async function getMatches(room, userId) {
  try {
    const response = await fetch(`${API_BASE}/matches/${room}/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting matches:', error);
    throw error;
  }
}