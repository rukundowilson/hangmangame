import db from '../config/db.js';

// Record game result
export const recordGame = (req, res) => {
  const { firebase_uid, won, score, word, difficulty, time_taken, wrong_guesses } = req.body;

  // Validation
  if (!firebase_uid || won === undefined) {
    return res.status(400).json({
      error: 'Firebase UID and game result (won) are required'
    });
  }

  // Get user ID from firebase_uid
  db.query(
    'SELECT id FROM users WHERE firebase_uid = ?',
    [firebase_uid],
    (err, users) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({
          error: 'Failed to fetch user',
          details: err.message
        });
      }

      if (users.length === 0) {
        return res.status(404).json({
          error: 'User not found. Please register first.'
        });
      }

      const userId = users[0].id;

      // Build update query for game stats
      let updateQuery;
      let updateValues = [];

      if (won) {
        updateQuery = `
          UPDATE game_stats 
          SET games_won = games_won + 1,
              games_played = games_played + 1
        `;
      } else {
        updateQuery = `
          UPDATE game_stats 
          SET games_lost = games_lost + 1,
              games_played = games_played + 1
        `;
      }

      if (score !== undefined) {
        updateQuery += `, total_score = total_score + ?, high_score = GREATEST(high_score, ?)`;
        updateValues.push(score, score);
      }

      updateQuery += ' WHERE user_id = ?';
      updateValues.push(userId);

      // Update game stats
      db.query(updateQuery, updateValues, (err) => {
        if (err) {
          console.error('Error updating game stats:', err);
          return res.status(500).json({
            error: 'Failed to update game stats',
            details: err.message
          });
        }

        // Record game history for all games (always record)
        db.query(
          `INSERT INTO game_history (user_id, word, difficulty, score, won, time_taken, wrong_guesses) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            word || null,
            difficulty || null,
            score || 0,
            won,
            time_taken || null,
            wrong_guesses || null
          ],
          (err) => {
            if (err) {
              console.error('Error recording game history:', err);
              // Don't fail the request, but log the error
            } else {
              console.log(`✅ Game history recorded: ${won ? 'WON' : 'LOST'} - Difficulty: ${difficulty || 'N/A'}, Score: ${score || 0}`);
            }
          }
        );

        // Return updated stats
        db.query(
          `SELECT games_played, games_won, games_lost, total_score, high_score 
           FROM game_stats 
           WHERE user_id = ?`,
          [userId],
          (err, updatedStats) => {
            if (err) {
              console.error('Error fetching updated stats:', err);
              return res.json({
                success: true,
                message: 'Game recorded successfully'
              });
            }

            res.json({
              success: true,
              stats: updatedStats[0]
            });
          }
        );
      });
    }
  );
};



