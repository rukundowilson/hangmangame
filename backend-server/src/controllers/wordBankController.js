import db from '../config/db.js';
import { extractWords, validateWordBankName, validateWords } from '../utils/wordExtractor.js';

// Create custom word bank
export const createWordBank = (req, res) => {
  const { firebase_uid, name, input } = req.body;

  // Validation
  if (!firebase_uid || !name || !input) {
    return res.status(400).json({
      error: 'Firebase UID, name, and input are required'
    });
  }

  // Validate name
  const nameValidation = validateWordBankName(name);
  if (!nameValidation.valid) {
    return res.status(400).json({
      error: nameValidation.error
    });
  }

  // Extract words from input
  const words = extractWords(input);
  
  // Validate extracted words
  const wordsValidation = validateWords(words);
  if (!wordsValidation.valid) {
    return res.status(400).json({
      error: wordsValidation.error
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

      // Insert word bank (without words - we'll add them separately)
      db.query(
        'INSERT INTO custom_word_banks (user_id, name, word_count) VALUES (?, ?, ?)',
        [userId, name.trim(), words.length],
        (err, result) => {
          if (err) {
            console.error('Error creating word bank:', err);
            return res.status(500).json({
              error: 'Failed to create word bank',
              details: err.message
            });
          }

          const wordBankId = result.insertId;

          // Insert each word separately
          if (words.length === 0) {
            return res.status(400).json({
              error: 'No valid words to save'
            });
          }

          // Prepare bulk insert for words
          const wordValues = words.map(word => [wordBankId, word]);
          const placeholders = words.map(() => '(?, ?)').join(', ');
          const flatValues = wordValues.flat();

          db.query(
            `INSERT INTO custom_word_bank_words (word_bank_id, word) VALUES ${placeholders}`,
            flatValues,
            (err) => {
              if (err) {
                console.error('Error inserting words:', err);
                // Rollback word bank if words fail
                db.query('DELETE FROM custom_word_banks WHERE id = ?', [wordBankId]);
                return res.status(500).json({
                  error: 'Failed to save words',
                  details: err.message
                });
              }

              res.json({
                success: true,
                message: 'Word bank created successfully',
                wordBank: {
                  id: wordBankId,
                  name: name.trim(),
                  wordCount: words.length,
                  words: words
                }
              });
            }
          );
        }
      );
    }
  );
};

// Get user's word banks
export const getUserWordBanks = (req, res) => {
  const { firebase_uid } = req.query;

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

      // Get user's word banks
      db.query(
        'SELECT id, name, word_count, created_at, updated_at FROM custom_word_banks WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, wordBanks) => {
          if (err) {
            console.error('Error fetching word banks:', err);
            return res.status(500).json({
              error: 'Failed to fetch word banks',
              details: err.message
            });
          }

          if (wordBanks.length === 0) {
            return res.json([]);
          }

          // Get word bank IDs
          const wordBankIds = wordBanks.map(bank => bank.id);
          const placeholders = wordBankIds.map(() => '?').join(', ');

          // Fetch all words for these word banks
          db.query(
            `SELECT word_bank_id, word FROM custom_word_bank_words WHERE word_bank_id IN (${placeholders}) ORDER BY word_bank_id, id`,
            wordBankIds,
            (err, allWords) => {
              if (err) {
                console.error('Error fetching words:', err);
                return res.status(500).json({
                  error: 'Failed to fetch words',
                  details: err.message
                });
              }

              // Group words by word_bank_id
              const wordsByBank = {};
              allWords.forEach(row => {
                if (!wordsByBank[row.word_bank_id]) {
                  wordsByBank[row.word_bank_id] = [];
                }
                wordsByBank[row.word_bank_id].push(row.word);
              });

              // Format response with words
              const formatted = wordBanks.map(bank => ({
                id: bank.id,
                name: bank.name,
                wordCount: bank.word_count || 0,
                words: wordsByBank[bank.id] || [],
                created_at: bank.created_at,
                updated_at: bank.updated_at
              }));

              res.json(formatted);
            }
          );
        }
      );
    }
  );
};

// Delete word bank
export const deleteWordBank = (req, res) => {
  const { firebase_uid, wordBankId } = req.body;

  if (!firebase_uid || !wordBankId) {
    return res.status(400).json({
      error: 'Firebase UID and word bank ID are required'
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

      // Delete word bank (only if it belongs to the user)
      db.query(
        'DELETE FROM custom_word_banks WHERE id = ? AND user_id = ?',
        [wordBankId, userId],
        (err, result) => {
          if (err) {
            console.error('Error deleting word bank:', err);
            return res.status(500).json({
              error: 'Failed to delete word bank',
              details: err.message
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              error: 'Word bank not found or you do not have permission to delete it'
            });
          }

          res.json({
            success: true,
            message: 'Word bank deleted successfully'
          });
        }
      );
    }
  );
};



