/**
 * Extracts valid words from various input formats:
 * - Paragraphs of text (handles punctuation, apostrophes, special characters)
 * - Comma-separated words
 * - Single words
 * 
 * Rules:
 * - Minimum 4 characters (shorter words are removed)
 * - Only letters (special characters are stripped, not used as separators)
 * - Converted to uppercase
 * - Handles apostrophes by splitting (e.g., "Earth's" becomes "Earth")
 */
export const extractWords = (input) => {
  if (!input || typeof input !== 'string') {
    return [];
  }

  // Trim the input
  const trimmed = input.trim();
  if (!trimmed) {
    return [];
  }

  // Check if it's a single word (very short, no spaces, no commas, no periods)
  if (trimmed.length < 50 && !/\s/.test(trimmed) && !trimmed.includes(',') && !trimmed.includes('.')) {
    const cleaned = trimmed.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (cleaned.length >= 4 && /^[A-Z]+$/.test(cleaned)) {
      return [cleaned];
    }
  }

  // Check if it's clearly a comma-separated LIST (not a paragraph with commas)
  // A list has: commas with spaces, short items, and no periods/sentence structure
  const hasPeriods = trimmed.includes('.');
  const hasSentenceStructure = /[.!?]\s+[A-Z]/.test(trimmed); // Period/question/exclamation followed by space and capital
  const commaCount = (trimmed.match(/,/g) || []).length;
  const hasSpacesAfterCommas = /,\s+[A-Za-z]/.test(trimmed);
  
  // Only treat as comma-separated if:
  // - No periods (not a sentence)
  // - Has commas with spaces after them
  // - Doesn't look like a paragraph/sentence
  if (!hasPeriods && !hasSentenceStructure && commaCount > 0 && hasSpacesAfterCommas && trimmed.length < 500) {
    return extractFromCommaSeparated(trimmed);
  }

  // Otherwise, treat as paragraph and extract words
  // This handles paragraphs with spaces, commas, periods, etc.
  return extractFromParagraph(trimmed);
};

/**
 * Extract words from comma-separated input
 * Accepts special characters and strips them during processing
 */
const extractFromCommaSeparated = (input) => {
  const words = input
    .split(',')
    .map(word => word.trim())
    .filter(word => word.length > 0)
    .map(word => {
      // Strip ALL non-letter characters (accept special chars, then remove them)
      const cleaned = word.replace(/[^A-Za-z]/g, '');
      // Only allow words with 4+ letters, convert to uppercase
      if (cleaned.length >= 4 && /^[A-Za-z]+$/.test(cleaned)) {
        return cleaned.toUpperCase();
      }
      return null;
    })
    .filter(word => word !== null);

  return [...new Set(words)]; // Remove duplicates
};

/**
 * Extract words from paragraph text
 * Splits on spaces, commas, periods, and other sentence separators
 * Accepts all special characters and strips them during processing
 * Handles apostrophes and filters short words (< 4 characters)
 */
const extractFromParagraph = (input) => {
  // Accept all input, including special characters
  // First, handle apostrophes - replace with space to separate words like "Earth's"
  let normalized = input.replace(/[''`]/g, ' ');
  
  // Replace sentence separators (periods, commas, semicolons, etc.) with spaces
  // This ensures words are properly separated
  normalized = normalized.replace(/[.,!?;:()\[\]{}""-]/g, ' ');
  
  // Split by whitespace (spaces, tabs, newlines)
  // This will properly separate words that were separated by spaces, commas, or periods
  const words = normalized
    .split(/\s+/) // Split on any whitespace (one or more spaces/tabs/newlines)
    .map(word => word.trim())
    .filter(word => word.length > 0) // Remove empty strings
    .map(word => {
      // Strip ALL non-letter characters (numbers, punctuation, special chars)
      // Keep only letters
      const cleaned = word.replace(/[^A-Za-z]/g, '');
      
      // Only keep words that are 4+ characters and contain only letters
      if (cleaned.length >= 4 && /^[A-Za-z]+$/.test(cleaned)) {
        return cleaned.toUpperCase();
      }
      return null;
    })
    .filter(word => word !== null && word.length >= 4); // Final filter for 4+ characters

  return [...new Set(words)]; // Remove duplicates
};

/**
 * Validate word bank name
 */
export const validateWordBankName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Word bank name is required' };
  }

  const trimmed = name.trim();
  if (trimmed.length < 1) {
    return { valid: false, error: 'Word bank name cannot be empty' };
  }

  if (trimmed.length > 255) {
    return { valid: false, error: 'Word bank name is too long (max 255 characters)' };
  }

  return { valid: true };
};

/**
 * Validate extracted words
 */
export const validateWords = (words) => {
  if (!Array.isArray(words) || words.length === 0) {
    return { valid: false, error: 'At least one valid word is required' };
  }

  if (words.length > 1000) {
    return { valid: false, error: 'Too many words (max 1000 words)' };
  }

  return { valid: true };
};



