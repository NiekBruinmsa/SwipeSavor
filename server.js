const express = require('express');
const Database = require('@replit/database');

const app = express();
const db = new Database();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// POST /swipe - Store swipe data
app.post('/swipe', async (req, res) => {
  try {
    const { room, userId, mealId, liked } = req.body;
    
    // Validate required fields
    if (!room || !userId || !mealId || typeof liked !== 'boolean') {
      return res.status(400).json({ 
        error: 'Missing required fields: room, userId, mealId, liked' 
      });
    }
    
    // Store swipe using the specified key pattern
    const swipeKey = `swipes/${room}/${userId}/${mealId}`;
    await db.set(swipeKey, { liked, timestamp: Date.now() });
    
    // Check for matches if this is a positive swipe
    if (liked) {
      await checkAndCreateMatch(room, mealId, userId);
    }
    
    res.json({ success: true, message: 'Swipe recorded' });
  } catch (error) {
    console.error('Error recording swipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /matches/:room/:userId - Get matches for user in room
app.get('/matches/:room/:userId', async (req, res) => {
  try {
    const { room, userId } = req.params;
    
    // Get all matches for this room
    const matchesKey = `matches/${room}`;
    const matches = await db.get(matchesKey) || [];
    
    // Filter matches that include this user
    const userMatches = matches.filter(match => 
      match.users && match.users.includes(userId)
    );
    
    // Extract meal IDs
    const mealIds = userMatches.map(match => match.mealId);
    
    res.json({ mealIds });
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to check for matches
async function checkAndCreateMatch(room, mealId, currentUserId) {
  try {
    // Get all swipes for this meal in this room
    const swipePattern = `swipes/${room}`;
    const allKeys = await db.list(swipePattern);
    
    const likedUsers = [];
    
    // Check all users who liked this meal
    for (const key of allKeys) {
      if (key.includes(`/${mealId}`)) {
        const swipeData = await db.get(key);
        if (swipeData && swipeData.liked) {
          // Extract userId from key pattern: swipes/room/userId/mealId
          const userId = key.split('/')[2];
          likedUsers.push(userId);
        }
      }
    }
    
    // If 2 or more users liked this meal, create a match
    if (likedUsers.length >= 2) {
      const matchesKey = `matches/${room}`;
      const existingMatches = await db.get(matchesKey) || [];
      
      // Check if match already exists
      const matchExists = existingMatches.some(match => 
        match.mealId === mealId && 
        match.users.sort().join(',') === likedUsers.sort().join(',')
      );
      
      if (!matchExists) {
        const newMatch = {
          mealId,
          users: likedUsers,
          timestamp: Date.now()
        };
        
        existingMatches.push(newMatch);
        await db.set(matchesKey, existingMatches);
        
        console.log(`Match created in room ${room} for meal ${mealId}:`, likedUsers);
      }
    }
  } catch (error) {
    console.error('Error checking for matches:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;