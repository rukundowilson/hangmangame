import db from '../config/db.js';

// Register user
export const registerUser = (req, res) => {
  const { firebase_uid, email, display_name } = req.body;

  // Validation
  if (!firebase_uid || !email) {
    return res.status(400).json({
      error: 'Firebase UID and email are required'
    });
  }

  // Check if user already exists
  db.query(
    'SELECT id FROM users WHERE firebase_uid = ?',
    [firebase_uid],
    (err, results) => {
      if (err) {
        console.error('Error checking user:', err);
        return res.status(500).json({
          error: 'Failed to check user',
          details: err.message
        });
      }

      if (results.length > 0) {
        // User exists, return success
        return res.json({
          success: true,
          message: 'User already exists',
          user_id: results[0].id
        });
      }

      // Insert new user
      db.query(
        'INSERT INTO users (firebase_uid, email, display_name) VALUES (?, ?, ?)',
        [firebase_uid, email, display_name || null],
        (err, result) => {
          if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({
              error: 'Failed to register user',
              details: err.message
            });
          }

          const userId = result.insertId;

          // Initialize game stats for the user
          db.query(
            'INSERT INTO game_stats (user_id, games_played, games_won, games_lost, total_score, high_score, active_word_bank_id) VALUES (?, 0, 0, 0, 0, 0, NULL)',
            [userId],
            (err) => {
              if (err) {
                console.error('Error initializing game stats:', err);
                // Don't fail the request, stats can be initialized later
              }

              res.json({
                success: true,
                message: 'User registered successfully',
                user_id: userId
              });
            }
          );
        }
      );
    }
  );
};

// Get user statistics
export const getUserStats = (req, res) => {
  const { firebase_uid } = req.query;

  // Validation
  if (!firebase_uid) {
    return res.status(400).json({
      error: 'Firebase UID is required'
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
          error: 'User not found'
        });
      }

      const userId = users[0].id;

      // Get game stats
      db.query(
        `SELECT games_played, games_won, games_lost, total_score, high_score, active_word_bank_id 
         FROM game_stats 
         WHERE user_id = ?`,
        [userId],
        (err, stats) => {
          if (err) {
            console.error('Error fetching stats:', err);
            return res.status(500).json({
              error: 'Failed to fetch user stats',
              details: err.message
            });
          }

          if (stats.length === 0) {
            // Initialize stats if they don't exist
            db.query(
              'INSERT INTO game_stats (user_id, active_word_bank_id) VALUES (?, NULL)',
              [userId],
              (err) => {
                if (err) {
                  console.error('Error initializing stats:', err);
                }
              }
            );
            return res.json({
              games_played: 0,
              games_won: 0,
              games_lost: 0,
              total_score: 0,
              high_score: 0,
              active_word_bank_id: null
            });
          }

          res.json(stats[0]);
        }
      );
    }
  );
};

// Update active word bank
export const updateActiveWordBank = (req, res) => {
  const { firebase_uid, word_bank_id } = req.body;

  // Validation
  if (!firebase_uid) {
    return res.status(400).json({
      error: 'Firebase UID is required'
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
          error: 'User not found'
        });
      }

      const userId = users[0].id;

      // If word_bank_id is provided and not 'default', verify it belongs to the user
      if (word_bank_id && word_bank_id !== 'default' && word_bank_id !== null) {
        db.query(
          'SELECT id FROM custom_word_banks WHERE id = ? AND user_id = ?',
          [word_bank_id, userId],
          (err, banks) => {
            if (err) {
              console.error('Error checking word bank:', err);
              return res.status(500).json({
                error: 'Failed to verify word bank',
                details: err.message
              });
            }

            if (banks.length === 0) {
              return res.status(404).json({
                error: 'Word bank not found or does not belong to user'
              });
            }

            // Update active word bank
            updateWordBankInStats(userId, word_bank_id, res);
          }
        );
      } else {
        // Set to NULL (default)
        updateWordBankInStats(userId, null, res);
      }
    }
  );
};

// Helper function to update word bank in stats
const updateWordBankInStats = (userId, wordBankId, res) => {
  db.query(
    'UPDATE game_stats SET active_word_bank_id = ? WHERE user_id = ?',
    [wordBankId, userId],
    (err) => {
      if (err) {
        console.error('Error updating active word bank:', err);
        return res.status(500).json({
          error: 'Failed to update active word bank',
          details: err.message
        });
      }

      res.json({
        success: true,
        message: 'Active word bank updated successfully',
        active_word_bank_id: wordBankId
      });
    }
  );
};
