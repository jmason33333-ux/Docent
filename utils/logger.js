const { google } = require('googleapis');

let sheets = null;
let isConfigured = false;

/**
 * Initialize Google Sheets API
 * Expects GOOGLE_SHEETS_CREDENTIALS env var with service account JSON
 */
function initializeSheets() {
  try {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS) {
      console.warn('Google Sheets logging not configured - skipping');
      return false;
    }

    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    sheets = google.sheets({ version: 'v4', auth });
    isConfigured = true;
    console.log('Google Sheets logging initialized');
    return true;

  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error.message);
    return false;
  }
}

/**
 * Log a conversation to Google Sheets
 * @param {Object} data
 * @param {string} data.userId - Anonymous user ID (can be generated from session)
 * @param {string} data.book - Book title
 * @param {number} data.chapter - Chapter number
 * @param {string} data.question - User's question
 * @param {string} data.answer - Rowan's response
 * @param {Object} data.metadata - Response metadata (prompt version, tokens, etc.)
 */
async function logConversation({ userId, book, chapter, question, answer, metadata = {} }) {
  const timestamp = new Date().toISOString();

  // Fallback: console logging if Sheets not configured
  if (!isConfigured) {
    console.log('CONVERSATION LOG:', JSON.stringify({
      timestamp,
      userId,
      book,
      chapter,
      question: question.substring(0, 100) + '...',
      answer: answer.substring(0, 100) + '...',
      promptVersion: metadata.promptVersion,
      promptType: metadata.promptType,
      tokensUsed: metadata.tokensUsed,
      queryCategory: metadata.queryCategory || 'unknown',
      querySubcategory: metadata.querySubcategory || 'none',
      notesAvailable: metadata.notesAvailable ? 'YES' : 'NO',
      notesLikelyUsed: metadata.notesLikelyUsed ? 'YES' : 'NO',
      notesRelevance: metadata.notesRelevance || 'unknown'
    }, null, 2));
    return;
  }

  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.warn('GOOGLE_SHEET_ID not set - skipping Sheets logging');
      return;
    }

    // Prepare query categorization values
    const queryCategoryValues = [
      metadata.queryCategory || 'unknown',
      metadata.querySubcategory || 'none',
      metadata.queryKeyTerms || ''
    ];

    // Prepare RAG tracking values
    const ragTrackingValues = [
      metadata.notesAvailable !== undefined ? (metadata.notesAvailable ? 'YES' : 'NO') : 'UNKNOWN',
      metadata.notesProvided !== undefined ? (metadata.notesProvided ? 'YES' : 'NO') : 'UNKNOWN',
      metadata.notesLikelyUsed !== undefined ? (metadata.notesLikelyUsed ? 'YES' : 'NO') : 'UNKNOWN',
      metadata.notesRelevance || 'unknown',
      metadata.chaptersFound || '',
      metadata.chaptersMissing || ''
    ];

    // Prepare snapshot tracking values
    const snapshotTrackingValues = [
      metadata.contextSource || 'unknown',
      metadata.snapshotUsed !== undefined ? (metadata.snapshotUsed ? 'YES' : 'NO') : 'NO',
      metadata.snapshotChapter || ''
    ];

    console.log('[LOGGING] Query category:', {
      category: queryCategoryValues[0],
      subcategory: queryCategoryValues[1],
      keyTerms: queryCategoryValues[2]
    });
    console.log('[LOGGING] RAG tracking:', {
      notesAvailable: ragTrackingValues[0],
      notesProvided: ragTrackingValues[1],
      notesLikelyUsed: ragTrackingValues[2],
      notesRelevance: ragTrackingValues[3],
      chaptersFound: ragTrackingValues[4],
      chaptersMissing: ragTrackingValues[5]
    });
    console.log('[LOGGING] Snapshot tracking:', {
      contextSource: snapshotTrackingValues[0],
      snapshotUsed: snapshotTrackingValues[1],
      snapshotChapter: snapshotTrackingValues[2]
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Conversations!A:X', // Extended to include snapshot tracking
      valueInputOption: 'RAW',
      resource: {
        values: [[
          timestamp,
          userId,
          book,
          chapter,
          question,
          answer,
          metadata.promptVersion || 'unknown',
          metadata.promptType || 'unknown',
          metadata.contextWindow || 1,
          metadata.tokensUsed || 0,
          '', // Reserved for feedback rating
          // Query categorization columns
          ...queryCategoryValues,
          // RAG tracking columns
          ...ragTrackingValues,
          // Snapshot tracking columns
          ...snapshotTrackingValues
        ]]
      }
    });

    console.log('✅ Logged conversation to Google Sheets with RAG tracking');

  } catch (error) {
    console.error('Failed to log to Google Sheets:', error.message);
    // Don't throw - logging failure shouldn't break the app
  }
}

/**
 * Log user feedback on a Rowan response
 * @param {Object} data
 * @param {string} data.userId - User ID
 * @param {string} data.bookTitle - Book title
 * @param {number} data.chapter - Chapter number
 * @param {string} data.question - Original question
 * @param {string} data.answer - Rowan's response
 * @param {number} data.rating - User rating (1-5)
 * @param {string} data.feedback - Optional text feedback
 * @param {string} data.promptVersion - Prompt version used
 * @param {string} data.messageId - Message ID for tracking
 */
async function logFeedback({
  userId,
  bookTitle,
  chapter,
  question,
  answer,
  rating,
  feedback = '',
  promptVersion = 'unknown',
  messageId = ''
}) {
  const timestamp = new Date().toISOString();

  // Fallback: console logging if Sheets not configured
  if (!isConfigured) {
    console.log('FEEDBACK LOG:', JSON.stringify({
      timestamp,
      userId,
      bookTitle,
      chapter,
      rating,
      feedback: feedback.substring(0, 100),
      promptVersion
    }, null, 2));
    return;
  }

  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      console.warn('GOOGLE_SHEET_ID not set - skipping Sheets logging');
      return;
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Feedback!A:J',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          timestamp,
          userId,
          bookTitle,
          chapter,
          rating,
          feedback,
          promptVersion,
          messageId,
          question.substring(0, 500), // Truncated for readability
          answer.substring(0, 500)    // Truncated for readability
        ]]
      }
    });

    console.log('Logged feedback to Google Sheets');

  } catch (error) {
    console.error('Failed to log feedback to Google Sheets:', error.message);
    // Don't throw - logging failure shouldn't break the app
  }
}

module.exports = {
  initializeSheets,
  logConversation,
  logFeedback
};
